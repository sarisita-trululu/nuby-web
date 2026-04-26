"""Reset production admin password and permissions."""

from datetime import datetime, timezone

from alembic import op
import sqlalchemy as sa


revision = "20260426_000002"
down_revision = "20260425_000001"
branch_labels = None
depends_on = None

ADMIN_EMAIL = "admin@nubyarango.com"
ADMIN_NAME = "Nuby Arango Pérez"
ADMIN_PASSWORD_HASH = "$2b$12$3C5W/y2qDnnnSYXgeDrBouYA6dJUX8RAyHVerPQtYyK.e4fjFj6Lm"


def upgrade() -> None:
    bind = op.get_bind()
    now = datetime.now(timezone.utc)

    users = sa.table(
        "users",
        sa.column("id", sa.Integer()),
        sa.column("name", sa.String(length=120)),
        sa.column("email", sa.String(length=255)),
        sa.column("password_hash", sa.String(length=255)),
        sa.column("role", sa.String(length=50)),
        sa.column("is_active", sa.Boolean()),
        sa.column("created_at", sa.DateTime(timezone=True)),
        sa.column("updated_at", sa.DateTime(timezone=True)),
    )

    existing_admin = bind.execute(
        sa.select(users.c.id).where(sa.func.lower(users.c.email) == ADMIN_EMAIL.lower())
    ).first()

    values = {
        "name": ADMIN_NAME,
        "password_hash": ADMIN_PASSWORD_HASH,
        "role": "admin",
        "is_active": True,
        "updated_at": now,
    }

    if existing_admin:
        bind.execute(sa.update(users).where(users.c.id == existing_admin.id).values(**values))
        return

    bind.execute(
        sa.insert(users).values(
            email=ADMIN_EMAIL,
            created_at=now,
            **values,
        )
    )


def downgrade() -> None:
    # Password resets are intentionally not reverted automatically.
    pass
