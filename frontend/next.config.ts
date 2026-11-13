import type { NextConfig } from "next";

const apiUrlValue =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

const remotePatterns: RemotePattern[] = [
  // Imágenes subidas desde el panel (Vercel Blob, almacenamiento público).
  {
    protocol: "https",
    hostname: "*.public.blob.vercel-storage.com",
    pathname: "/**",
  },
];

if (apiUrlValue) {
  // Imágenes servidas por la propia API (subidas locales en desarrollo).
  remotePatterns.push({
    protocol: new URL(apiUrlValue).protocol.replace(":", "") as "http" | "https",
    hostname: new URL(apiUrlValue).hostname,
    port: new URL(apiUrlValue).port,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
