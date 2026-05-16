# Frontend Nuby Arango Pérez

Frontend en Next.js para la página pública y el panel privado de administración.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zustand
- Framer Motion

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Producción local

```bash
npm run start
```

## Variables de entorno

### Vercel / producción

Usa `frontend/.env.example` como referencia:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-BACKEND.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

### Desarrollo local

Usa `frontend/.env.local.example` como referencia:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Conexión con backend

- El frontend consume el backend FastAPI del mismo repositorio, desplegado en Railway.
- Todas las llamadas del formulario de contacto, login admin y panel usan `NEXT_PUBLIC_API_URL`.
- En producción no se usa `localhost`.
- El panel admin usa JWT y envía `Authorization: Bearer <token>`.
- La subida de imágenes usa `POST /api/admin/uploads`.

## Despliegue en Vercel

Configura el proyecto así:

- Framework Preset: `Next.js`
- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: dejar vacío

Variables necesarias en Vercel:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-BACKEND.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Rutas clave

- Sitio: `/`
- Admin login: `/admin/login`
- Dashboard: `/admin/dashboard`

## Nota

La guía full stack y la configuración del backend en Railway están en el README raíz.
