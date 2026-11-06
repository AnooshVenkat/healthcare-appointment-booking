import { and, eq, gte, ne } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "./db";
import { appointments } from "./db/schema";
import { getOpenSlots } from "./availability";

export async function bookAppointment(input: {
  patientId: string;
  clinicianId: string;
  startAt: Date;
  endAt: Date;
  notes?: string;
}) {
  const open = await getOpenSlots(input.clinicianId, new Date(), 21);
  const match = open.find(
    (s) =>
      s.startAt === input.startAt.toISOString() &&
      s.endAt === input.endAt.toISOString()
  );
  if (!match) {
    throw new Error("That slot is no longer available.");
  }

  const [row] = await db
    .insert(appointments)
    .values({
      patientId: input.patientId,
      clinicianId: input.clinicianId,
      startAt: input.startAt,
      endAt: input.endAt,
      appointmentDate: format(input.startAt, "yyyy-MM-dd"),
      notes: input.notes || null,
      status: "booked",
    })
    .returning();

  return row;
}

export async function cancelAppointment(id: string, actorId: string, role: string) {
  const [appt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);

  if (!appt) throw new Error("Appointment not found.");
  if (appt.status === "cancelled") throw new Error("Already cancelled.");

  const allowed =
    role === "admin" ||
    (role === "patient" && appt.patientId === actorId) ||
    (role === "clinician" && appt.clinicianId === actorId);

  if (!allowed) throw new Error("Not allowed to cancel this appointment.");

  const [row] = await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning();

  return row;
}

export async function rescheduleAppointment(input: {
  id: string;
  actorId: string;
  role: string;
  startAt: Date;
  endAt: Date;
}) {
  const [appt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, input.id))
    .limit(1);

  if (!appt) throw new Error("Appointment not found.");
  if (appt.status === "cancelled") throw new Error("Cannot reschedule a cancelled appointment.");

  const allowed =
    input.role === "admin" ||
    (input.role === "patient" && appt.patientId === input.actorId) ||
    (input.role === "clinician" && appt.clinicianId === input.actorId);

  if (!allowed) throw new Error("Not allowed to reschedule this appointment.");

  // Temporarily treat current appt as cancelled for slot check
  await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(appointments.id, input.id));

  try {
    const open = await getOpenSlots(appt.clinicianId, new Date(), 21);
    const match = open.find(
      (s) =>
        s.startAt === input.startAt.toISOString() &&
        s.endAt === input.endAt.toISOString()
    );
    if (!match) {
      throw new Error("That slot is no longer available.");
    }

    const [row] = await db
      .update(appointments)
      .set({
        startAt: input.startAt,
        endAt: input.endAt,
        appointmentDate: format(input.startAt, "yyyy-MM-dd"),
        status: "booked",
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, input.id))
      .returning();

    return row;
  } catch (err) {
    await db
      .update(appointments)
      .set({ status: appt.status, updatedAt: new Date() })
      .where(eq(appointments.id, input.id));
    throw err;
  }
}

export async function markCompleted(id: string, clinicianId: string) {
  const [row] = await db
    .update(appointments)
    .set({ status: "completed", updatedAt: new Date() })
    .where(
      and(
        eq(appointments.id, id),
        eq(appointments.clinicianId, clinicianId),
        ne(appointments.status, "cancelled")
      )
    )
    .returning();
  return row;
}

export async function listUpcomingForClinician(clinicianId: string) {
  return db.query.appointments.findMany({
    where: and(
      eq(appointments.clinicianId, clinicianId),
      ne(appointments.status, "cancelled"),
      gte(appointments.startAt, new Date())
    ),
    with: { patient: true },
    orderBy: (a, { asc }) => [asc(a.startAt)],
  });
}
