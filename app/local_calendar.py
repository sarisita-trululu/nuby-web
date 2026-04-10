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
    owner: str
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

    def add_delivery_items(self, owner: str, deliveries: list[DeliveryItem]) -> int:
        events = self._load_events()
        existing_keys = {
            (event.owner, event.event_date_iso, event.title.lower(), event.event_type.lower())
            for event in events
        }
        created = 0

        for item in deliveries:
            due_event = CalendarEvent(
                id=str(uuid.uuid4()),
                owner=owner,
                event_date_iso=item.due_date_iso,
                title=item.title,
                subject=item.subject,
                category=item.category,
                event_type="Entrega",
                source_line=item.source_line,
            )
            reminder_event = CalendarEvent(
                id=str(uuid.uuid4()),
                owner=owner,
                event_date_iso=item.reminder_date_iso,
                title=f"Preparar: {item.title}",
                subject=item.subject,
                category=item.category,
                event_type="Recordatorio",
                source_line=item.source_line,
            )

            for event in (due_event, reminder_event):
                key = (event.owner, event.event_date_iso, event.title.lower(), event.event_type.lower())
                if key in existing_keys:
                    continue
                existing_keys.add(key)
                events.append(event)
                created += 1

        self._save_events(events)
        return created

    def get_month_view(self, owner: str, year: int, month: int) -> dict:
        events = self._load_events()
        events_by_day: dict[str, list[CalendarEvent]] = {}
        for event in events:
            if event.owner == owner and event.event_date_iso.startswith(f"{year:04d}-{month:02d}-"):
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
            [event.to_dict() for event in events if event.owner == owner],
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

    def add_manual_event(
        self,
        owner: str,
        event_date_iso: str,
        title: str,
        subject: str = "General",
        category: str = "actividad",
        event_type: str = "Entrega",
    ) -> str:
        normalized_title = title.strip()
        if not normalized_title:
            raise ValueError("Debes escribir un titulo para guardar el evento.")

        events = self._load_events()
        event = CalendarEvent(
            id=str(uuid.uuid4()),
            owner=owner,
            event_date_iso=event_date_iso,
            title=normalized_title,
            subject=subject.strip() or "General",
            category=category.strip() or "actividad",
            event_type=event_type.strip() or "Entrega",
            source_line="Creado manualmente",
        )
        events.append(event)
        self._save_events(events)
        return event.id

    def update_event(
        self,
        owner: str,
        event_id: str,
        event_date_iso: str,
        title: str,
        subject: str,
        category: str,
        event_type: str,
    ) -> None:
        events = self._load_events()
        normalized_title = title.strip()
        if not normalized_title:
            raise ValueError("Debes escribir un titulo para actualizar el evento.")

        for event in events:
            if event.id == event_id and event.owner == owner:
                event.event_date_iso = event_date_iso
                event.title = normalized_title
                event.subject = subject.strip() or "General"
                event.category = category.strip() or "actividad"
                event.event_type = event_type.strip() or "Entrega"
                self._save_events(events)
                return

        raise ValueError("No se encontro el evento que intentas actualizar.")

    def delete_event(self, owner: str, event_id: str) -> None:
        events = self._load_events()
        filtered = [event for event in events if not (event.id == event_id and event.owner == owner)]
        if len(filtered) == len(events):
            raise ValueError("No se encontro el evento que intentas borrar.")
        self._save_events(filtered)

    def clear_all(self, owner: str) -> None:
        events = [event for event in self._load_events() if event.owner != owner]
        self._save_events(events)

    def _load_events(self) -> list[CalendarEvent]:
        if not self.storage_path.exists():
            return []
        try:
            raw = json.loads(self.storage_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
        normalized = []
        for item in raw:
            item.setdefault("owner", "__legacy__")
            normalized.append(CalendarEvent(**item))
        return normalized

    def _save_events(self, events: list[CalendarEvent]) -> None:
        payload = [event.to_dict() for event in events]
        self.storage_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
