"""Synthesise a labelled receipt dataset.

The trick that makes this dataset trustworthy: we build the structured record
first, then render it down into messy, OCR-flavoured receipt text. The JSON is
correct by construction, so there is no hand-annotation and no label noise.

The rendering deliberately introduces the kind of variation a real extractor
has to survive:
  * dates written five different human ways, all normalising to one ISO date
  * the total hiding behind labels like "AMOUNT DUE" or "BALANCE"
  * line-item layouts that put quantity before or after the description
  * junk lines (address, phone, cashier, tax, loyalty points) that must be ignored

Those are the things a base model gets wrong and a fine-tune learns to handle,
which is the whole point of the eval later.

Usage:
    python -m src.generate_dataset --train 2000 --val 200 --test 200 --seed 7
"""

from __future__ import annotations

import argparse
import json
import random
from datetime import date, timedelta
from pathlib import Path

from .schema import LineItem, Receipt

VENDORS = [
    "Blue Bottle Coffee", "Trader Joe's", "The Corner Bistro", "QuickMart",
    "Whole Foods Market", "Shell", "Office Depot", "Home Hardware",
    "Sunrise Diner", "Green Grocer", "CVS Pharmacy", "Ace Bookshop",
    "Luigi's Pizzeria", "Metro Electronics", "Pete's Hardware", "Cafe Verona",
]

PRODUCTS = [
    ("Cappuccino", 4.50), ("Bananas 1lb", 0.59), ("Cheddar Cheese", 6.25),
    ("Notebook A5", 3.99), ("USB-C Cable", 12.00), ("Sourdough Loaf", 5.50),
    ("Olive Oil 500ml", 8.75), ("AA Batteries 4pk", 4.29), ("Ballpoint Pen", 1.25),
    ("Ground Coffee 12oz", 9.99), ("Paper Towels", 3.49), ("Espresso Shot", 2.75),
    ("Margherita Pizza", 13.50), ("Greek Salad", 8.00), ("Sparkling Water", 1.99),
    ("Dish Soap", 2.89), ("Light Bulb 60W", 3.15), ("Printer Paper 500ct", 7.49),
    ("Almond Milk", 3.29), ("Dark Chocolate Bar", 2.49),
]

ADDRESSES = [
    "142 Market St", "88 Elm Avenue", "5 Broadway", "27 Oak Lane",
    "301 Sunset Blvd", "16 River Road", "9 Kings Way", "220 Hill St",
]
CASHIERS = ["Alex", "Sam", "Jordan", "Taylor", "Chris", "Morgan", "Riley"]
TOTAL_LABELS = ["TOTAL", "AMOUNT DUE", "BALANCE DUE", "TOTAL DUE", "Grand Total"]
THANKS = ["THANK YOU!", "Thanks for shopping with us", "Please come again",
          "*** Customer Copy ***", "Have a great day!"]


def _fmt_date(d: date, style: int) -> str:
    """Render one date in one of several human formats (JSON keeps the ISO form)."""
    return [
        d.strftime("%m/%d/%Y"),
        d.strftime("%d-%m-%Y"),
        d.strftime("%b %d, %Y"),
        d.strftime("%d %B %Y"),
        d.strftime("%Y.%m.%d"),
    ][style]


def _money(value: float, symbol: bool) -> str:
    s = f"{value:,.2f}"
    return f"${s}" if symbol else s


def _sample_receipt(rng: random.Random) -> Receipt:
    vendor = rng.choice(VENDORS)
    day = date(2023, 1, 1) + timedelta(days=rng.randint(0, 900))
    n_items = rng.randint(1, 6)
    items = []
    for name, unit in rng.sample(PRODUCTS, n_items):
        qty = rng.randint(1, 4)
        items.append(LineItem(description=name, quantity=qty, price=round(unit, 2)))
    total = round(sum(i.price * i.quantity for i in items), 2)
    return Receipt(vendor=vendor, date=day, total=total, line_items=items)


def _render(receipt: Receipt, rng: random.Random) -> str:
    """Turn a clean Receipt into a noisy receipt string a scanner might produce."""
    symbol = rng.random() < 0.8
    lines: list[str] = []

    # Header block — vendor plus junk the model must learn to skip.
    lines.append(receipt.vendor.upper() if rng.random() < 0.5 else receipt.vendor)
    if rng.random() < 0.7:
        lines.append(rng.choice(ADDRESSES))
    if rng.random() < 0.5:
        lines.append(f"Tel: (555) {rng.randint(100, 999)}-{rng.randint(1000, 9999)}")
    lines.append("-" * rng.randint(20, 32))

    # Date and a receipt-number distractor, order shuffled.
    meta = [f"Date: {_fmt_date(receipt.date, rng.randint(0, 4))}"]
    if rng.random() < 0.6:
        meta.append(f"Receipt #: {rng.randint(10000, 99999)}")
    if rng.random() < 0.4:
        meta.append(f"Cashier: {rng.choice(CASHIERS)}")
    rng.shuffle(meta)
    lines.extend(meta)
    lines.append("-" * rng.randint(20, 32))

    # Line items — layout of quantity vs description varies row to row.
    for item in receipt.line_items:
        line_total = _money(item.price * item.quantity, symbol)
        layout = rng.randint(0, 2)
        if layout == 0:
            lines.append(f"{item.quantity} x {item.description}".ljust(26) + line_total)
        elif layout == 1:
            lines.append(f"{item.description} x{item.quantity}".ljust(26) + line_total)
        else:
            lines.append(item.description.ljust(22)
                         + f"{item.quantity} @ {_money(item.price, symbol)}")

    lines.append("-" * rng.randint(20, 32))

    # Subtotal / tax distractors that don't appear in the target JSON.
    if rng.random() < 0.6:
        tax = round(receipt.total * rng.uniform(0.05, 0.09), 2)
        subtotal = round(receipt.total - tax, 2)
        lines.append("Subtotal".ljust(20) + _money(subtotal, symbol))
        lines.append(f"Tax".ljust(20) + _money(tax, symbol))

    total_label = rng.choice(TOTAL_LABELS)
    lines.append(total_label.ljust(20) + _money(receipt.total, symbol))

    if rng.random() < 0.4:
        lines.append(f"Loyalty points earned: {rng.randint(5, 200)}")
    if rng.random() < 0.7:
        lines.append(rng.choice(THANKS))

    return "\n".join(lines)


def _write_split(path: Path, n: int, rng: random.Random) -> None:
    with path.open("w", encoding="utf-8") as f:
        for _ in range(n):
            receipt = _sample_receipt(rng)
            row = {"text": _render(receipt, rng), "target": receipt.to_json()}
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"wrote {n:>5} examples -> {path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a synthetic receipt dataset.")
    parser.add_argument("--train", type=int, default=2000)
    parser.add_argument("--val", type=int, default=200)
    parser.add_argument("--test", type=int, default=200)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--out", type=Path, default=Path("data"))
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    rng = random.Random(args.seed)
    # Separate RNG streams per split so the test set never overlaps generation with train.
    _write_split(args.out / "train.jsonl", args.train, random.Random(rng.random()))
    _write_split(args.out / "val.jsonl", args.val, random.Random(rng.random()))
    _write_split(args.out / "test.jsonl", args.test, random.Random(rng.random()))


if __name__ == "__main__":
    main()
