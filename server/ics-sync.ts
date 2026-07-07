import { getDb } from "./db.js";
import { RRule, RRuleSet, rrulestr } from "rrule";
import * as nodeIcal from "node-ical";

const SYNC_INTERVAL_MS = 15 * 60 * 1000;

interface IcsEvent {
  type: string;
  start?: Date;
  end?: Date;
  rrule?: any;
  datetype?: string;
  recurrences?: Record<string, IcsEvent>;
  exdate?: Record<string, any>;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getDaysBetween(start: Date, end: Date): string[] {
  const days: string[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  // For all-day events, end is typically the day after the last busy day
  while (current < endDate) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

async function fetchAndParseIcs(url: string): Promise<Record<string, IcsEvent>> {
  return (await nodeIcal.async.fromURL(url)) as Record<string, IcsEvent>;
}

function expandEvent(event: IcsEvent, windowStart: Date, windowEnd: Date): string[] {
  const days: string[] = [];

  if (event.rrule) {
    try {
      const rule: RRule | RRuleSet =
        typeof event.rrule === "string"
          ? rrulestr(event.rrule, { dtstart: event.start })
          : event.rrule;

      const occurrences = rule.between(windowStart, windowEnd, true);

      for (const occ of occurrences) {
        if (event.end && event.start) {
          const duration = event.end.getTime() - event.start.getTime();
          const occEnd = new Date(occ.getTime() + duration);
          days.push(...getDaysBetween(occ, occEnd));
        } else {
          days.push(formatDate(occ));
        }
      }
    } catch {
      // If RRULE parsing fails, fall through to single-event handling
      if (event.start && event.end) {
        days.push(...getDaysBetween(event.start, event.end));
      } else if (event.start) {
        days.push(formatDate(event.start));
      }
    }
  } else {
    if (event.start && event.end) {
      days.push(...getDaysBetween(event.start, event.end));
    } else if (event.start) {
      days.push(formatDate(event.start));
    }
  }

  // Handle recurrence overrides
  if (event.recurrences) {
    for (const dateKey of Object.keys(event.recurrences)) {
      const override = event.recurrences[dateKey];
      if (override.start && override.end) {
        days.push(...getDaysBetween(override.start, override.end));
      }
    }
  }

  return days.filter((d) => d >= formatDate(windowStart) && d <= formatDate(windowEnd));
}

export async function syncPerson(personId: string, icsUrl: string): Promise<void> {
  const db = getDb();
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const windowEnd = new Date(now.getFullYear(), now.getMonth() + 12, 0);

  try {
    const events = await fetchAndParseIcs(icsUrl);
    const allDays = new Set<string>();

    for (const key of Object.keys(events)) {
      const event = events[key];
      if (event.type !== "VEVENT") continue;
      const days = expandEvent(event, windowStart, windowEnd);
      for (const d of days) allDays.add(d);
    }

    const insertDay = db.prepare("INSERT OR IGNORE INTO ics_busy_days (person_id, date) VALUES (?, ?)");
    const clearOld = db.prepare(
      "DELETE FROM ics_busy_days WHERE person_id = ? AND date >= ? AND date <= ?"
    );

    db.transaction(() => {
      clearOld.run(personId, formatDate(windowStart), formatDate(windowEnd));
      for (const day of allDays) {
        insertDay.run(personId, day);
      }
    })();

    db.prepare(
      "INSERT INTO ics_sync_log (person_id, last_synced, last_error) VALUES (?, datetime('now'), NULL) ON CONFLICT(person_id) DO UPDATE SET last_synced = datetime('now'), last_error = NULL"
    ).run(personId);
  } catch (e: any) {
    db.prepare(
      "INSERT INTO ics_sync_log (person_id, last_synced, last_error) VALUES (?, datetime('now'), ?) ON CONFLICT(person_id) DO UPDATE SET last_synced = datetime('now'), last_error = ?"
    ).run(personId, e.message, e.message);
    console.error(`ICS sync failed for ${personId}:`, e.message);
  }
}

export async function syncAll(): Promise<void> {
  const db = getDb();
  const persons = db.prepare("SELECT id, ics_url FROM persons WHERE ics_url IS NOT NULL AND ics_url != ''").all() as {
    id: string;
    ics_url: string;
  }[];

  for (const person of persons) {
    await syncPerson(person.id, person.ics_url);
  }
}

export function startSyncLoop(): void {
  syncAll().catch((e) => console.error("Initial sync error:", e));
  setInterval(() => {
    syncAll().catch((e) => console.error("Sync loop error:", e));
  }, SYNC_INTERVAL_MS);
}
