# CareSlot — Healthcare Appointment Booking (V1 MVP)

Private demo app for booking healthcare appointments with **patient**, **clinician**, and **admin** roles.

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

## Quick start (Docker Postgres)

```bash
# 1. Start Postgres
docker compose up -d

# 2. Env
cp .env.example .env.local
# set AUTH_SECRET (e.g. openssl rand -base64 32)

# 3. Install + schema + seed
npm install
npm run db:push
npm run db:seed

# 4. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Without Docker

Point `DATABASE_URL` at any Postgres 14+ instance (local or hosted).

**Free Neon option:** create a project at [neon.tech](https://neon.tech), copy the connection string into `DATABASE_URL`, then run `npm run db:push` and `npm run db:seed`. Neon’s free tier is fine for demos and is **not** a HIPAA BAA environment.

## Environment variables

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `DATABASE_URL` | yes      | Postgres connection string                       |
| `AUTH_SECRET`  | yes      | Auth.js secret (`openssl rand -base64 32`)       |
| `AUTH_URL`     | prod     | Public site URL (e.g. `https://your-app.vercel.app`) |

## Demo logins (after seed)

| Role      | Email                 | Password      |
|-----------|-----------------------|---------------|
| Admin     | `admin@demo.local`    | `password123` |
| Clinician | `clinician@demo.local`| `password123` |
| Patient   | `patient@demo.local`  | `password123` |

## Scripts

| Script            | Purpose                          |
|-------------------|----------------------------------|
| `npm run dev`     | Next.js dev server               |
| `npm run build`   | Production build                 |
| `npm run start`   | Start production server          |
| `npm run db:push` | Push Drizzle schema to Postgres  |
| `npm run db:seed` | Seed demo users + availability   |
| `npm run db:studio` | Drizzle Studio                 |

## Out of scope (V1)

Email/SMS, video visits, medical records, insurance, payments, waitlist, multi-location, HIPAA BAA hosting.
