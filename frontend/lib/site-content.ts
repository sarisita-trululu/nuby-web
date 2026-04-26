import type { SiteSettingsMap } from "@/lib/types";

export const DEFAULT_WHATSAPP_DISPLAY = "301 279 9371";
export const DEFAULT_EMAIL = "nubypsicologa@gmail.com";
export const DEFAULT_INSTAGRAM = "@NubyPsicologa";

export const FALLBACK_SITE_SETTINGS: SiteSettingsMap = {
  hero_title: "Nuby Arango Pérez",
  hero_subtitle: "Psicología con sentido humano para la vida y el trabajo.",
  about_title: "Psicología con sentido humano",
  about_text:
    "Psicóloga clínica y organizacional con enfoque humanista, orientada al acompañamiento emocional y al fortalecimiento del bienestar integral tanto en individuos como en equipos de trabajo.",
  about_support_label: "Para la vida y el trabajo",
  about_support_items: "Clínica | Organizacional | Bienestar",
  emotional_quote:
    "No se trata solo de hablar de lo que duele, sino de encontrar nuevas formas de habitar tu historia.",
  emotional_cta_label: "Iniciar proceso",
  contact_email: DEFAULT_EMAIL,
  contact_phone: DEFAULT_WHATSAPP_DISPLAY,
  instagram: DEFAULT_INSTAGRAM,
  footer_phrase:
    "Psicología con sentido humano, para la vida y el trabajo.",
};

export const DEFAULT_CONTACT_MESSAGE =
  "Hola Nuby, quiero agendar una cita y conocer tus espacios de acompañamiento.";

export const DEFAULT_EXPERIENCE_MESSAGE =
  "Hola Nuby, quiero participar en una de tus experiencias vivenciales en la montaña.";
