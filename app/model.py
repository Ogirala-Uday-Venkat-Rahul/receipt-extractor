"""Serve the fine-tuned model on CPU via a quantized GGUF.

Why GGUF and not the training stack: the 4-bit + LoRA setup from the notebook
needs a GPU (bitsandbytes). A free Hugging Face Space is CPU-only, so we merge the
adapters, quantize to GGUF with llama.cpp, and run that here. It loads in a couple
of GB of RAM and answers in a few seconds per receipt.

The model is loaded lazily on first use so that importing this module (for tests
or the offline evaluator) doesn't require the weights to be present.
"""

from __future__ import annotations

import os
from functools import lru_cache

from src.prompt import build_prompt

MODEL_PATH = os.getenv("MODEL_PATH", "models/receipt-extractor-q4.gguf")
THREADS = int(os.getenv("LLAMA_THREADS", "4"))
# A ~4 GB GGUF is too big to commit. Push it to an HF model repo and set these two
# env vars; the app downloads it once on first request (cached on disk thereafter).
MODEL_REPO = os.getenv("MODEL_REPO")            # e.g. "ouvrahul/receipt-extractor-gguf"
MODEL_FILE = os.getenv("MODEL_FILE", "receipt-extractor-q4.gguf")


def _resolve_model() -> str:
    if os.path.exists(MODEL_PATH):
        return MODEL_PATH
    if MODEL_REPO:
        from huggingface_hub import hf_hub_download

        return hf_hub_download(repo_id=MODEL_REPO, filename=MODEL_FILE)
    raise FileNotFoundError(
        f"Model not found at {MODEL_PATH} and MODEL_REPO is unset. Train + quantize "
        "with the notebook, then either place the .gguf at MODEL_PATH or set "
        "MODEL_REPO/MODEL_FILE to download it from the Hub."
    )


@lru_cache(maxsize=1)
def _load():
    path = _resolve_model()  # fail fast with a clean error before loading the runtime
    from llama_cpp import Llama  # imported here so the dep is only needed to serve

    return Llama(
        model_path=path,
        n_ctx=2048,
        n_threads=THREADS,
        verbose=False,
    )


def extract(receipt_text: str) -> str:
    """Run the model on one receipt and return its raw JSON string."""
    llm = _load()
    # build_prompt embeds a literal "<s>"; llama.cpp adds BOS itself, so drop ours
    # to avoid a doubled beginning-of-sequence token.
    prompt = build_prompt(receipt_text).replace("<s>", "", 1)
    out = llm.create_completion(
        prompt=prompt,
        max_tokens=512,
        temperature=0.0,
        stop=["</s>"],
    )
    return out["choices"][0]["text"].strip()
