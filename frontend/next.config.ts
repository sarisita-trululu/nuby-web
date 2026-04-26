import type { NextConfig } from "next";

const productionApiUrl = "https://web-production-9b25b.up.railway.app";
const apiUrlValue =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : productionApiUrl);

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
