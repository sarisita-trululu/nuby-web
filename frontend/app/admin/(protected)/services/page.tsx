"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  createService,
  deleteService,
  listAdminServices,
  updateService,
} from "@/lib/admin-api";
import type { Service, ServicePayload } from "@/lib/types";

type ServiceFormValues = {
  title: string;
  description: string;
  items_text: string;
  is_active: boolean;
};

const blankForm: ServiceFormValues = {
  title: "",
  description: "",
  items_text: "",
  is_active: true,
};

export default function AdminServicesPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
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
  } = useForm<ServiceFormValues>({
    defaultValues: blankForm,
  });

  const nextOrder = useMemo(() => {
    if (!items.length) {
      return 1;
    }

    return Math.max(...items.map((item) => item.order)) + 1;
  }, [items]);

  async function refresh() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listAdminServices(token);
      setItems(data);
    } catch {
      setError("No fue posible cargar los servicios.");
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
      description: selected.description,
      items_text: selected.items.join("\n"),
      is_active: selected.is_active,
    });
  }, [reset, selected]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    const payload: ServicePayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      items: values.items_text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      icon: selected?.icon ?? undefined,
      order: selected?.order ?? nextOrder,
      is_active: values.is_active,
    };

    try {
      if (selected) {
        await updateService(token, selected.id, payload);
      } else {
        await createService(token, payload);
      }

      setSelected(null);
      reset(blankForm);
      await refresh();
      setSuccessMessage("Los cambios del servicio se guardaron correctamente.");
    } catch {
      setError("No fue posible guardar el servicio.");
    }
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Servicios"
        title="Servicios visibles"
        description="Actualiza la oferta de acompañamiento clínico y organizacional con un formulario claro y fácil de usar."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="soft-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-pine">
                {selected ? "Editar servicio" : "Crear servicio"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-pine/65">
                Edita el nombre, la descripción y los temas clave. El resto se organiza automáticamente.
              </p>
            </div>
            {selected ? (
              <Button onClick={() => setSelected(null)} type="button" variant="ghost">
                Crear otro
              </Button>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <InputField
              label="Nombre del servicio"
              placeholder="Ej: Terapia individual"
              error={errors.title?.message}
              {...register("title", { required: "Este campo es obligatorio." })}
            />

            <TextareaField
              label="Descripción"
              placeholder="Describe de forma clara en qué consiste este servicio."
              error={errors.description?.message}
              {...register("description", {
                required: "Este campo es obligatorio.",
              })}
            />

            <TextareaField
              label="Temas o puntos que incluye"
              hint="Escribe un punto por linea."
              placeholder="Ej: Manejo del estrés"
              error={errors.items_text?.message}
              {...register("items_text", {
                required: "Agrega al menos un tema.",
              })}
            />

            <ToggleField
              label="Mostrar este servicio"
              description="Si lo desactivas, deja de verse en la página pública."
              checked={watch("is_active")}
              onChange={(value) =>
                setValue("is_active", value, { shouldDirty: true })
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
                  : "Crear servicio"}
            </Button>
          </form>
        </section>

        <section className="soft-panel p-6">
          <h2 className="font-serif text-3xl text-pine">Servicios cargados</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-[1.6rem] bg-white/70"
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
                      <p className="mt-3 text-sm leading-6 text-pine/70">
                        {item.description}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-forest/65">
                        {item.items.length} temas visibles
                      </p>
                    </div>
                    <span className="rounded-full bg-forest/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-forest">
                      {item.is_active ? "Activo" : "Oculto"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => setSelected(item)} type="button" variant="secondary">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!token || !window.confirm("Eliminar este servicio?")) {
                          return;
                        }
                        await deleteService(token, item.id);
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
                Aún no hay servicios cargados.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
