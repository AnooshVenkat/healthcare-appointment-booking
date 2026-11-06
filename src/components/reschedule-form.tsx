"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { rescheduleAction } from "@/app/actions/appointments";
import { formatSlotLabel } from "@/lib/format";

type Slot = { startAt: string; endAt: string };

export function RescheduleForm({
  appointmentId,
  slots,
}: {
  appointmentId: string;
  slots: Slot[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slotKey, setSlotKey] = useState(slots[0] ? `${slots[0].startAt}|${slots[0].endAt}` : "");

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await rescheduleAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/patient");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="panel space-y-4">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      <input type="hidden" name="id" value={appointmentId} />
      {slots.length === 0 ? (
        <p className="text-muted">No alternate slots available right now.</p>
      ) : (
        <label className="block space-y-1 text-sm">
          <span>New slot</span>
          <select
            className="select"
            value={slotKey}
            onChange={(e) => setSlotKey(e.target.value)}
            required
          >
            {slots.map((s) => (
              <option key={s.startAt} value={`${s.startAt}|${s.endAt}`}>
                {formatSlotLabel(s.startAt)}
              </option>
            ))}
          </select>
        </label>
      )}
      <input type="hidden" name="startAt" value={slotKey.split("|")[0] || ""} />
      <input type="hidden" name="endAt" value={slotKey.split("|")[1] || ""} />
      <button className="btn btn-primary" type="submit" disabled={pending || slots.length === 0}>
        {pending ? "Saving…" : "Confirm reschedule"}
      </button>
    </form>
  );
}
