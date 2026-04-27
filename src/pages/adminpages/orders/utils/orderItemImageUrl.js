/**
 * Build absolute image URL for order cart line items (admin + storefront cart shapes).
 * @param {string} rawBackendUrl - e.g. import.meta.env.VITE_BACKEND_URL (with or without trailing slash)
 * @returns {string} empty string when nothing usable is present
 */
function normalizeOrigin(rawBackendUrl) {
  return String(rawBackendUrl || "").replace(/\/+$/, "");
}

function absoluteFromOrigin(origin, pathOrUrl) {
  if (pathOrUrl == null) return "";
  const p = String(pathOrUrl).trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const base = normalizeOrigin(origin);
  if (!base) return p.startsWith("/") ? p : `/${p}`;
  let segment = p.startsWith("/") ? p : `/${p}`;
  // API/Blob often stores pathname as "products/..." while Express serves files from ./uploads
  if (!segment.toLowerCase().startsWith("/uploads/") && segment.startsWith("/products/")) {
    segment = `/uploads${segment}`;
  }
  return `${base}${segment}`;
}

/**
 * @param {Record<string, unknown>} item - cart line from getOrderCart or full order.cart
 * @param {string} backendUrl
 * @returns {string}
 */
export function getOrderLineItemImageUrl(item, backendUrl) {
  if (!item) return "";
  const origin = normalizeOrigin(backendUrl);

  const isTradeIn = item.isTradeIn === true;
  if (isTradeIn && item.tradeInData?.deviceImage) {
    return absoluteFromOrigin(origin, item.tradeInData.deviceImage);
  }

  if (item.variantImages?.length > 0) {
    const img = item.variantImages[0];
    if (img?.url) return img.url;
    if (img?.path) return absoluteFromOrigin(origin, img.path);
  }

  if (item.galleryImages?.length > 0) {
    const img = item.galleryImages[0];
    if (img?.url) return img.url;
    if (img?.path) return absoluteFromOrigin(origin, img.path);
  }

  if (item.productthumbnail) {
    const t = item.productthumbnail;
    if (typeof t === "string") {
      const s = t.trim();
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://")) return s;
      if (s.startsWith("/")) return absoluteFromOrigin(origin, s);
      return absoluteFromOrigin(origin, `uploads/products/${s}`);
    }
    if (t.url) return t.url;
    if (t.path) return absoluteFromOrigin(origin, t.path);
  }

  if (item.metaImage?.url) return item.metaImage.url;
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
