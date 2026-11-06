import { format } from "date-fns";
import { cancelAction, completeAction } from "@/app/actions/appointments";
import type { AppointmentStatus } from "@/lib/db/schema";

type Row = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  notes?: string | null;
  patientName?: string | null;
  clinicianName?: string | null;
  specialty?: string | null;
};

export function AppointmentList({
  rows,
  mode,
}: {
  rows: Row[];
  mode: "patient" | "clinician" | "admin";
}) {
  if (rows.length === 0) {
    return <p className="text-muted">No appointments yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className={`badge badge-${row.status}`}>{row.status}</span>
              <strong>
                {format(row.startAt, "EEE MMM d")} · {format(row.startAt, "h:mm a")}–
                {format(row.endAt, "h:mm a")}
              </strong>
            </div>
            <p className="text-sm text-muted">
              {mode === "patient" && (
                <>
                  With {row.clinicianName}
                  {row.specialty ? ` (${row.specialty})` : ""}
                </>
              )}
              {mode === "clinician" && <>Patient: {row.patientName}</>}
              {mode === "admin" && (
                <>
                  {row.patientName} → {row.clinicianName}
                </>
              )}
            </p>
            {row.notes ? <p className="mt-1 text-sm">{row.notes}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {row.status === "booked" && (
              <>
                <form action={cancelAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button className="btn btn-danger" type="submit">
                    Cancel
                  </button>
                </form>
                {mode === "patient" && (
                  <a className="btn btn-secondary" href={`/dashboard/patient/reschedule/${row.id}`}>
                    Reschedule
                  </a>
                )}
                {mode === "clinician" && (
                  <form action={completeAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="btn btn-secondary" type="submit">
                      Mark completed
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
