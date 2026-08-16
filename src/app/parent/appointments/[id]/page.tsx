import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { updateAppointmentStatusAction } from "@/lib/actions";
import { formatDate, formatTime } from "@/lib/format";
import { getAppointment } from "@/lib/store";

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

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
      <Link href="/parent/appointments" className="text-sm text-black/40 hover:underline">
        ← Back to appointments
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{appointment.name}</h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">{appointment.specialty}</p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-black/40 dark:text-white/40">Date</dt>
            <dd className="font-medium">{formatDate(appointment.appointmentTime)}</dd>
          </div>
          <div>
            <dt className="text-black/40 dark:text-white/40">Time</dt>
            <dd className="font-medium">{formatTime(appointment.appointmentTime)}</dd>
          </div>
          <div>
            <dt className="text-black/40 dark:text-white/40">Provider</dt>
            <dd className="font-medium">{appointment.provider}</dd>
          </div>
          <div>
            <dt className="text-black/40 dark:text-white/40">Location</dt>
            <dd className="font-medium">{appointment.location}</dd>
          </div>
        </dl>

        {actions.length > 0 && (
          <div className="flex gap-2 mt-6">
            {actions.map((action) => (
              <form key={action.value} action={updateAppointmentStatusAction}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value={action.value} />
                <button className="text-sm px-3 py-1.5 rounded-full border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10">
                  {action.label}
                </button>
              </form>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
