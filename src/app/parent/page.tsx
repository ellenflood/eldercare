import Link from "next/link";
import { Card, CardTitle, StatPill } from "@/components/Card";
import Sparkline from "@/components/Sparkline";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { getAppointments, getDeviceLogs, getDocuments, getParent, getPrescriptions, getReminders } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function ParentDashboard() {
  const parent = getParent();
  const appointments = getAppointments();
  const prescriptions = getPrescriptions();
  const documents = getDocuments();
  const reminders = getReminders();
  const deviceLogs = getDeviceLogs();

  const upcoming = appointments.filter((a) => a.status === "Pending").slice(0, 3);
  const heartRate = deviceLogs
    .filter((l) => l.type === "HeartRate")
    .map((l) => ({ label: formatDate(l.createdAt).slice(0, 6), value: Number(l.value) }));
  const sleep = deviceLogs
    .filter((l) => l.type === "SleepDuration")
    .map((l) => ({ label: formatDate(l.createdAt).slice(0, 6), value: Number(l.value) }));

  function latestDoseStatus(prescriptionId: string) {
    const doseReminders = reminders
      .filter((r) => r.relatedType === "Prescription" && r.relatedId === prescriptionId)
      .sort((a, b) => b.dueTime.localeCompare(a.dueTime));
    return doseReminders[0];
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {parent.name}</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">{parent.condition} · Age {parent.age}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Active prescriptions" value={String(prescriptions.length)} />
        <StatPill label="Upcoming appointments" value={String(appointments.filter((a) => a.status === "Pending").length)} />
        <StatPill label="Documents" value={String(documents.length)} />
        <StatPill label="Linked devices" value="1" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardTitle action={<Link href="/parent/appointments" className="text-xs text-black/40 hover:underline">View all</Link>}>
            Appointments
          </CardTitle>
          <ul className="space-y-3">
            {appointments.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <div>
                  <Link href={`/parent/appointments/${a.id}`} className="text-sm font-medium hover:underline">
                    {a.name}
                  </Link>
                  <p className="text-xs text-black/40 dark:text-white/40">{formatDateTime(a.appointmentTime)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle action={<Link href="/parent/prescriptions" className="text-xs text-black/40 hover:underline">View all</Link>}>
            Prescriptions
          </CardTitle>
          <ul className="space-y-3">
            {prescriptions.map((rx) => {
              const dose = latestDoseStatus(rx.id);
              return (
                <li key={rx.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{rx.name}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">
                      {rx.dosage}
                      {rx.dosageUnit} · {rx.frequency}
                    </p>
                  </div>
                  {dose && <StatusBadge status={dose.status} />}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardTitle action={<Link href="/parent/documents" className="text-xs text-black/40 hover:underline">View all</Link>}>
            Documents
          </CardTitle>
          <ul className="space-y-3">
            {documents.slice(0, 3).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium truncate">{d.name}</p>
                <span className="text-xs text-black/40 dark:text-white/40 shrink-0">{d.type}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Wearable — Apple Watch</CardTitle>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-black/50 dark:text-white/50 mb-1">Heart rate (bpm)</p>
              <Sparkline points={heartRate} color="#ef4444" unit=" bpm" />
            </div>
            <div>
              <p className="text-xs text-black/50 dark:text-white/50 mb-1">Sleep duration (hrs)</p>
              <Sparkline points={sleep} color="#6366f1" unit="h" />
            </div>
          </div>
        </Card>
      </div>

      {upcoming.length > 0 && (
        <p className="text-xs text-black/40 dark:text-white/40 text-center">
          Next appointment: {upcoming[0].name} at {formatTime(upcoming[0].appointmentTime)} on {formatDate(upcoming[0].appointmentTime)}
        </p>
      )}
    </div>
  );
}
