interface SparklineProps {
  points: { label: string; value: number }[];
  color: string;
  unit?: string;
}

export default function Sparkline({ points, color, unit = "" }: SparklineProps) {
  const width = 320;
  const height = 96;
  const padding = 8;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padding + (i / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((p.value - min) / range) * (height - padding * 2);
    return { x, y, ...p };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" preserveAspectRatio="none">
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c) => (
          <circle key={c.label} cx={c.x} cy={c.y} r={2.5} fill={color} />
        ))}
        {last && (
          <circle cx={last.x} cy={last.y} r={4} fill={color} stroke="white" strokeWidth={1.5} />
        )}
      </svg>
      <div className="flex justify-between text-xs text-black/40 dark:text-white/40 mt-1">
        <span>{points[0]?.label}</span>
        <span className="font-medium text-black/70 dark:text-white/70">
          {last?.value}
          {unit} latest
        </span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
