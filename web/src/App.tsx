import { useState } from "react";
import type { Receipt } from "./api";
import { SEED_RECEIPTS } from "./data";
import Extractor from "./components/Extractor";
import Dashboard from "./components/Dashboard";
import ResultsTable from "./components/ResultsTable";
import HeroArt from "./components/HeroArt";

const GITHUB = "https://github.com/Ogirala-Uday-Venkat-Rahul/receipt-extractor";

export default function App() {
  const [receipts, setReceipts] = useState<Receipt[]>(SEED_RECEIPTS);
  const addReceipt = (r: Receipt) => setReceipts((prev) => [...prev, r]);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <span className="brand">
            <span className="dot" /> Receipt Extractor
          </span>
          <span className="nav-links">
            <a href="#try">Try it</a>
            <a href="#dashboard" className="hideq">Dashboard</a>
            <a href="#results">Results</a>
            <a className="cta" href={GITHUB} target="_blank" rel="noopener">
              GitHub ↗
            </a>
          </span>
        </div>
      </nav>
      <div className="wrap">
      <header>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="live" /> Fine-tuned · Qwen2.5-7B · QLoRA
            </span>
            <h1>
              Messy receipts in,
              <br />
              <span className="g">structured JSON</span> out.
            </h1>
            <p className="lede">
              A 7-billion-parameter model fine-tuned to pull the vendor, date, total, and line items
              out of noisy real-world receipt text. It ships with an evaluation that measures exactly
              how much the fine-tune beats the base model.
            </p>
            <div className="meta">
              <span className="pill">4-bit QLoRA</span>
              <span className="pill">Q4_K_M · CPU-served</span>
              <span className="pill">labelled-by-construction data</span>
              <a className="pill link" href={GITHUB} target="_blank" rel="noopener">
                GitHub ↗
              </a>
            </div>
          </div>
          <div className="hero-art">
            <HeroArt />
          </div>
        </div>

        <div className="showcase">
          <div className="sc-panel left">
            <div className="sc-head"><span className="d raw" /> Receipt · raw text</div>
            <pre className="sc-body">{`CAFE VERONA
220 Hill St
Date: 09 January 2025
2 x Cappuccino        $9.00
Sourdough Loaf x1     $5.50
AMOUNT DUE           $24.30
Thanks for shopping!`}</pre>
          </div>
          <div className="sc-arrow"><span>→</span></div>
          <div className="sc-panel right sc-json">
            <div className="sc-head"><span className="d json" /> JSON · schema-valid</div>
            <pre className="sc-body">
{'{\n  '}<span className="k">"vendor"</span>: <span className="s">"Cafe Verona"</span>,
{'\n  '}<span className="k">"date"</span>: <span className="s">"2025-01-09"</span>,
{'\n  '}<span className="k">"total"</span>: <span className="n">24.30</span>,
{'\n  '}<span className="k">"line_items"</span>: [
{'\n    { '}<span className="k">"description"</span>: <span className="s">"Cappuccino"</span>,
{' '}<span className="k">"quantity"</span>: <span className="n">2</span>, <span className="k">"price"</span>: <span className="n">4.50</span>{' },'}
{'\n    { '}<span className="k">"description"</span>: <span className="s">"Sourdough Loaf"</span>,
{' '}<span className="k">"quantity"</span>: <span className="n">1</span>, <span className="k">"price"</span>: <span className="n">5.50</span>{' }'}
{'\n  ]\n}'}
            </pre>
          </div>
        </div>
      </header>

      <Extractor onExtracted={addReceipt} />
      <Dashboard receipts={receipts} seedCount={SEED_RECEIPTS.length} />
      <ResultsTable />

      <section>
        <h2>Why fine-tune instead of calling an API?</h2>
        <div className="cards">
          <div className="card">
            <h3><span className="card-ic">💼</span> The business case</h3>
            <p>
              High-volume document processing where cost and privacy matter. A company scanning
              thousands of receipts a day doesn't want to pay a frontier API per call or ship its
              data off-site. It wants a small model it owns that has learned one job well.
            </p>
          </div>
          <div className="card">
            <h3><span className="card-ic">🧠</span> The learnable rules</h3>
            <p>
              Dates written five different ways that must normalise to <code>YYYY-MM-DD</code>, a
              total hiding behind "AMOUNT DUE" or "BALANCE", distractor lines that must be ignored,
              and a price convention the model can only pick up from examples. A base model guesses;
              the fine-tune learns the house rules.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>How it's built</h2>
        <div className="cards">
          <div className="card">
            <h3><span className="card-ic">⚙️</span> Pipeline</h3>
            <div className="flow">
              <b>synthetic data:</b> build a structured record, then render it down into noisy
              receipt text, so the ground-truth JSON is correct <b>by construction</b>
              {"\n        ↓\n"}
              <b>QLoRA fine-tune:</b> 7B base kept in 4-bit, low-rank adapters trained on a free T4
              GPU
              {"\n        ↓\n"}
              <b>evaluate</b> base vs. fine-tuned on validity, per-field accuracy, line-item F1
              {"\n        ↓\n"}
              <b>merge + quantize → GGUF (Q4_K_M)</b>
              {"\n        ↓\n"}
              <b>serve on CPU:</b> FastAPI, downloads the model from the Hub
            </div>
          </div>
          <div className="card">
            <h3><span className="card-ic">⚖️</span> Honest caveats</h3>
            <ul className="disc" style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                The dataset is <b>synthetic</b>. It models the kinds of noise real receipts have,
                not scanned OCR. The methodology transfers directly to a real annotated set.
              </li>
              <li>
                <b>CPU serving is slow:</b> about 2-3 minutes per receipt on a free Space. The
                architecture doesn't change with better hardware, only the latency does.
              </li>
              <li>The point is the <b>measured gap over the base model</b>, not that it's a 7B.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer>
        Built by Rahul Ogirala ·{" "}
        <a href={GITHUB} target="_blank" rel="noopener">
          source on GitHub
        </a>{" "}
        · fine-tuned Qwen2.5-7B-Instruct, served as a Q4_K_M GGUF.
      </footer>
      </div>
    </>
  );
}
