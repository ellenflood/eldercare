import { Card } from "@/components/Card";
import MonthCalendar from "@/components/MonthCalendar";
import { formatDate, formatTime } from "@/lib/format";
import { getAppointments, getDocuments, getPrescriptions, getReminders } from "@/lib/store";

export const dynamic = "force-dynamic";

interface CalendarEvent {
  date: string;
  kind: "Appointment" | "Bill" | "Prescription refill";
  title: string;
  detail: string;
}

const KIND_COLOR: Record<CalendarEvent["kind"], string> = {
  Appointment: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Bill: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  "Prescription refill": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export default function CalendarPage() {
  const appointments = getAppointments();
  const documents = getDocuments();
  const prescriptions = getPrescriptions();
  const reminders = getReminders();

  const events: CalendarEvent[] = [];

  for (const appt of appointments) {
    events.push({
      date: appt.appointmentTime,
      kind: "Appointment",
      title: appt.name,
      detail: `${appt.provider} · ${appt.location}`,
    });
  }

  for (const doc of documents) {
    if (doc.type === "Bill" && doc.dueDate) {
      events.push({ date: doc.dueDate, kind: "Bill", title: doc.name, detail: "Due date" });
    }
  }

  for (const rx of prescriptions) {
    const nextDose = reminders
      .filter((r) => r.relatedType === "Prescription" && r.relatedId === rx.id && r.status !== "Answered")
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime))[0];
    if (nextDose) {
      events.push({
        date: nextDose.dueTime,
        kind: "Prescription refill",
        title: rx.name,
        detail: `${rx.dosage}${rx.dosageUnit} · ${rx.frequency}`,
      });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <p className="text-sm text-black/50 dark:text-white/50">
        Appointments, bill due dates, and prescription refills in one view.
      </p>

      <Card>
        <MonthCalendar events={events} />
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-black/40 dark:text-white/40 mb-2">Agenda</p>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {events.map((e, i) => (
            <li key={i} className="py-3 flex items-center gap-4">
              <div className="w-20 shrink-0 text-sm font-medium">{formatDate(e.date)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-black/40 dark:text-white/40">
                  {e.detail} · {formatTime(e.date)}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${KIND_COLOR[e.kind]}`}>{e.kind}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
