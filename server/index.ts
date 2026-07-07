import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import path from "path";
import fs from "fs";
import { getDb } from "./db.js";
import { personsRoutes } from "./routes/persons.js";
import { busyRoutes } from "./routes/busy.js";
import { startSyncLoop } from "./ics-sync.js";

const port = parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "0.0.0.0";

async function main() {
  // Ensure data directory exists
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "calendar.db");
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize DB
  getDb();

  const app = Fastify({ logger: true });

  await app.register(fastifyCookie);
  await app.register(fastifyCors, { origin: true, credentials: true });

  // API routes
  await app.register(personsRoutes);
  await app.register(busyRoutes);

  // Serve the Expo web build (static files)
  const distPath = path.join(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    await app.register(fastifyStatic, {
      root: distPath,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback: serve index.html for all non-API routes
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith("/api")) {
        return reply.status(404).send({ error: "Not found" });
      }
      return reply.sendFile("index.html");
    });
  }

  // Start ICS sync background loop
  startSyncLoop();

  await app.listen({ port, host });
  console.log(`Server running on http://${host}:${port}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
