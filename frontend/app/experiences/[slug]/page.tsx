import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { ExperienceSalesLanding } from "@/components/public/experience-sales-landing";
import { PublicShell } from "@/components/public/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DEFAULT_EXPERIENCE_MESSAGE } from "@/lib/site-content";
import {
  EL_LUGAR_DONDE_TODO_EMPEZO_RESERVE_MESSAGE,
  getExperienceWithFallback,
  isElLugarDondeTodoEmpezo,
} from "@/lib/experience-landings";
import { getExperienceBySlug, getSiteSettings } from "@/lib/public-api";
import { buildSettingsMap, buildWhatsappLink, formatDateLong } from "@/lib/utils";

type ExperienceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ExperienceDetailPageProps) {
  const { slug } = await params;
  const apiExperience = await getExperienceBySlug(slug).catch(() => null);
  const experience = getExperienceWithFallback(slug, apiExperience);
  if (!experience) {
    return { title: "Experiencia | Nuby Arango Pérez" };
  }
  return {
    title: `${experience.title} | Nuby Arango Pérez`,
    description: experience.description,
  };
}

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { slug } = await params;
  const [apiExperience, siteSettings] = await Promise.all([
    getExperienceBySlug(slug).catch(() => null),
    getSiteSettings().catch(() => []),
  ]);
  const experience = getExperienceWithFallback(slug, apiExperience);

  if (!experience) {
    notFound();
  }

  const settingsMap = buildSettingsMap(siteSettings);
  const isSalesLanding = isElLugarDondeTodoEmpezo(experience);
  const message =
    isSalesLanding
      ? EL_LUGAR_DONDE_TODO_EMPEZO_RESERVE_MESSAGE
      : experience.whatsapp_message ??
    `${DEFAULT_EXPERIENCE_MESSAGE} Me interesa: ${experience.title}.`;

  return (
    <PublicShell settings={settingsMap} whatsappMessage={message}>
      {isSalesLanding ? (
        <ExperienceSalesLanding experience={experience} settings={settingsMap} />
      ) : (
        <section className="page-section">
          <div className="overflow-hidden rounded-[2.5rem] bg-white/75 shadow-soft">
            <div className="relative h-[24rem] w-full overflow-hidden md:h-[32rem]">
              {experience.cover_image ? (
                <Image
                  alt={experience.title}
                  className="h-full w-full object-cover"
                  fill
                  priority
                  sizes="100vw"
                  src={experience.cover_image}
                />
              ) : (
                <div className="grain-overlay h-full w-full bg-[linear-gradient(135deg,rgba(47,93,80,0.78),rgba(163,191,168,0.48))]" />
              )}
            </div>
            <div className="grid gap-10 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12">
              <div>
                <StatusBadge status={experience.status} />
                <h1 className="mt-5 font-serif text-5xl text-pine">
                  {experience.title}
                </h1>
                <p className="mt-5 text-base leading-8 text-pine/75">
                  {experience.description}
                </p>
                <div className="mt-8 flex flex-col gap-4 text-sm text-pine/72 md:flex-row md:flex-wrap">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {experience.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {experience.available_spots} de {experience.capacity} cupos
                  </span>
                  <span>{formatDateLong(experience.date)}</span>
                </div>
              </div>

              <div className="soft-panel h-fit p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-forest/60">
                  Reserva tu lugar
                </p>
                <p className="mt-4 text-sm leading-7 text-pine/72">
                  Si esta experiencia resuena contigo, puedes escribir directamente
                  por WhatsApp para recibir más información.
                </p>
                <Button
                  className="mt-6 w-full"
                  href={buildWhatsappLink(message, settingsMap)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Quiero participar
                </Button>
              </div>
            </div>

            {experience.gallery_images.length ? (
              <div className="grid gap-4 p-8 pt-0 md:grid-cols-3 md:px-12 md:pb-12">
                {experience.gallery_images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative h-56 overflow-hidden rounded-[1.75rem]"
                  >
                    <Image
                      alt={`${experience.title} galería ${index + 1}`}
                      className="h-full w-full object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      src={image}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
