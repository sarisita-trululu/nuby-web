from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from io import BytesIO
from pathlib import Path

import dateparser
import pdfplumber
from docx import Document

from .models import DeliveryItem

SPANISH_MONTH_HINTS = (
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "setiembre",
    "octubre",
    "noviembre",
    "diciembre",
)

DATE_PATTERNS = [
    r"\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b",
    r"\b\d{1,2}\s+de\s+[a-zA-Záéíóúñ]+\s*(?:de\s+\d{4})?\b",
    r"\b[a-zA-Záéíóúñ]+\s+\d{1,2},?\s+\d{4}\b",
]

TASK_KEYWORDS = [
    "entregar",
    "entrega",
    "fecha límite",
    "fecha limite",
    "deadline",
    "presentar",
    "presentación",
    "presentacion",
    "caso clínico",
    "caso clinico",
    "taller",
    "informe",
    "ensayo",
    "trabajo",
    "exposición",
    "exposicion",
    "quiz",
    "examen",
    "parcial",
    "actividad",
    "tarea",
    "laboratorio",
    "proyecto",
]


def extract_text(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf_text(content)
    if suffix == ".docx":
        return _extract_docx_text(content)
    raise ValueError("Formato no soportado. Usa un archivo PDF o DOCX.")


def parse_deliveries(
    text: str,
    today: date | None = None,
    reminder_days: int = 5,
) -> list[DeliveryItem]:
    if today is None:
        today = date.today()
    reminder_days = max(0, reminder_days)

    deliveries: list[DeliveryItem] = []
    seen: set[tuple[str, str]] = set()

    for raw_line in _normalize_lines(text):
        found_date = _extract_date(raw_line, today)
        if not found_date:
            continue

        if not _looks_like_task_line(raw_line):
            continue

        title = _extract_title(raw_line, found_date["matched_text"])
        if not title:
            title = f"Entrega detectada - {found_date['matched_text']}"

        due_date = found_date["date"]
        reminder_date = due_date - timedelta(days=reminder_days)
        key = (title.lower(), due_date.isoformat())
        if key in seen:
            continue

        seen.add(key)
        deliveries.append(
            DeliveryItem(
                title=title,
                due_date_iso=due_date.isoformat(),
                reminder_date_iso=reminder_date.isoformat(),
                source_line=raw_line,
                reminder_days=reminder_days,
            )
        )

    deliveries.sort(key=lambda item: item.due_date_iso)
    return deliveries


def _extract_pdf_text(content: bytes) -> str:
    pages: list[str] = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return "\n".join(pages)


def _extract_docx_text(content: bytes) -> str:
    document = Document(BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())


def _normalize_lines(text: str) -> list[str]:
    cleaned = text.replace("\r", "\n")
    chunks = [line.strip(" -•\t") for line in cleaned.split("\n")]
    return [re.sub(r"\s+", " ", chunk).strip() for chunk in chunks if chunk.strip()]


def _extract_date(line: str, today: date) -> dict | None:
    for pattern in DATE_PATTERNS:
        match = re.search(pattern, line, flags=re.IGNORECASE)
        if not match:
            continue

        matched_text = match.group(0)
        parsed = dateparser.parse(
            matched_text,
            languages=["es", "en"],
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": datetime.combine(today, datetime.min.time()),
            },
        )
        if not parsed:
            continue

        parsed_date = parsed.date()
        if parsed_date.year < today.year:
            parsed_date = parsed_date.replace(year=today.year)

        return {"date": parsed_date, "matched_text": matched_text}
    return None


def _looks_like_task_line(line: str) -> bool:
    lower = line.lower()
    if any(keyword in lower for keyword in TASK_KEYWORDS):
        return True
    return any(month in lower for month in SPANISH_MONTH_HINTS) and len(line.split()) >= 4


def _extract_title(line: str, matched_date_text: str) -> str:
    title = re.sub(re.escape(matched_date_text), "", line, flags=re.IGNORECASE).strip(" :.-")
    title = re.sub(
        r"\b(el|la|para|fecha límite|fecha limite|deadline|entregar|entrega|presentar)\b",
        "",
        title,
        flags=re.IGNORECASE,
    )
    title = re.sub(r"\s+", " ", title).strip(" :.-")
    return title[:120]
