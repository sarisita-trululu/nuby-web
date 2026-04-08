# Organizador de Entregas a Google Calendar

Aplicación web en Python que:

- Lee archivos `.docx` y `.pdf`
- Extrae fechas y tareas de entrega
- Muestra los resultados para revisión
- Crea eventos en Google Calendar
- Genera un recordatorio con días de anticipación configurables

## Requisitos

- Python 3.14 o compatible
- Una cuenta de Google
- Credenciales OAuth de Google Calendar

## Configuración

1. Crea y activa un entorno virtual:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Instala dependencias:

```powershell
pip install -r requirements.txt
```

3. Crea credenciales OAuth en Google Cloud:

- Entra a Google Cloud Console
- Activa la API de Google Calendar
- Crea un `OAuth Client ID` para aplicación de escritorio
- Descarga el archivo JSON y guárdalo como:

```text
credentials.json
```

en la raíz del proyecto.

## Ejecutar

```powershell
python run.py
```

Luego abre:

```text
http://127.0.0.1:8000
```

Para acceso desde otros equipos en la misma red, usa la IP local de este computador en el puerto `8000`.

## Despliegue en Render

La app quedó preparada con [render.yaml](C:\Users\Sara Valentina\OneDrive\Documentos\New project\render.yaml).

Pasos:

1. Sube este proyecto a un repositorio de GitHub.
2. En Render, crea un nuevo servicio usando ese repositorio o usa la opción de Blueprint.
3. Render usará:
   - build command: `pip install -r requirements.txt`
   - start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configura la variable de entorno `GOOGLE_CALENDAR_ID` si quieres usar un calendario específico.

### Opción recomendada para producción: Service Account

Para un despliegue estable en Render, la forma más simple es usar una cuenta de servicio de Google:

1. Crea una Service Account en Google Cloud.
2. Habilita Google Calendar API.
3. Descarga la clave JSON.
4. En Render, agrega una variable secreta:

```text
GOOGLE_SERVICE_ACCOUNT_JSON
```

con el contenido completo del JSON en una sola variable.

5. Comparte el calendario de Google con el correo de la cuenta de servicio.
6. Opcionalmente define `GOOGLE_CALENDAR_ID` con el ID del calendario compartido.

### Limitación actual

La app ya puede desplegarse públicamente, pero la sincronización con el calendario en Render está pensada para:

- un calendario compartido del proyecto, usando Service Account
- o uso local con `credentials.json`

Si quieres que cada usuario que entre a la web conecte su propio Google Calendar, hay que implementar OAuth web multiusuario.

## Cómo funciona

1. Subes un PDF o Word.
2. La app extrae texto del documento.
3. Detecta líneas con tareas y fechas.
4. Te muestra una lista para revisión.
5. Al sincronizar:
   - crea un evento el día de entrega
   - crea un evento de preparación con los días de anticipación elegidos
   - añade un recordatorio emergente

## Formatos que detecta mejor

Ejemplos de frases:

- `Entregar caso clínico el 10 de abril`
- `Exposición final - 22/05/2026`
- `Taller de farmacología para entregar el 3 de junio`
- `Fecha límite: 14-04-2026 informe de laboratorio`

## Archivos importantes

- `app/main.py`: servidor FastAPI
- `app/document_parser.py`: lectura y extracción de tareas
- `app/google_calendar.py`: autenticación y creación de eventos
- `templates/index.html`: interfaz web

## Notas

- Esta versión trabaja mejor con archivos Word `.docx`, no con `.doc` antiguos.
- Si el documento tiene fechas muy ambiguas, la app intentará inferir el año actual.
- La primera vez que sincronices con Google se abrirá el flujo de autorización OAuth.
