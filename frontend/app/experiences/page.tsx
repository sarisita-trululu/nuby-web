import { ExperiencesDirectory } from "@/components/public/experiences-directory";
import { PublicShell } from "@/components/public/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { withFeaturedExperienceFallback } from "@/lib/experience-landings";
import { getExperiences, getSiteSettings } from "@/lib/public-api";
import { buildSettingsMap } from "@/lib/utils";

export const metadata = {
  title: "Experiencias | Nuby Arango Pérez",
};

export default async function ExperiencesPage() {
  const [experiences, siteSettings] = await Promise.all([
    getExperiences().catch(() => []),
    getSiteSettings().catch(() => []),
  ]);
  const settingsMap = buildSettingsMap(siteSettings);
  const visibleExperiences = withFeaturedExperienceFallback(experiences);

  return (
    <PublicShell settings={settingsMap}>
      <section className="page-section">
        <Reveal>
          <SectionHeading
            eyebrow="Experiencias"
            title="Una pausa viva en la montaña"
            description="Encuentros para respirar, sentir el cuerpo con más presencia y reconectar contigo en medio de la naturaleza."
          />
        </Reveal>
        <div className="mt-10">
          <ExperiencesDirectory
            experiences={visibleExperiences}
            settings={settingsMap}
          />
        </div>
      </section>
    </PublicShell>
  );
}
