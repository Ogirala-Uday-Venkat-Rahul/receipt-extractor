import { useEffect, useRef } from "react";
import type { Receipt } from "../api";
import { MONTHS, money } from "../data";
import LineChart from "./LineChart";

// Roll the extracted receipts up into a small spend view. Extraction is the
// ingestion step; this is the decision layer that makes the JSON worth having.
export default function Dashboard({ receipts }: { receipts: Receipt[] }) {
  const rs = receipts.filter((r) => typeof r.total === "number" && !isNaN(r.total));
  const total = rs.reduce((s, r) => s + r.total, 0);
  const items = rs.reduce((s, r) => s + (r.line_items?.length || 0), 0);

  // spend by vendor — magnitude across identities -> one-hue horizontal bars
  const byVendor: Record<string, number> = {};
  rs.forEach((r) => {
    const k = r.vendor || "Unknown";
    byVendor[k] = (byVendor[k] || 0) + r.total;
  });
  const vendors = Object.entries(byVendor).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const vmax = Math.max(...vendors.map((v) => v[1]), 1);

  // spend over time — trend -> single-series line, aggregated by month
  const byMonth: Record<string, number> = {};
  rs.forEach((r) => {
    const m = (r.date || "").slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(m)) byMonth[m] = (byMonth[m] || 0) + r.total;
  });
  const months = Object.keys(byMonth)
    .sort()
    .map((m) => ({ label: MONTHS[+m.slice(5, 7) - 1], value: byMonth[m] }));

  // Flash the section when a new receipt lands, so a live extraction is visible.
  const ref = useRef<HTMLElement>(null);
  const count = rs.length;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth; // reflow so the animation can restart
    el.classList.add("flash");
  }, [count]);

  return (
    <section id="dashboard" ref={ref}>
      <h2>The point isn't JSON — it's the decision on top of it</h2>
      <p className="caption" style={{ margin: "0 0 22px" }}>
        Extraction is the <em>ingestion</em> step, not the product. A BI tool can chart a clean
        table — but it can't read a crumpled receipt, and that's the hard part the fine-tuned model
        does. Here the model's structured output is rolled up into a live spend view. It's pre-loaded
        with receipts the model already processed; <b>extract one above and it lands here too.</b>
      </p>

      <div className="kpis">
        <Kpi value={money(total)} label="Total spend" />
        <Kpi value={String(rs.length)} label="Receipts" />
        <Kpi value={rs.length ? money(total / rs.length) : "$0.00"} label="Avg receipt" />
        <Kpi value={String(items)} label="Line items" />
      </div>

      <div className="charts">
        <div className="chartcard">
          <h3>Spend by vendor</h3>
          <div>
            {vendors.map(([name, val]) => (
              <div className="brow" key={name}>
                <div className="blabel" title={name}>{name}</div>
                <div className="btrack">
                  <div className="bfill" style={{ width: `${((val / vmax) * 100).toFixed(1)}%` }} />
                </div>
                <div className="bval">{money(val)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="chartcard">
          <h3>Spend over time</h3>
          <LineChart series={months} />
        </div>
      </div>

      <p className="note">
        Deliberately a small view — the engineering that matters is <em>upstream</em>, turning messy
        text into this clean data. In production you'd pipe the same JSON into your warehouse or BI
        tool of choice.
      </p>
    </section>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="kpi">
      <div className="kpi-v">{value}</div>
      <div className="kpi-l">{label}</div>
    </div>
  );
}
