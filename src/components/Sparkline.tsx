import { useId } from "react";

interface SparklineProps {
  points: { label: string; value: number }[];
  color: string;
  unit?: string;
  decimals?: number;
  /** Padding added to both the data min and max before computing the y-axis
   * range, so the line isn't pinned to the top/bottom edge of the chart. */
  yPadding?: number;
}

interface Coord {
  x: number;
  y: number;
  label: string;
  value: number;
}

/** Catmull-Rom-derived cubic bezier smoothing through every point. */
function smoothPath(coords: Coord[]): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function Sparkline({ points, color, unit = "", decimals = 0, yPadding = 0 }: SparklineProps) {
  const gradientId = useId();
  const width = 340;
  const height = 150;
  const margin = { top: 20, right: 12, bottom: 30, left: 36 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const values = points.map((p) => p.value);
  const min = Math.min(...values) - yPadding;
  const max = Math.max(...values) + yPadding;
  const range = max - min || 1;

  const xFor = (i: number) => margin.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const yFor = (value: number) => margin.top + plotH - ((value - min) / range) * plotH;

  const coords: Coord[] = points.map((p, i) => ({ x: xFor(i), y: yFor(p.value), ...p }));
  const linePath = smoothPath(coords);
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(margin.top + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(margin.top + plotH).toFixed(1)} Z`
      : "";
  const last = coords[coords.length - 1];

  const yTicks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-muted-foreground">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {yTicks.map((t) => {
        const y = yFor(t);
        return (
          <g key={t}>
            <line
              x1={margin.left}
              y1={y}
              x2={width - margin.right}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text x={margin.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="currentColor" opacity={0.7}>
              {t.toFixed(decimals)}
            </text>
          </g>
        );
      })}

      {coords.map((c) => (
        <text
          key={c.label}
          x={c.x}
          y={margin.top + plotH + 14}
          textAnchor="middle"
          fontSize={9}
          fill="currentColor"
          opacity={0.7}
          transform={points.length > 5 ? `rotate(-35 ${c.x} ${margin.top + plotH + 14})` : undefined}
        >
          {c.label}
        </text>
      ))}

      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
      {coords.slice(0, -1).map((c) => (
        <circle key={c.label} cx={c.x} cy={c.y} r={2.5} fill={color} fillOpacity={0.55} />
      ))}
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r={5.5} fill={color} fillOpacity={0.18} />
          <circle cx={last.x} cy={last.y} r={3.5} fill={color} stroke="var(--card)" strokeWidth={1.5} />
          <text x={last.x} y={last.y - 10} textAnchor="end" fontSize={11} fontWeight={600} fill={color}>
            {last.value}{unit}
          </text>
        </>
      )}
    </svg>
  );
}
