import Link from "next/link";
import { Card } from "@/components/Card";
import MonthCalendar, { toDateKey } from "@/components/MonthCalendar";
import { formatDate, formatTime } from "@/lib/format";
import { getAppointments, getDocuments, getPrescriptions, getReminders } from "@/lib/store";

export const dynamic = "force-dynamic";

interface CalendarEvent {
  date: string;
  kind: "Appointment" | "Bill" | "Prescription refill";
  title: string;
  detail: string;
  href: string;
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
      href: `/parent/appointments/${appt.id}`,
    });
  }

  for (const doc of documents) {
    if (doc.type === "Bill" && doc.dueDate) {
      events.push({
        date: doc.dueDate,
        kind: "Bill",
        title: doc.name,
        detail: "Due date",
        href: `/parent/documents/${doc.id}`,
      });
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
        href: `/parent/prescriptions/${rx.id}`,
      });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = toDateKey(new Date(event.date));
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event]);
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <p className="text-sm text-muted-foreground">
        Appointments, bill due dates, and prescription refills in one view. Click a date with something on it
        to jump to the details below.
      </p>

      <Card>
        <MonthCalendar events={events} />
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Agenda</p>
        <div className="divide-y divide-border">
          {[...eventsByDay.entries()].map(([dayKey, dayEvents]) => (
            <div key={dayKey} id={`day-${dayKey}`} className="py-3 scroll-mt-24">
              <p className="text-sm font-semibold mb-2">{formatDate(dayEvents[0].date)}</p>
              <ul className="space-y-3">
                {dayEvents.map((e, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Link href={e.href} className="text-sm font-medium hover:underline">
                        {e.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {e.detail} · {formatTime(e.date)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${KIND_COLOR[e.kind]}`}>
                      {e.kind}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
