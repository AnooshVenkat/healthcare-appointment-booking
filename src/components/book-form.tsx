"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bookAction } from "@/app/actions/appointments";
import { formatSlotLabel } from "@/lib/format";

type Clinician = { id: string; name: string; specialty: string | null };
type Slot = { startAt: string; endAt: string };

export function BookForm({
  clinicians,
  selectedId,
  slots,
}: {
  clinicians: Clinician[];
  selectedId: string;
  slots: Slot[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slotKey, setSlotKey] = useState(slots[0] ? `${slots[0].startAt}|${slots[0].endAt}` : "");

  function onClinicianChange(id: string) {
    router.push(`/dashboard/patient/book?clinicianId=${id}`);
  }

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await bookAction(formData);
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
      <label className="block space-y-1 text-sm">
        <span>Clinician</span>
        <select
          className="select"
          name="clinicianId"
          value={selectedId}
          onChange={(e) => onClinicianChange(e.target.value)}
        >
          {clinicians.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.specialty ? ` — ${c.specialty}` : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1 text-sm">
        <span>Open slot</span>
        {slots.length === 0 ? (
          <p className="text-muted">No open slots in the next two weeks.</p>
        ) : (
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
        )}
      </label>

      <input type="hidden" name="startAt" value={slotKey.split("|")[0] || ""} />
      <input type="hidden" name="endAt" value={slotKey.split("|")[1] || ""} />

      <label className="block space-y-1 text-sm">
        <span>Notes (optional)</span>
        <textarea className="textarea" name="notes" rows={3} placeholder="Reason for visit" />
      </label>

      <button className="btn btn-primary" type="submit" disabled={pending || slots.length === 0}>
        {pending ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}
