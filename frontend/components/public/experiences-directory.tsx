"use client";

import { useMemo, useState } from "react";

import { ExperienceCard } from "@/components/public/experience-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Experience, ExperienceStatus, SiteSettingsMap } from "@/lib/types";
import { sortExperiencesAscending } from "@/lib/utils";

type ExperiencesDirectoryProps = {
  experiences: Experience[];
  settings: SiteSettingsMap;
};

const filters: Array<{ label: string; value: "all" | ExperienceStatus }> = [
  { label: "Todas", value: "all" },
  { label: "Proximamente", value: "proximamente" },
  { label: "Cupos abiertos", value: "cupos_abiertos" },
  { label: "Finalizadas", value: "finalizada" },
];

export function ExperiencesDirectory({
  experiences,
  settings,
}: ExperiencesDirectoryProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | ExperienceStatus>("all");

  const visibleExperiences = useMemo(() => {
    const sorted = sortExperiencesAscending(experiences);
    if (activeFilter === "all") {
      return sorted;
    }
    return sorted.filter((experience) => experience.status === activeFilter);
  }, [activeFilter, experiences]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === filter.value
                ? "bg-forest text-white"
                : "bg-white/75 text-pine hover:bg-forest/8"
            }`}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {visibleExperiences.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {visibleExperiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              settings={settings}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay experiencias en esta categoría"
          description="Pronto habra nuevas fechas para pausar, respirar y reconectar contigo."
        />
      )}
    </div>
  );
}
