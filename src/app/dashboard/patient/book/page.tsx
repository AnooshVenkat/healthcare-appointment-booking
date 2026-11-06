import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/book-form";
import { auth } from "@/lib/auth";
import { getOpenSlots } from "@/lib/availability";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ clinicianId?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") {
    redirect("/login");
  }

  const params = await searchParams;
  const clinicians = await db
    .select({
      id: users.id,
      name: users.name,
      specialty: users.specialty,
    })
    .from(users)
    .where(eq(users.role, "clinician"));

  const selectedId = params.clinicianId || clinicians[0]?.id;
  const slots = selectedId ? await getOpenSlots(selectedId, new Date(), 14) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Book an appointment</h1>
        <p className="text-muted">Choose a clinician and an open slot.</p>
      </div>
      {clinicians.length === 0 ? (
        <p className="panel text-muted">No clinicians are available yet.</p>
      ) : (
        <BookForm clinicians={clinicians} selectedId={selectedId!} slots={slots} />
      )}
    </div>
  );
}
