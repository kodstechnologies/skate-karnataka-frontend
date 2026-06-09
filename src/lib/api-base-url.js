const DEFAULT_PRODUCTION_API_ORIGIN =
  "https://api.karnatakarollerskatingassociation.com";

/** Vite inlines VITE_* at build time; fallback when the deploy secret omits it. */
export const resolveApiBaseUrl = () => {
  const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname.startsWith("admin.")) {
      return `${protocol}//api.${hostname.slice("admin.".length)}`;
    }
  }

  return DEFAULT_PRODUCTION_API_ORIGIN;
};
