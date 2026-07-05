---
title: Receipt Extractor
emoji: 🧾
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Receipt Extractor: a fine-tuned LLM for structured extraction

Messy receipt text in, clean structured JSON out. A **Qwen2.5-7B** model
fine-tuned with **QLoRA** to pull the vendor, date, total, and line items out of
noisy, real-world receipt formatting, plus an evaluation that shows how much the
fine-tune actually helps versus the base model.

**Live demo:** https://receipt-extractor-ten.vercel.app. Paste a receipt, get
structured JSON back, and watch it roll up into a small spend dashboard (the
point isn't the JSON; it's what you do with it). The frontend is a React app on
Vercel that calls the fine-tuned 7B model, served as a plain API on a free CPU
Hugging Face Space (https://ouvrahul-receipt-extractor.hf.space). A live
extraction takes about 2-3 minutes on CPU, a hosting choice rather than a model
limit; the dashboard is precomputed so you can explore instantly.

```
CAFE VERONA                                  {
220 Hill St                                    "vendor": "Cafe Verona",
Date: 09 January 2025                          "date": "2025-01-09",
2 x Cappuccino          $9.00       ──▶        "total": 24.30,
Sourdough Loaf x1       $5.50                  "line_items": [
AMOUNT DUE          $24.30                       {"description": "Cappuccino", "quantity": 2, "price": 4.50},
Thanks for shopping!                             {"description": "Sourdough Loaf", "quantity": 1, "price": 5.50}
                                               ]
                                             }
```

## Why fine-tune instead of calling a frontier API?

This is the textbook case for a small, private, fine-tuned model: **high-volume
document processing where cost and data privacy matter.** A business scanning
thousands of receipts a day doesn't want to send each one to a paid API and pay
per call. It wants a model it owns, running on its own hardware, that has learned
one job well. This project builds exactly that and measures whether it works.

The interesting problems live in the *noise*: dates written five different ways
that all have to normalise to `YYYY-MM-DD`, the total hiding behind "AMOUNT DUE"
or "BALANCE", junk lines (addresses, tax, loyalty points) that must be ignored,
and a "price" convention the model can only learn from examples. A base model
guesses; the fine-tune learns the house rules.

## Results

Both models are scored on 50 held-out receipts with identical metrics. The base
model is the same 4-bit Qwen2.5-7B with the LoRA adapters switched off, so the
comparison is apples-to-apples.

| Metric | Base Qwen2.5-7B | Fine-tuned |
|---|---|---|
| JSON valid | 92.0% | 100.0% |
| Exact match | 8.0% | 100.0% |
| Vendor accuracy | 100.0% | 100.0% |
| Date accuracy | 95.7% | 100.0% |
| Total accuracy | 100.0% | 100.0% |
| Line-item F1 | 37.2% | 100.0% |

The base model already reads vendor and total reliably, but it doesn't know the
receipt's line-item conventions (quantity-times-unit-price vs. line totals), so
its line-item F1 lands at 37% and it produces a fully correct record only 8% of
the time. The fine-tune learns those conventions from the data and gets them
right. Numbers come straight from the evaluation cell in
`notebooks/finetune_qlora.ipynb`; this repo does not ship invented benchmarks.

## How it fits together

```
src/schema.py           the JSON contract (Pydantic), one source of truth
src/prompt.py           the one prompt format shared by train / eval / serve
src/generate_dataset.py synthetic data: build the record, render a messy receipt
eval/evaluate.py        base-vs-fine-tuned scoring (validity, fields, line-item F1)
notebooks/              the QLoRA training notebook (runs on a free Colab T4)
app/                    FastAPI service + single-page UI, serving a quantized GGUF
```

The data is **labelled by construction**: every example starts as a structured
record and is rendered down into noisy receipt text, so the ground-truth JSON is
correct without any hand-annotation.

## Reproduce it

```bash
# 1. Generate the dataset
pip install -r requirements.txt
python -m src.generate_dataset --train 2000 --val 200 --test 200 --seed 7

# 2. Fine-tune (open notebooks/finetune_qlora.ipynb in Colab on a T4 GPU,
#    run top to bottom; it trains, evaluates base-vs-fine-tuned, and exports
#    a quantized GGUF you download at the end)

# 3. Serve
export MODEL_PATH=models/receipt-extractor-q4.gguf   # or set MODEL_REPO to pull from the Hub
uvicorn app.main:app --port 7860
# open http://localhost:7860
```

Training runs on a free Colab/Kaggle T4 (15 GB) because QLoRA keeps the 7B base in
4-bit; a 4 GB card can't do it locally. Serving runs on CPU via a Q4_K_M GGUF, which
is what lets the demo live on a free Hugging Face Space.

## Honest caveats

- **The dataset is synthetic.** It models the *kinds* of noise real receipts have
  (format variation, distractor lines, ambiguous conventions) but isn't scanned
  OCR. The methodology (labelled-by-construction, held-out eval) transfers
  directly to a real annotated set. It also shows up in the model's behaviour:
  probing it with out-of-distribution receipts, vendor/date/total stay correct,
  but it sometimes *over-applies* the quantity-times-unit-price convention it learned
  (e.g. inventing a quantity when a line has none), because the training receipts
  always had clean quantity columns. That's the synthetic-data gap made concrete.
- **CPU serving is slow.** About 2-3 minutes per receipt: a 7B model on a free,
  GPU-less Space. The architecture doesn't change with better hardware; the
  latency does. On a GPU it's seconds.
- **"Fine-tuned" is the point, not the model size.** The result that matters is the
  measured gap over the base model, not that it's a 7B.
