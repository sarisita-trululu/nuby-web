from __future__ import annotations

import json
from datetime import date, datetime, timedelta

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
            "reminder_days": 5,
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
        deliveries = parse_deliveries(text, today=date.today(), reminder_days=reminder_days)
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
                "reminder_days": reminder_days,
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
                "reminder_days": reminder_days,
            },
            status_code=400,
        )


@app.post("/sync", response_class=HTMLResponse)
async def sync_calendar(
    request: Request,
    payload: str = Form(...),
    reminder_days: int = Form(5),
):
    try:
        raw_items = json.loads(payload)
        reminder_days = max(0, reminder_days)
        deliveries = [_apply_reminder_days(DeliveryItem(**item), reminder_days) for item in raw_items]
        service = GoogleCalendarService()
        created_events = service.create_delivery_events(deliveries)
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "deliveries": deliveries,
                "error": None,
                "success": f"Se crearon {len(created_events)} eventos en Google Calendar.",
                "raw_payload": payload,
                "reminder_days": reminder_days,
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
                "raw_payload": payload,
                "reminder_days": reminder_days,
            },
            status_code=400,
        )


def _apply_reminder_days(item: DeliveryItem, reminder_days: int) -> DeliveryItem:
    due_date = datetime.fromisoformat(item.due_date_iso).date()
    item.reminder_days = reminder_days
    item.reminder_date_iso = (due_date - timedelta(days=reminder_days)).isoformat()
    return item
