import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentList } from "@/components/appointment-list";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "patient" && session.user.role !== "admin")) {
    redirect("/login");
  }

  const rows = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      notes: appointments.notes,
      clinicianName: users.name,
      specialty: users.specialty,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.clinicianId, users.id))
    .where(eq(appointments.patientId, session.user.id))
    .orderBy(desc(appointments.startAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">My appointments</h1>
          <p className="text-muted">View, cancel, or reschedule upcoming visits.</p>
        </div>
        <Link href="/dashboard/patient/book" className="btn btn-primary">
          Book appointment
        </Link>
      </div>
      <AppointmentList rows={rows} mode="patient" />
    </div>
  );
}
