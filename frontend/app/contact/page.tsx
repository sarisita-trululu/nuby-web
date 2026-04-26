import { Instagram, Mail, MessageCircleHeart } from "lucide-react";

import { ContactForm } from "@/components/public/contact-form";
import { PublicShell } from "@/components/public/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  DEFAULT_EMAIL,
  DEFAULT_INSTAGRAM,
  DEFAULT_WHATSAPP_DISPLAY,
} from "@/lib/site-content";
import { getSiteSettings } from "@/lib/public-api";
import { buildSettingsMap } from "@/lib/utils";

export const metadata = {
  title: "Contacto | Nuby Arango Pérez",
};

export default async function ContactPage() {
  const siteSettings = await getSiteSettings().catch(() => []);
  const settingsMap = buildSettingsMap(siteSettings);

  return (
    <PublicShell settings={settingsMap}>
      <section className="page-section">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="soft-panel h-full p-8 md:p-10">
              <SectionHeading
                eyebrow="Contacto"
                title="Estoy aquí para escucharte"
                description="Si deseas iniciar un proceso terapéutico o hablar sobre bienestar emocional en tu equipo, conversemos."
              />
              <div className="mt-8 space-y-5 text-sm text-pine/80">
                <div className="flex items-center gap-3">
                  <MessageCircleHeart className="h-5 w-5 text-forest" />
                  <span>{settingsMap.contact_phone ?? DEFAULT_WHATSAPP_DISPLAY}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-forest" />
                  <span>{settingsMap.instagram ?? DEFAULT_INSTAGRAM}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-forest" />
                  <span>{settingsMap.contact_email ?? DEFAULT_EMAIL}</span>
                </div>
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
    </PublicShell>
  );
}
