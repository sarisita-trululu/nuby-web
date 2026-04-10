from __future__ import annotations
import secrets
from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from .auth import AuthService
from .document_parser import analyze_document as analyze_uploaded_document
from .local_calendar import LocalCalendarService
from .models import DeliveryItem

app = FastAPI(title="Organizador de Entregas")
app.add_middleware(SessionMiddleware, secret_key="calendario-academico-seguro")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
GUEST_PREFIX = "__guest__:"


def _current_user(request: Request) -> str | None:
    user = request.session.get("user")
    return str(user) if user else None


def _session_owner(request: Request, create_if_missing: bool = True) -> str | None:
    current_user = _current_user(request)
    if current_user:
        return current_user

    guest_user = request.session.get("guest_user")
    if guest_user:
        return str(guest_user)

    if not create_if_missing:
        return None

    guest_user = f"{GUEST_PREFIX}{secrets.token_hex(8)}"
    request.session["guest_user"] = guest_user
    return guest_user


def _display_user_label(request: Request) -> str:
    current_user = _current_user(request)
    if current_user:
        return current_user
    return "Invitado"


def _base_context(request: Request, year: int | None = None, month: int | None = None) -> dict:
    today = date.today()
    year = year or today.year
    month = month or today.month
    current_user = _current_user(request)
    session_owner = _session_owner(request)
    calendar_data = LocalCalendarService().get_month_view(session_owner or "__guest__", year, month)
    return {
        "request": request,
        "current_user": current_user,
        "user_label": _display_user_label(request),
        "is_authenticated": bool(current_user),
        "is_guest": not bool(current_user),
        "error": None,
        "success": None,
        "analysis_count": 0,
        "analysis_month_label": None,
        "default_reminder_days": 5,
        "calendar_data": calendar_data,
    }


@app.get("/", response_class=HTMLResponse)
async def index(request: Request, year: int | None = None, month: int | None = None):
    _session_owner(request)
    return templates.TemplateResponse("index.html", _base_context(request, year=year, month=month))


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze", response_class=HTMLResponse)
async def analyze_document(
    request: Request,
    file: UploadFile = File(...),
    reminder_days: int = Form(5),
):
    current_owner = _session_owner(request)
    try:
        content = await file.read()
        reminder_days = max(0, reminder_days)
        deliveries = analyze_uploaded_document(
            file.filename,
            content,
            today=date.today(),
            reminder_days=reminder_days,
        )
        if not deliveries:
            return templates.TemplateResponse(
                "index.html",
                {
                    **_base_context(request),
                    "success": "No se detectaron items con fecha clara para ubicar en el calendario.",
                    "default_reminder_days": reminder_days,
                },
            )

        created_events = LocalCalendarService().add_delivery_items(current_owner, deliveries)
        focus_year, focus_month = _calendar_focus_from_deliveries(deliveries)
        success = (
            f"Se detectaron {len(deliveries)} items y se ubicaron en {month_name_es(focus_month)} {focus_year}."
            if created_events
            else f"Se detectaron {len(deliveries)} items, pero ya estaban ubicados en tu calendario."
        )
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request, year=focus_year, month=focus_month),
                "success": success,
                "analysis_count": len(deliveries),
                "analysis_month_label": f"{month_name_es(focus_month)} {focus_year}",
                "default_reminder_days": reminder_days,
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request),
                "error": str(exc),
                "default_reminder_days": reminder_days,
            },
            status_code=400,
        )


@app.post("/sync", response_class=HTMLResponse)
async def sync_calendar(
    request: Request,
    subjects: Annotated[list[str], Form(...)],
    categories: Annotated[list[str], Form(...)],
    titles: Annotated[list[str], Form(...)],
    due_dates: Annotated[list[str], Form(...)],
    source_lines: Annotated[list[str], Form(...)],
    reminder_days_list: Annotated[list[int], Form(...)],
):
    current_user = _session_owner(request)
    try:
        deliveries = _build_deliveries_from_form(
            subjects=subjects,
            categories=categories,
            titles=titles,
            due_dates=due_dates,
            source_lines=source_lines,
            reminder_days_list=reminder_days_list,
        )
        created_events = LocalCalendarService().add_delivery_items(current_user, deliveries)
        focus_year, focus_month = _calendar_focus_from_deliveries(deliveries)
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request, year=focus_year, month=focus_month),
                "success": f"Se agregaron {created_events} eventos a tu calendario propio.",
                "analysis_count": len(deliveries),
                "analysis_month_label": f"{month_name_es(focus_month)} {focus_year}",
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request),
                "error": str(exc),
            },
            status_code=400,
        )


@app.post("/calendar/clear", response_class=HTMLResponse)
async def clear_local_calendar(request: Request):
    current_user = _session_owner(request)
    LocalCalendarService().clear_all(current_user)
    return templates.TemplateResponse(
        "index.html",
        {
            **_base_context(request),
            "success": "Se limpiaron todos los eventos del calendario propio.",
        },
    )


@app.post("/calendar/add", response_class=HTMLResponse)
async def add_manual_calendar_event(
    request: Request,
    event_date_iso: str = Form(...),
    title: str = Form(...),
    subject: str = Form("General"),
    category: str = Form("actividad"),
    event_type: str = Form("Entrega"),
):
    current_user = _session_owner(request)

    try:
        LocalCalendarService().add_manual_event(
            owner=current_user,
            event_date_iso=event_date_iso,
            title=title,
            subject=subject,
            category=category,
            event_type=event_type,
        )
        year, month = _year_month_from_iso(event_date_iso)
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request, year=year, month=month),
                "success": "Evento agregado al calendario.",
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request),
                "error": str(exc),
            },
            status_code=400,
        )


@app.post("/calendar/update", response_class=HTMLResponse)
async def update_calendar_event(
    request: Request,
    event_id: str = Form(...),
    event_date_iso: str = Form(...),
    title: str = Form(...),
    subject: str = Form(...),
    category: str = Form(...),
    event_type: str = Form(...),
):
    current_user = _session_owner(request)

    try:
        LocalCalendarService().update_event(
            owner=current_user,
            event_id=event_id,
            event_date_iso=event_date_iso,
            title=title,
            subject=subject,
            category=category,
            event_type=event_type,
        )
        year, month = _year_month_from_iso(event_date_iso)
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request, year=year, month=month),
                "success": "Evento actualizado.",
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request),
                "error": str(exc),
            },
            status_code=400,
        )


@app.post("/calendar/delete", response_class=HTMLResponse)
async def delete_calendar_event(
    request: Request,
    event_id: str = Form(...),
    event_date_iso: str = Form(...),
):
    current_user = _session_owner(request)

    LocalCalendarService().delete_event(current_user, event_id)
    year, month = _year_month_from_iso(event_date_iso)
    return templates.TemplateResponse(
        "index.html",
        {
            **_base_context(request, year=year, month=month),
            "success": "Evento eliminado.",
        },
    )


@app.post("/register", response_class=HTMLResponse)
async def register(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    try:
        AuthService().register_user(username, password)
        request.session["user"] = username.strip().lower()
        return templates.TemplateResponse(
            "index.html",
            {
                **_base_context(request),
                "success": "Cuenta creada correctamente.",
            },
        )
    except Exception as exc:
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "error": str(exc),
                "success": None,
            },
            status_code=400,
        )


@app.post("/login", response_class=HTMLResponse)
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    if not AuthService().authenticate(username, password):
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "error": "Usuario o contraseña incorrectos.",
                "success": None,
            },
            status_code=401,
        )

    request.session["user"] = username.strip().lower()
    return templates.TemplateResponse(
        "index.html",
        {
            **_base_context(request),
            "success": "Sesion iniciada correctamente.",
        },
    )


@app.post("/logout", response_class=HTMLResponse)
async def logout(request: Request):
    request.session.clear()
    _session_owner(request)
    return templates.TemplateResponse(
        "index.html",
        {
            **_base_context(request),
            "success": "Se reinicio tu espacio abierto.",
        },
    )


def _apply_reminder_days(item: DeliveryItem, reminder_days: int) -> DeliveryItem:
    due_date = datetime.fromisoformat(item.due_date_iso).date()
    item.reminder_days = reminder_days
    item.reminder_date_iso = (due_date - timedelta(days=reminder_days)).isoformat()
    return item


def _build_deliveries_from_form(
    subjects: list[str],
    categories: list[str],
    titles: list[str],
    due_dates: list[str],
    source_lines: list[str],
    reminder_days_list: list[int],
) -> list[DeliveryItem]:
    if not (
        len(subjects)
        == len(categories)
        == len(titles)
        == len(due_dates)
        == len(source_lines)
        == len(reminder_days_list)
    ):
        raise ValueError("Los datos del formulario no coinciden entre actividades.")

    deliveries: list[DeliveryItem] = []
    for subject, category, title, due_date, source_line, reminder_days in zip(
        subjects,
        categories,
        titles,
        due_dates,
        source_lines,
        reminder_days_list,
    ):
        item = DeliveryItem(
            subject=subject,
            category=category,
            title=title,
            due_date_iso=due_date,
            reminder_date_iso=due_date,
            source_line=source_line,
            reminder_days=max(0, reminder_days),
        )
        deliveries.append(_apply_reminder_days(item, item.reminder_days))

    return deliveries


def _year_month_from_iso(date_iso: str) -> tuple[int, int]:
    parsed = datetime.fromisoformat(date_iso).date()
    return parsed.year, parsed.month


def _calendar_focus_from_deliveries(deliveries: list[DeliveryItem]) -> tuple[int, int]:
    first_due = min(datetime.fromisoformat(item.due_date_iso).date() for item in deliveries)
    return first_due.year, first_due.month


def month_name_es(month: int) -> str:
    names = {
        1: "enero",
        2: "febrero",
        3: "marzo",
        4: "abril",
        5: "mayo",
        6: "junio",
        7: "julio",
        8: "agosto",
        9: "septiembre",
        10: "octubre",
        11: "noviembre",
        12: "diciembre",
    }
    return names.get(month, "")
