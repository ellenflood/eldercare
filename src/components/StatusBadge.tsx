const STYLES: Record<string, string> = {
  Attended: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Answered: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "Not Answered": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "Didn't attend": "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
        STYLES[status] ?? "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"
      }`}
    >
      {status}
    </span>
  );
}
