import Link from "next/link";
import { Card } from "@/components/Card";
import MonthCalendar, { toDateKey } from "@/components/MonthCalendar";
import { formatDate, formatTime } from "@/lib/format";
import { KIND_COLOR, type CalendarEvent } from "@/lib/calendar";

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = toDateKey(new Date(event.date));
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event]);
  }

  return (
    <>
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
    </>
  );
}
