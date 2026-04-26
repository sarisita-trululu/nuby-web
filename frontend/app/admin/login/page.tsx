"use client";

import { LockKeyhole, Mountain, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuthStore } from "@/hooks/use-auth-store";
import { loginAdmin } from "@/lib/admin-api";
import type { LoginPayload } from "@/lib/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin/dashboard";
  const [error, setError] = useState<string | null>(null);
  const { token, hydrated, setSession } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/admin/dashboard");
    }
  }, [hydrated, router, token]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await loginAdmin(values);
      setSession(response.access_token, response.user);
      router.replace(nextPath);
    } catch {
      setError("Credenciales invalidas o usuario sin acceso.");
    }
  });

  return (
    <main className="grid min-h-screen bg-dawn lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-pine p-10 text-white lg:block">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute left-8 top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-12 right-12 h-56 w-56 rounded-full bg-moss/20 blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
              <Mountain className="h-6 w-6" />
            </span>
            <div>
              <p className="font-serif text-3xl">Nuby Arango Perez</p>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Panel privado
              </p>
            </div>
          </div>
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Acceso protegido
            </p>
            <h1 className="mt-4 font-serif text-6xl leading-none">
              Un espacio sereno para administrar el sitio
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-white/70">
              Desde aqui puedes editar experiencias, contenidos y mensajes con
              una interfaz limpia, humana y segura.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-[2rem] bg-white/8 p-5">
            <Shield className="h-5 w-5 text-moss" />
            <p className="text-sm text-white/70">
              Las rutas privadas usan JWT y requieren autenticacion valida.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="soft-panel w-full max-w-xl p-8 md:p-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.35em] text-forest/60">
            Ingreso privado
          </p>
          <h1 className="mt-4 font-serif text-5xl text-pine">Bienvenida</h1>
          <p className="mt-3 text-sm font-medium text-[#1f3d2b] md:text-base">
            Tia te amo, eres una tesa
          </p>
          <p className="mt-4 text-sm leading-7 text-pine/70">
            Inicia sesion para gestionar la web de Nuby con total privacidad.
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <InputField
              label="Correo"
              placeholder="admin@nubyarango.com"
              type="email"
              error={errors.email?.message}
              {...register("email", { required: "Escribe tu correo." })}
            />
            <InputField
              label="Contrasena"
              placeholder="Tu contrasena"
              type="password"
              error={errors.password?.message}
              {...register("password", { required: "Escribe tu contrasena." })}
            />
            {error ? (
              <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Ingresando..." : "Entrar al panel"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
