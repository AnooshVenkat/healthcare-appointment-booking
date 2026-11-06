"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  bookAppointment,
  cancelAppointment,
  markCompleted,
  rescheduleAppointment,
} from "@/lib/appointments";

export async function bookAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "patient") {
    return { error: "Only patients can book appointments." };
  }

  const clinicianId = String(formData.get("clinicianId") || "");
  const startAt = new Date(String(formData.get("startAt") || ""));
  const endAt = new Date(String(formData.get("endAt") || ""));
  const notes = String(formData.get("notes") || "");

  if (!clinicianId || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { error: "Missing slot details." };
  }

  try {
    await bookAppointment({
      patientId: session.user.id,
      clinicianId,
      startAt,
      endAt,
      notes,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Booking failed." };
  }

  revalidatePath("/dashboard/patient");
  revalidatePath("/dashboard/clinician");
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

export async function cancelAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const id = String(formData.get("id") || "");
  try {
    await cancelAppointment(id, session.user.id, session.user.role);
  } catch {
    return;
  }

  revalidatePath("/dashboard/patient");
  revalidatePath("/dashboard/clinician");
  revalidatePath("/dashboard/admin");
}

export async function rescheduleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const id = String(formData.get("id") || "");
  const startAt = new Date(String(formData.get("startAt") || ""));
  const endAt = new Date(String(formData.get("endAt") || ""));

  try {
    await rescheduleAppointment({
      id,
      actorId: session.user.id,
      role: session.user.role,
      startAt,
      endAt,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Reschedule failed." };
  }

  revalidatePath("/dashboard/patient");
  revalidatePath("/dashboard/clinician");
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

export async function completeAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "clinician" && session.user.role !== "admin")) {
    return;
  }

  const id = String(formData.get("id") || "");
  await markCompleted(id, session.user.id);
  revalidatePath("/dashboard/clinician");
  revalidatePath("/dashboard/admin");
}
