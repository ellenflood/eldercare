import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { updateAppointmentStatusAction } from "@/lib/actions";
import { formatDate, formatTime } from "@/lib/format";
import { getAppointment, getDocumentsForAppointment } from "@/lib/store";

export const dynamic = "force-dynamic";

const NEXT_STATUS: Record<string, { label: string; value: "Attended" | "Didn't attend" }[]> = {
  Pending: [
    { label: "Mark attended", value: "Attended" },
    { label: "Mark missed", value: "Didn't attend" },
  ],
};

export default async function AppointmentDetailPage({ params }: PageProps<"/parent/appointments/[id]">) {
  const { id } = await params;
  const appointment = getAppointment(id);
  if (!appointment) notFound();

  const actions = NEXT_STATUS[appointment.status] ?? [];
  const documents = getDocumentsForAppointment(appointment.id);

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
      <Link href="/parent/appointments" className="text-sm text-muted-foreground hover:underline">
        ← Back to appointments
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{appointment.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{appointment.specialty}</p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="font-medium">{formatDate(appointment.appointmentTime)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="font-medium">{formatTime(appointment.appointmentTime)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Provider</dt>
            <dd className="font-medium">{appointment.provider}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="font-medium">{appointment.location}</dd>
          </div>
        </dl>

        {actions.length > 0 && (
          <div className="flex gap-2 mt-6">
            {actions.map((action) => (
              <form key={action.value} action={updateAppointmentStatusAction}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value={action.value} />
                <button className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-accent">
                  {action.label}
                </button>
              </form>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-medium">Documents</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bills, visit summaries, and results tied to this appointment.
        </p>

        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No documents linked to this appointment yet.
          </p>
        ) : (
          <ul className="divide-y divide-border mt-3">
            {documents.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/parent/documents/${d.id}`}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-accent/50 -mx-2 px-2 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(d.createdAt)}
                      {d.dueDate ? ` · Due ${formatDate(d.dueDate)}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted shrink-0">
                    {d.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
