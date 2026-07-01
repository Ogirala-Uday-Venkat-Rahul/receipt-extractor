"""The one conversation definition used everywhere.

Fine-tuning only works if the model sees the same prompt at inference that it saw
during training. Rather than hand-roll a format string, we define the conversation
as messages and let Qwen's official chat template render it — the training notebook
applies it via `tokenizer.apply_chat_template`, and the serving app applies the same
template through llama.cpp's chat completion. Both sides derive from this one place,
so they cannot drift.

Qwen2.5-Instruct uses the ChatML format (`<|im_start|>role ... <|im_end|>`); the
schema rules live in the instruction because that is exactly what the fine-tune is
teaching the model to internalise.
"""

SYSTEM = (
    "You are a precise information-extraction engine. "
    "You convert receipt text into structured JSON and output nothing else."
)

INSTRUCTION = (
    "Extract the receipt below into JSON with these keys: "
    "vendor (string), date (YYYY-MM-DD), total (number), and line_items "
    "(a list of objects with description, quantity, and price). "
    "Return only the JSON object, nothing else."
)


def build_messages(receipt_text: str) -> list[dict]:
    """The chat conversation for one receipt (no answer) — the single source of truth."""
    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": f"{INSTRUCTION}\n\n{receipt_text.strip()}"},
    ]
