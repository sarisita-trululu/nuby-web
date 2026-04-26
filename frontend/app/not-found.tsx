import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="soft-panel max-w-xl p-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-forest/60">
          No encontrado
        </p>
        <h1 className="mt-4 font-serif text-5xl text-pine">
          Esta página no aparece en el camino
        </h1>
        <p className="mt-4 text-base leading-7 text-pine/70">
          Puede que el contenido ya no esté publicado o que la ruta haya cambiado.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/">Volver al inicio</Button>
        </div>
      </div>
    </main>
  );
}
