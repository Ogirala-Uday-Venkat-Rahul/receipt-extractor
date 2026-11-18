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
            <span className="dot" /> receipt-extractor
          </span>
          <span className="nav-links">
            <a href="#try">Playground</a>
            <a href="#dashboard" className="hideq">Telemetry</a>
            <a href="#results">Benchmarks</a>
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
              <span className="tag">Fine-Tuned</span> Qwen2.5-7B-Instruct · QLoRA
            </span>
            <h1>
              Messy receipts in.
              <br />
              <span className="g">Validated JSON</span> out.
            </h1>
            <p className="lede">
              A 7B language model fine-tuned on Qwen2.5 to turn noisy, unstructured checkout slips
              into deterministic Pydantic schemas. Evaluated on 50 held-out receipts to measure exact
              real-world extraction gains over the base model.
            </p>
            <div className="meta">
              <span className="pill">4-bit QLoRA</span>
              <span className="pill">GGUF Q4_K_M</span>
              <span className="pill">Pydantic Strict</span>
              <a className="pill link" href={GITHUB} target="_blank" rel="noopener">
                Repository ↗
              </a>
            </div>
          </div>
          <div className="hero-art">
            <HeroArt />
          </div>
        </div>

        <div className="showcase">
          <div className="sc-panel left">
            <div className="sc-head"><span className="d raw" /> Raw Receipt Input</div>
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
            <div className="sc-head"><span className="d json" /> Validated JSON Schema</div>
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
        <h2>Why a fine-tuned model over frontier APIs?</h2>
        <div className="cards">
          <div className="card">
            <h3>
              <span className="card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </span>
              Cost & Data Privacy at Scale
            </h3>
            <p>
              Routing sensitive financial transactions through commercial frontier APIs creates compounding
              token costs and compliance friction. A dedicated, quantized 7B model runs privately on self-hosted
              hardware with zero third-party data leakage and predictable infrastructure overhead.
            </p>
          </div>
          <div className="card">
            <h3>
              <span className="card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
                </svg>
              </span>
              Learning the House Rules
            </h3>
            <p>
              Real receipts routinely break general-purpose prompt templates: non-standard date formats,
              totals disguised behind "BALANCE DUE", and ambiguous item multipliers. Fine-tuning internalizes
              these structural patterns directly into the model weights without brittle prompt engineering.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Training & Serving Pipeline</h2>
        <div className="cards">
          <div className="card">
            <h3>
              <span className="card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15"/>
                  <circle cx="18" cy="6" r="3"/>
                  <circle cx="6" cy="18" r="3"/>
                  <path d="M18 9a9 9 0 0 1-9 9"/>
                </svg>
              </span>
              Architecture Overview
            </h3>
            <div className="flow">
              <b>1. Synthetic Dataset:</b> Structured ground-truth records rendered into realistic noisy receipt strings (correct by construction).
              {"\n        ↓\n"}
              <b>2. QLoRA Training:</b> 4-bit base model with low-rank adaptation matrix on single T4 GPU.
              {"\n        ↓\n"}
              <b>3. Evaluation:</b> Rigorous schema validation, exact field accuracy, and line-item token F1.
              {"\n        ↓\n"}
              <b>4. Merge & Quantize:</b> Adapter weights merged and exported to GGUF (Q4_K_M) for CPU serving.
              {"\n        ↓\n"}
              <b>5. Production Serving:</b> FastAPI application dynamically loading quantized weights from the Hub.
            </div>
          </div>
          <div className="card">
            <h3>
              <span className="card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              Design Tradeoffs & Known Limits
            </h3>
            <ul className="disc" style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                <b>Synthetic Training Distribution:</b> The training data models realistic textual noise rather than raw scanner bitmap defects. The fine-tuning methodology ports directly to human-annotated scan sets.
              </li>
              <li>
                <b>Free-Tier CPU Latency:</b> Inference takes ~2-3 minutes on Hugging Face's free CPU tier. On modest GPU hardware (T4/A10), latency drops to sub-second responses.
              </li>
              <li>
                <b>Empirical Delta:</b> The primary goal is demonstrating the measurable accuracy gap over zero-shot base models on identical parameters.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer>
        Rahul Ogirala ·{" "}
        <a href={GITHUB} target="_blank" rel="noopener">
          GitHub Repository
        </a>{" "}
        · Qwen2.5-7B-Instruct fine-tuned with QLoRA · Served via GGUF Q4_K_M.
      </footer>
      </div>
    </>
  );
}
