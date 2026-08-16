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

const KIND_TEXT: Record<CalendarEvent["kind"], string> = {
  Appointment: "text-indigo-600 dark:text-indigo-400",
  Bill: "text-red-600 dark:text-red-400",
  "Prescription refill": "text-emerald-600 dark:text-emerald-400",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_PER_DAY = 2;

export function toDateKey(d: Date): string {
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
      <p className="text-center font-display font-medium mb-3">
        {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const isToday = cell.key === todayKey;
          const dayEvents = eventsByDate.get(cell.key) ?? [];
          const hasEvents = dayEvents.length > 0;

          const cellClassName = `block rounded-md p-1.5 min-h-16 border text-xs transition-colors ${
            isToday ? "border-primary bg-accent" : "border-border"
          } ${hasEvents ? "cursor-pointer hover:border-ring/50 hover:bg-accent/50" : ""}`;

          const cellContent = (
            <>
              <div className={`text-right ${isToday ? "font-semibold" : "text-muted-foreground"}`}>
                {cell.dayNumber}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, MAX_VISIBLE_PER_DAY).map((e, idx) => (
                  <div key={idx} className={`truncate leading-tight text-[10px] font-medium ${KIND_TEXT[e.kind]}`}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > MAX_VISIBLE_PER_DAY && (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - MAX_VISIBLE_PER_DAY} more
                  </div>
                )}
              </div>
            </>
          );

          return hasEvents ? (
            <a key={cell.key} href={`#day-${cell.key}`} className={cellClassName}>
              {cellContent}
            </a>
          ) : (
            <div key={cell.key} className={cellClassName}>
              {cellContent}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground justify-center">
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
