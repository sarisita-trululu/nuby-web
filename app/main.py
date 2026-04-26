from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    admin_blog,
    admin_contact,
    admin_experiences,
    admin_services,
    admin_settings,
    admin_testimonials,
    auth,
    public,
    uploads,
)
from app.core.config import settings
from app.database.session import initialize_directories


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_directories()
    yield


app = FastAPI(
    title=settings.app_name,
    description="API para el sitio web y panel privado de Nuby Arango Perez.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_directories()

app.mount(settings.uploads_url_prefix, StaticFiles(directory=str(settings.uploads_path)), name="uploads")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Los datos enviados no son validos.",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    if settings.debug:
        raise exc

    return JSONResponse(
        status_code=500,
        content={"detail": "Ocurrio un error interno. Intenta nuevamente mas tarde."},
    )


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(public.router)
app.include_router(admin_services.router)
app.include_router(admin_experiences.router)
app.include_router(admin_blog.router)
app.include_router(admin_testimonials.router)
app.include_router(admin_contact.router)
app.include_router(admin_settings.router)
app.include_router(uploads.router)
