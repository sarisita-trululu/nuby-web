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

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Inicio en produccion

```bash
npm run start
```

Este proyecto ya esta configurado para Railway con salida `standalone`.

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Variables necesarias:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

Produccion en Vercel:

```env
NEXT_PUBLIC_API_URL=https://URL_REAL_DEL_BACKEND
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Conexion con backend

- El frontend consume el backend FastAPI del mismo repositorio.
- Todas las llamadas del formulario de contacto, login admin y panel usan `NEXT_PUBLIC_API_URL`.
- En produccion no se usa `localhost`; si falta `NEXT_PUBLIC_API_URL`, las acciones del backend fallaran hasta configurarla.
- El panel admin usa JWT y envia `Authorization: Bearer <token>`.
- La subida de imágenes usa `POST /api/admin/uploads`.

## Railway

Para desplegar este frontend dentro de Railway:

- Root Directory: `/frontend`
- Config as Code: `/frontend/railway.json`

Variable minima:

```env
NEXT_PUBLIC_API_URL=https://TU_BACKEND.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=573012799371
```

## Nota

La guia completa del proyecto full stack y del despliegue conjunto esta en el README raiz del repositorio.
