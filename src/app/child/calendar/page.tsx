import CalendarView from "@/components/CalendarView";
import { getCalendarEvents } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export default function ChildCalendarPage() {
  const events = getCalendarEvents();

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-[1.8rem] font-semibold">Calendar</h1>
      <p className="text-sm text-muted-foreground">
        Appointments, bill due dates, and prescription refills in one view. Click a date with something on it
        to jump to the details below.
      </p>

      <CalendarView events={events} />
    </div>
  );
}
