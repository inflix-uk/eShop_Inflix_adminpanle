/**
 * Build absolute image URL for order cart line items (admin + storefront cart shapes).
 * Prefer `lineImageUrl` from the API when present (server-resolved Blob / Spaces / disk).
 * @param {string} rawBackendUrl - e.g. import.meta.env.VITE_BACKEND_URL (with or without trailing slash)
 * @returns {string} empty string when nothing usable is present
 *
 * Fallback: Vercel Blob pathname-only keys need `VITE_BLOB_PUBLIC_BASE_URL` if API did not attach `lineImageUrl`.
 */
function normalizeOrigin(rawBackendUrl) {
  return String(rawBackendUrl || "").replace(/\/+$/, "");
}

function getBlobPublicBase() {
  return String(
    import.meta.env.VITE_BLOB_PUBLIC_BASE_URL ||
      import.meta.env.VITE_VERCEL_BLOB_PUBLIC_BASE_URL ||
      ""
  ).replace(/\/+$/, "");
}

function isVercelBlobHttpUrl(p) {
  const s = String(p).toLowerCase();
  return s.includes("blob.vercel-storage.com") || s.includes("public.blob.vercel-storage.com");
}

/** Blob object pathname (not disk uploads/): products/…, blogs/…, or aroma/products/…. */
function looksLikeBlobPathname(p) {
  const s = String(p || "").replace(/^\/+/, "").toLowerCase();
  if (!s || s.startsWith("uploads/")) return false;
  return /^(?:[a-z0-9_-]+\/)?(products|blogs|banners)\//.test(s);
}

function absoluteFromOrigin(origin, pathOrUrl) {
  if (pathOrUrl == null) return "";
  const p = String(pathOrUrl).trim();
  if (!p || p === "undefined" || p === "null") return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("//")) {
    const base = normalizeOrigin(origin);
    const proto = base.startsWith("https") ? "https:" : "http:";
    return `${proto}${p}`;
  }
  const blobBase = getBlobPublicBase();
  if (blobBase && looksLikeBlobPathname(p)) {
    return `${blobBase}/${p.replace(/^\/+/, "")}`;
  }
  const base = normalizeOrigin(origin);
  if (!base) return p.startsWith("/") ? p : `/${p}`;
  let segment = p.startsWith("/") ? p : `/${p}`;
  // API/Blob often stores pathname as "products/..." while Express serves files from ./uploads
  if (!segment.toLowerCase().startsWith("/uploads/") && segment.startsWith("/products/")) {
    segment = `/uploads${segment}`;
  }
  return `${base}${segment}`;
}

/** First usable URL from a variant/gallery slot (object or plain string). */
function resolveSlot(origin, raw) {
  if (raw == null) return "";
  if (typeof raw === "string") {
    return absoluteFromOrigin(origin, raw);
  }
  if (typeof raw === "object") {
    const urlStr = raw.url != null ? String(raw.url).trim() : "";
    const pathStr = raw.path != null ? String(raw.path).trim() : "";
    if (urlStr && isVercelBlobHttpUrl(urlStr)) return urlStr;
    if (pathStr && isVercelBlobHttpUrl(pathStr)) return pathStr;
    if (urlStr) {
      const u = absoluteFromOrigin(origin, raw.url);
      if (u) return u;
    }
    if (pathStr) {
      return absoluteFromOrigin(origin, raw.path);
    }
  }
  return "";
}

/**
 * @param {Record<string, unknown>} item - cart line from getOrderCart or full order.cart
 * @param {string} backendUrl
 * @returns {string}
 */
export function getOrderLineItemImageUrl(item, backendUrl) {
  if (!item) return "";
  if (item.lineImageUrl != null) {
    const pre = String(item.lineImageUrl).trim();
    if (pre) return pre;
  }
  const origin = normalizeOrigin(backendUrl);

  const isTradeIn = item.isTradeIn === true;
  if (isTradeIn && item.tradeInData?.deviceImage) {
    return absoluteFromOrigin(origin, item.tradeInData.deviceImage);
  }

  if (item.variantImages?.length > 0) {
    const u = resolveSlot(origin, item.variantImages[0]);
    if (u) return u;
  }

  if (item.galleryImages?.length > 0) {
    const u = resolveSlot(origin, item.galleryImages[0]);
    if (u) return u;
  }

  if (item.productthumbnail) {
    const t = item.productthumbnail;
    if (typeof t === "string") {
      const s = t.trim();
      if (!s) return "";
      if (isVercelBlobHttpUrl(s)) return s;
      if (looksLikeBlobPathname(s) || s.includes("/")) {
        return absoluteFromOrigin(origin, s.startsWith("/") ? s : s);
      }
      return absoluteFromOrigin(origin, `uploads/products/${s}`);
    }
    if (t.url) {
      const u = absoluteFromOrigin(origin, t.url);
      if (u) return u;
    }
    if (t.path) return absoluteFromOrigin(origin, t.path);
  }

  if (item.metaImage?.url) {
    const u = absoluteFromOrigin(origin, item.metaImage.url);
    if (u) return u;
  }
  if (item.metaImage?.path) {
    return absoluteFromOrigin(origin, item.metaImage.path);
  }

  if (item.image) {
    return absoluteFromOrigin(origin, item.image);
  }

  if (item.productImage) {
    return absoluteFromOrigin(origin, item.productImage);
  }

  return "";
}

export default getOrderLineItemImageUrl;
