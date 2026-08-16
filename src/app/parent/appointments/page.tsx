import Link from "next/link";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { getAppointments } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AppointmentsPage() {
  const appointments = getAppointments();

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>

      <Card>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {appointments.map((a) => (
            <li key={a.id} className="py-3">
              <Link href={`/parent/appointments/${a.id}`} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">
                    {a.provider} · {formatDateTime(a.appointmentTime)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
