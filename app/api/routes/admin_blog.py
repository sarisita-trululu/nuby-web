from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.base import utcnow
from app.database.session import get_db
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostRead, BlogPostUpdate
from app.services.slug import generate_unique_slug


router = APIRouter(prefix="/api/admin/blog", tags=["Admin Blog"])


def get_blog_post_or_404(post_id: int, db: Session) -> BlogPost:
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada.",
        )
    return post


@router.get("", response_model=list[BlogPostRead], dependencies=[Depends(get_current_admin)])
def list_admin_blog_posts(db: Annotated[Session, Depends(get_db)]) -> list[BlogPost]:
    return list(db.scalars(select(BlogPost).order_by(desc(BlogPost.created_at), BlogPost.id.desc())).all())


@router.post("", response_model=BlogPostRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
def create_blog_post(payload: BlogPostCreate, db: Annotated[Session, Depends(get_db)]) -> BlogPost:
    published_at = payload.published_at
    if payload.is_published and published_at is None:
        published_at = utcnow()

    post = BlogPost(
        **payload.model_dump(exclude={"slug", "published_at"}),
        slug=generate_unique_slug(db, BlogPost, payload.title, payload.slug),
        published_at=published_at,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/{post_id}", response_model=BlogPostRead, dependencies=[Depends(get_current_admin)])
def get_blog_post(post_id: int, db: Annotated[Session, Depends(get_db)]) -> BlogPost:
    return get_blog_post_or_404(post_id, db)


@router.put("/{post_id}", response_model=BlogPostRead, dependencies=[Depends(get_current_admin)])
def update_blog_post(post_id: int, payload: BlogPostUpdate, db: Annotated[Session, Depends(get_db)]) -> BlogPost:
    post = get_blog_post_or_404(post_id, db)
    updates = payload.model_dump(exclude_unset=True)

    if "title" in updates or "slug" in updates:
        post.slug = generate_unique_slug(
            db,
            BlogPost,
            updates.get("title", post.title),
            updates.get("slug", post.slug),
            instance_id=post.id,
        )

    for field, value in updates.items():
        if field in {"title", "slug", "published_at"}:
            continue
        setattr(post, field, value)

    post.title = updates.get("title", post.title)
    post.published_at = updates.get("published_at", post.published_at)
    if updates.get("is_published") is True and post.published_at is None:
        post.published_at = utcnow()
    if updates.get("is_published") is False:
        post.published_at = None

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_blog_post(post_id: int, db: Annotated[Session, Depends(get_db)]) -> Response:
    post = get_blog_post_or_404(post_id, db)
    db.delete(post)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
