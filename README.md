# Web profesional Nuby Arango Pérez

Sitio público y panel privado (`/admin`) de **nubypsicologa.com**.

## Arquitectura

| Parte | Tecnología | Dónde se ejecuta |
|---|---|---|
| Frontend + panel (`frontend/`) | Next.js 15, React 19, TypeScript, Tailwind | Vercel, proyecto `nuby-web-wqdz` (dominio `nubypsicologa.com`) |
| API (`app/`, `alembic/`) | FastAPI, SQLAlchemy 2, Alembic, JWT | Vercel Functions (Python), proyecto `nuby-web` (dominio `api.nubypsicologa.com`) |
| Base de datos | PostgreSQL | Neon |
| Imágenes subidas | Vercel Blob (público) | Vercel |

Railway ya no forma parte de la arquitectura.

Más detalle técnico en [`CLAUDE.md`](CLAUDE.md).

## Desarrollo local (macOS)

```bash
# Backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head                      # crea el esquema y el admin original
python -m app.seed --skip-admin           # crea los 7 servicios por defecto
python run.py                             # http://localhost:8000/health

# Frontend (otra terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                               # http://localhost:3000 · panel en /admin/login
```

El administrador que crea la migración es `admin@nubyarango.com` con su contraseña original.
Para entrar en local con otra cuenta de pruebas usa
`python -m app.seed --admin-email TU_CORREO --admin-password 'ClaveLocal123'` (solo en tu base local).

## Despliegue

- Las ramas distintas de `main` generan **Preview Deployments** en Vercel.
- `main` despliega producción. No fusionar sin haber probado el Preview.
- El build del backend (`tools/vercel_build.py`) ejecuta las migraciones pendientes y crea los servicios
  por defecto solo si la tabla está vacía. **Nunca** restablece la contraseña del administrador.

Variables de entorno: ver `.env.example`, `frontend/.env.example` y la sección 6 de `CLAUDE.md`.
