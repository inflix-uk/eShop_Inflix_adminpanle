/**
 * CMS favicon — removes stale link nodes, applies cache-bust, persists for pre-hydration script.
 */

const STORAGE_KEY = "favicon";

function backendOrigin() {
  const raw = import.meta.env.VITE_BACKEND_URL || "";
  return raw.replace(/\/$/, "");
}

/**
 * Resolve CMS path or absolute URL to absolute href (for link href).
 * @param {string} url
 * @returns {string}
 */
export function toAbsoluteFaviconUrl(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base = backendOrigin();
  if (!base) return u.startsWith("/") ? u : `/${u}`;
  const p = u.startsWith("/") ? u : `/${u}`;
  return `${base}${p}`;
}

function removeAllFaviconLinks() {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll(
      'link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]'
    )
    .forEach((el) => el.remove());
}

/** Remove all favicon link tags and clear persisted href. */
export function clearFavicon() {
  if (typeof document === "undefined") return;
  removeAllFaviconLinks();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Apply favicon: strip old nodes, add icon + shortcut + apple-touch, persist busted URL.
 * @param {string} url — relative CMS path or absolute (e.g. blob URL)
 */
export function setFavicon(url) {
  if (typeof document === "undefined") return;
  if (!url || !String(url).trim()) {
    clearFavicon();
    return;
  }

  const absolute = toAbsoluteFaviconUrl(String(url).trim());
  if (!absolute) {
    clearFavicon();
    return;
  }

  const sep = absolute.includes("?") ? "&" : "?";
  const finalUrl = `${absolute}${sep}v=${Date.now()}`;

  removeAllFaviconLinks();

  const basePath = absolute.split("?")[0].toLowerCase();
  const iconType = basePath.endsWith(".ico") ? "image/x-icon" : "image/png";
  const appleType = "image/png";

  const rels = [
    ["icon", iconType],
    ["shortcut icon", iconType],
    ["apple-touch-icon", appleType],
  ];

  for (const [rel, mime] of rels) {
    const link = document.createElement("link");
    link.rel = rel;
    link.type = mime;
    link.href = finalUrl;
    document.head.appendChild(link);
  }

  try {
    localStorage.setItem(STORAGE_KEY, finalUrl);
  } catch {
    /* private mode / quota */
  }
}
