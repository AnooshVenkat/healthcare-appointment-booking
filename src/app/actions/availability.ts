"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockedSlots, weeklyAvailability } from "@/lib/db/schema";

export async function saveWeeklyHoursAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "clinician") {
    return;
  }

  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const slotMinutes = Number(formData.get("slotMinutes") || 30);

  if (
    Number.isNaN(dayOfWeek) ||
    dayOfWeek < 0 ||
    dayOfWeek > 6 ||
    !startTime ||
    !endTime ||
    startTime >= endTime
  ) {
    return;
  }

  await db.insert(weeklyAvailability).values({
    clinicianId: session.user.id,
    dayOfWeek,
    startTime,
    endTime,
    slotMinutes: [15, 30, 45, 60].includes(slotMinutes) ? slotMinutes : 30,
  });

  revalidatePath("/dashboard/clinician/availability");
}

export async function deleteWeeklyHoursAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "clinician") {
    return;
  }

  const id = String(formData.get("id") || "");
  await db
    .delete(weeklyAvailability)
    .where(
      and(
        eq(weeklyAvailability.id, id),
        eq(weeklyAvailability.clinicianId, session.user.id)
      )
    );

  revalidatePath("/dashboard/clinician/availability");
}

export async function addBlockedSlotAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "clinician") {
    return;
  }

  const startAt = new Date(String(formData.get("startAt") || ""));
  const endAt = new Date(String(formData.get("endAt") || ""));
  const reason = String(formData.get("reason") || "") || null;

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return;
  }

  await db.insert(blockedSlots).values({
    clinicianId: session.user.id,
    startAt,
    endAt,
    reason,
  });

  revalidatePath("/dashboard/clinician/availability");
}

export async function deleteBlockedSlotAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "clinician") {
    return;
  }

  const id = String(formData.get("id") || "");
  await db
    .delete(blockedSlots)
    .where(and(eq(blockedSlots.id, id), eq(blockedSlots.clinicianId, session.user.id)));

  revalidatePath("/dashboard/clinician/availability");
}
