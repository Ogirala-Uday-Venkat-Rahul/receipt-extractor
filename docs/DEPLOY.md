# Deploying the Receipt Extractor

Two artefacts ship: the **model** (a quantized GGUF, produced by the notebook) and
the **app** (this repo, running as a Hugging Face Docker Space). The Space downloads
the model from a companion model repo at runtime, so the app image stays small.

## 1. Train and export the model

Open `notebooks/finetune_qlora.ipynb` in Google Colab, set the runtime to a **T4
GPU**, and run it top to bottom. It will:

1. Ask you to log in (Mistral-7B-Instruct is gated — accept its license once at
   https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3, then paste a read token).
2. Generate the dataset, fine-tune with QLoRA, and print the base-vs-fine-tuned table.
3. Merge the adapters, quantize to `receipt-extractor-q4.gguf`, and download it.

Copy the eval numbers into the README results table while you have them.

## 2. Publish the model + deploy the app

The helper does both in one shot. In `.env`:

```
HF_TOKEN=hf_...            # write token
MODEL_REPO=<user>/receipt-extractor-gguf
MODEL_FILE=receipt-extractor-q4.gguf
LOCAL_GGUF=receipt-extractor-q4.gguf   # path to the file you downloaded
```

Then:

```bash
python deploy_hf.py receipt-extractor
```

It uploads the GGUF to the model repo, creates/updates the Docker Space, uploads the
app, and sets `MODEL_REPO`/`MODEL_FILE` as Space variables so the app knows where to
pull the weights.

## 3. Doing it by hand (if you skip the helper)

- Upload the `.gguf` to a new **model** repo on the Hub.
- Create a **Docker** Space. Keep the README frontmatter (`sdk: docker`,
  `app_port: 7860`) — HF reads the port from it.
- Push this repo to the Space (exclude `.env`, `*.gguf`, `data/*.jsonl`).
- In **Settings → Variables**, add `MODEL_REPO` and `MODEL_FILE`.

## 4. Verify

- `https://<user>-receipt-extractor.hf.space/health` →
  `{"status":"ok","model":"<user>/receipt-extractor-gguf/...","available":true}`
- Open `/` and extract one of the sample receipts. First call is slow while the
  Space downloads the GGUF and warms llama.cpp; subsequent calls are a few seconds.

## Notes on cost and persistence

- The GGUF download is cached on the Space's disk, but a free Space's filesystem is
  **ephemeral** — after a restart it re-downloads on the first request. That's a cold
  start, not data loss; the model repo is the source of truth.
- Everything here is free: Colab T4 for training, an HF model repo for the weights,
  and an HF CPU Space for serving.
