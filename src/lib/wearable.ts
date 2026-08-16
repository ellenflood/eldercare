export interface WearableAssessment {
  status: "ok" | "warning";
  message: string;
}

interface SeriesPoint {
  label: string;
  value: number;
}

/** Flags a spike if the latest reading is a resting tachycardia reading, or a sharp jump above the recent average. */
export function assessHeartRate(points: SeriesPoint[]): WearableAssessment {
  if (points.length === 0) return { status: "ok", message: "No heart rate data yet." };

  const latest = points[points.length - 1].value;
  const prior = points.slice(0, -1);
  const priorAvg = prior.length ? prior.reduce((sum, p) => sum + p.value, 0) / prior.length : latest;
  const jump = latest - priorAvg;

  if (latest > 100 || jump > 15) {
    return {
      status: "warning",
      message: `Spike detected — latest reading ${latest} bpm is well above the recent average (${priorAvg.toFixed(0)} bpm).`,
    };
  }
  return { status: "ok", message: "Heart rate looks normal — no spikes detected." };
}

/** Flags a short night if the latest reading falls under a 6-hour baseline. */
export function assessSleep(points: SeriesPoint[]): WearableAssessment {
  if (points.length === 0) return { status: "ok", message: "No sleep data yet." };

  const latest = points[points.length - 1].value;
  if (latest < 6) {
    return {
      status: "warning",
      message: `Short night — only ${latest}h of sleep, below the 6h baseline.`,
    };
  }
  return { status: "ok", message: "Sleep duration looks normal." };
}
