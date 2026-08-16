import Link from "next/link";
import AlertsFeed from "@/components/AlertsFeed";
import { Card, CardTitle, StatPill } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatFullDate } from "@/lib/format";
import { combineWearableStatus, nextUpcomingAppointment, refillsDueThisWeek } from "@/lib/insights";
import { getAlerts, getAppointments, getChild, getDeviceLogs, getParent, getPrescriptions, getReminders } from "@/lib/store";
import { assessHeartRate, assessSleep } from "@/lib/wearable";

export const dynamic = "force-dynamic";

export default function ChildDashboard() {
  const child = getChild();
  const parent = getParent();
  const appointments = getAppointments();
  const prescriptions = getPrescriptions();
  const reminders = getReminders();
  const deviceLogs = getDeviceLogs();
  const alerts = getAlerts();

  const upcoming = appointments.filter((a) => a.status === "Pending").slice(0, 3);

  const heartRate = deviceLogs
    .filter((l) => l.type === "HeartRate")
    .map((l) => ({ label: formatDate(l.createdAt).slice(0, 6), value: Number(l.value) }));
  const sleep = deviceLogs
    .filter((l) => l.type === "SleepDuration")
    .map((l) => ({ label: formatDate(l.createdAt).slice(0, 6), value: Number(l.value) }));
  const wearableStatus = combineWearableStatus(assessHeartRate(heartRate), assessSleep(sleep));

  const nextAppointment = nextUpcomingAppointment(appointments);
  const refills = refillsDueThisWeek(prescriptions, reminders);

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hi {child.name}</h1>
          <p className="text-sm text-black/50 dark:text-white/50 mt-1">
            Keeping an eye on {parent.name} ({parent.condition})
          </p>
        </div>
        <p className="text-sm text-black/40 dark:text-white/40 shrink-0 pt-1">{formatFullDate()}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          label="Upcoming appointment"
          value={nextAppointment ? nextAppointment.name : "None scheduled"}
          hint={nextAppointment ? formatDateTime(nextAppointment.appointmentTime) : undefined}
        />
        <StatPill
          label="Refills this week"
          value={refills.length > 0 ? refills.map((r) => r.prescription.name).join(", ") : "None due"}
        />
        <StatPill label="Active alerts" value={String(alerts.length)} tone={alerts.length > 0 ? "warning" : "ok"} />
        <StatPill
          label="Wearable status"
          value={wearableStatus.status === "warning" ? "Attention needed" : "All normal"}
          tone={wearableStatus.status}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardTitle>Alerts</CardTitle>
          <AlertsFeed alerts={alerts} />
        </Card>

        <Card>
          <CardTitle>Upcoming appointments</CardTitle>
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">{formatDateTime(a.appointmentTime)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
            {upcoming.length === 0 && <p className="text-sm text-black/40">Nothing scheduled.</p>}
          </ul>
        </Card>

        <Card>
          <CardTitle>Parent snapshot</CardTitle>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-black/40 dark:text-white/40">Name</dt>
              <dd className="font-medium">{parent.name}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Condition</dt>
              <dd className="font-medium">{parent.condition}</dd>
            </div>
            <div>
              <dt className="text-black/40 dark:text-white/40">Prescriptions</dt>
              <dd className="font-medium">{prescriptions.map((p) => p.name).join(", ")}</dd>
            </div>
          </dl>
          <Link href="/child/account" className="text-xs text-black/40 hover:underline mt-4 inline-block">
            View account →
          </Link>
        </Card>
      </div>
    </div>
  );
}
