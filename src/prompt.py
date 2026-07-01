"""The one prompt format used everywhere.

Fine-tuning only works if the model sees the same instruction at inference that
it saw during training. Training, evaluation, and the serving API all build the
prompt through these functions so the three can never drift apart.

Mistral-7B-Instruct expects the `[INST] ... [/INST]` chat format. We keep the
instruction terse and put all the schema rules in it, because those rules are
exactly what the fine-tune is teaching the model to internalise.
"""

INSTRUCTION = (
    "Extract the receipt below into JSON with these keys: "
    "vendor (string), date (YYYY-MM-DD), total (number), and line_items "
    "(a list of objects with description, quantity, and price). "
    "Return only the JSON object, nothing else."
)


def build_prompt(receipt_text: str) -> str:
    """The full `[INST]...[/INST]` string fed to the model (no answer)."""
    return f"<s>[INST] {INSTRUCTION}\n\n{receipt_text.strip()} [/INST]"


def build_training_example(receipt_text: str, target_json: str) -> str:
    """Prompt + gold answer + EOS — one row of the supervised fine-tuning set."""
    return f"{build_prompt(receipt_text)} {target_json}</s>"
