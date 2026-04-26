import type { NextConfig } from "next";

const apiUrlValue =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : null);

const remotePatterns = apiUrlValue
  ? [
      {
        protocol: new URL(apiUrlValue).protocol.replace(":", "") as "http" | "https",
        hostname: new URL(apiUrlValue).hostname,
        port: new URL(apiUrlValue).port,
        pathname: "/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns,
  },
};

export default nextConfig;
