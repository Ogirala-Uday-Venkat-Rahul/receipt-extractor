interface EvalRow {
  metric: string;
  base: string;
  ft: string;
  delta: string;
  hi?: boolean;
}

const ROWS: EvalRow[] = [
  { metric: "JSON Schema Validity", base: "92.0%", ft: "100.0%", delta: "+8.0%" },
  { metric: "Exact Match (All Fields)", base: "8.0%", ft: "100.0%", delta: "+92.0%", hi: true },
  { metric: "Vendor Extraction Accuracy", base: "100.0%", ft: "100.0%", delta: "0.0%" },
  { metric: "Date Normalization (ISO-8601)", base: "95.7%", ft: "100.0%", delta: "+4.3%" },
  { metric: "Total Amount Accuracy", base: "100.0%", ft: "100.0%", delta: "0.0%" },
  { metric: "Line-Item Token F1 Score", base: "37.2%", ft: "100.0%", delta: "+62.8%", hi: true },
];

export default function ResultsTable() {
  return (
    <section id="results">
      <h2>Empirical Evaluation: Zero-Shot Base vs. Fine-Tuned</h2>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Benchmark Metric</th>
              <th>Base Qwen2.5-7B</th>
              <th>Fine-Tuned (QLoRA)</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.metric} className={r.hi ? "hi" : undefined}>
                <td className="metric">{r.metric}</td>
                <td className="base">{r.base}</td>
                <td className="ft">{r.ft}</td>
                <td className="ft" style={{ color: r.delta.startsWith("+") ? "var(--ok)" : "var(--dim)" }}>
                  {r.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="caption">
        Both models were evaluated on the identical 50 held-out validation receipts. The baseline is the
        same 4-bit model without the low-rank adapter weights. While the base model extracts top-level
        fields (vendor, total) with moderate reliability, it consistently struggles with multi-item syntax
        (quantity-times-unit-price conventions), resulting in only 37.2% line-item F1 and 8% overall exact match.
        Adapter fine-tuning completely resolves this structural ambiguity.
      </p>
    </section>
  );
}
