const LOCAL_API_URL = "http://localhost:8000";

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  if (process.env.NODE_ENV === "development") {
    return LOCAL_API_URL;
  }

  return null;
}

export function requireApiBaseUrl() {
  const apiUrl = getApiBaseUrl();

  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL no esta configurada en produccion. Configura la URL real del backend FastAPI en Vercel.",
    );
  }

  return apiUrl;
}
