"""Score a model's receipt extractions against the gold labels.

This is the part of the project that actually earns the word "fine-tuned" on a
resume. Anyone can LoRA a model; the question an interviewer asks is "how do you
know it got better?" These metrics answer that, and the same code scores the
base model and the fine-tuned model so the comparison is apples-to-apples.

Metrics reported:
  json_valid   : fraction of outputs that parse into the schema at all. The base
                 model often wraps JSON in prose or emits trailing commas; this
                 catches that. A model that can't produce valid JSON is useless
                 downstream regardless of field accuracy.
  exact_match  : fraction where the whole record equals the gold record.
  vendor/date/total accuracy: per-field correctness (only over parseable rows).
  line_item_f1 : precision/recall/F1 over (description, quantity, price) tuples,
                 because a receipt with the right total but wrong items is wrong.

Use from a notebook:
    from eval.evaluate import evaluate, format_report
    report = evaluate(predict_fn, load_examples("data/test.jsonl"))
    print(format_report({"base": base_report, "fine-tuned": report}))
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable

from src.schema import Receipt, parse_receipt


@dataclass
class Example:
    text: str
    gold: Receipt


@dataclass
class Report:
    n: int = 0
    json_valid: int = 0
    exact: int = 0
    vendor_ok: int = 0
    date_ok: int = 0
    total_ok: int = 0
    li_tp: int = 0
    li_fp: int = 0
    li_fn: int = 0
    parsed: int = 0  # rows that parsed, i.e. the denominator for field accuracy
    failures: list[str] = field(default_factory=list)

    @property
    def json_valid_rate(self) -> float:
        return self.json_valid / self.n if self.n else 0.0

    @property
    def exact_rate(self) -> float:
        return self.exact / self.n if self.n else 0.0

    def _field_rate(self, ok: int) -> float:
        return ok / self.parsed if self.parsed else 0.0

    @property
    def vendor_acc(self) -> float:
        return self._field_rate(self.vendor_ok)

    @property
    def date_acc(self) -> float:
        return self._field_rate(self.date_ok)

    @property
    def total_acc(self) -> float:
        return self._field_rate(self.total_ok)

    @property
    def line_item_f1(self) -> float:
        p = self.li_tp / (self.li_tp + self.li_fp) if (self.li_tp + self.li_fp) else 0.0
        r = self.li_tp / (self.li_tp + self.li_fn) if (self.li_tp + self.li_fn) else 0.0
        return 2 * p * r / (p + r) if (p + r) else 0.0


def _norm_vendor(v: str) -> str:
    return " ".join(v.lower().split())


def _item_key(item) -> tuple:
    return (_norm_vendor(item.description), item.quantity, round(item.price, 2))


def _score_line_items(pred: Receipt, gold: Receipt) -> tuple[int, int, int]:
    """Multiset overlap of line items → (true positives, false positives, false negatives)."""
    pred_keys: dict[tuple, int] = {}
    for it in pred.line_items:
        pred_keys[_item_key(it)] = pred_keys.get(_item_key(it), 0) + 1
    gold_keys: dict[tuple, int] = {}
    for it in gold.line_items:
        gold_keys[_item_key(it)] = gold_keys.get(_item_key(it), 0) + 1

    tp = sum(min(pred_keys.get(k, 0), c) for k, c in gold_keys.items())
    fp = sum(pred_keys.values()) - tp
    fn = sum(gold_keys.values()) - tp
    return tp, fp, fn


def _score_one(raw: str, gold: Receipt, report: Report) -> None:
    report.n += 1
    try:
        pred = parse_receipt(raw)
    except Exception:
        report.failures.append(raw[:200])
        return

    report.json_valid += 1
    report.parsed += 1

    if _norm_vendor(pred.vendor) == _norm_vendor(gold.vendor):
        report.vendor_ok += 1
    if pred.date == gold.date:
        report.date_ok += 1
    if abs(pred.total - gold.total) < 0.01:
        report.total_ok += 1

    tp, fp, fn = _score_line_items(pred, gold)
    report.li_tp += tp
    report.li_fp += fp
    report.li_fn += fn

    if pred.to_json() == gold.to_json():
        report.exact += 1


def load_examples(path: str | Path) -> list[Example]:
    examples = []
    for line in Path(path).open(encoding="utf-8"):
        row = json.loads(line)
        examples.append(Example(text=row["text"], gold=parse_receipt(row["target"])))
    return examples


def evaluate(predict_fn: Callable[[str], str], examples: Iterable[Example]) -> Report:
    """Run `predict_fn` over every example and accumulate the metrics."""
    report = Report()
    for ex in examples:
        raw = predict_fn(ex.text)
        _score_one(raw, ex.gold, report)
    return report


def format_report(reports: dict[str, Report]) -> str:
    """Render one or more named reports as an aligned comparison table."""
    rows = [
        ("JSON valid", "json_valid_rate"),
        ("Exact match", "exact_rate"),
        ("Vendor acc", "vendor_acc"),
        ("Date acc", "date_acc"),
        ("Total acc", "total_acc"),
        ("Line-item F1", "line_item_f1"),
    ]
    names = list(reports)
    width = max(12, *(len(n) for n in names))
    header = "Metric".ljust(14) + "".join(n.rjust(width + 2) for n in names)
    lines = [header, "-" * len(header)]
    for label, attr in rows:
        cells = "".join(f"{getattr(reports[n], attr):.1%}".rjust(width + 2) for n in names)
        lines.append(label.ljust(14) + cells)
    return "\n".join(lines)


def _cli() -> None:
    """Evaluate the served GGUF model against the test set from the command line."""
    import argparse

    parser = argparse.ArgumentParser(description="Evaluate the local GGUF extractor.")
    parser.add_argument("--test", type=Path, default=Path("data/test.jsonl"))
    parser.add_argument("--limit", type=int, default=None, help="cap examples for a quick run")
    args = parser.parse_args()

    from app.model import extract  # imported lazily so scoring stays dependency-free

    examples = load_examples(args.test)
    if args.limit:
        examples = examples[: args.limit]
    report = evaluate(extract, examples)
    print(format_report({"fine-tuned": report}))


if __name__ == "__main__":
    _cli()
