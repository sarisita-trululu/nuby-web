from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.security import create_access_token, verify_password
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import AuthUser, LoginRequest, TokenResponse


router = APIRouter(prefix="/api", tags=["Auth"])


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta no se encuentra activa.",
        )

    token = create_access_token(user.email, role=user.role, user_id=user.id)
    return TokenResponse(access_token=token, user=user)


@router.get("/admin/me", response_model=AuthUser)
def me(current_user: Annotated[User, Depends(get_current_admin)]) -> AuthUser:
    return current_user
