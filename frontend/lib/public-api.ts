import type {
  BlogPost,
  ContactPayload,
  Experience,
  Service,
  SiteSetting,
  Testimonial,
} from "@/lib/types";
import { requireApiBaseUrl } from "@/lib/api-config";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${requireApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getServices() {
  return apiFetch<Service[]>("/api/services");
}

export async function getExperiences() {
  return apiFetch<Experience[]>("/api/experiences");
}

export async function getExperienceBySlug(slug: string) {
  return apiFetch<Experience>(`/api/experiences/${slug}`);
}

export async function getBlogPosts() {
  return apiFetch<BlogPost[]>("/api/blog");
}

export async function getBlogPostBySlug(slug: string) {
  return apiFetch<BlogPost>(`/api/blog/${slug}`);
}

export async function getTestimonials() {
  return apiFetch<Testimonial[]>("/api/testimonials");
}

export async function getSiteSettings() {
  return apiFetch<SiteSetting[]>("/api/site-settings");
}

export async function submitContact(payload: ContactPayload) {
  return apiFetch<{ message: string }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getHomePayload() {
  const [services, experiences, blogPosts, testimonials, siteSettings] =
    await Promise.all([
      getServices(),
      getExperiences(),
      getBlogPosts(),
      getTestimonials(),
      getSiteSettings(),
    ]);

  return { services, experiences, blogPosts, testimonials, siteSettings };
}
