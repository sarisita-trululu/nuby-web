from __future__ import annotations

import json
import os
from datetime import datetime, time, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from .models import DeliveryItem

SCOPES = ["https://www.googleapis.com/auth/calendar"]


class GoogleCalendarService:
    def __init__(
        self,
        credentials_path: str = "credentials.json",
        token_path: str = "token.json",
        calendar_id: str = "primary",
    ) -> None:
        self.credentials_path = Path(os.getenv("GOOGLE_CREDENTIALS_PATH", credentials_path))
        self.token_path = Path(os.getenv("GOOGLE_TOKEN_PATH", token_path))
        self.calendar_id = os.getenv("GOOGLE_CALENDAR_ID", calendar_id)

    def create_delivery_events(self, deliveries: list[DeliveryItem]) -> list[dict]:
        service = self._build_service()
        created_events: list[dict] = []

        for item in deliveries:
            created_events.append(self._create_due_event(service, item))
            created_events.append(self._create_prep_event(service, item))

        return created_events

    def _build_service(self):
        service_account_creds = self._load_service_account_credentials()
        if service_account_creds:
            return build("calendar", "v3", credentials=service_account_creds)

        creds = None
        if self.token_path.exists():
            creds = Credentials.from_authorized_user_file(str(self.token_path), SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not self.credentials_path.exists():
                    raise FileNotFoundError(
                        "No se encontro credentials.json en la raiz del proyecto."
                    )
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.credentials_path),
                    SCOPES,
                )
                creds = flow.run_local_server(port=0)

            self.token_path.write_text(creds.to_json(), encoding="utf-8")

        return build("calendar", "v3", credentials=creds)

    def _load_service_account_credentials(self):
        raw_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
        if raw_json:
            info = json.loads(raw_json)
            return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)

        service_account_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
        if service_account_path and Path(service_account_path).exists():
            return service_account.Credentials.from_service_account_file(
                service_account_path,
                scopes=SCOPES,
            )

        return None

    def _create_due_event(self, service, item: DeliveryItem) -> dict:
        due_date = datetime.fromisoformat(item.due_date_iso).date()
        event = {
            "summary": f"{item.subject} - {item.category.title()} - {item.title}",
            "description": (
                f"Materia: {item.subject}\n"
                f"Categoria: {item.category}\n"
                f"Tarea detectada automaticamente.\n\n"
                f"Texto original: {item.source_line}"
            ),
            "start": {"date": due_date.isoformat()},
            "end": {"date": (due_date + timedelta(days=1)).isoformat()},
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 60 * 24 * item.reminder_days},
                ],
            },
        }
        return service.events().insert(calendarId=self.calendar_id, body=event).execute()

    def _create_prep_event(self, service, item: DeliveryItem) -> dict:
        prep_dt = datetime.combine(datetime.fromisoformat(item.reminder_date_iso).date(), time(9, 0))
        event = {
            "summary": f"Preparar {item.subject} - {item.category.title()} - {item.title}",
            "description": (
                f"Materia: {item.subject}\n"
                f"Categoria: {item.category}\n"
                f"Recordatorio automatico {item.reminder_days} dias antes de la entrega.\n"
                f"Entrega final: {item.due_date_iso}"
            ),
            "start": {"dateTime": prep_dt.isoformat(), "timeZone": "America/Bogota"},
            "end": {"dateTime": prep_dt.replace(hour=10).isoformat(), "timeZone": "America/Bogota"},
            "reminders": {"useDefault": True},
        }
        return service.events().insert(calendarId=self.calendar_id, body=event).execute()
