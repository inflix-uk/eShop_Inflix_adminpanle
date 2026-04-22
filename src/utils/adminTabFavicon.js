import { setFavicon, clearFavicon } from "./faviconManager";

const apiBase = () => {
  const raw = import.meta.env.VITE_BACKEND_URL || "";
  return raw.endsWith("/") ? raw : `${raw}/`;
};

/**
 * Apply tab favicon from logo API payload (paths from /get/logo or /get/logo/public).
 * @param {{ faviconUrl?: string | null }} | null | undefined data
 */
export function applyAdminTabFaviconFromLogoData(data) {
  const path = data?.faviconUrl;
  if (!path || !String(path).trim()) {
    clearFavicon();
    return;
  }
  setFavicon(String(path).trim());
}

export async function fetchAndApplyAdminTabFavicon() {
  if (!import.meta.env.VITE_BACKEND_URL) return;
  try {
    const r = await fetch(`${apiBase()}get/logo/public`, { cache: "no-store" });
    const json = await r.json();
    if (json?.success && json?.data?.faviconUrl) {
      applyAdminTabFaviconFromLogoData(json.data);
    } else {
      clearFavicon();
    }
  } catch {
    /* ignore */
  }
}
