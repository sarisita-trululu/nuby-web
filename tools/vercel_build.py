"""Build del backend en Vercel.

1. Verifica las variables obligatorias.
2. Ejecuta las migraciones de Alembic (idempotentes: solo aplica las pendientes).
   La migración 20260426_000002 crea el administrador original (admin@nubyarango.com)
   con su hash de contraseña original si no existe; nunca crea duplicados.
3. Crea los 7 servicios por defecto solo si la tabla está vacía.

Este script NUNCA restablece la contraseña del administrador. Para hacerlo a propósito
hay que ejecutar `python -m app.seed --admin-email ... --admin-password ...` a mano,
con autorización explícita.
"""

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

    if not os.getenv("DATABASE_URL"):
        print("DATABASE_URL no definida: se omiten migraciones y datos iniciales.")
        return

    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
    subprocess.run(
        [sys.executable, "-m", "app.seed", "--skip-admin", "--services-if-empty"],
        check=True,
    )


if __name__ == "__main__":
    main()
