import {
  addDays,
  addMinutes,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { and, eq, gte, lt, ne } from "drizzle-orm";
import { db } from "./db";
import { appointments, blockedSlots, weeklyAvailability } from "./db/schema";

function parseTimeOnDate(day: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return setMinutes(setHours(startOfDay(day), h), m || 0);
}

export async function getOpenSlots(clinicianId: string, fromDate: Date, days = 14) {
  const endWindow = addDays(fromDate, days);

  const [weekly, blocks, existing] = await Promise.all([
    db
      .select()
      .from(weeklyAvailability)
      .where(eq(weeklyAvailability.clinicianId, clinicianId)),
    db
      .select()
      .from(blockedSlots)
      .where(
        and(
          eq(blockedSlots.clinicianId, clinicianId),
          lt(blockedSlots.startAt, endWindow),
          gte(blockedSlots.endAt, fromDate)
        )
      ),
    db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicianId, clinicianId),
          ne(appointments.status, "cancelled"),
          gte(appointments.startAt, fromDate),
          lt(appointments.startAt, endWindow)
        )
      ),
  ]);

  const slots: { startAt: string; endAt: string }[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const day = addDays(startOfDay(fromDate), d);
    const dow = day.getDay();
    const dayRules = weekly.filter((w) => w.dayOfWeek === dow);

    for (const rule of dayRules) {
      let cursor = parseTimeOnDate(day, String(rule.startTime).slice(0, 5));
      const end = parseTimeOnDate(day, String(rule.endTime).slice(0, 5));
      const duration = rule.slotMinutes;

      while (addMinutes(cursor, duration) <= end) {
        const slotEnd = addMinutes(cursor, duration);
        const overlapsBlock = blocks.some(
          (b) => cursor < b.endAt && slotEnd > b.startAt
        );
        const overlapsAppt = existing.some(
          (a) => cursor < a.endAt && slotEnd > a.startAt
        );

        if (!overlapsBlock && !overlapsAppt && !isBefore(slotEnd, now)) {
          slots.push({
            startAt: cursor.toISOString(),
            endAt: slotEnd.toISOString(),
          });
        }
        cursor = slotEnd;
      }
    }
  }

  return slots;
}
