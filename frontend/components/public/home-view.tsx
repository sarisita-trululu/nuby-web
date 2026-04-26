"use client";

import Image from "next/image";
import { ArrowRight, Flower2, Instagram, Mail, MessageCircleHeart } from "lucide-react";

import { BlogCard } from "@/components/public/blog-card";
import { ContactForm } from "@/components/public/contact-form";
import { ExperienceSalesLanding } from "@/components/public/experience-sales-landing";
import { ExperienceCard } from "@/components/public/experience-card";
import { HeroSection } from "@/components/public/hero-section";
import { ServiceCard } from "@/components/public/service-card";
import { TestimonialStrip } from "@/components/public/testimonial-strip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getElLugarDondeTodoEmpezoFallbackExperience,
  isElLugarDondeTodoEmpezo,
} from "@/lib/experience-landings";
import {
  DEFAULT_EMAIL,
  DEFAULT_INSTAGRAM,
  DEFAULT_WHATSAPP_DISPLAY,
  FALLBACK_SITE_SETTINGS,
} from "@/lib/site-content";
import type {
  BlogPost,
  Experience,
  Service,
  SiteSettingsMap,
  Testimonial,
} from "@/lib/types";
import { sortExperiencesAscending } from "@/lib/utils";

type HomeViewProps = {
  services: Service[];
  experiences: Experience[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
  settings: SiteSettingsMap;
};

export function HomeView({
  services,
  experiences,
  blogPosts,
  testimonials,
  settings,
}: HomeViewProps) {
  const featuredExperience =
    experiences.find(isElLugarDondeTodoEmpezo) ??
    getElLugarDondeTodoEmpezoFallbackExperience();
  const extraExperiences = sortExperiencesAscending(
    experiences.filter((experience) => !isElLugarDondeTodoEmpezo(experience)),
  ).slice(0, 2);
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <>
      <HeroSection settings={settings} />

      <section className="page-section">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-[38%_62%_53%_47%/40%_42%_58%_60%] bg-moss/35 blur-2xl" />
              <div className="soft-panel relative overflow-hidden rounded-[38%_62%_53%_47%/40%_42%_58%_60%] p-4">
                <Image
                  alt="Retrato profesional de Nuby Arango Pérez"
                  className="h-auto w-full rounded-[32%_68%_54%_46%/42%_38%_62%_58%]"
                  height={720}
                  src="/nuby-portrait.jpg"
                  width={720}
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <SectionHeading
              eyebrow="Sobre Nuby"
              title={settings.about_title ?? FALLBACK_SITE_SETTINGS.about_title}
              description={
                <p>{settings.about_text ?? FALLBACK_SITE_SETTINGS.about_text}</p>
              }
            />
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-[1.75rem] border border-forest/10 bg-white/70 px-5 py-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.28em] text-forest/60">
                  {settings.about_support_label ??
                    FALLBACK_SITE_SETTINGS.about_support_label}
                </p>
                <p className="mt-2 text-sm text-pine/80">
                  {settings.about_support_items ??
                    FALLBACK_SITE_SETTINGS.about_support_items}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-section pt-0" id="services">
        <Reveal>
          <SectionHeading
            eyebrow="Servicios"
            title="Acompañamiento terapéutico y organizacional"
            description="Espacios creados para cuidar tu salud emocional, fortalecer tus relaciones y construir bienestar sostenible."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.05}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="overflow-hidden rounded-[2.5rem] bg-pine px-6 py-14 text-white shadow-soft md:px-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.32em] text-white/55">
                Presencia y contención
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                {settings.emotional_quote ?? FALLBACK_SITE_SETTINGS.emotional_quote}
              </h2>
            </div>
            <Button
              className="bg-white text-pine hover:bg-sand"
              href="/contact"
              variant="secondary"
            >
              {settings.emotional_cta_label ??
                FALLBACK_SITE_SETTINGS.emotional_cta_label}
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section pt-0" id="blog">
        <Reveal>
          <SectionHeading
            eyebrow="Blog"
            title="Contenido para tu bienestar"
            description="Reflexiones, herramientas y recursos psicoeducativos para acompañarte dentro y fuera de la consulta."
          />
        </Reveal>
        <div className="mt-10">
          {latestPosts.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {latestPosts.map((post, index) => (
                <Reveal key={post.id} delay={index * 0.06}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aún no hay publicaciones visibles"
              description="Muy pronto encontrarás artículos pensados para ayudarte a comprender mejor tu proceso y tu bienestar."
            />
          )}
        </div>
      </section>

      <section className="page-section pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonios"
            title="Voces que hablan de procesos con calma y confianza"
            description="Cada historia refleja una experiencia distinta de acompañamiento, escucha y transformación."
          />
        </Reveal>
        <div className="mt-10">
          {testimonials.length ? (
            <TestimonialStrip testimonials={testimonials.slice(0, 6)} />
          ) : (
            <EmptyState
              title="Los testimonios aparecerán aquí"
              description="Cuando Nuby publique nuevas historias de acompañamiento, este espacio se llenará con voces reales y cercanas."
            />
          )}
        </div>
      </section>

      <ExperienceSalesLanding
        embedded
        experience={featuredExperience}
        sectionId="psicosendero"
        settings={settings}
      />

      {extraExperiences.length ? (
        <section className="page-section pt-0">
          <Reveal>
            <SectionHeading
              eyebrow="Más experiencias"
              title="Otros encuentros de PsicoSendero"
              description="Si Nuby abre nuevas fechas, aparecerán aquí sin sacar al usuario de la página principal."
            />
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {extraExperiences.map((experience, index) => (
              <Reveal key={experience.id} delay={index * 0.06}>
                <ExperienceCard experience={experience} settings={settings} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-section pt-0" id="contact">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="soft-panel grain-overlay h-full p-8 md:p-10">
              <SectionHeading
                eyebrow="Contacto"
                title="Hablemos de tu proceso"
                description="Si quieres iniciar terapia, resolver una duda o llevar bienestar emocional a tu equipo, este es un buen lugar para empezar."
              />
              <div className="mt-8 space-y-5 text-sm text-pine/80">
                <div className="flex items-center gap-3">
                  <MessageCircleHeart className="h-5 w-5 text-forest" />
                  <span>{settings.contact_phone ?? DEFAULT_WHATSAPP_DISPLAY}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-forest" />
                  <span>{settings.instagram ?? DEFAULT_INSTAGRAM}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-forest" />
                  <span>{settings.contact_email ?? DEFAULT_EMAIL}</span>
                </div>
              </div>
              <div className="mt-8 rounded-[1.75rem] bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-forest/60">
                  Presencia
                </p>
                <p className="mt-3 text-sm leading-7 text-pine/75">
                  Un espacio emocionalmente cálido, pensado para que puedas
                  detenerte, respirar y sentirte acompañada con respeto.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="soft-panel bg-white/85 p-8 md:p-10">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
