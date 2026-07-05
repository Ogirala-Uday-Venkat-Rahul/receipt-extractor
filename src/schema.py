"""The extraction target: a receipt reduced to structured fields.

This schema is the single source of truth for the whole project. The dataset
generator produces objects that validate against it, the fine-tune trains the
model to emit it, and the evaluator scores predictions field-by-field against
it. If the shape changes, it changes here and nowhere else.
"""

from __future__ import annotations

import json
from datetime import date

from pydantic import BaseModel, Field, field_validator


class LineItem(BaseModel):
    description: str
    quantity: int = Field(ge=1)
    price: float = Field(ge=0)

    @field_validator("price")
    @classmethod
    def round_price(cls, v: float) -> float:
        return round(v, 2)


class Receipt(BaseModel):
    vendor: str
    date: date
    total: float = Field(ge=0)
    line_items: list[LineItem]

    @field_validator("total")
    @classmethod
    def round_total(cls, v: float) -> float:
        return round(v, 2)

    def to_json(self) -> str:
        """Compact, key-ordered JSON: the exact string the model is trained to emit."""
        return json.dumps(
            {
                "vendor": self.vendor,
                "date": self.date.isoformat(),
                "total": self.total,
                "line_items": [
                    {
                        "description": item.description,
                        "quantity": item.quantity,
                        "price": item.price,
                    }
                    for item in self.line_items
                ],
            },
            ensure_ascii=False,
        )


def parse_receipt(raw: str) -> Receipt:
    """Validate a model's raw output string into a Receipt (raises on bad JSON/shape)."""
    return Receipt.model_validate_json(raw)
