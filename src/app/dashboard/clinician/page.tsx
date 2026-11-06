import { and, desc, eq, gte, ne } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentList } from "@/components/appointment-list";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";

export default async function ClinicianDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "clinician" && session.user.role !== "admin")) {
    redirect("/login");
  }

  const upcoming = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      notes: appointments.notes,
      patientName: users.name,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.patientId, users.id))
    .where(
      and(
        eq(appointments.clinicianId, session.user.id),
        ne(appointments.status, "cancelled"),
        gte(appointments.startAt, new Date())
      )
    )
    .orderBy(appointments.startAt);

  const recent = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      notes: appointments.notes,
      patientName: users.name,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.patientId, users.id))
    .where(eq(appointments.clinicianId, session.user.id))
    .orderBy(desc(appointments.startAt))
    .limit(20);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Upcoming schedule</h1>
          <p className="text-muted">Booked visits from now forward.</p>
        </div>
        <Link href="/dashboard/clinician/availability" className="btn btn-primary">
          Edit availability
        </Link>
      </div>
      <AppointmentList rows={upcoming} mode="clinician" />

      <section className="space-y-3">
        <h2 className="text-2xl">Recent (incl. past / cancelled)</h2>
        <AppointmentList rows={recent} mode="clinician" />
      </section>
    </div>
  );
}
