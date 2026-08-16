import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display font-medium text-sm uppercase tracking-wide text-muted-foreground">{children}</h2>
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
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-base font-semibold mt-0.5 leading-snug ${TONE_TEXT[tone]} ${href ? "hover:underline" : ""}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-md bg-muted px-4 py-3 hover:bg-accent transition-colors">
        {content}
      </Link>
    );
  }

  return <div className="rounded-md bg-muted px-4 py-3">{content}</div>;
}
