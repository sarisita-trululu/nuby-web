"use client";

import axios from "axios";

import { requireApiBaseUrl } from "@/lib/api-config";
import type {
  AuthUser,
  BlogPayload,
  BlogPost,
  ContactMessage,
  ContactUpdatePayload,
  Experience,
  ExperiencePayload,
  LoginPayload,
  LoginResponse,
  Service,
  ServicePayload,
  SiteSetting,
  SiteSettingPayload,
  Testimonial,
  TestimonialPayload,
} from "@/lib/types";

function client(token?: string) {
  return axios.create({
    baseURL: requireApiBaseUrl(),
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}

export async function loginAdmin(payload: LoginPayload) {
  const response = await client().post<LoginResponse>("/api/auth/login", payload);
  return response.data;
}

export async function getAdminMe(token: string) {
  const response = await client(token).get<AuthUser>("/api/admin/me");
  return response.data;
}

export async function listAdminExperiences(token: string) {
  const response = await client(token).get<Experience[]>("/api/admin/experiences");
  return response.data;
}

export async function createExperience(token: string, payload: ExperiencePayload) {
  const response = await client(token).post<Experience>("/api/admin/experiences", payload);
  return response.data;
}

export async function updateExperience(
  token: string,
  id: number,
  payload: Partial<ExperiencePayload>,
) {
  const response = await client(token).put<Experience>(`/api/admin/experiences/${id}`, payload);
  return response.data;
}

export async function deleteExperience(token: string, id: number) {
  await client(token).delete(`/api/admin/experiences/${id}`);
}

export async function listAdminBlog(token: string) {
  const response = await client(token).get<BlogPost[]>("/api/admin/blog");
  return response.data;
}

export async function createBlogPost(token: string, payload: BlogPayload) {
  const response = await client(token).post<BlogPost>("/api/admin/blog", payload);
  return response.data;
}

export async function updateBlogPost(token: string, id: number, payload: Partial<BlogPayload>) {
  const response = await client(token).put<BlogPost>(`/api/admin/blog/${id}`, payload);
  return response.data;
}

export async function deleteBlogPost(token: string, id: number) {
  await client(token).delete(`/api/admin/blog/${id}`);
}

export async function listAdminServices(token: string) {
  const response = await client(token).get<Service[]>("/api/admin/services");
  return response.data;
}

export async function createService(token: string, payload: ServicePayload) {
  const response = await client(token).post<Service>("/api/admin/services", payload);
  return response.data;
}

export async function updateService(token: string, id: number, payload: Partial<ServicePayload>) {
  const response = await client(token).put<Service>(`/api/admin/services/${id}`, payload);
  return response.data;
}

export async function deleteService(token: string, id: number) {
  await client(token).delete(`/api/admin/services/${id}`);
}

export async function listContactMessages(token: string) {
  const response = await client(token).get<ContactMessage[]>("/api/admin/contact-messages");
  return response.data;
}

export async function updateContactMessage(
  token: string,
  id: number,
  payload: ContactUpdatePayload,
) {
  const response = await client(token).put<ContactMessage>(
    `/api/admin/contact-messages/${id}`,
    payload,
  );
  return response.data;
}

export async function listSiteSettings(token: string) {
  const response = await client(token).get<SiteSetting[]>("/api/admin/site-settings");
  return response.data;
}

export async function createSiteSetting(token: string, payload: SiteSettingPayload) {
  const response = await client(token).post<SiteSetting>("/api/admin/site-settings", payload);
  return response.data;
}

export async function updateSiteSetting(
  token: string,
  id: number,
  payload: Partial<SiteSettingPayload>,
) {
  const response = await client(token).put<SiteSetting>(
    `/api/admin/site-settings/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteSiteSetting(token: string, id: number) {
  await client(token).delete(`/api/admin/site-settings/${id}`);
}

export async function listAdminTestimonials(token: string) {
  const response = await client(token).get<Testimonial[]>("/api/admin/testimonials");
  return response.data;
}

export async function createTestimonial(token: string, payload: TestimonialPayload) {
  const response = await client(token).post<Testimonial>("/api/admin/testimonials", payload);
  return response.data;
}

export async function updateTestimonial(
  token: string,
  id: number,
  payload: Partial<TestimonialPayload>,
) {
  const response = await client(token).put<Testimonial>(
    `/api/admin/testimonials/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteTestimonial(token: string, id: number) {
  await client(token).delete(`/api/admin/testimonials/${id}`);
}

export async function uploadImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await client(token).post<{ filename: string; url: string }>(
    "/api/admin/uploads",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}
