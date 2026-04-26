"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  createSiteSetting,
  listSiteSettings,
  updateSiteSetting,
} from "@/lib/admin-api";
import { FALLBACK_SITE_SETTINGS } from "@/lib/site-content";
import type { SiteSetting, SiteSettingPayload } from "@/lib/types";

type SettingField = {
  key: keyof typeof FALLBACK_SITE_SETTINGS | "hero_title" | "hero_subtitle";
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
  description?: string;
};

type SettingsFormValues = Record<string, string>;

const SETTING_SECTIONS: Array<{
  title: string;
  description: string;
  fields: SettingField[];
}> = [
  {
    title: "Inicio",
    description:
      "Edita lo primero que las personas leen cuando entran a la página principal.",
    fields: [
      {
        key: "hero_title",
        label: "Título principal",
        placeholder: "Ej: Nuby Arango Pérez",
      },
      {
        key: "hero_subtitle",
        label: "Subtítulo principal",
        placeholder: "Ej: Psicología con sentido humano para la vida y el trabajo.",
      },
    ],
  },
  {
    title: "Sobre Nuby",
    description:
      "Este bloque cuenta quién es Nuby y cómo acompaña a las personas y equipos.",
    fields: [
      {
        key: "about_title",
        label: "Título de la sección",
        placeholder: "Ej: Psicología con sentido humano",
      },
      {
        key: "about_text",
        label: "Texto sobre Nuby",
        placeholder:
          "Describe el perfil profesional y el enfoque de acompañamiento.",
        type: "textarea",
      },
      {
        key: "about_support_label",
        label: "Etiqueta pequeña",
        placeholder: "Ej: Para la vida y el trabajo",
      },
      {
        key: "about_support_items",
        label: "Línea de apoyo",
        placeholder: "Ej: Clínica | Organizacional | Bienestar",
      },
    ],
  },
  {
    title: "Frase destacada",
    description:
      "Ajusta la franja emocional que aparece en la mitad de la página.",
    fields: [
      {
        key: "emotional_quote",
        label: "Frase principal",
        placeholder: "Escribe la frase emocional que quieres destacar.",
        type: "textarea",
      },
      {
        key: "emotional_cta_label",
        label: "Texto del botón",
        placeholder: "Ej: Iniciar proceso",
      },
    ],
  },
  {
    title: "Contacto",
    description:
      "Estos datos aparecen en la sección de contacto y ayudan a que te escriban fácilmente.",
    fields: [
      {
        key: "contact_phone",
        label: "WhatsApp",
        placeholder: "Ej: 301 279 9371",
      },
      {
        key: "instagram",
        label: "Instagram",
        placeholder: "Ej: @NubyPsicologa",
      },
      {
        key: "contact_email",
        label: "Correo",
        placeholder: "Ej: nubypsicologa@gmail.com",
      },
      {
        key: "footer_phrase",
        label: "Frase del pie de página",
        placeholder: "Escribe una frase breve para el cierre del sitio.",
      },
    ],
  },
];

const EXTRA_FALLBACK_VALUES: Record<string, string> = {
  hero_title: "Nuby Arango Pérez",
  hero_subtitle: "Psicología con sentido humano para la vida y el trabajo.",
};

const SETTING_FIELDS = SETTING_SECTIONS.flatMap((section) => section.fields);
const SETTING_KEYS = SETTING_FIELDS.map((field) => field.key);

function buildDefaultSettingsValues() {
  const values: SettingsFormValues = {};

  SETTING_KEYS.forEach((key) => {
    values[key] =
      EXTRA_FALLBACK_VALUES[key] ??
      FALLBACK_SITE_SETTINGS[key as keyof typeof FALLBACK_SITE_SETTINGS] ??
      "";
  });

  return values;
}

export default function AdminSettingsPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    defaultValues: buildDefaultSettingsValues(),
  });

  async function refresh() {
    if (!token) {
      return;
    }

    setLoading(true);

    try {
      const data = await listSiteSettings(token);
      setItems(data);
    } catch {
      setError("No fue posible cargar la configuración.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  useEffect(() => {
    const values = buildDefaultSettingsValues();

    items.forEach((item) => {
      if ((SETTING_KEYS as string[]).includes(item.key)) {
        values[item.key] = item.value;
      }
    });

    reset(values);
  }, [items, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      for (const field of SETTING_FIELDS) {
        const payload: SiteSettingPayload = {
          key: field.key,
          value: values[field.key]?.trim() ?? "",
        };
        const currentSetting = items.find((item) => item.key === field.key);

        if (currentSetting) {
          await updateSiteSetting(token, currentSetting.id, payload);
        } else {
          await createSiteSetting(token, payload);
        }
      }

      await refresh();
      setSuccess("Los textos de la página se guardaron correctamente.");
    } catch {
      setError("No fue posible guardar los cambios de esta seccion.");
    }
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Configuración"
        title="Textos y datos de la página"
        description="Edita los mensajes principales del sitio, la información de contacto y los textos visibles sin tocar código."
      />

      <form className="space-y-6" onSubmit={onSubmit}>
        {SETTING_SECTIONS.map((section) => (
          <section key={section.title} className="soft-panel p-6">
            <div className="max-w-3xl">
              <h2 className="font-serif text-3xl text-pine">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-pine/70">
                {section.description}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {section.fields.map((field) =>
                field.type === "textarea" ? (
                  <TextareaField
                    key={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    hint={field.description}
                    error={errors[field.key]?.message}
                    className="min-h-[180px]"
                    {...register(field.key, {
                      required: "Este campo es obligatorio.",
                    })}
                  />
                ) : (
                  <InputField
                    key={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    hint={field.description}
                    error={errors[field.key]?.message}
                    {...register(field.key, {
                      required: "Este campo es obligatorio.",
                    })}
                  />
                ),
              )}
            </div>
          </section>
        ))}

        <div className="soft-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-pine">Guardar cambios</h2>
            <p className="mt-2 text-sm leading-6 text-pine/70">
              Cuando guardes, los textos quedarán listos para mostrarse en la página pública.
            </p>
          </div>
          <Button disabled={isSubmitting || loading} type="submit">
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>

      {success ? (
        <p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
