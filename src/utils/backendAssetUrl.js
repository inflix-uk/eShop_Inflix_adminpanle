const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Build absolute URL for a logo/favicon path returned by the API.
 */
export function resolveBackendAssetUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }
  const baseUrl = BACKEND_URL?.endsWith("/")
    ? BACKEND_URL.slice(0, -1)
    : BACKEND_URL;
  let path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  if (!path.startsWith("/uploads/")) {
    if (path.startsWith("/logo/") || path.startsWith("/favicon/")) {
      path = `/uploads${path}`;
    } else if (!path.startsWith("/uploads/logo/")) {
      if (!path.startsWith("/uploads/")) {
        path = `/uploads${path}`;
      }
    }
  }

  return `${baseUrl}${path}`;
}

/** Bust browser cache when the file path is stable but contents change (e.g. zextons-favicon.png). */
export function withCacheBust(url, version) {
  if (!url || version == null || version === "") return url || "";
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(String(version))}`;
}
