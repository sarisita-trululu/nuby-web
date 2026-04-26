"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth-store";
import { listContactMessages, updateContactMessage } from "@/lib/admin-api";
import type { ContactMessage } from "@/lib/types";
import { formatDateLong } from "@/lib/utils";

const WHATSAPP_REPLY_MESSAGE =
  "Hola, te escribe Nuby Arango. Recibí tu mensaje y me gustaría acompañarte en este proceso. Cuéntame un poco más para poder orientarte mejor ✨";

function normalizeWhatsAppNumber(phone?: null | string) {
  if (!phone) {
    return null;
  }

  const digitsOnly = phone.replace(/\D/g, "");

  if (!digitsOnly) {
    return null;
  }

  if (digitsOnly.startsWith("57")) {
    return digitsOnly;
  }

  const normalized = digitsOnly.replace(/^0+/, "");

  if (normalized.length === 10) {
    return `57${normalized}`;
  }

  return normalized.length ? `57${normalized}` : null;
}

function buildWhatsAppReplyLink(phone?: null | string) {
  const normalizedNumber = normalizeWhatsAppNumber(phone);

  if (!normalizedNumber) {
    return null;
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(WHATSAPP_REPLY_MESSAGE)}`;
}

export default function AdminMessagesPage() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listContactMessages(token);
      setItems(data);
    } catch {
      setError("No fue posible cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [token]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Mensajes"
        title="Mensajes de contacto"
        description="Revisa los mensajes que llegan desde el formulario público y responde de forma rápida cuando compartan su número."
      />

      <section className="soft-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-forest/10 bg-white/70 text-pine/70">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Motivo</th>
                <th className="px-6 py-4 font-medium">Mensaje</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-pine/65" colSpan={6}>
                    Cargando mensajes...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => {
                  const whatsappLink = buildWhatsAppReplyLink(item.phone);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-forest/8 bg-white/65 align-top"
                    >
                      <td className="px-6 py-5 font-medium text-pine">
                        {item.full_name}
                      </td>
                      <td className="px-6 py-5 text-pine/70">
                        <div className="space-y-2">
                          <p>{item.email}</p>
                          {item.phone ? (
                            <div className="inline-flex items-center gap-2 text-pine/60">
                              <Phone className="h-4 w-4" />
                              <span>{item.phone}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-pine/45">
                              Sin teléfono registrado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-pine/70">{item.reason}</td>
                      <td className="max-w-sm px-6 py-5 text-pine/72">
                        {item.message}
                      </td>
                      <td className="px-6 py-5 text-pine/60">
                        {formatDateLong(item.created_at)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex min-w-[220px] flex-col gap-3">
                          {whatsappLink ? (
                            <Button
                              className="justify-center bg-[#25D366] text-white hover:bg-[#1fb85a] hover:text-white"
                              href={whatsappLink}
                              rel="noreferrer"
                              target="_blank"
                              type="button"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Responder por WhatsApp
                            </Button>
                          ) : (
                            <Button
                              className="justify-center border border-forest/10 bg-white/70 text-pine/40 shadow-none hover:bg-white/70 hover:text-pine/40"
                              disabled
                              type="button"
                              variant="secondary"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Sin WhatsApp
                            </Button>
                          )}

                          <Button
                            onClick={async () => {
                              if (!token) {
                                return;
                              }
                              await updateContactMessage(token, item.id, {
                                is_read: !item.is_read,
                              });
                              await refresh();
                            }}
                            type="button"
                            variant={item.is_read ? "ghost" : "secondary"}
                          >
                            {item.is_read ? "Leído" : "Marcar leído"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-6 text-pine/65" colSpan={6}>
                    Todavía no hay mensajes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
