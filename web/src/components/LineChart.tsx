interface Point {
  label: string;
  value: number;
}

// Single-series spend-over-time: 2px line, soft area fill, ringed markers.
// End labels are anchored to the plot edges (start / middle / end) so the first
// and last month names don't clip at the chart boundary.
export default function LineChart({ series }: { series: Point[] }) {
  if (!series.length) {
    return <div className="muted">No dated receipts yet.</div>;
  }

  const W = 320, H = 150, pL = 8, pR = 8, pT = 12, pB = 24;
  const iw = W - pL - pR, ih = H - pT - pB, n = series.length;
  const max = Math.max(...series.map((s) => s.value)) || 1;

  const x = (i: number) => (n === 1 ? pL + iw / 2 : pL + (iw * i) / (n - 1));
  const y = (v: number) => pT + ih * (1 - v / max);

  const pts = series.map((s, i) => [x(i), y(s.value)] as const);
  const line = "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  const base = (pT + ih).toFixed(1);
  const area = `${line} L${pts[n - 1][0].toFixed(1)},${base} L${pts[0][0].toFixed(1)},${base} Z`;

  const anchor = (i: number) =>
    i === 0 ? "start" : i === n - 1 ? "end" : "middle";

  return (
    <svg
      className="svgline"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Spend over time by month"
    >
      <path className="area" d={area} />
      <path className="line" d={line} />
      {series.map((s, i) => (
        <circle key={`d${i}`} className="dot" cx={x(i).toFixed(1)} cy={y(s.value).toFixed(1)} r={4}>
          <title>{`${s.label}: $${s.value.toFixed(2)}`}</title>
        </circle>
      ))}
      {series.map((s, i) => (
        <text key={`t${i}`} x={x(i).toFixed(1)} y={H - 8} textAnchor={anchor(i)}>
          {s.label}
        </text>
      ))}
    </svg>
  );
}
