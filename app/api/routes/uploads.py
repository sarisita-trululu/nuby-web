from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from vercel.blob import AsyncBlobClient

from app.api.deps import get_current_admin
from app.core.config import settings
from app.services.slug import slugify


router = APIRouter(prefix="/api/admin/uploads", tags=["Admin Uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("", dependencies=[Depends(get_current_admin)])
@router.post("/image", dependencies=[Depends(get_current_admin)])
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
) -> dict[str, str]:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa archivos jpg, jpeg, png o webp.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no corresponde a una imagen válida.",
        )

    max_size_bytes = settings.max_upload_size_mb * 1024 * 1024
    safe_name = slugify(Path(filename).stem) or "image"
    final_name = f"{safe_name}-{uuid4().hex}{extension}"

    total_size = 0
    chunks: list[bytes] = []
    try:
        while chunk := await file.read(1024 * 1024):
            total_size += len(chunk)
            if total_size > max_size_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"La imagen supera el máximo permitido de {settings.max_upload_size_mb} MB.",
                )
            chunks.append(chunk)
    finally:
        await file.close()

    file_bytes = b"".join(chunks)

    if settings.use_local_uploads:
        destination = settings.uploads_path / final_name
        with destination.open("wb") as output_file:
            output_file.write(file_bytes)

        public_url = f"{str(request.base_url).rstrip('/')}{settings.uploads_url_prefix}/{final_name}"
        return {"filename": final_name, "url": public_url}

    blob_client = AsyncBlobClient()
    blob_path = f"{settings.blob_upload_prefix.strip('/')}/{final_name}"
    blob = await blob_client.put(
        blob_path,
        file_bytes,
        access="public",
        add_random_suffix=False,
        content_type=file.content_type or "application/octet-stream",
    )
    return {"filename": final_name, "url": blob.url}
