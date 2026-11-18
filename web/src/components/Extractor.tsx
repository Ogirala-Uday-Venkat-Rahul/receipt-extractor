import { useState } from "react";
import { extract, type Receipt } from "../api";
import { SAMPLES } from "../data";

type Status = "idle" | "working";

export default function Extractor({ onExtracted }: { onExtracted: (r: Receipt) => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("Output will appear here.");
  const [outMuted, setOutMuted] = useState(true);
  const [badge, setBadge] = useState<"ok" | "bad" | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    const trimmed = text.trim();
    if (!trimmed || status === "working") return;
    setStatus("working");
    setBadge(null);
    setOutMuted(true);
    setOutput("Executing inference on Hugging Face Space (CPU runtime: ~2-3 min)...");
    try {
      const data = await extract(trimmed);
      setOutMuted(false);
      setOutput(data.valid ? JSON.stringify(data.receipt, null, 2) : data.raw);
      setBadge(data.valid ? "ok" : "bad");
      if (data.valid && data.receipt) onExtracted(data.receipt);
    } catch (e) {
      setOutMuted(true);
      setOutput(String((e as Error).message || e));
    } finally {
      setStatus("idle");
    }
  }

  function copyOutput() {
    if (!output || outMuted) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="try">
      <h2>Interactive Inference Playground</h2>
      <div className="samples">
        <span className="muted">Preloaded test cases:</span>
        {SAMPLES.map((s) => (
          <span key={s.key} className="chip" onClick={() => setText(s.text)}>
            {s.label}
          </span>
        ))}
      </div>

      <div className="grid">
        <div>
          <label htmlFor="in">Receipt input (UTF-8 plain text)</label>
          <textarea
            id="in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
            }}
            placeholder="Paste raw unstructured receipt text here, or select a preloaded sample above..."
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ margin: 0 }}>
              Validated JSON Schema{" "}
              {badge === "ok" && <span className="badge ok">Schema Valid</span>}
              {badge === "bad" && <span className="badge bad">Parse Error</span>}
            </label>
            {!outMuted && badge === "ok" && (
              <button
                type="button"
                onClick={copyOutput}
                style={{ padding: "3px 10px", fontSize: "11px", background: "var(--panel2)", border: "1px solid var(--line2)" }}
              >
                {copied ? "Copied" : "Copy JSON"}
              </button>
            )}
          </div>
          <div className={outMuted ? "out muted" : "out"}>{output}</div>
        </div>
      </div>

      <div className="row">
        <button onClick={run} disabled={status === "working"}>
          {status === "working" ? "Running Inference..." : "Extract Data"}
        </button>
        {status === "working" && <span className="muted">Processing model forward pass...</span>}
      </div>

      <p className="note">
        <b>Runtime note:</b> Live inference queries a 7B parameter Q4_K_M GGUF model deployed on a free-tier CPU Hugging Face Space (~2-3 minute turnaround time). On GPU infrastructure, inference completes in &lt;1 second. Press <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> to run.
      </p>
    </section>
  );
}
