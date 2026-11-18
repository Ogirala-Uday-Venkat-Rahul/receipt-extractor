import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import { checkHealth, extract, type HealthStatus, type Receipt } from "../api";
import { SAMPLES } from "../data";

type Status = "idle" | "working";

export default function Extractor({ onExtracted }: { onExtracted: (r: Receipt) => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState("Output will appear here.");
  const [outMuted, setOutMuted] = useState(true);
  const [badge, setBadge] = useState<"ok" | "bad" | null>(null);
  const [copied, setCopied] = useState(false);

  // Client-side OCR state
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing">("idle");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrMessage, setOcrMessage] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backend Space health check
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    checkHealth().then(setHealth);
  }, []);

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a receipt image (PNG, JPG, JPEG, WEBP)");
      return;
    }
    setImageName(file.name);
    setOcrStatus("processing");
    setOcrMessage("Initializing client-side OCR engine...");
    setOcrProgress(0.1);

    try {
      const res = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(m.progress);
            setOcrMessage(`Recognizing text (${Math.round(m.progress * 100)}%)...`);
          }
        },
      });
      const recognized = res.data.text.trim();
      if (recognized) {
        setText(recognized);
        setOcrMessage("Receipt text successfully extracted into input buffer");
      } else {
        setOcrMessage("No readable text detected. Please paste text directly or adjust lighting.");
      }
    } catch (err: any) {
      setOcrMessage(`OCR recognition failed: ${err.message || err}`);
    } finally {
      setOcrStatus("idle");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  }

  function removeImage() {
    setImageName(null);
    setOcrMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0 }}>Interactive Inference Playground</h2>
        {health && (
          <div className="status-pill" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            background: health.online ? "#f0fdf4" : "#fefce8",
            border: `1px solid ${health.online ? "#bbf7d0" : "#fef08a"}`,
            borderRadius: "4px",
            color: health.online ? "#15803d" : "#854d0e",
            fontSize: "11.5px",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace"
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: health.online ? "#16a34a" : "#ca8a04"
            }} />
            <span>{health.online ? "API: Online" : "Space: Cold Starting (~30s)"}</span>
          </div>
        )}
      </div>

      {/* Drag & Drop OCR Ingestion Zone */}
      <div
        className={dragOver ? "drop-zone dragover" : "drop-zone"}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFileSelect}
        />
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: "28px", height: "28px", color: "var(--acc)", margin: "0 auto 8px", display: "block" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
          <strong>Drop receipt photo</strong> or click to browse (PNG, JPG, WEBP)
        </p>
        <span style={{ fontSize: "12.5px", color: "var(--dim)" }}>
          Runs client-side OCR in your browser via WebAssembly (zero data leaves your device)
        </span>

        {imageName && (
          <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--panel2)", border: "1px solid var(--line2)", padding: "4px 10px", borderRadius: "4px", fontSize: "12px" }} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{imageName}</span>
            <button type="button" onClick={removeImage} style={{ background: "none", border: "none", color: "var(--bad)", cursor: "pointer", padding: 0, fontSize: "13px" }}>✕</button>
          </div>
        )}

        {ocrStatus === "processing" && (
          <div style={{ marginTop: "12px", maxWidth: "320px", margin: "12px auto 0" }}>
            <div style={{ height: "6px", background: "var(--panel2)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--line2)" }}>
              <div style={{ width: `${Math.round(ocrProgress * 100)}%`, height: "100%", background: "var(--acc)", transition: "width 0.2s ease" }} />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "4px", fontFamily: "'JetBrains Mono', monospace" }}>
              {ocrMessage}
            </div>
          </div>
        )}

        {ocrStatus === "idle" && ocrMessage && (
          <div style={{ fontSize: "12px", color: "var(--ok)", marginTop: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
            {ocrMessage}
          </div>
        )}
      </div>

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
            placeholder="Paste raw unstructured receipt text here, drop a receipt photo above, or select a preloaded sample..."
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
