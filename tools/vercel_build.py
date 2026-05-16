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


if __name__ == "__main__":
    main()
