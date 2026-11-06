import "dotenv/config";
import { hash } from "bcryptjs";
import { addDays, setHours, setMinutes, startOfDay } from "date-fns";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  appointments,
  blockedSlots,
  users,
  weeklyAvailability,
} from "../src/lib/db/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);

  console.log("Clearing existing demo data…");
  await db.delete(appointments);
  await db.delete(blockedSlots);
  await db.delete(weeklyAvailability);
  await db.delete(users);

  const passwordHash = await hash("password123", 10);

  const [admin] = await db
    .insert(users)
    .values({
      name: "Ada Admin",
      email: "admin@demo.local",
      passwordHash,
      role: "admin",
    })
    .returning();

  const [clinician] = await db
    .insert(users)
    .values({
      name: "Dr. Casey Clinician",
      email: "clinician@demo.local",
      passwordHash,
      role: "clinician",
      specialty: "Family Medicine",
    })
    .returning();

  const [patient] = await db
    .insert(users)
    .values({
      name: "Pat Patient",
      email: "patient@demo.local",
      passwordHash,
      role: "patient",
    })
    .returning();

  // Mon–Fri 09:00–12:00 and 13:00–17:00, 30-min slots
  const weekly = [];
  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    weekly.push(
      {
        clinicianId: clinician.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "12:00",
        slotMinutes: 30,
      },
      {
        clinicianId: clinician.id,
        dayOfWeek,
        startTime: "13:00",
        endTime: "17:00",
        slotMinutes: 30,
      }
    );
  }
  await db.insert(weeklyAvailability).values(weekly);

  // Block tomorrow lunch-ish already covered; add a half-day block next week Wednesday afternoon
  const nextWed = addDays(startOfDay(new Date()), ((3 - new Date().getDay() + 7) % 7) || 7);
  await db.insert(blockedSlots).values({
    clinicianId: clinician.id,
    startAt: setMinutes(setHours(nextWed, 13), 0),
    endAt: setMinutes(setHours(nextWed, 17), 0),
    reason: "Clinic meeting",
  });

  // Seed one upcoming appointment if a weekday morning exists
  const start = setMinutes(setHours(addDays(startOfDay(new Date()), 1), 10), 0);
  // bump to weekday
  let apptStart = start;
  while (apptStart.getDay() === 0 || apptStart.getDay() === 6) {
    apptStart = addDays(apptStart, 1);
  }
  const apptEnd = setMinutes(setHours(apptStart, 10), 30);

  await db.insert(appointments).values({
    patientId: patient.id,
    clinicianId: clinician.id,
    startAt: apptStart,
    endAt: apptEnd,
    appointmentDate: apptStart.toISOString().slice(0, 10),
    status: "booked",
    notes: "Annual checkup",
  });

  console.log("Seeded users:");
  console.log(`  admin     ${admin.email} / password123`);
  console.log(`  clinician ${clinician.email} / password123`);
  console.log(`  patient   ${patient.email} / password123`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
