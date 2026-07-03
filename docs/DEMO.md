# Demo Guide — Receipt Extractor

A runbook for presenting the project: what to open, what to say, and which inputs
show off the parts that matter.

## Links

- **Web app (present this):** https://<user>-receipt-extractor.hf.space
- **Health check:** https://<user>-receipt-extractor.hf.space/health
- **Source:** https://github.com/<user>/receipt-extractor
- **Training notebook:** `notebooks/finetune_qlora.ipynb`

## Before you present (2 minutes)

The Space is on HF's free CPU tier — it sleeps after inactivity and cold-starts on
the next visit (it re-downloads the GGUF and warms llama.cpp, so the first request
is slow).

1. Open the app a few minutes early so it's awake.
2. Hit `/health` — `available: true` means the model is wired up.
3. Run one extraction to warm it, then leave the page open.

## What this is, in one sentence

A Qwen2.5-7B model fine-tuned with QLoRA to turn messy receipt text into clean,
schema-valid JSON — with an evaluation that proves the fine-tune beats the base model.

## The 60-second pitch

> This is the case where fine-tuning a small private model beats calling a frontier
> API: high-volume document processing where cost and privacy matter. I built a
> synthetic dataset by generating structured records and rendering them into noisy
> receipts, so every label is correct by construction. I fine-tuned Qwen2.5-7B with
> QLoRA on a free T4 GPU, then measured it against the untuned base on a held-out
> set — JSON validity, field accuracy, and line-item F1. The fine-tune's job is to
> learn the conventions the base model can only guess at: date normalisation, which
> line is the total, and which lines to ignore.

## Running the demo

On the web app, click a sample chip (or paste a receipt) and press **Extract**. The
output pane shows the parsed JSON and a **valid JSON** badge.

### Show 1 — the happy path

Use the **Cafe receipt** sample. Narrate the output:
- `date` came in as "09 January 2025" and normalised to `2025-01-09`.
- The total was labelled **AMOUNT DUE**, not "TOTAL" — it found it anyway.
- The address, receipt number, and "Thanks for shopping" lines were dropped.

### Show 2 — the convention it learned

Point at a `price` field. The receipt often prints a *line total* (`2 x Cappuccino
$9.00`) but the JSON reports the *unit* price (`4.50`). The instruction never says
which — the model learned the house convention from the training data. That's the
single clearest "why fine-tune" moment: a base model can't know your convention.

### Show 3 — the numbers

Scroll down on the demo page — the base-vs-fine-tuned results table is right there
under the extractor (also in the README and the notebook's eval cell). The gap in
JSON-validity and line-item F1 is the actual deliverable — the model size is not the
point, the measured improvement is.

## Honest caveats to have ready

- **The dataset is synthetic.** It models the kinds of noise real receipts have, but
  isn't scanned OCR. The methodology transfers directly to a real annotated set.
- **CPU serving is slow.** A few seconds per receipt on a free Space; a GPU or a
  hosted inference endpoint changes the latency, not the architecture.
- **It's narrow on purpose.** It does receipts, not arbitrary documents — which is
  exactly why a small fine-tuned model is the right tool instead of a general LLM.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| First request hangs | Cold start: GGUF download + llama.cpp warmup | Warm it before presenting |
| `/extract` returns 503 | `MODEL_REPO` not set on the Space | Set it in Space settings and restart |
| `valid: false` on an odd input | Model produced non-schema output | Expected on out-of-distribution text; note it honestly |
