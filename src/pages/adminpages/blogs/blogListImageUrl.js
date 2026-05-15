/**
 * Card image URL for merged blog lists (legacy Blog + NewBlog from get/blog).
 * Legacy posts use thumbnailImage; new CMS posts use featuredImage / bannerImage
 * and may already be absolute (blob/CDN).
 */
export function blogListCardImageSrc(apiBaseUrl, post) {
  const raw =
    post?.thumbnailImage || post?.featuredImage || post?.bannerImage || "";
  const path = String(raw).trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = String(apiBaseUrl || "").replace(/\/+$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}
