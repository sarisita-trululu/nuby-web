from __future__ import annotations

import os
import subprocess
import sys


REQUIRED_VERCEL_ENV_VARS = ("DATABASE_URL", "SECRET_KEY")


def main() -> None:
    if os.getenv("VERCEL"):
        missing = [name for name in REQUIRED_VERCEL_ENV_VARS if not os.getenv(name)]
        if missing:
            formatted = ", ".join(missing)
            raise SystemExit(
                f"Faltan variables obligatorias para desplegar el backend en Vercel: {formatted}",
            )

    if os.getenv("DATABASE_URL"):
        subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            check=True,
        )

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME")

    if admin_email and admin_password:
        command = [
            sys.executable,
            "-m",
            "app.seed",
            "--admin-email",
            admin_email,
            "--admin-password",
            admin_password,
        ]
        if admin_name:
            command.extend(["--admin-name", admin_name])
        subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
