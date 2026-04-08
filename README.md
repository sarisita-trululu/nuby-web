# s1

App para estudiantes de USB.

## Organizador de Entregas a Google Calendar

Aplicacion web en Python que:

- Lee archivos `.docx` y `.pdf`
- Extrae fechas y tareas de entrega
- Muestra los resultados para revision
- Crea eventos en Google Calendar
- Genera un recordatorio con dias de anticipacion configurables

## Requisitos

- Python 3.14 o compatible
- Una cuenta de Google
- Credenciales OAuth de Google Calendar

## Configuracion

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
- Crea un `OAuth Client ID` para aplicacion de escritorio
- Descarga el archivo JSON y guardalo como `credentials.json` en la raiz del proyecto

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

La app quedo preparada con `render.yaml`.

Pasos:

1. Sube este proyecto a un repositorio de GitHub.
2. En Render, crea un nuevo servicio usando ese repositorio o usa la opcion de Blueprint.
3. Render usara:
   - build command: `pip install -r requirements.txt`
   - start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configura la variable de entorno `GOOGLE_CALENDAR_ID` si quieres usar un calendario especifico.

### Opcion recomendada para produccion: Service Account

Para un despliegue estable en Render, la forma mas simple es usar una cuenta de servicio de Google:

1. Crea una Service Account en Google Cloud.
2. Habilita Google Calendar API.
3. Descarga la clave JSON.
4. En Render, agrega una variable secreta `GOOGLE_SERVICE_ACCOUNT_JSON` con el contenido completo del JSON en una sola variable.
5. Comparte el calendario de Google con el correo de la cuenta de servicio.
6. Opcionalmente define `GOOGLE_CALENDAR_ID` con el ID del calendario compartido.

### Limitacion actual

La app ya puede desplegarse publicamente, pero la sincronizacion con el calendario en Render esta pensada para:

- un calendario compartido del proyecto, usando Service Account
- o uso local con `credentials.json`

Si quieres que cada usuario que entre a la web conecte su propio Google Calendar, hay que implementar OAuth web multiusuario.

## Como funciona

1. Subes un PDF o Word.
2. La app extrae texto del documento.
3. Detecta lineas con tareas y fechas.
4. Te muestra una lista para revision.
5. Al sincronizar:
   - crea un evento el dia de entrega
   - crea un evento de preparacion con los dias de anticipacion elegidos
   - anade un recordatorio emergente

## Formatos que detecta mejor

Ejemplos de frases:

- `Entregar caso clinico el 10 de abril`
- `Exposicion final - 22/05/2026`
- `Taller de farmacologia para entregar el 3 de junio`
- `Fecha limite: 14-04-2026 informe de laboratorio`

## Archivos importantes

- `app/main.py`: servidor FastAPI
- `app/document_parser.py`: lectura y extraccion de tareas
- `app/google_calendar.py`: autenticacion y creacion de eventos
- `templates/index.html`: interfaz web

## Notas

- Esta version trabaja mejor con archivos Word `.docx`, no con `.doc` antiguos.
- Si el documento tiene fechas muy ambiguas, la app intentara inferir el ano actual.
- La primera vez que sincronices con Google se abrira el flujo de autorizacion OAuth.
