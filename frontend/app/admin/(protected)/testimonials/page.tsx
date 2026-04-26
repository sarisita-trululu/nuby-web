"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  createTestimonial,
  deleteTestimonial,
  listAdminTestimonials,
  updateTestimonial,
} from "@/lib/admin-api";
import type { Testimonial, TestimonialPayload } from "@/lib/types";

type TestimonialFormValues = {
  name: string;
  text: string;
  service_type: string;
  is_visible: boolean;
};

const blankForm: TestimonialFormValues = {
  name: "",
  text: "",
  service_type: "",
  is_visible: true,
};

export default function AdminTestimonialsPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({
    defaultValues: blankForm,
  });

  const refresh = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const data = await listAdminTestimonials(token);
      setItems(data);
    } catch {
      setError("No fue posible cargar los testimonios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [token]);

  useEffect(() => {
    if (!selected) {
      reset(blankForm);
      return;
    }

    reset({
      name: selected.name,
      text: selected.text,
      service_type: selected.service_type,
      is_visible: selected.is_visible,
    });
  }, [reset, selected]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }
    setError(null);
    const payload: TestimonialPayload = {
      name: values.name,
      text: values.text,
      service_type: values.service_type,
      is_visible: values.is_visible,
    };

    try {
      if (selected) {
        await updateTestimonial(token, selected.id, payload);
      } else {
        await createTestimonial(token, payload);
      }
      setSelected(null);
      reset(blankForm);
      await refresh();
    } catch {
      setError("No fue posible guardar el testimonio.");
    }
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Testimonios"
        title="Voces del proceso"
        description="Mantiene visibles testimonios reales y seleccionados con cuidado para la experiencia pública."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="soft-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-pine">
              {selected ? "Editar testimonio" : "Nuevo testimonio"}
            </h2>
            {selected ? (
              <Button onClick={() => setSelected(null)} type="button" variant="ghost">
                Limpiar
              </Button>
            ) : null}
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Nombre"
                error={errors.name?.message}
                {...register("name", { required: "Este campo es obligatorio." })}
              />
              <InputField
                label="Tipo de servicio"
                error={errors.service_type?.message}
                {...register("service_type", { required: "Este campo es obligatorio." })}
              />
            </div>
            <TextareaField
              label="Testimonio"
              error={errors.text?.message}
              {...register("text", { required: "Este campo es obligatorio." })}
            />
            <ToggleField
              label="Visible en la web"
              description="Solo los testimonios visibles aparecen en la página pública."
              checked={watch("is_visible")}
              onChange={(value) => setValue("is_visible", value, { shouldDirty: true })}
            />
            {error ? (
              <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Guardando..."
                : selected
                  ? "Actualizar testimonio"
                  : "Crear testimonio"}
            </Button>
          </form>
        </section>

        <section className="soft-panel p-6">
          <h2 className="font-serif text-3xl text-pine">Listado</h2>
          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-[1.6rem] bg-white/70" />
              ))
            ) : items.length ? (
              items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.75rem] border border-forest/10 bg-white/85 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-pine">{item.name}</h3>
                      <p className="mt-2 text-sm uppercase tracking-[0.2em] text-forest/60">
                        {item.service_type}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-pine/70">{item.text}</p>
                    </div>
                    <span className="rounded-full bg-forest/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-forest">
                      {item.is_visible ? "Visible" : "Oculto"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => setSelected(item)} type="button" variant="secondary">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!token || !window.confirm("Eliminar este testimonio?")) {
                          return;
                        }
                        await deleteTestimonial(token, item.id);
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
                Aún no hay testimonios creados.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
