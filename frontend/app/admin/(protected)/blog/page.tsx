"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImageUploadControl } from "@/components/admin/image-upload-control";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  createBlogPost,
  deleteBlogPost,
  listAdminBlog,
  updateBlogPost,
} from "@/lib/admin-api";
import type { BlogPayload, BlogPost } from "@/lib/types";
import { formatDateLong } from "@/lib/utils";

type BlogFormValues = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string;
  is_published: boolean;
};

const blankForm: BlogFormValues = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  cover_image: "",
  is_published: false,
};

export default function AdminBlogPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    defaultValues: blankForm,
  });

  async function refresh() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listAdminBlog(token);
      setItems(data);
    } catch {
      setError("No fue posible cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  useEffect(() => {
    if (!selected) {
      reset(blankForm);
      return;
    }

    reset({
      title: selected.title,
      excerpt: selected.excerpt,
      content: selected.content,
      category: selected.category,
      cover_image: selected.cover_image ?? "",
      is_published: selected.is_published,
    });
  }, [reset, selected]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const payload: BlogPayload = {
      title: values.title.trim(),
      excerpt: values.excerpt.trim(),
      content: values.content.trim(),
      category: values.category.trim(),
      cover_image: values.cover_image || undefined,
      is_published: values.is_published,
      published_at: null,
      slug: undefined,
    };

    try {
      if (selected) {
        await updateBlogPost(token, selected.id, payload);
      } else {
        await createBlogPost(token, payload);
      }

      setSelected(null);
      reset(blankForm);
      await refresh();
      setSuccessMessage(
        values.is_published
          ? "La publicación se guardó y quedó visible en el blog."
          : "La publicación se guardó como borrador.",
      );
    } catch {
      setError("No fue posible guardar la publicación.");
    }
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Blog"
        title="Publicaciones psicoeducativas"
        description="Escribe nuevas publicaciones para acompañar a las personas con contenido claro, humano y fácil de leer."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="soft-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-pine">
                {selected ? "Editar publicación" : "Crear nueva publicación"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-pine/65">
                Completa solo la información principal. La dirección interna se organiza automáticamente.
              </p>
            </div>
            {selected ? (
              <Button onClick={() => setSelected(null)} type="button" variant="ghost">
                Crear otra
              </Button>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Título"
                placeholder="Ej: Cuando el cansancio emocional pide una pausa"
                error={errors.title?.message}
                {...register("title", { required: "Este campo es obligatorio." })}
              />
              <InputField
                label="Categoría"
                placeholder="Ej: Bienestar emocional"
                error={errors.category?.message}
                {...register("category", {
                  required: "Este campo es obligatorio.",
                })}
              />
            </div>

            <InputField
              label="Imagen de portada"
              placeholder="Se llena automáticamente si subes una imagen."
              {...register("cover_image")}
            />

            {token ? (
              <ImageUploadControl
                token={token}
                label="Subir portada"
                onUploaded={(urls) =>
                  setValue("cover_image", urls[0], { shouldDirty: true })
                }
              />
            ) : null}

            {watch("cover_image") ? (
              <div className="relative h-48 overflow-hidden rounded-[1.5rem]">
                <Image
                  alt="Portada del blog"
                  className="h-full w-full object-cover"
                  fill
                  sizes="100vw"
                  src={watch("cover_image")}
                />
              </div>
            ) : null}

            <TextareaField
              label="Resumen breve"
              placeholder="Escribe un resumen corto para invitar a leer la publicación."
              error={errors.excerpt?.message}
              {...register("excerpt", { required: "Este campo es obligatorio." })}
            />

            <TextareaField
              label="Contenido"
              className="min-h-[260px]"
              hint="Puedes escribir por parrafos dejando lineas en blanco entre ideas."
              placeholder="Desarrolla aquí el contenido principal del artículo."
              error={errors.content?.message}
              {...register("content", {
                required: "Este campo es obligatorio.",
                minLength: {
                  value: 30,
                  message: "Escribe un contenido más amplio.",
                },
              })}
            />

            <ToggleField
              label="Publicar ahora"
              description="Si está activo, la publicación aparece en el blog público."
              checked={watch("is_published")}
              onChange={(value) =>
                setValue("is_published", value, { shouldDirty: true })
              }
            />

            {successMessage ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {successMessage}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Guardando..."
                : selected
                  ? "Guardar cambios"
                  : "Crear publicación"}
            </Button>
          </form>
        </section>

        <section className="soft-panel p-6">
          <h2 className="font-serif text-3xl text-pine">Publicaciones guardadas</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-[1.6rem] bg-white/70"
                />
              ))
            ) : items.length ? (
              items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.75rem] border border-forest/10 bg-white/85 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-pine">{item.title}</h3>
                      <p className="mt-2 text-sm text-pine/60">
                        {item.category} - {formatDateLong(item.published_at ?? item.created_at)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-pine/70">
                        {item.excerpt}
                      </p>
                    </div>
                    <span className="rounded-full bg-forest/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-forest">
                      {item.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => setSelected(item)} type="button" variant="secondary">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!token || !window.confirm("Eliminar esta publicación?")) {
                          return;
                        }
                        await deleteBlogPost(token, item.id);
                        if (selected?.id === item.id) {
                          setSelected(null);
                        }
                        await refresh();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-forest/10 bg-white/70 p-6 text-sm text-pine/70">
                Aún no hay publicaciones creadas.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
