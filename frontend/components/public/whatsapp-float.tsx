import { MessageCircleHeart } from "lucide-react";

import type { SiteSettingsMap } from "@/lib/types";
import { buildWhatsappLink } from "@/lib/utils";

const PSICOSENDERO_FLOAT_MESSAGE = "Hola, quiero informacion sobre PsicoSendero";

type WhatsappFloatProps = {
  settings: SiteSettingsMap;
  message?: string;
};

export function WhatsappFloat({
  settings,
  message = PSICOSENDERO_FLOAT_MESSAGE,
}: WhatsappFloatProps) {
  return (
    <a
      className="fixed bottom-28 right-4 z-[999] inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-[#25D366] text-white shadow-[0_18px_38px_rgba(10,59,25,0.32)] transition duration-300 hover:scale-105 hover:bg-[#20bd5c] hover:shadow-[0_22px_44px_rgba(10,59,25,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] md:bottom-6 md:right-6"
      href={buildWhatsappLink(message, settings)}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
    >
      <MessageCircleHeart className="h-6 w-6" />
    </a>
  );
}
