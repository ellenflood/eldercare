import Link from "next/link";
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

const TONE_TEXT: Record<"ok" | "warning" | "neutral", string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  neutral: "",
};

export function StatPill({
  label,
  value,
  hint,
  tone = "neutral",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "ok" | "warning" | "neutral";
  href?: string;
}) {
  const content = (
    <>
      <div className="text-xs text-black/50 dark:text-white/50">{label}</div>
      <div className={`text-base font-semibold mt-0.5 leading-snug ${TONE_TEXT[tone]} ${href ? "hover:underline" : ""}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-black/40 dark:text-white/40 mt-0.5">{hint}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl bg-black/5 dark:bg-white/10 px-4 py-3 hover:bg-black/10 dark:hover:bg-white/15 transition-colors">
        {content}
      </Link>
    );
  }

  return <div className="rounded-xl bg-black/5 dark:bg-white/10 px-4 py-3">{content}</div>;
}
