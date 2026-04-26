import { BlogCard } from "@/components/public/blog-card";
import { PublicShell } from "@/components/public/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBlogPosts, getSiteSettings } from "@/lib/public-api";
import { buildSettingsMap } from "@/lib/utils";

export const metadata = {
  title: "Blog | Nuby Arango Pérez",
};

export default async function BlogPage() {
  const [posts, siteSettings] = await Promise.all([
    getBlogPosts().catch(() => []),
    getSiteSettings().catch(() => []),
  ]);
  const settingsMap = buildSettingsMap(siteSettings);

  return (
    <PublicShell settings={settingsMap}>
      <section className="page-section">
        <Reveal>
          <SectionHeading
            eyebrow="Blog"
            title="Reflexiones y recursos para tu bienestar"
            description="Lecturas pensadas para acompañarte con claridad, calma y herramientas útiles para tu vida cotidiana."
          />
        </Reveal>
        <div className="mt-10">
          {posts.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal key={post.id} delay={index * 0.06}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aún no hay publicaciones visibles"
              description="Cuando Nuby publique nuevos contenidos, aparecerán aquí para leerse con calma."
            />
          )}
        </div>
      </section>
    </PublicShell>
  );
}
