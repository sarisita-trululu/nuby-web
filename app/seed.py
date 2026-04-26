import argparse
import os

from sqlalchemy import select

from app.core.security import get_password_hash
from app.database.session import SessionLocal, initialize_directories
from app.models.service import Service
from app.models.user import User


DEFAULT_SERVICES = [
    {
        "title": "Terapia online",
        "description": "Atención psicológica virtual, segura y confidencial.",
        "items": [
            "Sesiones virtuales personalizadas",
            "Acompañamiento flexible desde cualquier lugar",
            "Proceso terapéutico seguro y confidencial",
        ],
        "icon": "video",
    },
    {
        "title": "Terapia individual",
        "description": (
            "Acompañamiento clínico para trabajar estrés y ansiedad, depresión, duelos y pérdidas, "
            "autoconocimiento, gestión emocional y desarrollo personal."
        ),
        "items": [
            "Estrés y ansiedad",
            "Depresión",
            "Duelos y pérdidas",
            "Autoconocimiento",
            "Gestión emocional",
            "Desarrollo personal",
        ],
        "icon": "user",
    },
    {
        "title": "Terapia de pareja",
        "description": (
            "Espacio terapéutico para fortalecer la comunicación, reconstruir acuerdos y recuperar la confianza."
        ),
        "items": [
            "Comunicación asertiva",
            "Reestructuración de acuerdos",
            "Construcción de proyectos conjuntos",
            "Recuperación de confianza",
        ],
        "icon": "heart",
    },
    {
        "title": "Formación y capacitación",
        "description": "Programas formativos para equipos y organizaciones enfocados en el desarrollo humano.",
        "items": [
            "Inteligencia emocional en el trabajo",
            "Resolución de conflictos",
            "Comunicación organizacional",
            "Liderazgo humanizado",
            "Bienestar y autocuidado laboral",
        ],
        "icon": "graduation-cap",
    },
    {
        "title": "Cultura organizacional y clima laboral",
        "description": "Procesos para diagnosticar, fortalecer y transformar la experiencia de los equipos.",
        "items": [
            "Diagnóstico de clima laboral",
            "Integración de equipos",
            "Sentido de pertenencia",
        ],
        "icon": "building",
    },
    {
        "title": "Bienestar laboral y salud mental en empresas",
        "description": "Estrategias para promover salud mental, prevención e intervención psicosocial en organizaciones.",
        "items": [
            "Evaluación de riesgos psicosociales",
            "Programas de bienestar emocional",
            "Intervenciones de apoyo",
        ],
        "icon": "briefcase",
    },
    {
        "title": "Acompañamiento preventivo y de bienestar",
        "description": "Acciones preventivas para fortalecer hábitos saludables y reducir factores de riesgo emocional.",
        "items": [
            "Estilos de vida sanos",
            "Manejo del estrés",
            "Prevención de problemáticas emocionales",
        ],
        "icon": "leaf",
    },
]


def upsert_admin(db, name: str, email: str, password: str) -> str:
    normalized_email = email.strip().lower()
    user = db.scalar(select(User).where(User.email == normalized_email))
    password_hash = get_password_hash(password)

    if user is None:
        db.add(
            User(
                name=name.strip(),
                email=normalized_email,
                password_hash=password_hash,
                role="admin",
                is_active=True,
            )
        )
        return f"Admin creado: {normalized_email}"

    user.name = name.strip()
    user.password_hash = password_hash
    user.role = "admin"
    user.is_active = True
    return f"Admin actualizado: {normalized_email}"


def upsert_services(db) -> str:
    created = 0
    updated = 0
    for index, service_data in enumerate(DEFAULT_SERVICES, start=1):
        existing = db.scalar(select(Service).where(Service.title == service_data["title"]))
        payload = {
            **service_data,
            "order": index,
            "is_active": True,
        }
        if existing is None:
            db.add(Service(**payload))
            created += 1
            continue

        for field, value in payload.items():
            setattr(existing, field, value)
        updated += 1

    return f"Servicios creados: {created}, actualizados: {updated}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed inicial para el backend de Nuby Arango Pérez.")
    parser.add_argument("--admin-name", default=os.getenv("ADMIN_NAME", "Nuby Arango Pérez"))
    parser.add_argument("--admin-email", default=os.getenv("ADMIN_EMAIL"))
    parser.add_argument("--admin-password", default=os.getenv("ADMIN_PASSWORD"))
    parser.add_argument("--skip-admin", action="store_true", help="Omite la creación o actualización del admin.")
    args = parser.parse_args()

    if not args.skip_admin and (not args.admin_email or not args.admin_password):
        parser.error("Debes indicar --admin-email y --admin-password, o definir ADMIN_EMAIL y ADMIN_PASSWORD.")

    initialize_directories()

    with SessionLocal() as db:
        results = [upsert_services(db)]
        if not args.skip_admin:
            results.append(upsert_admin(db, args.admin_name, args.admin_email, args.admin_password))
        db.commit()

    for line in results:
        print(line)


if __name__ == "__main__":
    main()
