import clsx, { type ClassValue } from "clsx";

import type {
  Experience,
  SiteSetting,
  SiteSettingsMap,
} from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

function parseDateValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  return new Date(value);
}

export function formatDateLong(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateValue(value));
}

export function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  }).format(parseDateValue(value));
}

export function truncateText(value: string, limit = 170) {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit).trim()}...`;
}

export function buildSettingsMap(settings: SiteSetting[]): SiteSettingsMap {
  return settings.reduce<SiteSettingsMap>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}

export function sortExperiencesAscending(items: Experience[]) {
  return [...items].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
}

export function formatStatus(status: Experience["status"]) {
  const labels: Record<Experience["status"], string> = {
    proximamente: "Proximamente",
    cupos_abiertos: "Cupos abiertos",
    finalizada: "Finalizada",
  };
  return labels[status];
}

const DEFAULT_WHATSAPP_LINK =
  "https://wa.me/573012799371?text=Hola%20Nuby,%20conoc%C3%AD%20tu%20trabajo%20y%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20tus%20servicios%20y%20las%20experiencias%20de%20PsicoSendero.%20Quedo%20atento(a).%20Gracias.";

export function buildWhatsappLink(_message: string, _settings?: SiteSettingsMap) {
  return DEFAULT_WHATSAPP_LINK;
}

export function firstParagraph(content: string) {
  return content.split("\n").find(Boolean) ?? content;
}
