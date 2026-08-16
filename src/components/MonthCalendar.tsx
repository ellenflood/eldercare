export interface CalendarEvent {
  date: string;
  kind: "Appointment" | "Bill" | "Prescription refill";
  title: string;
}

const KIND_DOT: Record<CalendarEvent["kind"], string> = {
  Appointment: "bg-indigo-500",
  Bill: "bg-red-500",
  "Prescription refill": "bg-emerald-500",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MonthCalendar({ events, today = new Date() }: { events: CalendarEvent[]; today?: Date }) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = toDateKey(today);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = toDateKey(new Date(event.date));
    eventsByDate.set(key, [...(eventsByDate.get(key) ?? []), event]);
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - startOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    const date = new Date(year, month, dayNumber);
    return { dayNumber, key: toDateKey(date) };
  });

  return (
    <div>
      <p className="text-center font-medium mb-3">
        {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-black/40 dark:text-white/40 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isToday = cell.key === todayKey;
          const dayEvents = eventsByDate.get(cell.key) ?? [];
          return (
            <div
              key={cell.key}
              className={`rounded-lg p-1.5 min-h-16 border text-xs ${
                isToday
                  ? "border-black dark:border-white bg-black/5 dark:bg-white/10"
                  : "border-black/5 dark:border-white/10"
              }`}
            >
              <div className={`text-right ${isToday ? "font-semibold" : "text-black/60 dark:text-white/60"}`}>
                {cell.dayNumber}
              </div>
              <div className="flex flex-wrap gap-0.5 mt-1 justify-end">
                {dayEvents.map((e, idx) => (
                  <span key={idx} title={e.title} className={`w-1.5 h-1.5 rounded-full ${KIND_DOT[e.kind]}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-black/50 dark:text-white/50 justify-center">
        {(Object.keys(KIND_DOT) as CalendarEvent["kind"][]).map((kind) => (
          <span key={kind} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${KIND_DOT[kind]}`} />
            {kind}
          </span>
        ))}
      </div>
    </div>
  );
}
