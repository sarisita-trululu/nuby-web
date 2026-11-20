# CLAUDE.md — Nuby Psicóloga (nubypsicologa.com)

Contexto técnico del proyecto para Claude Code. Todo lo que aparece aquí se verificó en el código, en el historial de Git o en el sitio publicado (auditoría del 12 de noviembre de 2026). Lo que no se pudo verificar está marcado como **[PENDIENTE DE VERIFICAR]**.

## 1. Qué es

Sitio profesional de **Nuby Arango Pérez**, psicóloga clínica y organizacional: "Psicología con sentido humano".

- **Sitio público:** inicio, sobre Nuby, servicios, experiencias (PsicoSendero, por ejemplo "El lugar donde todo empezó" en Laguna la Colorada), blog, testimonios, preguntas frecuentes y contacto.
- **Reservas:** por enlaces de WhatsApp con mensaje predefinido (`NEXT_PUBLIC_WHATSAPP_NUMBER`). No hay pagos en línea.
- **Panel privado (`/admin`):** gestiona experiencias, blog, servicios, testimonios, textos del sitio (site settings), mensajes de contacto y subida de imágenes.

## 2. Arquitectura

Es un monorepo con dos aplicaciones que se despliegan por separado:

| Parte | Carpeta | Tecnología |
|---|---|---|
| Frontend | `frontend/` | Next.js 15 (App Router), React 19, TypeScript, Tailwind 3, Zustand, React Hook Form, Axios, Framer Motion |
| Backend (API) | raíz: `app/`, `alembic/`, `requirements.txt` | FastAPI, SQLAlchemy 2, Alembic, Pydantic Settings, JWT (python-jose), bcrypt (passlib) |
| Base de datos | — | PostgreSQL en producción (`psycopg`), SQLite en local |
| Imágenes subidas | — | Vercel Blob en producción (`STORAGE_BACKEND=vercel_blob`), disco local en desarrollo |

El frontend **no tiene datos propios**: todo el contenido dinámico sale de la API (`NEXT_PUBLIC_API_URL`). Cuando la API falla, las páginas públicas no muestran error, sino estados vacíos (`.catch(() => [])`). La experiencia "El lugar donde todo empezó" tiene un respaldo fijo en `frontend/lib/experience-landings.ts`.

### Estructura

```
app/
  main.py            # FastAPI: CORS, /health, routers, montaje de /uploads en local
  index.py           # entrada ASGI para Vercel (también hay index.py en la raíz)
  core/config.py     # Settings (variables de entorno)
  core/security.py   # hash bcrypt + JWT HS256
  api/deps.py        # get_current_user / get_current_admin
  api/routes/        # auth, public, admin_*, uploads
  models/            # user, service, experience, blog, testimonial, contact, site_setting
  schemas/           # modelos Pydantic
  seed.py            # crea/actualiza los 7 servicios por defecto y el admin
alembic/versions/
  20260425_000001_initial.py
  20260426_000002_reset_production_admin_password.py
tools/vercel_build.py  # build del backend en Vercel: migraciones + seed
pyproject.toml         # [tool.vercel.scripts] build = "python tools/vercel_build.py"
frontend/
  app/               # rutas públicas + app/admin/login + app/admin/(protected)/*
  components/        # admin/, public/, ui/
  hooks/             # use-auth-store (Zustand + localStorage), use-admin-guard
  lib/               # api-config, public-api, admin-api, site-content, types
  vercel.json        # framework nextjs
```

**Restos de otro proyecto anterior** (calendario académico "Sara", commits del 8 al 10 de abril de 2026), que no usa la app actual: `templates/`, `static/`, `start_web.bat`, `render.yaml`, `Procfile`. No borrarlos sin autorización.

## 3. Base de datos

Tablas (según la migración inicial):

- `users`: id, name, email (único), password_hash, role (por defecto `admin`), is_active
- `services`: title, description, items (JSON), icon, order, is_active
- `experiences`: title, slug (único), description, date, location, capacity, available_spots, status (`proximamente` | `cupos_abiertos` | `finalizada`), cover_image, gallery_images (JSON), whatsapp_message, is_published
- `blog_posts`: title, slug (único), excerpt, content, category, cover_image, is_published, published_at
- `testimonials`: name, text, service_type, is_visible
- `contact_messages`: full_name, email, phone, reason, message, is_read
- `site_settings`: key (único), value

No hay claves foráneas entre tablas. Las migraciones se ejecutan **en cada build del backend en Vercel** (`tools/vercel_build.py` → `alembic upgrade head`).

Proveedor de PostgreSQL en producción: **[PENDIENTE DE VERIFICAR]**. El README recomienda Vercel Postgres o cualquier PostgreSQL administrado; el valor real está en `DATABASE_URL` del proyecto backend en Vercel.

## 4. Autenticación y permisos

- `POST /api/auth/login` recibe `{email, password}` (Pydantic `EmailStr`, contraseña de 8 a 128 caracteres) y devuelve un JWT HS256 (`sub` = email, `role`, `user_id`) que dura `ACCESS_TOKEN_EXPIRE_MINUTES` (720 min).
- `GET /api/admin/me` y todas las rutas `/api/admin/*` exigen `Authorization: Bearer <token>` y `role == "admin"`.
- Solo existe un rol (`admin`). No hay registro público de usuarios.
- Frontend: el token se guarda en `localStorage` (clave `nuby-admin-auth`). `AdminGuard` llama a `/api/admin/me`. Si falla, borra la sesión y redirige a `/admin/login`. **No hay middleware de Next.js**: la protección ocurre del lado del cliente y la seguridad real está en la API.
- La página de login muestra siempre "Credenciales inválidas o usuario sin acceso." ante **cualquier** error: también cuando la API no responde, hay un error de CORS o falta `NEXT_PUBLIC_API_URL`.
- Correo del admin en producción (según la migración 000002): `admin@nubyarango.com`. La contraseña no está en el repo; solo su hash bcrypt (no coincide con el `ChangeMe123!` de ejemplo).
- Desde la rama `migracion-vercel`, el build ya **no** ejecuta el seed del admin aunque existan `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Restablecer la contraseña solo se hace a mano y con autorización: `python -m app.seed --admin-email admin@nubyarango.com --admin-password '<nueva>'`.

## 5. Rutas

- **Públicas (frontend):** `/`, `/services`, `/experiences`, `/experiences/[slug]` (alias `/experiencias`), `/blog`, `/blog/[slug]`, `/contact`
- **Admin (frontend):** `/admin/login`, `/admin/dashboard`, `/admin/psicosendero` (= experiences), `/admin/blog`, `/admin/servicios` (= services), `/admin/configuracion` (= settings), `/admin/mensajes` (= messages), `/admin/testimonials`
- **API:** `/health`, `/api/services`, `/api/experiences[/{slug}]`, `/api/blog[/{slug}]`, `/api/testimonials`, `/api/site-settings`, `POST /api/contact`, `/api/auth/login`, `/api/admin/me`, CRUD de `/api/admin/{experiences,blog,services,testimonials,contact-messages,site-settings}`, `POST /api/admin/uploads`

## 6. Variables de entorno (solo nombres)

**Backend (proyecto Vercel del backend):**
`DATABASE_URL` (obligatoria), `SECRET_KEY` (obligatoria), `CORS_ORIGINS` (lista separada por comas o JSON), `ACCESS_TOKEN_EXPIRE_MINUTES`, `STORAGE_BACKEND` (`local` | `vercel_blob`), `BLOB_UPLOAD_PREFIX`, `BLOB_READ_WRITE_TOKEN`, `MAX_UPLOAD_SIZE_MB`; opcionales: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Solo en local: `PORT`, `HOST`, `UPLOAD_DIR`, `UVICORN_RELOAD`.

**Frontend (proyecto Vercel del frontend):**
`NEXT_PUBLIC_API_URL` (obligatoria en producción; sin ella falla toda llamada a la API), `NEXT_PUBLIC_WHATSAPP_NUMBER`.

Plantillas: `.env.example` (raíz) y `frontend/.env.example`. Los `.env` están en `.gitignore`. **Nunca subir secretos al repo** (es público).

## 7. Servicios externos

- **GitHub:** `sarisita-trululu/nuby-web` (público), rama única `main`. `sarisita-trululu/Psicologa-nuby` está vacío.
- **Vercel:** cuenta con el equipo `saravalg29-9323s-projects`. Frontend: proyecto `nuby-web-wqdz` (con nubypsicologa.com). Backend: proyecto `nuby-web` (nunca desplegado con éxito). Ver la sección 12.
- **Railway (anterior):** el backend estuvo en `web-production-9b25b.up.railway.app` hasta mayo de 2026. Hoy no responde.
- **Dominio:** `nubypsicologa.com` sirve el frontend Next.js. CORS del backend permite `https://nubypsicologa.com` y `https://www.nubypsicologa.com`. DNS y registrador: **[PENDIENTE DE VERIFICAR]**.
- **Vercel Blob:** almacenamiento de imágenes subidas desde el admin.

## 8. Desarrollo local (macOS)

Requisitos: Python 3.12 (`.python-version`), Node 20 (`engines`), Git.

```bash
git clone https://github.com/sarisita-trululu/nuby-web.git && cd nuby-web

# Backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # DATABASE_URL=sqlite:///./nuby.db por defecto
alembic upgrade head
python -m app.seed --admin-email TU_CORREO_REAL@dominio.com --admin-password 'TuClaveLocal123'
python run.py                 # http://localhost:8000/health

# Frontend (otra terminal)
cd frontend && npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local
npm run dev                   # http://localhost:3000/admin/login
```

Ojo: la validación de correo rechaza dominios reservados (`.test`, `.local`, etc.). Usa un correo con dominio real para el admin local.

## 9. Pruebas

No hay suite de tests automatizados. Verificación manual:

- `curl localhost:8000/health` → `{"status":"ok"}`
- `curl localhost:8000/api/services` → 7 servicios tras el seed
- Login en `/admin/login` → redirige a `/admin/dashboard`; las secciones del panel cargan
- `cd frontend && npx tsc --noEmit` (pasa sin errores) y `npm run build`

## 10. Despliegue

Son dos proyectos de Vercel conectados al mismo repo (según el README):

1. **Backend:** Root Directory `/`, Framework Preset `FastAPI`, runtime Python, entrada `index.py` / `app/index.py`. El build ejecuta `tools/vercel_build.py`: valida `DATABASE_URL` y `SECRET_KEY`, ejecuta `alembic upgrade head` (con `DATABASE_URL_UNPOOLED` si existe) y crea los 7 servicios por defecto **solo si la tabla está vacía**. Nunca toca la contraseña del admin.
2. **Frontend:** Root Directory `frontend`, preset Next.js, `npm install` y `npm run build`.

Un push a `main` dispara los despliegues de producción (si la integración Git está activa) **[PENDIENTE DE VERIFICAR]**. No se publica nada sin autorización.

## 11. Problemas conocidos

1. **`requirements.txt` no fija versiones.** El paquete `vercel` ≥ 0.12.0 (publicado el 15 de octubre de 2026) ya no exporta `AsyncBlobClient`, que importa `app/api/routes/uploads.py`. Con la versión actual el backend **no arranca** (ImportError). Con `vercel==0.11.6` funciona (verificado en local).
2. **Producción no recibe datos de la API.** `nubypsicologa.com/services` muestra "Aún no hay servicios publicados", aunque el seed crea 7 servicios. Eso apunta a que el frontend no llega al backend, y por eso el admin no puede iniciar sesión.
3. El commit `0336f53` (16 de mayo de 2026) quitó la URL de Railway que estaba fija en el código. Desde entonces producción depende por completo de `NEXT_PUBLIC_API_URL`.
4. El login oculta la causa real del error (muestra siempre "Credenciales inválidas").
5. El README tiene rutas de Windows (`C:\New project\...`) que no sirven en Mac.
6. `.gitignore` incluye `tools/`, pero `tools/vercel_build.py` está versionado (a la fuerza). Los archivos nuevos en `tools/` no se subirían.
7. El repo es público y contiene el hash de la contraseña del admin y el correo del admin.

## 12. Recuperación del administrador (diagnóstico del 12 de noviembre de 2026)

### Proyectos de Vercel (equipo `saravalg29-9323s-projects`)

| Proyecto | Tipo | Dominios | Último despliegue de producción | Variables de entorno |
|---|---|---|---|---|
| `nuby-web-wqdz` | Next.js (frontend) | **nubypsicologa.com**, nuby-web-wqdz.vercel.app | READY, 19 de mayo de 2026 (commit e85b51b) | **Ninguna** |
| `nuby-web` | FastAPI (backend) | nuby-web-saravalg29-9323s-projects.vercel.app | **ERROR** en sus 3 despliegues (27 de abril, 18 y 19 de mayo) | **Ninguna** |
| `nuby-web-pvij` | sin framework | nuby-web-pvij.vercel.app | READY, 30 de septiembre de 2026, pero la compilación quedó vacía (141 ms); no sirve la API | **Ninguna** |

Registro de compilación del backend: `Faltan variables obligatorias para desplegar el backend en Vercel: DATABASE_URL, SECRET_KEY`. **El backend nunca ha funcionado en Vercel**, así que ninguna base de datos de Vercel tiene el admin.

### Causa raíz del fallo del admin

1. El frontend publicado se compiló **sin `NEXT_PUBLIC_API_URL`**. Se comprobó en el código servido por nubypsicologa.com: lee `process.env.NEXT_PUBLIC_API_URL` en tiempo de ejecución, en lugar de tener la URL escrita. Al enviar el login, `requireApiBaseUrl()` lanza un error **antes de cualquier petición de red**, y la página lo muestra como "Credenciales inválidas". El admin nunca se valida.
2. **No existe un backend en funcionamiento.** El backend de Railway (`web-production-9b25b.up.railway.app`) ya no responde, y el de Vercel nunca compiló.
3. Por el mismo motivo, la parte pública sale vacía (servicios, blog y testimonios).

### Dónde vivían los datos y el admin original

Según el historial (README y `.env.example` antes del commit 0336f53), la producción original estaba en **Railway**: un servicio backend, PostgreSQL (`DATABASE_URL=${{Postgres.DATABASE_URL}}`) y un volumen `/data/uploads` para las imágenes. La migración `20260426_000002` (restablecer la contraseña de `admin@nubyarango.com`) se aplicó allí. **Está pendiente verificar** si ese proyecto y su base de datos siguen existiendo en Railway.

### Auditoría de Railway (12 de noviembre de 2026, solo lectura)

- Workspace: "sarisita-trululu's Projects", con el **trial vencido** (le quedan USD 3,47 de crédito; tiene tarjeta registrada).
- Proyecto **`harmonious-healing`** (id 080ad1e0-…, entorno `production`, US West):
  - `Postgres` (imagen `ghcr.io/railwayapp-templates/postgres-ssl:18`): **offline**, sin despliegue activo. Volumen `postgres-volume` de 500 MB.
  - **AVISO DE RAILWAY: "This volume is scheduled to be deleted soon as per our data retention policy."** La fecha exacta no aparece en el panel.
  - Backups: **ninguno**.
  - `web` (backend FastAPI desde GitHub): **offline**. Variables: `CORS_ORIGINS`, `DATABASE_URL`, `SECRET_KEY`. **No tiene volumen** de uploads, así que las imágenes subidas desde el admin quedaron en disco efímero y es muy probable que se hayan perdido. Historial: despliegues REMOVED (antes funcionales) hasta "Add organizational advisory hero CTA" (27 de abril), incluido "Reset production admin password". El último intento quedó FAILED por healthcheck.
- Proyecto `perfect-spontaneity` (`organizador-entregas`): otra app, no tiene relación con Nuby.
- La base de datos solo se puede leer con el servicio Postgres desplegado, y eso exige pasar a un plan de pago.

### Plan de recuperación (requiere autorización en cada paso)

1. Revisar en Railway si siguen la base de datos y el volumen. Si siguen, hacer respaldo (`pg_dump`) antes de cualquier cambio.
2. Decidir dónde vive el backend (reactivar Railway o terminar la migración a Vercel con un PostgreSQL administrado, cargando el respaldo).
3. Backend: definir `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `STORAGE_BACKEND`, `BLOB_READ_WRITE_TOKEN`. **No** definir `ADMIN_PASSWORD`, salvo que se quiera restablecer la contraseña a propósito. Fijar `vercel==0.11.6` en `requirements.txt`.
4. Frontend (`nuby-web-wqdz`): definir `NEXT_PUBLIC_API_URL` con la URL del backend y volver a desplegar (la variable se escribe en el código al compilar).
5. Comprobar en la base de datos que `admin@nubyarango.com` existe, con `is_active=true` y `role=admin`, antes de pensar en restablecer la contraseña.
6. Si hay que restablecer la contraseña: `python -m app.seed --admin-email admin@nubyarango.com --admin-password '<nueva>'` contra la base de datos de producción. Hace un upsert (no duplica) y además actualiza los 7 servicios por defecto. Solo con autorización.

## 13. Migración a Vercel + Neon (rama `migracion-vercel`, noviembre de 2026)

Railway queda fuera de la arquitectura. Los datos que vivían en su volumen (blog, testimonios, experiencias creadas desde el panel, textos editados, mensajes de contacto e imágenes subidas) **no se recuperaron**. El admin original se recrea desde la migración `20260426_000002` con su hash bcrypt original.

### Cambios de código
- `requirements.txt` con versiones fijadas (`vercel==0.11.6`).
- `app/core/config.py`: normaliza `postgres://` → `postgresql+psycopg://`; nueva variable `CORS_ORIGIN_REGEX`.
- `app/database/session.py`: `NullPool` en Vercel (el pooling lo hace Neon).
- `alembic/env.py`: usa `DATABASE_URL_UNPOOLED` para migrar si existe.
- `app/seed.py`: opción `--services-if-empty`.
- `tools/vercel_build.py`: migraciones + servicios por defecto si la tabla está vacía; sin seed del admin.
- `frontend/next.config.ts`: permite imágenes de `*.public.blob.vercel-storage.com`.
- `frontend/app/admin/login/page.tsx`: mensajes de error reales.

### Verificación local (PostgreSQL 16)
- Build ejecutado dos veces: 1 solo usuario (`admin@nubyarango.com`, rol `admin`, activo, hash bcrypt original) y 7 servicios; la segunda ejecución no duplica ni modifica nada.
- 28/28 pruebas de API: login incorrecto 401, sin token 401, `/api/admin/me`, CRUD de servicios, experiencias, blog, testimonios y configuración, mensajes de contacto, subida de imágenes y rechazo de formatos inválidos.
- Un servicio editado se conserva tras un nuevo build. CORS acepta producción y Previews y rechaza otros orígenes.
- `npx tsc --noEmit` sin errores.

### Recursos configurados en Vercel (equipo `saravalg29-9323s-projects`)
- **Neon** `nuby-production-db` (plan Free, Neon ID `broad-mud-92687160`; estaba vacía) conectada al proyecto `nuby-web` (Production + Preview) con el prefijo `DATABASE` → `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, etc.
- **Vercel Blob** `nuby-imagenes` (público, iad1) conectado a `nuby-web` → `BLOB_READ_WRITE_TOKEN`.
- `nuby-web` (backend): `SECRET_KEY` (sensitive, generada), `STORAGE_BACKEND=vercel_blob`, `CORS_ORIGINS`, `CORS_ORIGIN_REGEX`. Dominio `api.nubypsicologa.com` añadido (pendiente de DNS).
- `nuby-web-wqdz` (frontend): `NEXT_PUBLIC_API_URL=https://api.nubypsicologa.com`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. El sitio publicado no cambia hasta un nuevo despliegue de producción.

### DNS (Hostinger, nameservers dns-parking.com; el dominio está en otra cuenta de Hostinger, no en la de saravalg29)
- `api` → CNAME `469fd61128e57fb9.vercel-dns-017.com` ✅ (creado el 17 de noviembre de 2026, HTTPS activo)
- `api-preview` → no creado (opcional; el dominio existe en Vercel ligado a la rama `migracion-vercel`)

### Estado en la nube (20 de noviembre de 2026)
- Backend `nuby-web` desplegado en **producción** desde `migracion-vercel` (commit 3675280), autorizado por la usuaria. Responde en `https://api.nubypsicologa.com`. El sitio público no lo usa todavía.
- Build en Vercel: migraciones aplicadas en Neon (esquema + admin original) y 7 servicios creados.
- 20/20 pruebas sin sesión en la nube (salud, lectura pública, 401 sin token o con token inválido en todas las rutas admin, contacto 201/422, 404).
- Frontend preview (`nuby-web-wqdz-git-migracion-vercel-…vercel.app`) muestra los datos de Neon. El login con contraseña incorrecta llega a la API y muestra "Correo o contraseña incorrectos." CORS verificado desde el preview. Vista móvil revisada.
- Datos de prueba: el mensaje "Prueba Migracion" y todos los registros de prueba ya se borraron. Queda una imagen de 8×8 px (`uploads/prueba-migracion-*.png`) en Vercel Blob, que no afecta al sitio.

### Administradores (20 de noviembre de 2026)
- `admin@nubyarango.com` (id 1): admin original recreado por la migración 000002. Nadie recuerda su contraseña; se conserva sin cambios.
- `admin@nubypsicologa.com` (id 2): **nuevo administrador creado a pedido de la usuaria** (INSERT en Neon con hash bcrypt; la contraseña se le entregó a ella y no está en el repo).
- Con la sesión del id 2 se verificaron en la nube: `/api/admin/me`, el CRUD de servicios, experiencias, blog, testimonios y configuración, los mensajes (marcar como leído y borrar) y la subida a Vercel Blob (URL pública `*.public.blob.vercel-storage.com`, imagen accesible). Los formatos inválidos se rechazan. 24/24 OK.

### Pendiente
1. Aprobación final: fusionar `migracion-vercel` → `main` (despliega nubypsicologa.com).
3. Decisión del plan de Vercel: Hobby es solo para uso no comercial; Pro cuesta USD 20 al mes por usuario.

## 14. Reglas para trabajar en este repo

- No reconstruir ni cambiar el framework ni el diseño visual.
- No modificar la base de datos de producción, usuarios, contraseñas ni credenciales sin autorización explícita.
- No crear migraciones destructivas. Cualquier migración nueva se ejecuta sola en el próximo build del backend.
- No hacer push a `main` ni promover despliegues sin autorización (push = despliegue a producción).
- No tocar la configuración de Vercel ni del dominio sin autorización.
- Nunca escribir valores de secretos en archivos versionados.
