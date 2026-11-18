import { useEffect, useRef, useState } from "react";
import type { Receipt } from "../api";
import { MONTHS, money } from "../data";
import LineChart from "./LineChart";

type View = "all" | "sample" | "session";

export default function Dashboard({ receipts, seedCount }: { receipts: Receipt[]; seedCount: number }) {
  const sessionCount = Math.max(0, receipts.length - seedCount);
  const [view, setView] = useState<View>("all");

  const prevSession = useRef(sessionCount);
  useEffect(() => {
    if (sessionCount > prevSession.current) setView("session");
    prevSession.current = sessionCount;
  }, [sessionCount]);

  const scoped =
    view === "sample" ? receipts.slice(0, seedCount)
    : view === "session" ? receipts.slice(seedCount)
    : receipts;
  const rs = scoped.filter((r) => typeof r.total === "number" && !isNaN(r.total));
  const total = rs.reduce((s, r) => s + r.total, 0);
  const items = rs.reduce((s, r) => s + (r.line_items?.length || 0), 0);

  // Spend by vendor
  const byVendor: Record<string, number> = {};
  rs.forEach((r) => {
    const k = r.vendor || "Unknown";
    byVendor[k] = (byVendor[k] || 0) + r.total;
  });
  const vendors = Object.entries(byVendor).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const vmax = Math.max(...vendors.map((v) => v[1]), 1);

  // Spend over time
  const byMonth: Record<string, number> = {};
  rs.forEach((r) => {
    const m = (r.date || "").slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(m)) byMonth[m] = (byMonth[m] || 0) + r.total;
  });
  const months = Object.keys(byMonth)
    .sort()
    .map((m) => ({ label: MONTHS[+m.slice(5, 7) - 1], value: byMonth[m] }));

  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }, [receipts.length]);

  function exportCSV() {
    let csv = "Vendor,Date,Description,Quantity,Price,Total\n";
    rs.forEach((r) => {
      if (r.line_items && r.line_items.length) {
        r.line_items.forEach((it) => {
          csv += `"${r.vendor}","${r.date}","${it.description}",${it.quantity},${it.price},${r.total}\n`;
        });
      } else {
        csv += `"${r.vendor}","${r.date}","Total",1,${r.total},${r.total}\n`;
      }
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_spend_${view}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportQuickBooks() {
    const payload = JSON.stringify({
      format: "quickbooks_expense_v1",
      exported_at: new Date().toISOString(),
      view,
      records: scoped,
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quickbooks_expenses_${view}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="dashboard" ref={ref}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ margin: 0 }}>Downstream Ingestion & Telemetry</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={exportCSV}
            style={{ padding: "6px 12px", fontSize: "12px", background: "var(--panel)", border: "1px solid var(--line2)", color: "var(--ink)" }}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={exportQuickBooks}
            style={{ padding: "6px 12px", fontSize: "12px", background: "var(--panel)", border: "1px solid var(--line2)", color: "var(--ink)" }}
          >
            Export QuickBooks
          </button>
        </div>
      </div>

      <p className="caption" style={{ margin: "0 0 18px" }}>
        Extraction is the <em>ingestion phase</em> of the document lifecycle. BI dashboards and data
        warehouses require deterministic schemas to compute analytics. Below is a sample batch processed
        by the fine-tuned model; live extractions from above dynamically append to this dataset.
      </p>

      {sessionCount > 0 && (
        <div className="dviews">
          <span className={view === "all" ? "chip on" : "chip"} onClick={() => setView("all")}>
            All · {receipts.length}
          </span>
          <span className={view === "sample" ? "chip on" : "chip"} onClick={() => setView("sample")}>
            Sample batch · {seedCount}
          </span>
          <span className={view === "session" ? "chip on" : "chip"} onClick={() => setView("session")}>
            This session · {sessionCount}
          </span>
        </div>
      )}

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
        Deliberately a small view. The engineering that matters is <em>upstream</em>, turning messy
        text into this clean data. A real deployment runs receipts through the same model in batch (on
        a GPU that's about a second each, versus the minutes the free CPU Space takes here) and pipes
        the JSON into your warehouse or BI tool of choice.
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
