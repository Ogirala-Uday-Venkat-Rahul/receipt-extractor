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

  async function run() {
    const trimmed = text.trim();
    if (!trimmed || status === "working") return;
    setStatus("working");
    setBadge(null);
    setOutMuted(true);
    setOutput("Working… a live run on the free CPU Space takes ~2–3 minutes.");
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

  return (
    <section>
      <h2>Try it live</h2>
      <div className="samples">
        <span className="muted">Load a sample:</span>
        {SAMPLES.map((s) => (
          <span key={s.key} className="chip" onClick={() => setText(s.text)}>
            {s.label}
          </span>
        ))}
      </div>

      <div className="grid">
        <div>
          <label htmlFor="in">Receipt text</label>
          <textarea
            id="in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
            }}
            placeholder="Paste a receipt here, or load a sample above..."
          />
        </div>
        <div>
          <label>
            Extracted JSON{" "}
            {badge === "ok" && <span className="badge ok">valid JSON</span>}
            {badge === "bad" && <span className="badge bad">invalid JSON</span>}
          </label>
          <div className={outMuted ? "out muted" : "out"}>{output}</div>
        </div>
      </div>

      <div className="row">
        <button onClick={run} disabled={status === "working"}>
          {status === "working" ? "Extracting…" : "Extract"}
        </button>
        {status === "working" && <span className="muted">Extracting…</span>}
      </div>

      <p className="note">
        Heads up: this is a 7B model served on a <b>free CPU</b> Space, so a live extraction takes{" "}
        <b>~2–3 minutes</b> — a hosting choice, not a model limit (on a GPU it's seconds). That's why
        the dashboard below is precomputed; a live run here appends to it.{" "}
        <kbd>Ctrl/⌘ + Enter</kbd> also runs it.
      </p>
    </section>
  );
}
