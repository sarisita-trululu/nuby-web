# Web profesional Nuby Arango Perez

Repositorio full stack para la pagina publica y el panel privado de Nuby Arango Perez.

## Estructura

- `app/`, `alembic/`, `requirements.txt`, `run.py`: backend FastAPI
- `frontend/`: frontend Next.js
- `uploads/`: archivos locales en desarrollo

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, JWT, PostgreSQL/SQLite
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Zustand, React Hook Form
- Despliegue recomendado: Railway

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
CORS_ORIGINS=https://nuby-web-wqdz.vercel.app,http://localhost:3000
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

Produccion en Vercel:

```env
NEXT_PUBLIC_API_URL=https://URL_REAL_DEL_BACKEND
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Preparado para Git

El proyecto ya incluye exclusiones importantes en `.gitignore`:

- `.env`, `.env.*`
- `.venv/`
- `node_modules/`
- `.next/`
- bases SQLite locales
- logs y errores
- `.railway/` y `.vercel/`
- `uploads/` locales

Comandos para subir a GitHub:

```bash
git init
git add .
git commit -m "Initial full stack website for Nuby Arango Perez"
git branch -M main
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

## Despliegue en Railway

La forma recomendada para este repositorio es crear **un solo proyecto Railway** con:

1. Un servicio `backend`
2. Un servicio `frontend`
3. Una base de datos PostgreSQL
4. Un volumen para los uploads del backend

### Servicio backend

Usa la raiz del repositorio:

- Root Directory: `/`
- Config as Code: `/railway.json`

El archivo `railway.json` ya esta preparado para:

- instalar con Nixpacks
- correr migraciones antes de iniciar
- levantar FastAPI
- exponer `GET /health` como healthcheck

Variables recomendadas del backend en Railway:

```env
SECRET_KEY=una-clave-larga-y-segura
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGINS=https://nuby-web-wqdz.vercel.app,http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=720
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE_MB=5
```

Ademas:

- agrega un volumen al backend
- monta el volumen en `/data`

Esto evita que las fotos subidas desde el panel admin se pierdan entre despliegues.

### Servicio frontend

Usa la carpeta del frontend:

- Root Directory: `/frontend`
- Config as Code: `/frontend/railway.json`

El frontend ya esta preparado para Railway con:

- `output: "standalone"` en Next.js
- `npm run start` sirviendo `.next/standalone/server.js`
- `frontend/railway.json` con comando de inicio y healthcheck

Variables recomendadas del frontend en Railway:

```env
NEXT_PUBLIC_API_URL=https://TU_BACKEND.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

### Base de datos

- Agrega PostgreSQL desde Railway
- conecta `DATABASE_URL` al servicio backend usando una reference variable

### Dominios

Despues de desplegar:

1. Genera dominio publico para backend
2. Genera dominio publico para frontend
3. Actualiza `NEXT_PUBLIC_API_URL` en Vercel con el dominio real del backend
4. Actualiza `CORS_ORIGINS` en Railway con `https://nuby-web-wqdz.vercel.app,http://localhost:3000`
5. Redeploy de ambos servicios

## Comprobaciones despues del despliegue

Verifica:

- frontend abre correctamente
- backend responde en `/health`
- formulario de contacto envia a `${NEXT_PUBLIC_API_URL}/api/contact`
- login admin funciona
- crear experiencia funciona
- subir imagen funciona
- las imagenes de `/uploads` son accesibles
- formulario de contacto llega al panel

## Notas importantes

- Cambia las credenciales iniciales del admin antes de produccion.
- Si vas a usar uploads en produccion, no dejes `UPLOAD_DIR=uploads`; usa un volumen.
- El frontend y el backend pueden desplegarse desde el mismo repositorio sin cambiar rutas publicas.
- El panel admin sigue protegido; la pagina publica no requiere login.
