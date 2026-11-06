import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { dashboardFor } from "@/lib/auth.config";
import type { Role } from "@/lib/db/schema";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: Role };
}) {
  const home = dashboardFor(user.role);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link href={home} className="font-[family-name:var(--font-display)] text-2xl text-brand">
            CareSlot
          </Link>
          <p className="text-sm text-muted">
            {user.name} · {user.role}
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {user.role === "patient" && (
            <>
              <Link className="btn btn-secondary" href="/dashboard/patient">
                My appointments
              </Link>
              <Link className="btn btn-primary" href="/dashboard/patient/book">
                Book
              </Link>
            </>
          )}
          {user.role === "clinician" && (
            <>
              <Link className="btn btn-secondary" href="/dashboard/clinician">
                Schedule
              </Link>
              <Link className="btn btn-primary" href="/dashboard/clinician/availability">
                Availability
              </Link>
            </>
          )}
          {user.role === "admin" && (
            <Link className="btn btn-primary" href="/dashboard/admin">
              Admin
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit" className="btn btn-secondary">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
