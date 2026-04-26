import Image from "next/image";
import {
  CalendarDays,
  Check,
  Footprints,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Mountain,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
} from "lucide-react";

import {
  ReflectiveQuoteCards,
  type ReflectiveQuoteItem,
} from "@/components/public/reflective-quote-cards";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import {
  EL_LUGAR_DONDE_TODO_EMPEZO_CTA_IMAGE,
  EL_LUGAR_DONDE_TODO_EMPEZO_GALLERY_IMAGES,
  EL_LUGAR_DONDE_TODO_EMPEZO_HERO_IMAGE,
  EL_LUGAR_DONDE_TODO_EMPEZO_WHATSAPP_MESSAGE,
} from "@/lib/experience-landings";
import type { Experience, SiteSettingsMap } from "@/lib/types";
import { buildWhatsappLink } from "@/lib/utils";

type ExperienceSalesLandingProps = {
  experience: Experience;
  settings: SiteSettingsMap;
  sectionId?: string;
  embedded?: boolean;
};

const heroChips = [
  "17 de mayo",
  "Laguna la Colorada",
  "$70.000 COP",
  "Cupos abiertos",
];

const experienceHighlights = [
  {
    title: "Caminata consciente en la naturaleza",
    icon: Footprints,
  },
  {
    title: "Espacio de conexión emocional",
    icon: Heart,
  },
  {
    title: "Reflexión sobre la infancia y la historia personal",
    icon: Sparkles,
  },
  {
    title: "Ejercicios simbólicos de reconexión",
    icon: Leaf,
  },
  {
    title: "Pausa, respiración y presencia",
    icon: Trees,
  },
  {
    title: "Cierre grupal seguro y respetuoso",
    icon: ShieldCheck,
  },
];

const includedItems = [
  {
    title: "Transporte ida y regreso",
    icon: MapPin,
  },
  {
    title: "Seguro durante la experiencia",
    icon: ShieldCheck,
  },
  {
    title: "Refrigerio",
    icon: Leaf,
  },
  {
    title: "Taller vivencial guiado",
    icon: Heart,
  },
];

const reflectiveItems: ReflectiveQuoteItem[] = [
  {
    type: "quote",
    text: "Si una situación interior no se hace consciente, sucede afuera, como destino.",
    author: "Carl Jung",
  },
  {
    type: "inspired",
    text: "Volver a la infancia no es quedarse en el pasado; es mirar con amor el lugar donde aprendimos a ser.",
  },
  {
    type: "quote",
    text: "La capacidad de estar solo es uno de los signos más importantes de madurez en el desarrollo emocional.",
    author: "Donald Winnicott",
  },
  {
    type: "inspired",
    text: "A veces sanar no es olvidar, sino encontrar una forma más amable de recordar.",
  },
  {
    type: "quote",
    text: "En cada paseo con la naturaleza, uno recibe mucho más de lo que busca.",
    author: "John Muir",
  },
  {
    type: "inspired",
    text: "La naturaleza no exige respuestas; ofrece silencio para escucharnos mejor.",
  },
  {
    type: "quote",
    text: "El precursor del espejo es el rostro de la madre.",
    author: "Donald Winnicott",
  },
  {
    type: "inspired",
    text: "No se trata de cambiar tu historia, sino de volver a habitarla con más compasión.",
  },
];

const faqItems = [
  {
    question: "¿Necesito experiencia previa?",
    answer:
      "No. Solo necesitas disposición para vivir una experiencia de pausa, conexión y reflexión personal.",
  },
  {
    question: "¿Puedo ir sola o solo?",
    answer:
      "Sí. El encuentro está pensado para que cada persona pueda vivir su propio proceso en un ambiente seguro y respetuoso.",
  },
  {
    question: "¿Qué debo llevar?",
    answer:
      "Ropa cómoda, abrigo, zapatos adecuados para caminar, agua, algo ligero para comer y disposición para conectar contigo.",
  },
  {
    question: "¿Dónde será?",
    answer: "En Laguna la Colorada, Sogamoso, Boyacá.",
  },
  {
    question: "¿Cuánto cuesta?",
    answer: "El valor es de $70.000 COP por persona.",
  },
  {
    question: "¿Qué incluye?",
    answer:
      "Transporte ida y regreso, seguro, refrigerio y taller vivencial guiado.",
  },
  {
    question: "¿Cómo reservo?",
    answer:
      "Puedes reservar directamente por WhatsApp dando clic en el botón “Reservar mi lugar”.",
  },
  {
    question: "¿Es terapia psicológica?",
    answer:
      "No reemplaza un proceso psicoterapéutico individual. Es una experiencia vivencial de bienestar, reflexión y conexión emocional acompañada por una psicóloga.",
  },
  {
    question: "¿Hay cupos limitados?",
    answer:
      "Sí. Los cupos son limitados para cuidar la calidad, la cercanía y el acompañamiento del encuentro.",
  },
];

function LandingActions({
  href,
  className,
  primaryLabel = "Reservar mi lugar",
}: {
  href: string;
  className?: string;
  primaryLabel?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          className="min-h-14 min-w-[240px] bg-forest px-7 text-base hover:bg-pine"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {primaryLabel}
        </Button>
        <Button
          className="min-h-14 min-w-[240px] border border-black/10 bg-white px-7 text-base font-semibold text-[#1f3d2b] shadow-[0_14px_32px_rgba(14,26,22,0.12)] hover:bg-[#f5f5f5] hover:text-[#1f3d2b]"
          href={href}
          rel="noreferrer"
          target="_blank"
          variant="secondary"
        >
          <MessageCircle className="mr-2 h-4 w-4 text-[#1f3d2b]" />
          Hablar por WhatsApp
        </Button>
      </div>
    </div>
  );
}

export function ExperienceSalesLanding({
  experience,
  settings,
  sectionId,
  embedded = false,
}: ExperienceSalesLandingProps) {
  const reserveLink = buildWhatsappLink(
    EL_LUGAR_DONDE_TODO_EMPEZO_WHATSAPP_MESSAGE,
    settings,
  );
  const visibleGalleryImages =
    EL_LUGAR_DONDE_TODO_EMPEZO_GALLERY_IMAGES.slice(0, 6);

  return (
    <section
      className="scroll-mt-24 pb-28 md:pb-10"
      id={sectionId}
    >
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            alt={experience.title}
            className="h-full w-full object-cover"
            fill
            priority
            sizes="100vw"
            src={EL_LUGAR_DONDE_TODO_EMPEZO_HERO_IMAGE}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,43,37,0.28),rgba(20,43,37,0.8))]" />
        <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-sage/18 blur-3xl" />
        <div className="absolute -right-12 bottom-12 h-56 w-56 rounded-full bg-sand/22 blur-3xl" />

        <div
          className={`page-section relative flex items-end py-16 md:py-24 ${
            embedded ? "min-h-[78vh] md:min-h-[82vh]" : "min-h-[92vh]"
          }`}
        >
          <div className="max-w-5xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-white/70">
              Experiencia vivencial en la montaña
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.92] md:text-7xl">
              El lugar donde todo empezó
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/84 md:text-2xl md:leading-10">
              Un encuentro para volver a ti desde la naturaleza.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {heroChips.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/18 bg-white/12 px-5 py-3 text-sm font-medium text-white backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>

            <LandingActions className="mt-10" href={reserveLink} />
          </div>
        </div>
      </section>

      <section className="page-section pt-10 md:pt-16">
        <div className="mx-auto max-w-5xl rounded-[2.75rem] bg-white/88 px-8 py-10 shadow-soft md:px-14 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
            Un encuentro para reconectar contigo desde la naturaleza
          </p>
          <p className="mt-6 font-serif text-3xl leading-tight text-pine md:text-5xl">
            Quizás no necesitas convertirte en alguien nuevo. Quizás necesitas
            volver a mirar con ternura esa parte de ti que aprendió a
            protegerse.
          </p>
          <div className="mt-8 space-y-5 text-base leading-8 text-pine/74 md:text-lg">
            <p>Hay una parte de ti que no está herida... solo está esperando que regreses.</p>
            <p>
              Un lugar donde aún habita tu versión más libre, más auténtica, más
              viva.
            </p>
            <p>
              En este encuentro no vamos a convertirnos en alguien nuevo...
              vamos a recordar quiénes éramos antes de olvidar.
            </p>
          </div>
          <LandingActions className="mt-10" href={reserveLink} />
        </div>
      </section>

      <section className="page-section pt-0">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
              ¿Qué vivirás en este encuentro?
            </p>
            <h2 className="mt-4 font-serif text-4xl text-pine md:text-5xl">
              Una experiencia emocional, cercana y guiada con cuidado
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {experienceHighlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <article className="rounded-[2rem] border border-forest/10 bg-white/84 p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                  <div className="inline-flex rounded-full bg-sage/18 p-3 text-forest">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl leading-tight text-pine">
                    {item.title}
                  </h3>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="rounded-[2.5rem] bg-[linear-gradient(145deg,rgba(255,253,248,0.98),rgba(232,242,235,0.88))] p-8 shadow-card md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
                ¿Para quién es?
              </p>
              <h2 className="mt-4 font-serif text-4xl text-pine md:text-5xl">
                Para personas que quieren pausar y volver a escucharse
              </h2>
              <p className="mt-6 text-base leading-8 text-pine/74 md:text-lg">
                Este encuentro es para personas mayores de edad que sienten el
                deseo de pausar, reconectar con su historia, mirar su infancia
                con más compasión y vivir una experiencia de bienestar emocional
                en contacto con la montaña.
              </p>
              <LandingActions className="mt-10" href={reserveLink} />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-[2.5rem] bg-pine p-8 text-white shadow-soft md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/60">
                Puede ser para ti si...
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Sientes que necesitas hacer una pausa.",
                  "Quieres reconectar con una parte más auténtica de ti.",
                  "Te interesa mirar tu historia sin juicio.",
                  "Buscas un espacio tranquilo, humano y acompañado.",
                  "La naturaleza te ayuda a sentirte en calma.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-[1.5rem] bg-white/10 px-5 py-4"
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-pine">
                      <Check className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-7 text-white/84">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="rounded-[2.75rem] bg-[linear-gradient(145deg,rgba(245,241,232,0.98),rgba(217,228,215,0.88))] p-8 shadow-card md:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
              Este encuentro incluye todo lo necesario para que solo te enfoques en ti
            </p>
            <h2 className="mt-4 font-serif text-4xl text-pine md:text-5xl">
              Una experiencia pensada para que llegues con calma y presencia
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {includedItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.title} delay={index * 0.05}>
                  <article className="rounded-[2rem] border border-forest/10 bg-white/78 p-6 shadow-card">
                    <div className="inline-flex rounded-full bg-sage/22 p-3 text-forest">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-serif text-2xl leading-tight text-pine">
                      {item.title}
                    </h3>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-8 max-w-3xl text-base leading-8 text-pine/74">
            Nos encargamos de lo logístico para que tú puedas dedicarte a lo
            importante: reconectar contigo.
          </p>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <div className="rounded-[2.75rem] bg-pine p-8 text-white shadow-soft md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/58">
                Precio
              </p>
              <h2 className="mt-4 font-serif text-4xl text-white md:text-5xl">
                Una inversión clara para una experiencia completa
              </h2>
              <div className="mt-8 rounded-[2rem] border border-white/14 bg-white/10 p-6">
                <p className="font-serif text-3xl">El lugar donde todo empezó</p>
                <div className="mt-6 space-y-3 text-sm text-white/82">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-sand" />
                    <span>17 de mayo de 2026</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-sand" />
                    <span>Laguna la Colorada, Sogamoso, Boyacá</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mountain className="mt-0.5 h-4 w-4 text-sand" />
                    <span>
                      Valor: <strong>$70.000 COP por persona</strong>
                    </span>
                  </div>
                </div>
                <p className="mt-5 text-sm font-semibold leading-7 text-sand">
                  Incluye transporte, seguro, refrigerio y experiencia guiada.
                </p>
                <p className="mt-3 text-sm leading-7 text-white/72">
                  Cupos limitados para garantizar un espacio cercano y seguro.
                </p>
              </div>
              <LandingActions
                className="mt-8"
                href={reserveLink}
                primaryLabel="Reservar ahora por WhatsApp"
              />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-[2.75rem] bg-white/84 p-8 shadow-card md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
                Un servicio aparte dentro de la web de Nuby
              </p>
              <h2 className="mt-4 font-serif text-4xl text-pine md:text-5xl">
                Psicología clínica, psicología organizacional y experiencias vivenciales
              </h2>
              <p className="mt-6 text-base leading-8 text-pine/72">
                Esta experiencia no reemplaza los procesos terapéuticos ni el
                trabajo organizacional. Es una línea propia de acompañamiento,
                creada para abrir un espacio de bienestar, reflexión y conexión
                emocional desde la naturaleza.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Reserva directa por WhatsApp.",
                  "Acompañamiento guiado por profesional en psicología.",
                  "Naturaleza como contexto de pausa y presencia.",
                  "Encuentro diseñado para sentirse cercano y cuidado.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] bg-sage/14 px-5 py-4 text-sm leading-7 text-pine/76"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
            Galería
          </p>
          <h2 className="mt-4 font-serif text-4xl text-pine md:text-5xl">
            El paisaje, la pausa y los detalles que sostienen este encuentro
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {visibleGalleryImages.map((image, index) => (
            <Reveal
              key={image}
              delay={index * 0.05}
              className={
                index === 0 || index === 1
                  ? "relative min-h-[21rem] overflow-hidden rounded-[2rem] md:col-span-2"
                  : "relative min-h-[18rem] overflow-hidden rounded-[2rem]"
              }
            >
              <Image
                alt={`Galería del encuentro ${index + 1}`}
                className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                src={image}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="rounded-[2.75rem] bg-[linear-gradient(145deg,rgba(245,241,232,0.98),rgba(217,228,215,0.88))] p-8 shadow-soft md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
            A veces, lo que sentimos ya ha sido nombrado antes...
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl text-pine md:text-5xl">
            Palabras que acompañan la memoria, la infancia y el regreso a ti
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-pine/72">
            Una selección contemplativa entre citas verificables y frases
            inspiradas, sin forzar atribuciones literales cuando no corresponde.
          </p>
          <ReflectiveQuoteCards className="mt-10" items={reflectiveItems} />
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="rounded-[2.75rem] bg-white/86 p-8 shadow-card md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-forest/58">
            Preguntas frecuentes
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl text-pine md:text-5xl">
            Lo esencial antes de reservar
          </h2>

          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.75rem] border border-forest/10 bg-white/80 px-6 py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-2xl text-pine">
                  <span>{item.question}</span>
                  <span className="text-forest transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-pine/72">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="relative isolate overflow-hidden rounded-[2.9rem]">
          <div className="absolute inset-0">
            <Image
              alt="Montaña abierta en Boyacá"
              className="h-full w-full object-cover"
              fill
              sizes="100vw"
              src={EL_LUGAR_DONDE_TODO_EMPEZO_CTA_IMAGE}
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,43,37,0.78),rgba(20,43,37,0.5))]" />

          <div className="relative px-8 py-16 text-white md:px-12 md:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/60">
                CTA final
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
                Tal vez este sea el momento de volver a ti.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
                Si esta experiencia te está llamando, puedes escribir ahora
                mismo y reservar tu lugar con un solo mensaje.
              </p>
              <Button
                className="mt-10 min-h-14 min-w-[240px] bg-white px-7 text-base text-pine hover:bg-white/90"
                href={reserveLink}
                rel="noreferrer"
                target="_blank"
              >
                Reservar mi lugar
              </Button>
              <div className="mt-6 flex items-center gap-3 text-sm text-white/76">
                <MessageCircle className="h-4 w-4" />
                Reserva directa por WhatsApp
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-forest/10 bg-cream/95 p-3 shadow-soft backdrop-blur-xl md:hidden">
        <Button
          className="min-h-14 w-full text-base"
          href={reserveLink}
          rel="noreferrer"
          target="_blank"
        >
          Reservar mi lugar
        </Button>
      </div>
    </section>
  );
}
