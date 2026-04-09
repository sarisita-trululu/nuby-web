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
    r"\b\d{1,2}\s+[a-zA-Záéíóúñ\.]+\s*(?:\d{4})?\b",
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
    "sustentación",
    "sustentacion",
    "prueba objetiva",
    "papsi",
    "coloquio",
]

READING_KEYWORDS = [
    "lectura",
    "lecturas",
    "capítulo",
    "capitulo",
    "artículo",
    "articulo",
    "revista",
    "doi",
    "disponible en",
    "guía de consulta",
    "capítulos",
    "capitulos",
]

ACTIVITY_KEYWORDS = [
    "actividad evaluativa",
    "quiz",
    "examen",
    "informe",
    "papsi",
    "entrega",
    "sustentación",
    "sustentacion",
    "análisis de caso",
    "analisis de caso",
    "proyecto de aula",
    "prueba objetiva",
    "final acumulativo",
    "película y análisis",
    "pelicula y analisis",
    "guía de trabajo",
    "guia de trabajo",
    "seminario alemán",
    "seminario aleman",
]


def analyze_document(
    filename: str,
    content: bytes,
    today: date | None = None,
    reminder_days: int = 5,
) -> list[DeliveryItem]:
    if today is None:
        today = date.today()

    suffix = Path(filename).suffix.lower()
    if suffix == ".docx":
        return _parse_docx_document(filename, content, today, reminder_days)
    if suffix == ".pdf":
        text = _extract_pdf_text(content)
        return parse_deliveries(text, today=today, reminder_days=reminder_days, source_name=filename)
    raise ValueError("Formato no soportado. Usa un archivo PDF o DOCX.")


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
    source_name: str = "",
    base_year: int | None = None,
) -> list[DeliveryItem]:
    if today is None:
        today = date.today()
    reminder_days = max(0, reminder_days)
    subject = _extract_subject(text, source_name)

    deliveries: list[DeliveryItem] = []
    seen: set[tuple[str, str, str]] = set()

    for raw_line in _normalize_lines(text):
        found_date = _extract_date(raw_line, today, base_year=base_year)
        if not found_date:
            continue

        category = _classify_line(raw_line)
        if category == "otro":
            continue

        title = _extract_title(raw_line, found_date["matched_text"])
        if not title:
            title = f"{category.title()} detectada - {found_date['matched_text']}"

        item = _build_item(
            subject=subject,
            category=category,
            title=title,
            due_date=found_date["date"],
            source_line=raw_line,
            reminder_days=reminder_days,
        )
        key = (item.subject.lower(), item.category.lower(), f"{item.title.lower()}|{item.due_date_iso}")
        if key not in seen:
            seen.add(key)
            deliveries.append(item)

    deliveries.sort(key=lambda item: (item.due_date_iso, item.subject, item.title))
    return deliveries


def _parse_docx_document(
    filename: str,
    content: bytes,
    today: date,
    reminder_days: int,
) -> list[DeliveryItem]:
    document = Document(BytesIO(content))
    subject = _extract_subject_from_document(document, filename)
    base_year = _extract_year_from_document(document, filename, today.year)
    deliveries = _extract_items_from_tables(document, subject, today, reminder_days, base_year)

    if deliveries:
        return _dedupe_items(deliveries)

    text = _extract_docx_text(content)
    return parse_deliveries(
        text,
        today=today,
        reminder_days=reminder_days,
        source_name=filename,
        base_year=base_year,
    )


def _extract_items_from_tables(
    document: Document,
    subject: str,
    today: date,
    reminder_days: int,
    base_year: int,
) -> list[DeliveryItem]:
    items: list[DeliveryItem] = []
    for table in document.tables:
        rows = [_row_to_cells(row) for row in table.rows]
        if not rows:
            continue

        header = [cell.lower() for cell in rows[0]]
        if any("semana" in cell for cell in header) and any("trabajo independiente" in cell for cell in header):
            items.extend(_parse_course_plan_table(rows, subject, today, reminder_days, base_year))
        elif any("fecha" in cell for cell in header) and any("tipo de prueba" in cell for cell in header):
            items.extend(_parse_evaluation_plan_table(rows, subject, today, reminder_days, base_year))

    return items


def _parse_course_plan_table(
    rows: list[list[str]],
    subject: str,
    today: date,
    reminder_days: int,
    base_year: int,
) -> list[DeliveryItem]:
    items: list[DeliveryItem] = []
    for row in rows[1:]:
        if len(row) < 4:
            continue

        week_cell, themes_cell, teacher_cell, independent_cell = row[:4]
        due_info = _extract_date(week_cell, today, base_year=base_year)
        if not due_info:
            continue

        due_date = due_info["date"]
        if "semana santa" in " ".join(row).lower():
            continue

        activity_title = _extract_activity_from_course_row(themes_cell, teacher_cell, independent_cell)
        if activity_title:
            items.append(
                _build_item(
                    subject=subject,
                    category="actividad",
                    title=activity_title,
                    due_date=due_date,
                    source_line=" | ".join(part for part in row if part),
                    reminder_days=reminder_days,
                )
            )

        reading_title = _extract_reading_from_course_row(themes_cell, independent_cell)
        if reading_title:
            items.append(
                _build_item(
                    subject=subject,
                    category="lectura",
                    title=reading_title,
                    due_date=due_date,
                    source_line=" | ".join(part for part in row if part),
                    reminder_days=reminder_days,
                )
            )

    return items


def _parse_evaluation_plan_table(
    rows: list[list[str]],
    subject: str,
    today: date,
    reminder_days: int,
    base_year: int,
) -> list[DeliveryItem]:
    items: list[DeliveryItem] = []
    for row in rows[1:]:
        if len(row) < 4:
            continue

        topic, test_type, percent, date_cell = row[:4]
        due_info = _extract_date(date_cell, today, base_year=base_year)
        if not due_info:
            continue

        detail = " - ".join(part for part in (topic, test_type, percent) if part)
        items.append(
            _build_item(
                subject=subject,
                category="actividad",
                title=detail or "Actividad evaluativa",
                due_date=due_info["date"],
                source_line=" | ".join(part for part in row if part),
                reminder_days=reminder_days,
            )
        )

    return items


def _extract_activity_from_course_row(themes: str, teacher_work: str, independent_work: str) -> str:
    candidates = [themes, teacher_work, independent_work]
    for text in candidates:
        lower = text.lower()
        if any(keyword in lower for keyword in ACTIVITY_KEYWORDS):
            return _clean_title(text)

    return ""


def _extract_reading_from_course_row(themes: str, independent_work: str) -> str:
    lower = independent_work.lower()
    if not independent_work or "no aplica" in lower or "semana santa" in lower:
        return ""

    if any(keyword in lower for keyword in READING_KEYWORDS) or _looks_like_bibliography(independent_work):
        theme_hint = _first_phrase(themes) or "Lectura"
        return _clean_title(f"Lectura: {theme_hint}")

    return ""


def _looks_like_bibliography(text: str) -> bool:
    bibliography_markers = ["pp.", "p.", "doi", "revista", "editorial", "capítulo", "capitulo", "http://", "https://"]
    return any(marker in text.lower() for marker in bibliography_markers)


def _build_item(
    subject: str,
    category: str,
    title: str,
    due_date: date,
    source_line: str,
    reminder_days: int,
) -> DeliveryItem:
    reminder_date = due_date - timedelta(days=max(0, reminder_days))
    return DeliveryItem(
        subject=subject,
        category=category,
        title=title[:160],
        due_date_iso=due_date.isoformat(),
        reminder_date_iso=reminder_date.isoformat(),
        source_line=source_line[:1000],
        reminder_days=max(0, reminder_days),
    )


def _dedupe_items(items: list[DeliveryItem]) -> list[DeliveryItem]:
    seen: set[tuple[str, str, str, str]] = set()
    unique: list[DeliveryItem] = []
    for item in items:
        key = (
            item.subject.lower(),
            item.category.lower(),
            item.title.lower(),
            item.due_date_iso,
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    unique.sort(key=lambda item: (item.due_date_iso, item.subject, item.category, item.title))
    return unique


def _extract_pdf_text(content: bytes) -> str:
    pages: list[str] = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return "\n".join(pages)


def _extract_docx_text(content: bytes) -> str:
    document = Document(BytesIO(content))
    lines = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    for table in document.tables:
        for row in table.rows:
            lines.append(" | ".join(_row_to_cells(row)))
    return "\n".join(lines)


def _row_to_cells(row) -> list[str]:
    cells: list[str] = []
    for cell in row.cells:
        text = " ".join(p.text.strip() for p in cell.paragraphs if p.text.strip())
        normalized = re.sub(r"\s+", " ", text).strip()
        cells.append(normalized)
    return cells


def _normalize_lines(text: str) -> list[str]:
    cleaned = text.replace("\r", "\n")
    chunks = [line.strip(" -•\t") for line in cleaned.split("\n")]
    return [re.sub(r"\s+", " ", chunk).strip() for chunk in chunks if chunk.strip()]


def _extract_date(line: str, today: date, base_year: int | None = None) -> dict | None:
    for pattern in DATE_PATTERNS:
        for match in re.finditer(pattern, line, flags=re.IGNORECASE):
            matched_text = match.group(0).replace(".", "").strip()
            if "semana" in matched_text.lower():
                continue

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
            explicit_year = re.search(r"\b\d{4}\b", matched_text)
            if base_year and not explicit_year:
                parsed_date = parsed_date.replace(year=base_year)
            elif parsed_date.year < today.year:
                parsed_date = parsed_date.replace(year=today.year)

            return {"date": parsed_date, "matched_text": matched_text}
    return None


def _classify_line(line: str) -> str:
    lower = line.lower()
    if any(keyword in lower for keyword in ACTIVITY_KEYWORDS):
        return "actividad"
    if any(keyword in lower for keyword in READING_KEYWORDS):
        return "lectura"
    if any(keyword in lower for keyword in TASK_KEYWORDS):
        return "actividad"
    return "otro"


def _extract_title(line: str, matched_date_text: str) -> str:
    title = re.sub(re.escape(matched_date_text), "", line, flags=re.IGNORECASE).strip(" :.-")
    title = re.sub(
        r"\b(el|la|para|fecha límite|fecha limite|deadline|entregar|entrega|presentar)\b",
        "",
        title,
        flags=re.IGNORECASE,
    )
    title = re.sub(r"\s+", " ", title).strip(" :.-")
    return title[:160]


def _extract_subject(text: str, source_name: str) -> str:
    lines = _normalize_lines(text)
    header_candidates = lines[:20]

    patterns = [
        r"\b(?:materia|asignatura|curso|catedra|cátedra|modulo|módulo)\s*:\s*(.+)",
        r"\b(?:plan de curso|programa de curso|syllabus)\s+de\s+(.+)",
        r"\bnombre del curso / seminario\s*\|\s*(.+)",
    ]

    for line in header_candidates:
        for pattern in patterns:
            match = re.search(pattern, line, flags=re.IGNORECASE)
            if match:
                subject = _clean_subject(match.group(1))
                if subject:
                    return subject

    stem = Path(source_name).stem if source_name else ""
    cleaned_name = _clean_subject(stem.replace("_", " ").replace("-", " "))
    return cleaned_name or "Materia no identificada"


def _extract_subject_from_document(document: Document, source_name: str) -> str:
    for table in document.tables:
        for row in table.rows:
            cells = _unique_nonempty(_row_to_cells(row))
            joined = " | ".join(cells)
            match = re.search(r"nombre del curso / seminario\s*\|\s*(.+)", joined, flags=re.IGNORECASE)
            if match:
                subject = _clean_subject(match.group(1))
                if subject:
                    return subject

    text = "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
    return _extract_subject(text, source_name)


def _extract_year_from_document(document: Document, source_name: str, fallback_year: int) -> int:
    source_match = re.search(r"\b(20\d{2})[-_ ]?[12]?\b", Path(source_name).stem)
    if source_match:
        return int(source_match.group(1))

    for table in document.tables:
        for row in table.rows:
            joined = " | ".join(_unique_nonempty(_row_to_cells(row)))
            match = re.search(r"periodo académico\s*\|\s*(20\d{2})", joined, flags=re.IGNORECASE)
            if match:
                return int(match.group(1))

    return fallback_year


def _unique_nonempty(values: list[str]) -> list[str]:
    compact: list[str] = []
    for value in values:
        if value and value not in compact:
            compact.append(value)
    return compact


def _clean_subject(value: str) -> str:
    cleaned = re.sub(r"\s+", " ", value).strip(" :.-_")
    cleaned = re.sub(
        r"\b(grupo|semestre|periodo|período)\b.*$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    ).strip(" :.-_")
    return cleaned[:120]


def _clean_title(value: str) -> str:
    cleaned = re.sub(r"\s+", " ", value).strip(" :.-_")
    return cleaned[:160]


def _first_phrase(value: str) -> str:
    phrase = re.split(r"[.:;|]", value)[0].strip()
    return phrase[:100]
