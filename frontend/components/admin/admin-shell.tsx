"use client";

import {
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  NotebookPen,
  Sparkles,
  TextCursorInput,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth-store";
import { cn } from "@/lib/utils";

const adminLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    matches: ["/admin/dashboard"],
  },
  {
    href: "/admin/psicosendero",
    label: "PsicoSendero",
    icon: Sparkles,
    matches: ["/admin/psicosendero", "/admin/experiences"],
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: NotebookPen,
    matches: ["/admin/blog"],
  },
  {
    href: "/admin/servicios",
    label: "Servicios",
    icon: Sparkles,
    matches: ["/admin/servicios", "/admin/services"],
  },
  {
    href: "/admin/configuracion",
    label: "Textos de la página",
    icon: TextCursorInput,
    matches: ["/admin/configuracion", "/admin/settings"],
  },
  {
    href: "/admin/mensajes",
    label: "Mensajes",
    icon: Mail,
    matches: ["/admin/mensajes", "/admin/messages"],
  },
];

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearSession } = useAuthStore();

  const logout = () => {
    clearSession();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,253,248,1),rgba(239,244,239,0.95))]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden min-h-screen flex-col border-r border-forest/10 bg-pine px-6 py-8 text-white lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Nuby Arango Pérez
            </p>
            <h1 className="mt-4 font-serif text-4xl">Panel privado</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Gestiona el contenido del sitio con una interfaz cálida y ordenada.
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {adminLinks.map((item) => {
              const active = item.matches.some((match) => pathname.startsWith(match));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white",
                    active && "bg-white/10 text-white",
                  )}
                  href={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 pt-10">
            <button
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
              type="button"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>

            <div className="rounded-[1.75rem] border border-white/12 bg-white/10 px-5 py-6 text-center shadow-[0_18px_45px_rgba(6,24,20,0.18)] backdrop-blur-sm">
              <p className="font-serif text-lg leading-relaxed text-white/95">
                tía te amo, eres una tesa
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-forest/55">
                  Privado
                </p>
                <p className="text-sm text-pine/75">
                  {user?.name ?? "Administración de contenido"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="hidden sm:inline-flex" onClick={logout} type="button" variant="secondary">
                  Cerrar sesión
                </Button>
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-white/80 text-forest lg:hidden"
                  onClick={() => setMobileOpen((state) => !state)}
                  type="button"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {mobileOpen ? (
              <div className="mt-4 grid gap-2 rounded-[1.8rem] bg-white/80 p-3 lg:hidden">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const active = item.matches.some((match) => pathname.startsWith(match));
                  return (
                    <Link
                      key={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-pine/70",
                        active && "bg-forest text-white",
                      )}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="mt-2 rounded-[1.6rem] border border-forest/10 bg-forest/5 px-4 py-5 text-center shadow-[0_16px_35px_rgba(31,61,53,0.08)]">
                  <p className="font-serif text-base leading-relaxed text-pine">
                    tía te amo, eres una tesa
                  </p>
                </div>
              </div>
            ) : null}
          </header>

          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
