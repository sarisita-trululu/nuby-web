"use client";

import {
  ArrowRight,
  FileText,
  Mail,
  MessageSquareQuote,
  Settings2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  listAdminBlog,
  listAdminExperiences,
  listAdminServices,
  listContactMessages,
  listSiteSettings,
} from "@/lib/admin-api";
import type {
  BlogPost,
  ContactMessage,
  Experience,
  Service,
  SiteSetting,
} from "@/lib/types";

export default function AdminDashboardPage() {
  const { token } = useAuthStore();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    Promise.allSettled([
      listAdminExperiences(token),
      listAdminBlog(token),
      listContactMessages(token),
      listAdminServices(token),
      listSiteSettings(token),
    ])
      .then((results) => {
        const [
          experienceItems,
          blogItems,
          messageItems,
          serviceItems,
          settingItems,
        ] = results;

        setExperiences(
          experienceItems.status === "fulfilled" ? experienceItems.value : [],
        );
        setPosts(blogItems.status === "fulfilled" ? blogItems.value : []);
        setMessages(
          messageItems.status === "fulfilled" ? messageItems.value : [],
        );
        setServices(
          serviceItems.status === "fulfilled" ? serviceItems.value : [],
        );
        setSettings(
          settingItems.status === "fulfilled" ? settingItems.value : [],
        );

        if (results.some((result) => result.status === "rejected")) {
          setError(
            "Abrimos el panel, pero algunos datos no se pudieron cargar. Puedes seguir editando desde las tarjetas.",
          );
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const unreadMessages = messages.filter((message) => !message.is_read).length;
  const publishedExperiences = experiences.filter(
    (experience) => experience.is_published,
  ).length;

  const adminSections = [
    {
      title: "PsicoSendero",
      description:
        "Crea encuentros, cambia fechas, sube fotos y decide que experiencia aparece publicada.",
      href: "/admin/psicosendero",
      cta: "Editar",
      meta: `${experiences.length} experiencias - ${publishedExperiences} publicadas`,
      icon: Sparkles,
    },
    {
      title: "Blog",
      description:
        "Escribe publicaciones, ajusta sus portadas y decide si salen publicadas o quedan en borrador.",
      href: "/admin/blog",
      cta: "Editar",
      meta: `${posts.length} publicaciones`,
      icon: FileText,
    },
    {
      title: "Servicios",
      description:
        "Actualiza los servicios que aparecen en la página para que la información siempre esté vigente.",
      href: "/admin/servicios",
      cta: "Editar",
      meta: `${services.length} servicios visibles`,
      icon: MessageSquareQuote,
    },
    {
      title: "Textos de la página",
      description:
        "Edita títulos, frases, datos de contacto y textos generales sin tocar código.",
      href: "/admin/configuracion",
      cta: "Editar",
      meta: `${settings.length} textos configurados`,
      icon: Settings2,
    },
    {
      title: "Mensajes",
      description:
        "Revisa los mensajes que llegan del formulario y marca los que ya atendiste.",
      href: "/admin/mensajes",
      cta: "Editar",
      meta: `${unreadMessages} sin leer - ${messages.length} recibidos`,
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Panel de administración"
        description="Desde aquí puedes entrar a cada área del sitio y actualizar el contenido con formularios simples."
      />

      {loading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[2rem] bg-white/60"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Experiencias publicadas"
            value={publishedExperiences}
            icon={<Sparkles className="h-5 w-5" />}
          />
          <StatCard
            label="Entradas del blog"
            value={posts.length}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            label="Mensajes sin leer"
            tone="accent"
            value={unreadMessages}
            icon={<Mail className="h-5 w-5" />}
          />
        </div>
      )}

      {error ? (
        <p className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {adminSections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.href}
              className="soft-panel flex h-full flex-col justify-between p-6"
            >
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-serif text-3xl text-pine">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-pine/72">
                  {section.description}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-forest">{section.meta}</p>
                <Link
                  href={section.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-forest"
                >
                  {section.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <div className="soft-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-3xl text-pine">Acceso rapido</h2>
          <p className="mt-2 text-sm leading-6 text-pine/70">
            Si hoy necesitas hacer una sola cosa, entra directo a PsicoSendero y crea tu próximo encuentro.
          </p>
        </div>
        <Button href="/admin/psicosendero" variant="secondary">
          Abrir PsicoSendero
        </Button>
      </div>
    </div>
  );
}
