import type { WearableAssessment } from "@/lib/wearable";

export default function WearableStatusLine({ assessment }: { assessment: WearableAssessment }) {
  const isWarning = assessment.status === "warning";
  return (
    <p
      className={`flex items-center gap-1.5 text-xs mt-1 ${
        isWarning ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
      }`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isWarning ? "bg-amber-500" : "bg-emerald-500"}`} />
      {assessment.message}
    </p>
  );
}
