"use client";

import { useActionState } from "react";
import Link from "next/link";

type AuthState = { error?: string } | null;

export function LoginForm({
  action,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="panel mx-auto w-full max-w-md space-y-4">
      <div>
        <h1 className="text-3xl text-brand">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Use a demo account or your own signup.</p>
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input className="input" type="email" name="email" required autoComplete="email" />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Password</span>
        <input
          className="input"
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>
      <button className="btn btn-primary w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link className="font-semibold text-brand" href="/signup">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({
  action,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="panel mx-auto w-full max-w-md space-y-4">
      <div>
        <h1 className="text-3xl text-brand">Create account</h1>
        <p className="mt-1 text-sm text-muted">Patients and clinicians can self-register.</p>
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <label className="block space-y-1 text-sm">
        <span>Full name</span>
        <input className="input" name="name" required />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input className="input" type="email" name="email" required />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Password</span>
        <input className="input" type="password" name="password" minLength={6} required />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Role</span>
        <select className="select" name="role" defaultValue="patient">
          <option value="patient">Patient</option>
          <option value="clinician">Clinician</option>
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span>Specialty (clinicians)</span>
        <input className="input" name="specialty" placeholder="e.g. Family Medicine" />
      </label>
      <button className="btn btn-primary w-full" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link className="font-semibold text-brand" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
