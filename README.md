# Web profesional Nuby Arango Pérez

Repositorio full stack para la página pública y el panel privado de Nuby Arango Pérez.

## Estructura

- `app/`, `alembic/`, `requirements.txt`, `run.py`: backend FastAPI
- `frontend/`: frontend Next.js
- `uploads/`: archivos locales en desarrollo

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, JWT, PostgreSQL/SQLite
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Zustand, React Hook Form
- Despliegue objetivo:
  - Frontend en Vercel
  - Backend en Railway

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

### Backend (`.env`)

Variables base:

```env
PORT=8000
HOST=0.0.0.0
SECRET_KEY=change-this-secret-key-in-production
DATABASE_URL=sqlite:///./nuby.db
CORS_ORIGINS=https://nuby-web-wqdz.vercel.app,https://nubypsicologa.com,https://www.nubypsicologa.com,http://localhost:3000,http://127.0.0.1:3000
ACCESS_TOKEN_EXPIRE_MINUTES=720
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=5
ADMIN_NAME=Nuby Arango Perez
ADMIN_EMAIL=admin@nubyarango.com
ADMIN_PASSWORD=ChangeMe123!
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

### Frontend en Vercel

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-BACKEND.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Despliegue

### Backend en Railway

- Root Directory: `/`
- Config as Code: `/railway.json`

Variables recomendadas:

```env
SECRET_KEY=una-clave-larga-y-segura
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGINS=https://nuby-web-wqdz.vercel.app,https://nubypsicologa.com,https://www.nubypsicologa.com,http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=720
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE_MB=5
```

El backend expone `GET /health` para healthcheck.

### Frontend en Vercel

Configura el proyecto así:

- Framework Preset: `Next.js`
- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: vacío

Variables requeridas:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-BACKEND.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Comprobaciones

Verifica:

- frontend abre correctamente
- backend responde en `/health`
- formulario de contacto envía a `${NEXT_PUBLIC_API_URL}/api/contact`
- login admin funciona
- crear experiencia funciona
- subir imagen funciona
- las imágenes de `/uploads` son accesibles

## Git

El proyecto ya incluye exclusiones importantes en `.gitignore`:

- `.env`, `.env.*`
- `.venv/`
- `node_modules/`
- `.next/`
- bases SQLite locales
- logs y errores
- `.railway/` y `.vercel/`
- `uploads/` locales
