import Link from "next/link";
import { Card, CardTitle, StatPill } from "@/components/Card";
import Sparkline from "@/components/Sparkline";
import StatusBadge from "@/components/StatusBadge";
import WearableStatusLine from "@/components/WearableStatusLine";
import { formatDate, formatDateTime, formatFullDate } from "@/lib/format";
import { combineWearableStatus, nextUpcomingAppointment, refillsDueThisWeek, todayDoseAdherence } from "@/lib/insights";
import { getAppointments, getDeviceLogs, getDocuments, getParent, getPrescriptions, getReminders } from "@/lib/store";
import { assessHeartRate, assessSleep } from "@/lib/wearable";

export const dynamic = "force-dynamic";

export default function ParentDashboard() {
  const parent = getParent();
  const appointments = getAppointments();
  const prescriptions = getPrescriptions();
  const documents = getDocuments();
  const reminders = getReminders();
  const deviceLogs = getDeviceLogs();

  const heartRate = deviceLogs
    .filter((l) => l.type === "HeartRate")
    .map((l) => ({ label: formatDate(l.createdAt).slice(0, 6), value: Number(l.value) }));
  const sleep = deviceLogs
    .filter((l) => l.type === "SleepDuration")
    .map((l) => ({ label: formatDate(l.createdAt).slice(0, 6), value: Number(l.value) }));
  const heartRateAssessment = assessHeartRate(heartRate);
  const sleepAssessment = assessSleep(sleep);
  const wearableStatus = combineWearableStatus(heartRateAssessment, sleepAssessment);

  const nextAppointment = nextUpcomingAppointment(appointments);
  const refills = refillsDueThisWeek(prescriptions, reminders);
  const adherence = todayDoseAdherence(reminders);

  function latestDoseStatus(prescriptionId: string) {
    const doseReminders = reminders
      .filter((r) => r.relatedType === "Prescription" && r.relatedId === prescriptionId)
      .sort((a, b) => b.dueTime.localeCompare(a.dueTime));
    return doseReminders[0];
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {parent.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{parent.condition} · Age {parent.age}</p>
        </div>
        <p className="text-sm text-muted-foreground shrink-0 pt-1">{formatFullDate()}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          label="Upcoming appointment"
          value={nextAppointment ? nextAppointment.name : "None scheduled"}
          hint={nextAppointment ? formatDateTime(nextAppointment.appointmentTime) : undefined}
          href={nextAppointment ? `/parent/appointments/${nextAppointment.id}` : undefined}
        />
        <StatPill
          label="Refills this week"
          value={
            refills.length > 0 ? (
              refills.map((r, i) => (
                <span key={r.prescription.id}>
                  {i > 0 && ", "}
                  <Link href={`/parent/prescriptions/${r.prescription.id}`} className="hover:underline">
                    {r.prescription.name}
                  </Link>
                </span>
              ))
            ) : (
              "None due"
            )
          }
        />
        <StatPill
          label="Today's doses"
          value={adherence.total > 0 ? `${adherence.taken} of ${adherence.total} taken` : "None scheduled"}
          tone={adherence.total > 0 && adherence.taken < adherence.total ? "warning" : "ok"}
        />
        <StatPill
          label="Wearable status"
          value={wearableStatus.status === "warning" ? "Attention needed" : "All normal"}
          tone={wearableStatus.status}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardTitle action={<Link href="/parent/appointments" className="text-xs text-muted-foreground hover:underline">View all</Link>}>
            Appointments
          </CardTitle>
          <ul className="space-y-3">
            {appointments.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <div>
                  <Link href={`/parent/appointments/${a.id}`} className="text-sm font-medium hover:underline">
                    {a.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatDateTime(a.appointmentTime)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle action={<Link href="/parent/prescriptions" className="text-xs text-muted-foreground hover:underline">View all</Link>}>
            Prescriptions
          </CardTitle>
          <ul className="space-y-3">
            {prescriptions.map((rx) => {
              const dose = latestDoseStatus(rx.id);
              return (
                <li key={rx.id} className="flex items-center justify-between gap-3">
                  <div>
                    <Link href={`/parent/prescriptions/${rx.id}`} className="text-sm font-medium hover:underline">
                      {rx.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
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
          <CardTitle action={<Link href="/parent/documents" className="text-xs text-muted-foreground hover:underline">View all</Link>}>
            Documents
          </CardTitle>
          <ul className="space-y-3">
            {documents.slice(0, 3).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3">
                <Link href={`/parent/documents/${d.id}`} className="text-sm font-medium truncate hover:underline">
                  {d.name}
                </Link>
                <span className="text-xs text-muted-foreground shrink-0">{d.type}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Wearable — Apple Watch</CardTitle>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Heart rate (bpm)</p>
              <Sparkline points={heartRate} color="#ef4444" unit=" bpm" />
              <WearableStatusLine assessment={heartRateAssessment} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sleep duration (hrs)</p>
              <Sparkline points={sleep} color="#6366f1" unit="h" decimals={1} />
              <WearableStatusLine assessment={sleepAssessment} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
