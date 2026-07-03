# Deploying the Receipt Extractor

Two artefacts ship: the **model** (a quantized GGUF, produced by the notebook) and
the **app** (this repo, running as a Hugging Face Docker Space). The Space downloads
the model from a companion model repo at runtime, so the app image stays small.

## 1. Train and export the model

Open `notebooks/finetune_qlora.ipynb` on a free **T4 GPU** — Google Colab or Kaggle
both work (Kaggle is easier to get a GPU on, and its "Save & Run All" survives
disconnects). Run it top to bottom. It will:

1. Fine-tune with QLoRA and print the base-vs-fine-tuned table. Qwen2.5-7B-Instruct
   is openly licensed, so no login is needed.
2. Merge the adapters, quantize to `receipt-extractor-q4.gguf`.

Copy the eval numbers into the README results table while you have them.

The GGUF is ~4.7 GB, so the cleanest move is to **push it to the Hub straight from
the training environment** rather than pulling it down and re-uploading — a big
local download is exactly the step most likely to fail. Either way, the weights end
up in a **model** repo (e.g. `<user>/receipt-extractor-gguf`) as the source of truth.

## 2. Deploy the app

Config lives in `.env` (which is git-ignored — the write token never gets
committed):

```
HF_TOKEN=hf_...            # write token, used only at deploy time
MODEL_REPO=<user>/receipt-extractor-gguf
MODEL_FILE=receipt-extractor-q4.gguf
# LOCAL_GGUF=path/to.gguf  # ONLY if the weights aren't on the Hub yet
```

Then:

```bash
python deploy_hf.py receipt-extractor
```

The helper creates/updates the Docker Space, uploads the app, and sets
`MODEL_REPO`/`MODEL_FILE` as Space variables so the app knows where to pull the
weights. **The GGUF upload is optional and self-skipping:** it only runs if
`LOCAL_GGUF` is set *and* the file exists on disk. If the weights are already on the
Hub (the recommended path above), leave `LOCAL_GGUF` unset and the helper goes
straight to deploying the app — the token is never used to store the model twice.

Rotate the write token afterward if it was ever pasted somewhere visible; it isn't
stored in the Space (only the plain `MODEL_REPO`/`MODEL_FILE` variables are).

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
