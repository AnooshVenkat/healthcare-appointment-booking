"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { dashboardFor } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { users, type Role } from "@/lib/db/schema";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["patient", "clinician"]).default("patient"),
  specialty: z.string().optional(),
});

export async function signupAction(_prev: unknown, formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "patient",
    specialty: formData.get("specialty") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please provide a valid name, email, and password (6+ chars)." };
  }

  const { name, email, password, role, specialty } = parsed.data;
  const normalized = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hash(password, 10);
  await db.insert(users).values({
    name,
    email: normalized,
    passwordHash,
    role: role as Role,
    specialty: role === "clinician" ? specialty || "General Practice" : null,
  });

  try {
    await signIn("credentials", {
      email: normalized,
      password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created but sign-in failed. Try logging in." };
    }
    throw err;
  }

  redirect(dashboardFor(role));
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  redirect(dashboardFor(user?.role));
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
