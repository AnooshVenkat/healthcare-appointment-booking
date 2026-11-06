import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { RescheduleForm } from "@/components/reschedule-form";
import { auth } from "@/lib/auth";
import { getOpenSlots } from "@/lib/availability";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") {
    redirect("/login");
  }

  const { id } = await params;
  const [appt] = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.id, id),
        eq(appointments.patientId, session.user.id),
        ne(appointments.status, "cancelled")
      )
    )
    .limit(1);

  if (!appt) {
    redirect("/dashboard/patient");
  }

  const slots = await getOpenSlots(appt.clinicianId, new Date(), 21);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Reschedule</h1>
        <p className="text-muted">Pick a new open slot with the same clinician.</p>
      </div>
      <RescheduleForm appointmentId={appt.id} slots={slots} />
    </div>
  );
}
