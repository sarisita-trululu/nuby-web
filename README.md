# Web profesional Nuby Arango Pérez

Repositorio full stack para la página pública y el panel privado de Nuby Arango Pérez.

## Arquitectura final

- `frontend/`: Next.js App Router, desplegado en Vercel
- `app/`, `alembic/`, `requirements.txt`: FastAPI, desplegado en Vercel como Python Function
- Base de datos: PostgreSQL administrado, recomendado Vercel Postgres
- Archivos subidos: Vercel Blob en producción

## Qué cambió en la migración

- El frontend ya no depende de Railway.
- El backend queda preparado para Vercel con entrada ASGI en [C:\New project\app\index.py](C:\New project\app\index.py).
- Las migraciones de Alembic se ejecutan en build del backend mediante [C:\New project\tools\vercel_build.py](C:\New project\tools\vercel_build.py).
- La subida de imágenes deja de depender del disco local en producción y usa Vercel Blob.
- Se eliminaron los archivos de configuración de Railway del flujo activo.

## Desarrollo local

### Backend

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python -m app.seed --admin-email admin@nubyarango.com --admin-password ChangeMe123!
python run.py
```

Backend local:

- API: [http://localhost:8000](http://localhost:8000)
- Healthcheck: [http://localhost:8000/health](http://localhost:8000/health)

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend local:

- Sitio: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Variables de entorno

### Backend local (`.env`)

```env
PORT=8000
HOST=0.0.0.0
SECRET_KEY=change-this-secret-key-in-production
DATABASE_URL=sqlite:///./nuby.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ACCESS_TOKEN_EXPIRE_MINUTES=720
UPLOAD_DIR=uploads
STORAGE_BACKEND=local
BLOB_UPLOAD_PREFIX=uploads
MAX_UPLOAD_SIZE_MB=5
ADMIN_NAME=Nuby Arango Pérez
ADMIN_EMAIL=admin@nubyarango.com
ADMIN_PASSWORD=ChangeMe123!
```

### Backend en Vercel

Configura estas variables en el proyecto backend:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=una-clave-larga-y-segura
CORS_ORIGINS=https://nubypsicologa.com,https://www.nubypsicologa.com,https://TU-FRONTEND.vercel.app,http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=720
STORAGE_BACKEND=vercel_blob
BLOB_UPLOAD_PREFIX=uploads
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
MAX_UPLOAD_SIZE_MB=5
```

Notas:

- `DATABASE_URL`: usa Vercel Postgres o cualquier PostgreSQL administrado.
- `BLOB_READ_WRITE_TOKEN`: necesario para que el panel admin pueda subir imágenes en producción.
- No uses SQLite en Vercel; el filesystem es efímero.

### Frontend en Vercel

Configura estas variables en el proyecto frontend:

```env
NEXT_PUBLIC_API_URL=https://TU-BACKEND.vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Despliegue en Vercel

### Proyecto 1: backend FastAPI

- Root Directory: `/`
- Framework Preset: `Other`
- Install Command: `pip install -r requirements.txt`
- Build Command: automático vía [C:\New project\pyproject.toml](C:\New project\pyproject.toml)
- Runtime: Python

Vercel detecta [C:\New project\app\index.py](C:\New project\app\index.py) como entrada ASGI.

### Proyecto 2: frontend Next.js

- Root Directory: `frontend`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: vacío

## Rutas que deben funcionar

### Públicas

- `/`
- `/services`
- `/experiences`
- `/blog`
- `/contact`

### Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/psicosendero`
- `/admin/blog`
- `/admin/servicios`
- `/admin/configuracion`
- `/admin/mensajes`

### API backend

- `/health`
- `/api/auth/login`
- `/api/contact`
- `/api/admin/*`

## Validaciones recomendadas después del deploy

- `GET /health` responde `200`
- la home carga sin depender de `localhost`
- `/admin/login` inicia sesión y redirige a `/admin/dashboard`
- crear experiencia funciona
- subir imagen desde admin funciona y devuelve URL de Vercel Blob
- editar blog, servicios, textos y mensajes funciona

## Limitación importante

La única parte que no se puede dejar en Vercel con el diseño anterior es el almacenamiento local de archivos. Vercel no garantiza persistencia en disco entre invocaciones. Por eso la migración mueve uploads a Vercel Blob y la base de datos a PostgreSQL administrado.

## Git

El proyecto ya excluye en `.gitignore`:

- `.env`, `.env.*`
- `.venv/`
- `node_modules/`
- `.next/`
- bases SQLite locales
- logs y errores
- `uploads/` locales
