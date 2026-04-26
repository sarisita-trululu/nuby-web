"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { DEFAULT_CONTACT_MESSAGE, FALLBACK_SITE_SETTINGS } from "@/lib/site-content";
import type { SiteSettingsMap } from "@/lib/types";
import { buildWhatsappLink } from "@/lib/utils";

type HeroSectionProps = {
  settings: SiteSettingsMap;
};

export function HeroSection({ settings }: HeroSectionProps) {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, -40]);

  return (
    <section className="relative isolate overflow-hidden scroll-mt-24" id="inicio">
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        <Image
          alt="Montañas con niebla"
          className="h-full w-full object-cover"
          fill
          priority
          sizes="100vw"
          src="/mountain-mist.svg"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,15,0.42),rgba(18,38,32,0.78))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_32%),linear-gradient(125deg,rgba(0,0,0,0.12),transparent_46%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,rgba(255,253,248,0.95))]" />

      <div className="page-section relative flex min-h-[88vh] items-center">
        <div className="max-w-3xl text-white">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.28)]"
          >
            Psicología clínica | Organizacional | PsicoSendero
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="max-w-3xl font-serif text-5xl leading-[0.95] text-[#fffdf8] [text-shadow:0_10px_35px_rgba(0,0,0,0.34)] md:text-7xl"
          >
            {settings.hero_title ?? FALLBACK_SITE_SETTINGS.hero_title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-white/95 [text-shadow:0_6px_18px_rgba(0,0,0,0.28)] md:text-xl"
          >
            {settings.hero_subtitle ?? FALLBACK_SITE_SETTINGS.hero_subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
          >
            <Button
              className="min-h-14 w-full border border-[rgba(31,61,43,0.18)] bg-white text-[#1f3d2b] shadow-[0_16px_40px_rgba(0,0,0,0.16)] hover:bg-[#f5f1e8] hover:text-[#1f3d2b] sm:w-auto"
              href={buildWhatsappLink(DEFAULT_CONTACT_MESSAGE, settings)}
              rel="noreferrer"
              target="_blank"
              variant="secondary"
            >
              Agendar cita
            </Button>
            <Button
              className="min-h-14 w-full justify-center text-[#1f3d2b] shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:w-auto"
              href="/#psicosendero"
              variant="secondary"
            >
              Ver experiencia en la montaña
            </Button>
          </motion.div>
        </div>

        <motion.svg
          aria-hidden
          className="absolute bottom-10 right-0 hidden w-[28rem] text-white/35 lg:block"
          fill="none"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.35 }}
          viewBox="0 0 500 320"
        >
          <motion.path
            d="M20 235C95 175 165 153 220 164C290 178 335 240 407 225C441 218 468 198 480 180"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.7 }}
          />
          <path
            d="M135 72C155 82 171 104 176 129C154 123 136 105 129 84C125 74 124 67 135 72Z"
            fill="currentColor"
            opacity="0.55"
          />
          <path
            d="M194 58C213 69 228 91 233 117C210 110 190 90 184 69C181 59 182 52 194 58Z"
            fill="currentColor"
            opacity="0.4"
          />
        </motion.svg>
      </div>
    </section>
  );
}
