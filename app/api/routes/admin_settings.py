from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.session import get_db
from app.models.site_setting import SiteSetting
from app.schemas.site_setting import SiteSettingCreate, SiteSettingRead, SiteSettingUpdate


router = APIRouter(prefix="/api/admin/site-settings", tags=["Admin Site Settings"])


def get_site_setting_or_404(setting_id: int, db: Session) -> SiteSetting:
    setting = db.get(SiteSetting, setting_id)
    if setting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Configuración no encontrada.")
    return setting


def validate_setting_key(db: Session, key: str, current_id: int | None = None) -> None:
    existing = db.scalar(select(SiteSetting).where(SiteSetting.key == key))
    if existing is not None and existing.id != current_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una configuración con esa clave.",
        )


@router.get("", response_model=list[SiteSettingRead], dependencies=[Depends(get_current_admin)])
def list_site_settings_admin(db: Annotated[Session, Depends(get_db)]) -> list[SiteSetting]:
    return list(db.scalars(select(SiteSetting).order_by(SiteSetting.key.asc())).all())


@router.post("", response_model=SiteSettingRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
def create_site_setting(payload: SiteSettingCreate, db: Annotated[Session, Depends(get_db)]) -> SiteSetting:
    validate_setting_key(db, payload.key)
    setting = SiteSetting(**payload.model_dump())
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


@router.get("/{setting_id}", response_model=SiteSettingRead, dependencies=[Depends(get_current_admin)])
def get_site_setting(setting_id: int, db: Annotated[Session, Depends(get_db)]) -> SiteSetting:
    return get_site_setting_or_404(setting_id, db)


@router.put("/{setting_id}", response_model=SiteSettingRead, dependencies=[Depends(get_current_admin)])
def update_site_setting(
    setting_id: int,
    payload: SiteSettingUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> SiteSetting:
    setting = get_site_setting_or_404(setting_id, db)
    updates = payload.model_dump(exclude_unset=True)

    if "key" in updates:
        validate_setting_key(db, updates["key"], current_id=setting.id)

    for field, value in updates.items():
        setattr(setting, field, value)

    db.commit()
    db.refresh(setting)
    return setting


@router.delete("/{setting_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_site_setting(setting_id: int, db: Annotated[Session, Depends(get_db)]) -> Response:
    setting = get_site_setting_or_404(setting_id, db)
    db.delete(setting)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
