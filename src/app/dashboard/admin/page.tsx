import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { redirect } from "next/navigation";
import { AppointmentList } from "@/components/appointment-list";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      specialty: users.specialty,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.role, users.name);

  const patients = alias(users, "patients");
  const clinicians = alias(users, "clinicians");

  const allAppts = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      notes: appointments.notes,
      patientName: patients.name,
      clinicianName: clinicians.name,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(clinicians, eq(appointments.clinicianId, clinicians.id))
    .orderBy(desc(appointments.startAt))
    .limit(50);

  const cliniciansOnly = allUsers.filter((u) => u.role === "clinician");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Admin overview</h1>
        <p className="text-muted">Users, clinicians, and all appointments.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl">Users ({allUsers.length})</h2>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 font-medium">Specialty</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/70">
                  <td className="py-2 pr-3">{u.name}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3 capitalize">{u.role}</td>
                  <td className="py-2">{u.specialty || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl">Clinicians ({cliniciansOnly.length})</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {cliniciansOnly.map((c) => (
            <li key={c.id} className="panel">
              <strong>{c.name}</strong>
              <p className="text-sm text-muted">{c.specialty || "General"}</p>
              <p className="text-sm">{c.email}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl">All appointments</h2>
        <AppointmentList rows={allAppts} mode="admin" />
      </section>
    </div>
  );
}
