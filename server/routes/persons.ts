import { FastifyInstance } from "fastify";
import { getDb } from "../db.js";
import { nanoid } from "nanoid";
import { syncPerson } from "../ics-sync.js";

export async function personsRoutes(app: FastifyInstance) {
  app.get("/api/persons", async () => {
    const db = getDb();
    return db.prepare("SELECT id, name, color, ics_url FROM persons ORDER BY created_at").all();
  });

  app.post<{ Body: { name: string; color: string } }>("/api/persons", async (req, reply) => {
    const { name, color } = req.body;
    if (!name || !color) {
      return reply.status(400).send({ error: "name and color required" });
    }
    const db = getDb();
    const id = nanoid(12);
    try {
      db.prepare("INSERT INTO persons (id, name, color) VALUES (?, ?, ?)").run(id, name.trim(), color);
    } catch (e: any) {
      if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return reply.status(409).send({ error: "Name already taken" });
      }
      throw e;
    }
    return reply.status(201).send({ id, name: name.trim(), color });
  });

  app.patch<{ Params: { id: string }; Body: { name?: string; color?: string; ics_url?: string | null } }>(
    "/api/persons/:id",
    async (req, reply) => {
      const { id } = req.params;
      const { name, color, ics_url } = req.body;
      const db = getDb();

      const person = db.prepare("SELECT id FROM persons WHERE id = ?").get(id);
      if (!person) return reply.status(404).send({ error: "Not found" });

      if (name !== undefined) {
        db.prepare("UPDATE persons SET name = ? WHERE id = ?").run(name.trim(), id);
      }
      if (color !== undefined) {
        db.prepare("UPDATE persons SET color = ? WHERE id = ?").run(color, id);
      }
      if (ics_url !== undefined) {
        db.prepare("UPDATE persons SET ics_url = ? WHERE id = ?").run(ics_url, id);
        if (ics_url) {
          syncPerson(id, ics_url).catch((e) => console.error("Sync after save failed:", e));
        }
      }

      const updated = db.prepare("SELECT id, name, color, ics_url FROM persons WHERE id = ?").get(id);
      return updated;
    }
  );

  app.delete<{ Params: { id: string } }>("/api/persons/:id", async (req, reply) => {
    const { id } = req.params;
    const db = getDb();
    const result = db.prepare("DELETE FROM persons WHERE id = ?").run(id);
    if (result.changes === 0) return reply.status(404).send({ error: "Not found" });
    return { ok: true };
  });
}
