"use client";

import { Menu, Mountain, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DEFAULT_CONTACT_MESSAGE } from "@/lib/site-content";
import type { SiteSettingsMap } from "@/lib/types";
import { buildWhatsappLink, cn } from "@/lib/utils";

const navItems = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#services", label: "Servicios" },
  { href: "/#psicosendero", label: "PsicoSendero" },
  { href: "/#blog", label: "Blog" },
  { href: "/#contact", label: "Contacto" },
];

type SiteHeaderProps = {
  settings: SiteSettingsMap;
};

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-cream/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link
          className="flex items-center gap-3 text-pine transition hover:text-forest"
          href="/"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white shadow-soft">
            <Mountain className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-2xl leading-none">
              Nuby Arango Pérez
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-forest/60">
              Psicología con sentido humano
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const active = item.href === "/#inicio" ? pathname === "/" : false;
            return (
              <Link
                key={item.href}
                className={cn(
                  "text-sm font-medium text-pine/75 hover:text-forest",
                  active && "text-forest",
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button
            href={buildWhatsappLink(DEFAULT_CONTACT_MESSAGE, settings)}
            target="_blank"
            rel="noreferrer"
          >
            Agendar cita
          </Button>
        </div>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-white/80 text-forest md:hidden"
          onClick={() => setOpen((state) => !state)}
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-forest/10 bg-cream/95 px-5 py-5 md:hidden">
          <div className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-pine hover:bg-forest/5"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              className="w-full"
              href={buildWhatsappLink(DEFAULT_CONTACT_MESSAGE, settings)}
              target="_blank"
              rel="noreferrer"
            >
              Agendar cita
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
