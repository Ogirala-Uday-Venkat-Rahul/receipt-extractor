# Demo Guide — Receipt Extractor

A runbook for presenting the project: what to open, what to say, and which inputs
show off the parts that matter.

## Links

- **Frontend (present this):** the React SPA on Vercel — set the URL after `vercel --prod`
- **Model API:** https://ouvrahul-receipt-extractor.hf.space
- **Health check:** https://ouvrahul-receipt-extractor.hf.space/health
- **Source:** https://github.com/Ogirala-Uday-Venkat-Rahul/receipt-extractor
- **Training notebook:** `notebooks/finetune_qlora.ipynb`

The architecture is two pieces: a **React frontend on Vercel** (fast, static, the face
of the project) calling a **model API on a Hugging Face Space** (`POST /extract`). Present
the Vercel URL — it loads instantly and the dashboard is populated on arrival.

## Before you present (2 minutes)

The frontend loads instantly, but the model API behind it is on HF's free CPU tier — it
sleeps after inactivity and cold-starts on the next call (re-downloads the GGUF and warms
llama.cpp), and even warm it takes **~2–3 minutes per receipt**. So don't present a live
extraction cold.

1. Open the frontend a few minutes early. The precomputed dashboard means the page is
   already worth showing without any wait.
2. Hit the API's `/health` — `available: true` means the model is wired up.
3. If you want to show a *live* run, kick one off ~3 minutes before you need it to warm
   the Space and prove the round-trip; otherwise present the seeded dashboard and the
   precomputed sample output and be upfront that a live run takes a couple of minutes.

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

### Show 3 — the payoff, not the JSON

Scroll to the spend dashboard. The point to make: extraction is the *ingestion* step,
not the product. The dashboard rolls the structured output into KPIs, spend-by-vendor,
and spend-over-time — the decision layer a business actually wants. A BI tool can chart
a clean table but can't read a crumpled receipt; that hard part is what the fine-tuned
model does. It's seeded with receipts the model already extracted, and a live run appends
to it, so the end-to-end story is visible without waiting.

### Show 4 — the numbers

The base-vs-fine-tuned results table is right under the dashboard (also in the README and
the notebook's eval cell). The gap in JSON-validity and line-item F1 is the actual
deliverable — the model size is not the point, the measured improvement is.

## Honest caveats to have ready

- **The dataset is synthetic.** It models the kinds of noise real receipts have, but
  isn't scanned OCR. The methodology transfers directly to a real annotated set. Probing
  the live model with out-of-distribution receipts shows exactly where this bites: vendor,
  date, and total stay correct, but it sometimes *over-applies* the quantity × unit-price
  convention (inventing a quantity on a line that has none) because the training receipts
  always had clean quantity columns. Good thing to raise yourself — it shows you evaluated.
- **CPU serving is slow.** ~2–3 minutes per receipt on the free Space — a 7B on 2 vCPUs.
  A GPU or paid CPU endpoint changes the latency, not the architecture; the frontend
  points at it via one env var.
- **It's narrow on purpose.** It does receipts, not arbitrary documents — which is
  exactly why a small fine-tuned model is the right tool instead of a general LLM.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| First request hangs | Cold start: GGUF download + llama.cpp warmup | Warm it before presenting |
| `/extract` returns 503 | `MODEL_REPO` not set on the Space | Set it in Space settings and restart |
| `valid: false` on an odd input | Model produced non-schema output | Expected on out-of-distribution text; note it honestly |
| Frontend shows a network/CORS error | API missing CORS headers, or `VITE_API_BASE` wrong | Confirm the Space has the CORS middleware deployed and the Vercel env var points at it |
| Extraction runs but nothing lands on the dashboard | Output was `valid: false`, so it isn't appended | Only schema-valid results roll up; check the raw output pane |
