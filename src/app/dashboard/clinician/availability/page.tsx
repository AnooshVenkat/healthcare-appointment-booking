import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import {
  addBlockedSlotAction,
  deleteBlockedSlotAction,
  deleteWeeklyHoursAction,
  saveWeeklyHoursAction,
} from "@/app/actions/availability";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockedSlots, weeklyAvailability } from "@/lib/db/schema";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "clinician") {
    redirect("/login");
  }

  const [weekly, blocks] = await Promise.all([
    db
      .select()
      .from(weeklyAvailability)
      .where(eq(weeklyAvailability.clinicianId, session.user.id)),
    db.select().from(blockedSlots).where(eq(blockedSlots.clinicianId, session.user.id)),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Availability</h1>
        <p className="text-muted">Set weekly clinic hours and block time off.</p>
      </div>

      <section className="panel space-y-4">
        <h2 className="text-xl">Weekly hours</h2>
        <form action={saveWeeklyHoursAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-1 text-sm">
            <span>Day</span>
            <select className="select" name="dayOfWeek" defaultValue={1}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>Start</span>
            <input className="input" type="time" name="startTime" defaultValue="09:00" required />
          </label>
          <label className="space-y-1 text-sm">
            <span>End</span>
            <input className="input" type="time" name="endTime" defaultValue="17:00" required />
          </label>
          <label className="space-y-1 text-sm">
            <span>Slot (min)</span>
            <select className="select" name="slotMinutes" defaultValue={30}>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={45}>45</option>
              <option value={60}>60</option>
            </select>
          </label>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" type="submit">
              Add hours
            </button>
          </div>
        </form>

        <ul className="divide-y divide-border">
          {weekly.length === 0 && <li className="py-2 text-muted">No weekly hours yet.</li>}
          {weekly.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                {DAYS[w.dayOfWeek]} · {String(w.startTime).slice(0, 5)}–
                {String(w.endTime).slice(0, 5)} · {w.slotMinutes} min slots
              </span>
              <form action={deleteWeeklyHoursAction}>
                <input type="hidden" name="id" value={w.id} />
                <button className="btn btn-danger" type="submit">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel space-y-4">
        <h2 className="text-xl">Blocked slots</h2>
        <form action={addBlockedSlotAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span>Start</span>
            <input className="input" type="datetime-local" name="startAt" required />
          </label>
          <label className="space-y-1 text-sm">
            <span>End</span>
            <input className="input" type="datetime-local" name="endAt" required />
          </label>
          <label className="space-y-1 text-sm">
            <span>Reason</span>
            <input className="input" name="reason" placeholder="Vacation, meeting…" />
          </label>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" type="submit">
              Block time
            </button>
          </div>
        </form>

        <ul className="divide-y divide-border">
          {blocks.length === 0 && <li className="py-2 text-muted">No blocked time.</li>}
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                {format(b.startAt, "MMM d h:mm a")} → {format(b.endAt, "MMM d h:mm a")}
                {b.reason ? ` · ${b.reason}` : ""}
              </span>
              <form action={deleteBlockedSlotAction}>
                <input type="hidden" name="id" value={b.id} />
                <button className="btn btn-danger" type="submit">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
