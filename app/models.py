from __future__ import annotations

from dataclasses import dataclass, asdict


@dataclass
class DeliveryItem:
    subject: str
    title: str
    due_date_iso: str
    reminder_date_iso: str
    source_line: str
    reminder_days: int = 5

    def to_dict(self) -> dict:
        return asdict(self)
