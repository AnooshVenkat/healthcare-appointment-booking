# CareSlot — Healthcare Appointment Booking (V1 MVP)

Demo app for booking healthcare appointments with **patient**, **clinician**, and **admin** roles.

> **Compliance note:** Free hosting (Vercel, Neon, etc.) is **not HIPAA-covered**. Use only synthetic demo data. Do not put real protected health information in this stack without a BAA and proper controls.

## Stack

- Next.js 15 (App Router) + TypeScript
- Postgres + Drizzle ORM
- Auth.js (NextAuth v5) credentials provider with role claims

## Features (V1)

- Sign up / sign in with role-based dashboards
- Clinician weekly hours + blocked slots
- Patient booking of open slots
- Cancel / reschedule; statuses: `booked` | `completed` | `cancelled`
- Admin overview of users, clinicians, and appointments

## Quick start (recommended: free Neon Postgres)

You do **not** need Docker. Neon’s free tier is the easiest path on Windows/macOS/Linux.

1. Create a free project at [neon.tech](https://neon.tech) and copy the connection string (`postgresql://…`).
2. In the repo:

```bash
npm install
cp .env.example .env.local
```

3. Edit `.env.local`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
AUTH_SECRET=replace-with-a-long-random-string
AUTH_URL=http://localhost:3000
```

Generate `AUTH_SECRET` with:

```bash
# macOS / Linux / Git Bash
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

4. Push schema, seed demo users, start the app:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Alternative: Docker Postgres

Requires **Docker Desktop running** (Windows/macOS) or Docker Engine (Linux).

```bash
docker compose up -d
cp .env.example .env.local
# set AUTH_SECRET; DATABASE_URL can stay as the compose default
npm install
npm run db:push
npm run db:seed
npm run dev
```

Default compose URL:

```env
DATABASE_URL=postgresql://careslot:careslot@localhost:5432/careslot
```

### Docker error on Windows

If you see:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

Docker Desktop is not running (or not installed). Either:

1. **Install/start [Docker Desktop](https://www.docker.com/products/docker-desktop/)**, wait until it says Engine running, then retry `docker compose up -d`, or
2. **Skip Docker** and use the Neon steps above.

## Environment variables

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `DATABASE_URL` | yes      | Postgres connection string                       |
| `AUTH_SECRET`  | yes      | Auth.js secret (`openssl rand -base64 32`)       |
| `AUTH_URL`     | local/prod | App URL (use `http://localhost:3000` for local) |

## Demo logins (after seed)

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| Admin     | `admin@demo.local`     | `password123` |
| Clinician | `clinician@demo.local` | `password123` |
| Patient   | `patient@demo.local`   | `password123` |

## Scripts

| Script              | Purpose                         |
|---------------------|---------------------------------|
| `npm run dev`       | Next.js dev server              |
| `npm run build`     | Production build                |
| `npm run start`     | Start production server         |
| `npm run db:push`   | Push Drizzle schema to Postgres |
| `npm run db:seed`   | Seed demo users + availability  |
| `npm run db:studio` | Drizzle Studio                  |

## Out of scope (V1)

Email/SMS, video visits, medical records, insurance, payments, waitlist, multi-location, HIPAA BAA hosting.
