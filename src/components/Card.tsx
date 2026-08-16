import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-medium text-sm uppercase tracking-wide text-black/50 dark:text-white/50">{children}</h2>
      {action}
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/5 dark:bg-white/10 px-4 py-3">
      <div className="text-xs text-black/50 dark:text-white/50">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}
