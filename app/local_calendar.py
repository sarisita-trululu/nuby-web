from __future__ import annotations

import json
import uuid
from calendar import month_name, monthcalendar
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path

from .models import DeliveryItem


@dataclass
class CalendarEvent:
    id: str
    event_date_iso: str
    title: str
    subject: str
    category: str
    event_type: str
    source_line: str

    def to_dict(self) -> dict:
        return asdict(self)


class LocalCalendarService:
    def __init__(self, storage_path: str = "local_calendar_events.json") -> None:
        self.storage_path = Path(storage_path)

    def add_delivery_items(self, deliveries: list[DeliveryItem]) -> int:
        events = self._load_events()
        existing_keys = {
            (event.event_date_iso, event.title.lower(), event.event_type.lower())
            for event in events
        }
        created = 0

        for item in deliveries:
            due_event = CalendarEvent(
                id=str(uuid.uuid4()),
                event_date_iso=item.due_date_iso,
                title=item.title,
                subject=item.subject,
                category=item.category,
                event_type="Entrega",
                source_line=item.source_line,
            )
            reminder_event = CalendarEvent(
                id=str(uuid.uuid4()),
                event_date_iso=item.reminder_date_iso,
                title=f"Preparar: {item.title}",
                subject=item.subject,
                category=item.category,
                event_type="Recordatorio",
                source_line=item.source_line,
            )

            for event in (due_event, reminder_event):
                key = (event.event_date_iso, event.title.lower(), event.event_type.lower())
                if key in existing_keys:
                    continue
                existing_keys.add(key)
                events.append(event)
                created += 1

        self._save_events(events)
        return created

    def get_month_view(self, year: int, month: int) -> dict:
        events = self._load_events()
        events_by_day: dict[str, list[CalendarEvent]] = {}
        for event in events:
            if event.event_date_iso.startswith(f"{year:04d}-{month:02d}-"):
                events_by_day.setdefault(event.event_date_iso, []).append(event)

        weeks = []
        for week in monthcalendar(year, month):
            days = []
            for day in week:
                if day == 0:
                    days.append(None)
                    continue
                day_iso = f"{year:04d}-{month:02d}-{day:02d}"
                days.append(
                    {
                        "date_iso": day_iso,
                        "day": day,
                        "events": sorted(
                            [event.to_dict() for event in events_by_day.get(day_iso, [])],
                            key=lambda event: (event["event_type"], event["title"]),
                        ),
                        "is_today": day_iso == date.today().isoformat(),
                    }
                )
            weeks.append(days)

        upcoming_events = sorted(
            [event.to_dict() for event in events],
            key=lambda event: (event["event_date_iso"], event["event_type"], event["title"]),
        )[:30]

        prev_year, prev_month = (year - 1, 12) if month == 1 else (year, month - 1)
        next_year, next_month = (year + 1, 1) if month == 12 else (year, month + 1)

        return {
            "label": f"{month_name[month]} {year}",
            "year": year,
            "month": month,
            "weeks": weeks,
            "upcoming_events": upcoming_events,
            "prev_year": prev_year,
            "prev_month": prev_month,
            "next_year": next_year,
            "next_month": next_month,
        }

    def clear_all(self) -> None:
        self._save_events([])

    def _load_events(self) -> list[CalendarEvent]:
        if not self.storage_path.exists():
            return []
        try:
            raw = json.loads(self.storage_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
        return [CalendarEvent(**item) for item in raw]

    def _save_events(self, events: list[CalendarEvent]) -> None:
        payload = [event.to_dict() for event in events]
        self.storage_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
