import { FastifyInstance } from "fastify";
import { getDb } from "../db.js";

export async function busyRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { from: string; to: string } }>("/api/busy", async (req, reply) => {
    const { from, to } = req.query;
    if (!from || !to) {
      return reply.status(400).send({ error: "from and to query params required (YYYY-MM-DD)" });
    }
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT person_id, date, 'manual' as source FROM manual_busy_days WHERE date >= ? AND date <= ?
         UNION ALL
         SELECT person_id, date, 'ics' as source FROM ics_busy_days WHERE date >= ? AND date <= ?
         ORDER BY date`
      )
      .all(from, to, from, to) as { person_id: string; date: string; source: string }[];

    const grouped: Record<string, { date: string; manual: boolean }[]> = {};
    for (const row of rows) {
      if (!grouped[row.person_id]) grouped[row.person_id] = [];
      const existing = grouped[row.person_id].find((d) => d.date === row.date);
      if (existing) {
        if (row.source === "manual") existing.manual = true;
      } else {
        grouped[row.person_id].push({ date: row.date, manual: row.source === "manual" });
      }
    }
    return grouped;
  });

  app.put<{ Params: { id: string }; Body: { dates: string[] } }>(
    "/api/persons/:id/busy-days",
    async (req, reply) => {
      const { id } = req.params;
      const { dates } = req.body;
      if (!Array.isArray(dates)) {
        return reply.status(400).send({ error: "dates array required" });
      }
      const db = getDb();
      const person = db.prepare("SELECT id FROM persons WHERE id = ?").get(id);
      if (!person) return reply.status(404).send({ error: "Person not found" });

      const insert = db.prepare("INSERT OR IGNORE INTO manual_busy_days (person_id, date) VALUES (?, ?)");
      const txn = db.transaction((dates: string[]) => {
        for (const date of dates) {
          insert.run(id, date);
        }
      });
      txn(dates);
      return { ok: true };
    }
  );

  app.delete<{ Params: { id: string; date: string } }>(
    "/api/persons/:id/busy-days/:date",
    async (req, reply) => {
      const { id, date } = req.params;
      const db = getDb();
      db.prepare("DELETE FROM manual_busy_days WHERE person_id = ? AND date = ?").run(id, date);
      return { ok: true };
    }
  );
}
