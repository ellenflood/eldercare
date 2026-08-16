import { getAppointments, getDocuments, getPrescriptions, getReminders } from "@/lib/store";

export interface CalendarEvent {
  date: string;
  kind: "Appointment" | "Bill" | "Prescription refill";
  title: string;
  detail: string;
  href: string;
}

export const KIND_COLOR: Record<CalendarEvent["kind"], string> = {
  Appointment: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Bill: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  "Prescription refill": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function getCalendarEvents(): CalendarEvent[] {
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
  return events;
}
