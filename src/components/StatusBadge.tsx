const STYLES: Record<string, string> = {
  Attended: "border-success/30 bg-success/10 text-success",
  Answered: "border-success/30 bg-success/10 text-success",
  Pending: "border-accent-light bg-accent-subtle text-accent-hover",
  "Not Answered": "border-accent-light bg-accent-subtle text-accent-hover",
  Deferred: "border-accent-light bg-accent-subtle text-accent-hover",
  "Didn't attend": "border-destructive/30 bg-destructive/10 text-destructive",
  Rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono text-[0.625rem] font-medium uppercase tracking-wider px-2 py-1 whitespace-nowrap ${
        STYLES[status] ?? "border-border bg-secondary text-secondary-foreground"
      }`}
    >
      {status}
    </span>
  );
}
