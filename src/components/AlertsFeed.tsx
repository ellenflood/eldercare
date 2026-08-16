import Link from "next/link";
import type { Alert } from "@/lib/types";
import CallAgainButton from "@/components/CallAgainButton";
import { formatDateTime } from "@/lib/format";

function severityStyle(severity: number): string {
  if (severity >= 5) return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  if (severity >= 3) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
}

export default function AlertsFeed({ alerts }: { alerts: { alert: Alert; href: string | null }[] }) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-black/50 dark:text-white/50 py-6 text-center">
        No active alerts. Everything looks on track.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-black/5 dark:divide-white/10">
      {alerts.map(({ alert, href }) => (
        <li key={alert.id} className="py-3 flex items-start justify-between gap-3">
          <div>
            {href ? (
              <Link href={href} className="text-sm font-medium hover:underline">
                {alert.name}
              </Link>
            ) : (
              <p className="text-sm font-medium">{alert.name}</p>
            )}
            <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
              {alert.type} · {formatDateTime(alert.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${severityStyle(alert.severity)}`}>
              Severity {alert.severity}
            </span>
            <CallAgainButton reminderId={alert.reminderId} />
          </div>
        </li>
      ))}
    </ul>
  );
}
