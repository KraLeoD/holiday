import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "calendar.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS persons (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL,
      ics_url    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS manual_busy_days (
      person_id  TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      PRIMARY KEY (person_id, date)
    );

    CREATE TABLE IF NOT EXISTS ics_busy_days (
      person_id  TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      PRIMARY KEY (person_id, date)
    );

    CREATE TABLE IF NOT EXISTS ics_sync_log (
      person_id    TEXT PRIMARY KEY REFERENCES persons(id) ON DELETE CASCADE,
      last_synced  TEXT,
      last_error   TEXT
    );
  `);
}
