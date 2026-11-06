import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardFor } from "@/lib/auth.config";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect(dashboardFor(session.user.role));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        Healthcare scheduling
      </p>
      <h1 className="max-w-2xl text-5xl leading-tight text-brand sm:text-6xl">CareSlot</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Book visits, manage clinician availability, and keep schedules clear — a free-tier
        friendly V1 MVP for local demos.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className="btn btn-primary">
          Sign in
        </Link>
        <Link href="/signup" className="btn btn-secondary">
          Create account
        </Link>
      </div>
      <p className="mt-10 max-w-xl text-sm text-muted">
        Demo tip: seed the database, then sign in as patient / clinician / admin. Free hosting
        platforms are not HIPAA-covered — use only synthetic demo data.
      </p>
    </div>
  );
}
