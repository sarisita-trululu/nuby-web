from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .document_parser import extract_text, parse_deliveries
from .google_calendar import GoogleCalendarService
from .models import DeliveryItem

app = FastAPI(title="Organizador de Entregas")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "deliveries": [],
            "error": None,
            "success": None,
            "raw_payload": "[]",
            "default_reminder_days": 5,
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze", response_class=HTMLResponse)
async def analyze_document(
    request: Request,
    file: UploadFile = File(...),
    reminder_days: int = Form(5),
):
    try:
        content = await file.read()
        text = extract_text(file.filename, content)
        reminder_days = max(0, reminder_days)
        deliveries = parse_deliveries(
            text,
            today=date.today(),
            reminder_days=reminder_days,
            source_name=file.filename or "",
        )
        raw_payload = json.dumps([item.to_dict() for item in deliveries], ensure_ascii=False)
        success = f"Se detectaron {len(deliveries)} entregas." if deliveries else "No se detectaron entregas."
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "deliveries": deliveries,
                "error": None,
                "success": success,
                "raw_payload": raw_payload,
                "default_reminder_days": reminder_days,
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "deliveries": [],
                "error": str(exc),
                "success": None,
                "raw_payload": "[]",
                "default_reminder_days": reminder_days,
            },
            status_code=400,
        )


@app.post("/sync", response_class=HTMLResponse)
async def sync_calendar(
    request: Request,
    subjects: Annotated[list[str], Form(...)],
    titles: Annotated[list[str], Form(...)],
    due_dates: Annotated[list[str], Form(...)],
    source_lines: Annotated[list[str], Form(...)],
    reminder_days_list: Annotated[list[int], Form(...)],
):
    try:
        deliveries = _build_deliveries_from_form(
            subjects=subjects,
            titles=titles,
            due_dates=due_dates,
            source_lines=source_lines,
            reminder_days_list=reminder_days_list,
        )
        service = GoogleCalendarService()
        created_events = service.create_delivery_events(deliveries)
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "deliveries": deliveries,
                "error": None,
                "success": f"Se crearon {len(created_events)} eventos en Google Calendar.",
                "raw_payload": json.dumps([item.to_dict() for item in deliveries], ensure_ascii=False),
                "default_reminder_days": 5,
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "deliveries": [],
                "error": str(exc),
                "success": None,
                "raw_payload": "[]",
                "default_reminder_days": 5,
            },
            status_code=400,
        )


def _apply_reminder_days(item: DeliveryItem, reminder_days: int) -> DeliveryItem:
    due_date = datetime.fromisoformat(item.due_date_iso).date()
    item.reminder_days = reminder_days
    item.reminder_date_iso = (due_date - timedelta(days=reminder_days)).isoformat()
    return item


def _build_deliveries_from_form(
    subjects: list[str],
    titles: list[str],
    due_dates: list[str],
    source_lines: list[str],
    reminder_days_list: list[int],
) -> list[DeliveryItem]:
    if not (
        len(subjects)
        == len(titles)
        == len(due_dates)
        == len(source_lines)
        == len(reminder_days_list)
    ):
        raise ValueError("Los datos del formulario no coinciden entre actividades.")

    deliveries: list[DeliveryItem] = []
    for subject, title, due_date, source_line, reminder_days in zip(
        subjects,
        titles,
        due_dates,
        source_lines,
        reminder_days_list,
    ):
        item = DeliveryItem(
            subject=subject,
            title=title,
            due_date_iso=due_date,
            reminder_date_iso=due_date,
            source_line=source_line,
            reminder_days=max(0, reminder_days),
        )
        deliveries.append(_apply_reminder_days(item, item.reminder_days))

    return deliveries
