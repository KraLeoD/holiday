# Holiday Calendar

A shared availability calendar for a small group of friends to find free windows for trips. Each person marks their busy days (manually or via an ICS calendar feed), and the month grid makes it easy to spot when everyone is free.

## Features

- **Month grid view** — busy days shown as stacked color bars per person, blank = everyone free
- **ICS feed sync** — paste a read-only calendar URL and busy days are imported automatically every 15 minutes (supports recurring events/RRULE)
- **Manual busy days** — tap a day to mark yourself busy or free
- **Privacy first** — only busy/free status is stored, never event titles
- **Per-person visibility** — hide individual people's colors from your view
- **Light + dark mode** — MD3-inspired design with a bright modern look
- **Simple identity** — pick your name and color on first visit, no login required (relies on external auth gate like Authentik)

<img width="1079" height="1334" alt="Screenshot_20260707_214710_Firefox" src="https://github.com/user-attachments/assets/0790eb5c-4496-4725-a80c-a7eaa9c6fb8b" />


## Running locally

```bash
npm install
npm run dev:server   # Fastify API on :3000
npm run dev:web      # Expo web dev server
```

## Production with Docker Compose

Single container serving both the API and static frontend, with SQLite on a mounted volume.

### Using the pre-built image

Create a `docker-compose.yml`:

```yaml
services:
  holiday-calendar:
    image: ghcr.io/kraleod/holiday:latest
    ports:
      - "3000:3000"
    environment:
      - DB_PATH=/data/calendar.db
    volumes:
      - calendar-data:/data
    restart: unless-stopped

volumes:
  calendar-data:
```

Then run:

```bash
docker compose up -d
```

The app is available at `http://localhost:3000`.

### Building locally

```bash
docker compose up -d --build
```

This builds the image from source and starts the container.

### Updating

```bash
docker compose pull
docker compose up -d
```

The SQLite database persists on the `calendar-data` volume, so updates are non-destructive.

The image is built for both `linux/amd64` and `linux/arm64`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listen port |
| `DB_PATH` | `/data/calendar.db` | SQLite database file path |
