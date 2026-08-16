interface SparklineProps {
  points: { label: string; value: number }[];
  color: string;
  unit?: string;
  decimals?: number;
}

export default function Sparkline({ points, color, unit = "", decimals = 0 }: SparklineProps) {
  const width = 340;
  const height = 150;
  const margin = { top: 10, right: 12, bottom: 30, left: 34 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xFor = (i: number) => margin.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const yFor = (value: number) => margin.top + plotH - ((value - min) / range) * plotH;

  const coords = points.map((p, i) => ({ x: xFor(i), y: yFor(p.value), ...p }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];

  const yTicks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-muted-foreground">
      {yTicks.map((t) => {
        const y = yFor(t);
        return (
          <g key={t}>
            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
            <text x={margin.left - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="currentColor">
              {t.toFixed(decimals)}
            </text>
          </g>
        );
      })}

      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
      <line x1={margin.left} y1={margin.top + plotH} x2={width - margin.right} y2={margin.top + plotH} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />

      {coords.map((c) => (
        <text
          key={c.label}
          x={c.x}
          y={margin.top + plotH + 12}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          transform={points.length > 5 ? `rotate(-35 ${c.x} ${margin.top + plotH + 12})` : undefined}
        >
          {c.label}
        </text>
      ))}

      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c) => (
        <circle key={c.label} cx={c.x} cy={c.y} r={2.5} fill={color} />
      ))}
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r={4} fill={color} stroke="white" strokeWidth={1.5} />
          <text x={last.x} y={last.y - 8} textAnchor="end" fontSize={10} fontWeight={600} fill={color}>
            {last.value}{unit}
          </text>
        </>
      )}
    </svg>
  );
}
