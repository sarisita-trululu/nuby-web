"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/input-field";
import { submitContact } from "@/lib/public-api";
import type { ContactPayload } from "@/lib/types";

type ContactFormProps = {
  compact?: boolean;
};

export function ContactForm({ compact = false }: ContactFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactPayload>({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      reason: "",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setServerMessage(null);
    try {
      const response = await submitContact(values);
      setServerMessage(response.message);
      reset();
    } catch {
      setServerError(
        "No fue posible enviar el mensaje en este momento. Intenta nuevamente en unos minutos.",
      );
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <InputField
        label="Nombre completo"
        placeholder="Tu nombre"
        error={errors.full_name?.message}
        {...register("full_name", { required: "Este campo es obligatorio." })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Correo"
          placeholder="nombre@correo.com"
          type="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Este campo es obligatorio.",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Escribe un correo válido.",
            },
          })}
        />
        <InputField
          label="Telefono"
          placeholder="301 279 9371"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <InputField
        label="Motivo"
        placeholder="Quiero iniciar un proceso"
        error={errors.reason?.message}
        {...register("reason", { required: "Este campo es obligatorio." })}
      />
      <TextareaField
        label="Mensaje"
        className={compact ? "min-h-[110px]" : undefined}
        placeholder="Cuéntame un poco de lo que necesitas."
        error={errors.message?.message}
        {...register("message", {
          required: "Este campo es obligatorio.",
          minLength: {
            value: 10,
            message: "El mensaje debe tener al menos 10 caracteres.",
          },
        })}
      />
      {serverMessage ? (
        <p className="rounded-2xl bg-moss/25 px-4 py-3 text-sm text-pine">
          {serverMessage}
        </p>
      ) : null}
      {serverError ? (
        <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      ) : null}
      <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
      </Button>
    </form>
  );
}
