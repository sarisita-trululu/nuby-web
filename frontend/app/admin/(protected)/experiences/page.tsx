"use client";

import Image from "next/image";
import { Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImageUploadControl } from "@/components/admin/image-upload-control";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  createExperience,
  deleteExperience,
  listAdminExperiences,
  updateExperience,
} from "@/lib/admin-api";
import type { Experience, ExperiencePayload, ExperienceStatus } from "@/lib/types";
import { formatDateLong, formatStatus } from "@/lib/utils";

type IncludeItemValue = {
  value: string;
};

type ExperienceFormValues = {
  title: string;
  date: string;
  location: string;
  price: string;
  status: ExperienceStatus;
  description: string;
  includes: IncludeItemValue[];
  cover_image: string;
  gallery_images: string[];
  is_published: boolean;
};

const DEFAULT_CAPACITY = 12;
const DEFAULT_INCLUDE_ITEMS = [
  "Transporte",
  "Seguro",
  "Refrigerio",
  "Taller vivencial",
];

function createBlankForm(): ExperienceFormValues {
  return {
    title: "",
    date: "",
    location: "",
    price: "",
    status: "cupos_abiertos",
    description: "",
    includes: DEFAULT_INCLUDE_ITEMS.map((value) => ({ value })),
    cover_image: "",
    gallery_images: [],
    is_published: true,
  };
}

function parseDateForAdmin(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  return new Date(value);
}

function isDateInPast(value: string) {
  if (!value) {
    return false;
  }

  const today = new Date();
  const todayAtNoon = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
  );

  return parseDateForAdmin(value).getTime() < todayAtNoon.getTime();
}

function normalizeGalleryImages(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 6);
}

function normalizeIncludes(items: IncludeItemValue[]) {
  const cleaned = items.map((item) => item.value.trim()).filter(Boolean);
  return cleaned.length ? cleaned : DEFAULT_INCLUDE_ITEMS;
}

function buildStoredDescription(
  description: string,
  price: string,
  includes: string[],
) {
  const sections = [description.trim()];

  if (price.trim()) {
    sections.push(`Valor de referencia: ${price.trim()}.`);
  }

  if (includes.length) {
    sections.push(`Incluye: ${includes.join(", ")}.`);
  }

  return sections.filter(Boolean).join("\n\n");
}

function parseStoredDescription(description: string) {
  const paragraphs = description
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  const body: string[] = [];
  let price = "";
  let includes = [...DEFAULT_INCLUDE_ITEMS];

  paragraphs.forEach((paragraph) => {
    if (/^Valor de referencia:/i.test(paragraph)) {
      price = paragraph.replace(/^Valor de referencia:\s*/i, "").replace(/\.$/, "").trim();
      return;
    }

    if (/^Incluye:/i.test(paragraph)) {
      const parsedIncludes = paragraph
        .replace(/^Incluye:\s*/i, "")
        .replace(/\.$/, "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (parsedIncludes.length) {
        includes = parsedIncludes;
      }
      return;
    }

    body.push(paragraph);
  });

  return {
    description: body.join("\n\n"),
    price,
    includes,
  };
}

function buildFormValuesFromExperience(experience: Experience): ExperienceFormValues {
  const parsedDescription = parseStoredDescription(experience.description);

  return {
    title: experience.title,
    date: experience.date,
    location: experience.location,
    price: parsedDescription.price,
    status: experience.status,
    description: parsedDescription.description,
    includes: parsedDescription.includes.map((value) => ({ value })),
    cover_image: experience.cover_image ?? "",
    gallery_images: normalizeGalleryImages(experience.gallery_images),
    is_published: experience.is_published,
  };
}

function buildWhatsappMessage(title: string, location: string, date: string) {
  const formattedDate = date ? formatDateLong(date) : "la fecha indicada";
  return `Hola, quiero información sobre el encuentro ${title.trim()} en ${location.trim()} del ${formattedDate}`;
}

function SectionList({
  title,
  description,
  items,
  onEdit,
  onDelete,
  selectedId,
}: {
  title: string;
  description: string;
  items: Experience[];
  onEdit: (item: Experience) => void;
  onDelete: (item: Experience) => Promise<void>;
  selectedId?: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-2xl text-pine">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-pine/65">{description}</p>
      </div>

      {items.length ? (
        items.map((item) => (
          <article
            key={item.id}
            className={`rounded-[1.75rem] border bg-white/85 p-5 transition ${
              selectedId === item.id
                ? "border-forest/30 shadow-soft"
                : "border-forest/10"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-serif text-2xl text-pine">{item.title}</h4>
                  <span className="rounded-full bg-forest/8 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-forest">
                    {item.is_published ? "Publicada" : "Borrador"}
                  </span>
                  <span className="rounded-full bg-sage/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-pine">
                    {formatStatus(item.status)}
                  </span>
                </div>
                <p className="text-sm text-pine/60">
                  {formatDateLong(item.date)} · {item.location}
                </p>
                <p className="text-sm leading-6 text-pine/70">{item.description}</p>
              </div>

              {item.cover_image ? (
                <div className="relative hidden h-24 w-24 overflow-hidden rounded-[1.25rem] md:block">
                  <Image
                    alt={item.title}
                    className="h-full w-full object-cover"
                    fill
                    sizes="96px"
                    src={item.cover_image}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => onEdit(item)} type="button" variant="secondary">
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                onClick={() => void onDelete(item)}
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
        <div className="rounded-[1.75rem] border border-forest/10 bg-white/70 p-6 text-sm leading-6 text-pine/70">
          Todavía no hay experiencias en esta sección.
        </div>
      )}
    </div>
  );
}

export default function AdminExperiencesPage() {
  const { token } = useAuthStore();
  const formRef = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<Experience[]>([]);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues>({
    defaultValues: createBlankForm(),
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "includes",
  });

  const watchedDate = watch("date");
  const watchedTitle = watch("title");
  const watchedLocation = watch("location");
  const watchedGalleryImages = watch("gallery_images");
  const watchedCoverImage = watch("cover_image");
  const watchedPublished = watch("is_published");

  const upcomingExperiences = useMemo(() => {
    return [...items]
      .filter((item) => !isDateInPast(item.date))
      .sort(
        (left, right) =>
          parseDateForAdmin(left.date).getTime() - parseDateForAdmin(right.date).getTime(),
      );
  }, [items]);

  const pastExperiences = useMemo(() => {
    return [...items]
      .filter((item) => isDateInPast(item.date))
      .sort(
        (left, right) =>
          parseDateForAdmin(right.date).getTime() - parseDateForAdmin(left.date).getTime(),
      );
  }, [items]);

  const autoSectionLabel = watchedDate
    ? isDateInPast(watchedDate)
      ? "Memorias del camino"
      : "Próximos encuentros"
    : "Próximos encuentros";

  const autoWhatsappMessage =
    watchedTitle.trim() && watchedLocation.trim() && watchedDate
      ? buildWhatsappMessage(watchedTitle, watchedLocation, watchedDate)
      : "Se creará automáticamente cuando completes título, lugar y fecha.";

  async function refresh() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listAdminExperiences(token);
      setItems(data);
    } catch {
      setError("No fue posible cargar las experiencias.");
    } finally {
      setLoading(false);
    }
  }

  function startCreating() {
    setSelected(null);
    setError(null);
    setSuccessMessage(null);
    reset(createBlankForm());
    replace(DEFAULT_INCLUDE_ITEMS.map((value) => ({ value })));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEditing(item: Experience) {
    setSelected(item);
    setError(null);
    setSuccessMessage(null);
    const formValues = buildFormValuesFromExperience(item);
    reset(formValues);
    replace(formValues.includes);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  async function handleDelete(item: Experience) {
    if (!token || !window.confirm("Eliminar esta experiencia?")) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await deleteExperience(token, item.id);
      if (selected?.id === item.id) {
        setSelected(null);
        reset(createBlankForm());
        replace(DEFAULT_INCLUDE_ITEMS.map((value) => ({ value })));
      }
      await refresh();
      setSuccessMessage("La experiencia se elimino correctamente.");
    } catch {
      setError("No fue posible eliminar la experiencia.");
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const includes = normalizeIncludes(values.includes);
    const normalizedStatus = isDateInPast(values.date) ? "finalizada" : values.status;
    const capacity = Math.max(selected?.capacity ?? DEFAULT_CAPACITY, 1);
    const availableSpots =
      normalizedStatus === "finalizada"
        ? 0
        : Math.max(selected?.available_spots || capacity, 1);

    const payload: ExperiencePayload = {
      title: values.title.trim(),
      description: buildStoredDescription(values.description, values.price, includes),
      date: values.date,
      location: values.location.trim(),
      capacity,
      available_spots: availableSpots,
      status: normalizedStatus,
      cover_image: values.cover_image || undefined,
      gallery_images: normalizeGalleryImages(values.gallery_images),
      whatsapp_message: buildWhatsappMessage(
        values.title,
        values.location,
        values.date,
      ),
      is_published: values.is_published,
    };

    try {
      if (selected) {
        await updateExperience(token, selected.id, payload);
      } else {
        await createExperience(token, payload);
      }

      setSelected(null);
      reset(createBlankForm());
      replace(DEFAULT_INCLUDE_ITEMS.map((value) => ({ value })));
      await refresh();
      setSuccessMessage(
        values.is_published
          ? "Tu experiencia se publicó correctamente."
          : "Tu experiencia se guardó como borrador.",
      );
    } catch {
      setError("No fue posible guardar la experiencia.");
    }
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="PsicoSendero"
        title="Experiencias vivenciales"
        description="Crea encuentros nuevos con un formulario simple. El sistema organiza la experiencia, prepara el mensaje de WhatsApp y mantiene la misma estructura visual de la web."
      />

      <div className="flex flex-col gap-4 rounded-[2rem] border border-forest/10 bg-white/75 p-5 shadow-card md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-pine">
            Nuby solo completa la información principal.
          </p>
          <p className="mt-2 text-sm leading-6 text-pine/68">
            La URL interna, el mensaje de reserva, la selección de hasta 6 fotos y la
            organización por fecha se resuelven automáticamente.
          </p>
        </div>
        <Button className="min-h-14 px-7 text-base" onClick={startCreating} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Crear nueva experiencia
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="soft-panel p-6" ref={formRef}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-pine">
                {selected ? "Editar experiencia" : "Crear nueva experiencia"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-pine/65">
                Completa solo los datos esenciales del encuentro. Nosotros dejamos la
                estructura lista por detrás.
              </p>
            </div>
            {selected ? (
              <Button onClick={startCreating} type="button" variant="ghost">
                Crear otra
              </Button>
            ) : null}
          </div>

          <div className="mt-6 rounded-[1.75rem] bg-sage/12 p-5 text-sm leading-7 text-pine/72">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest shadow-card">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="space-y-2">
                <p>
                  Esta experiencia se ubicará en <strong>{autoSectionLabel}</strong>.
                </p>
                <p>
                  La galería principal usará hasta <strong>6 fotos</strong>: las primeras 2
                  se verán grandes y las siguientes 4 como apoyo.
                </p>
                <p>
                  El botón de reserva dirá automáticamente:{" "}
                  <span className="text-pine">{autoWhatsappMessage}</span>
                </p>
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Título del encuentro"
                placeholder="Ej: El lugar donde todo empezó"
                error={errors.title?.message}
                {...register("title", { required: "Este campo es obligatorio." })}
              />
              <InputField
                label="Fecha"
                type="date"
                error={errors.date?.message}
                {...register("date", { required: "Este campo es obligatorio." })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Lugar"
                placeholder="Ej: Laguna la Colorada, Boyacá"
                error={errors.location?.message}
                {...register("location", { required: "Este campo es obligatorio." })}
              />
              <InputField
                label="Precio"
                placeholder="Ej: $70.000 COP"
                {...register("price")}
              />
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-pine">Estado</span>
              <select
                className="w-full rounded-2xl border border-forest/15 bg-white/90 px-4 py-3 text-sm text-pine outline-none focus:border-forest focus:ring-2 focus:ring-forest/10"
                {...register("status")}
              >
                <option value="cupos_abiertos">Cupos abiertos</option>
                <option value="proximamente">Próximamente</option>
                <option value="finalizada">Finalizada</option>
              </select>
              <span className="text-xs text-pine/55">
                Si la fecha ya pasó, el sistema la moverá automáticamente a memorias del
                camino.
              </span>
            </label>

            <TextareaField
              label="Descripción"
              placeholder="Describe la experiencia con un tono humano, cercano y claro."
              error={errors.description?.message}
              {...register("description", { required: "Este campo es obligatorio." })}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-pine">Incluye</p>
                  <p className="text-xs text-pine/55">
                    Puedes dejar la lista base o cambiarla según el encuentro.
                  </p>
                </div>
                <Button
                  onClick={() => append({ value: "" })}
                  type="button"
                  variant="ghost"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3">
                    <InputField
                      className="flex-1"
                      label={`Item ${index + 1}`}
                      placeholder="Ej: Transporte ida y regreso"
                      {...register(`includes.${index}.value` as const)}
                    />
                    <Button
                      className="mt-8 px-4"
                      onClick={() => remove(index)}
                      type="button"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {token ? (
              <ImageUploadControl
                token={token}
                label="Imagen principal"
                helper="Sube la foto que quieres ver primero en la tarjeta y el detalle del encuentro."
                onUploaded={(urls) =>
                  setValue("cover_image", urls[0] ?? "", { shouldDirty: true })
                }
              />
            ) : null}

            {watchedCoverImage ? (
              <div className="relative h-52 overflow-hidden rounded-[1.5rem]">
                <Image
                  alt="Vista previa de la imagen principal"
                  className="h-full w-full object-cover"
                  fill
                  sizes="100vw"
                  src={watchedCoverImage}
                />
              </div>
            ) : null}

            {token ? (
              <ImageUploadControl
                token={token}
                label="Galería"
                helper="Sube varias fotos. La página usará automáticamente máximo 6 imágenes para mantener una galería ordenada."
                multiple
                onUploaded={(urls) => {
                  const currentImages = getValues("gallery_images") ?? [];
                  setValue(
                    "gallery_images",
                    normalizeGalleryImages([...currentImages, ...urls]),
                    { shouldDirty: true },
                  );
                }}
              />
            ) : null}

            {watchedGalleryImages.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-pine">Vista previa de la galería</p>
                    <p className="text-xs text-pine/55">
                      Las primeras 2 fotos se destacarán en grande. Las siguientes 4 se
                      mostrarán como apoyo.
                    </p>
                  </div>
                  <span className="rounded-full bg-forest/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-forest">
                    {watchedGalleryImages.length}/6 fotos
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {watchedGalleryImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-[1.4rem] border border-forest/10 bg-white/80"
                    >
                      <div className="relative h-32">
                        <Image
                          alt={`Vista previa ${index + 1}`}
                          className="h-full w-full object-cover"
                          fill
                          sizes="33vw"
                          src={image}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 px-3 py-3">
                        <span className="text-xs text-pine/60">
                          {index < 2 ? `Destacada ${index + 1}` : `Secundaria ${index - 1}`}
                        </span>
                        <Button
                          className="px-3 py-2 text-xs"
                          onClick={() =>
                            setValue(
                              "gallery_images",
                              watchedGalleryImages.filter((_, itemIndex) => itemIndex !== index),
                              { shouldDirty: true },
                            )
                          }
                          type="button"
                          variant="ghost"
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <ToggleField
              label="Publicar en la página"
              description="Si está activo, el encuentro podrá verse en la web pública."
              checked={watchedPublished}
              onChange={(value) => setValue("is_published", value, { shouldDirty: true })}
            />

            {successMessage ? (
              <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
                {successMessage}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <Button className="min-h-14 px-7 text-base" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Guardando..."
                : selected
                  ? "Guardar cambios"
                  : "Guardar experiencia"}
            </Button>
          </form>
        </section>

        <section className="soft-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-pine">Listado de experiencias</h2>
              <p className="mt-2 text-sm leading-6 text-pine/65">
                Desde aquí puedes editar, cambiar fotos o eliminar encuentros ya creados.
              </p>
            </div>
            <Button onClick={startCreating} type="button" variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Crear nueva experiencia
            </Button>
          </div>

          <div className="mt-6 space-y-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-[1.6rem] bg-white/70" />
              ))
            ) : (
              <>
                <SectionList
                  description="Encuentros con fecha futura o activa, listos para recibir reservas."
                  items={upcomingExperiences}
                  onDelete={handleDelete}
                  onEdit={startEditing}
                  selectedId={selected?.id}
                  title="Próximos encuentros"
                />

                <SectionList
                  description="Experiencias que ya ocurrieron y quedan como memoria del camino."
                  items={pastExperiences}
                  onDelete={handleDelete}
                  onEdit={startEditing}
                  selectedId={selected?.id}
                  title="Memorias del camino"
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
