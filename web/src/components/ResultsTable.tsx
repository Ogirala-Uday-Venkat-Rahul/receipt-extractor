const ROWS: { metric: string; base: string; ft: string; hi?: boolean }[] = [
  { metric: "JSON valid", base: "92.0%", ft: "100.0%" },
  { metric: "Exact match", base: "8.0%", ft: "100.0%" },
  { metric: "Vendor accuracy", base: "100.0%", ft: "100.0%" },
  { metric: "Date accuracy", base: "95.7%", ft: "100.0%" },
  { metric: "Total accuracy", base: "100.0%", ft: "100.0%" },
  { metric: "Line-item F1", base: "37.2%", ft: "100.0%", hi: true },
];

export default function ResultsTable() {
  return (
    <section id="results">
      <h2>Does the fine-tune actually help?</h2>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Base Qwen2.5-7B</th>
              <th>Fine-tuned</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.metric} className={r.hi ? "hi" : undefined}>
                <td className="metric">{r.metric}</td>
                <td className="base">{r.base}</td>
                <td className="ft">{r.ft}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="caption">
        Both models are scored on the same 50 held-out receipts. The "base" is the identical 4-bit
        model with the LoRA adapters switched off, so it's apples-to-apples. The base already reads
        vendor and total fine, but it can't know the receipt's <em>line-item convention</em>
        (quantity-times-unit-price vs. line totals), so its line-item F1 sits at 37% and it gets a fully
        correct record only 8% of the time. That gap is what fine-tuning buys.
      </p>
    </section>
  );
}
