from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.blog import BlogPost
from app.models.contact import ContactMessage
from app.models.experience import Experience
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.testimonial import Testimonial
from app.schemas.blog import BlogPostRead
from app.schemas.contact import ContactMessageCreate, ContactSubmitResponse
from app.schemas.experience import ExperienceRead
from app.schemas.service import ServiceRead
from app.schemas.site_setting import SiteSettingRead
from app.schemas.testimonial import TestimonialRead


router = APIRouter(prefix="/api", tags=["Public"])


@router.get("/services", response_model=list[ServiceRead])
def list_services(db: Annotated[Session, Depends(get_db)]) -> list[Service]:
    return list(
        db.scalars(
            select(Service).where(Service.is_active.is_(True)).order_by(Service.order.asc(), Service.id.asc())
        ).all()
    )


@router.get("/experiences", response_model=list[ExperienceRead])
def list_experiences(db: Annotated[Session, Depends(get_db)]) -> list[Experience]:
    return list(
        db.scalars(
            select(Experience)
            .where(Experience.is_published.is_(True))
            .order_by(desc(Experience.date), Experience.id.desc())
        ).all()
    )


@router.get("/experiences/{slug}", response_model=ExperienceRead)
def get_experience(slug: str, db: Annotated[Session, Depends(get_db)]) -> Experience:
    experience = db.scalar(
        select(Experience).where(Experience.slug == slug, Experience.is_published.is_(True))
    )
    if experience is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiencia no encontrada.")
    return experience


@router.get("/blog", response_model=list[BlogPostRead])
def list_blog_posts(db: Annotated[Session, Depends(get_db)]) -> list[BlogPost]:
    return list(
        db.scalars(
            select(BlogPost)
            .where(BlogPost.is_published.is_(True))
            .order_by(desc(BlogPost.published_at), desc(BlogPost.created_at))
        ).all()
    )


@router.get("/blog/{slug}", response_model=BlogPostRead)
def get_blog_post(slug: str, db: Annotated[Session, Depends(get_db)]) -> BlogPost:
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published.is_(True)))
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada.")
    return post


@router.get("/testimonials", response_model=list[TestimonialRead])
def list_testimonials(db: Annotated[Session, Depends(get_db)]) -> list[Testimonial]:
    return list(
        db.scalars(
            select(Testimonial)
            .where(Testimonial.is_visible.is_(True))
            .order_by(desc(Testimonial.created_at), Testimonial.id.desc())
        ).all()
    )


@router.get("/site-settings", response_model=list[SiteSettingRead])
def list_site_settings(db: Annotated[Session, Depends(get_db)]) -> list[SiteSetting]:
    return list(db.scalars(select(SiteSetting).order_by(SiteSetting.key.asc())).all())


@router.post("/contact", response_model=ContactSubmitResponse, status_code=status.HTTP_201_CREATED)
def create_contact_message(
    payload: ContactMessageCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ContactSubmitResponse:
    contact_message = ContactMessage(**payload.model_dump())
    db.add(contact_message)
    db.commit()
    return ContactSubmitResponse(message="Tu mensaje fue enviado correctamente.")
