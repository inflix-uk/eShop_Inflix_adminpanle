/** Map admin parent / legacy category slugs to public URL first segment. */
const PUBLIC_PARENT_SEGMENT = {
  product: "products",
  products: "products",
  blog: "blogs",
  blogs: "blogs",
  category: "categories",
  categories: "categories",
};

function normalizeSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase();
}

/** Public storefront path shown in admin (matches website routing). */
export function buildFooterPagePublicPath(childSlug, parentSlug) {
  const child = String(childSlug || "").trim();
  if (!child) return "/";
  if (!parentSlug || !String(parentSlug).trim()) {
    return `/${child}`;
  }
  const parent = normalizeSlug(parentSlug);
  const segment = PUBLIC_PARENT_SEGMENT[parent] || parent;
  return `/${segment}/${child}`;
}

export function resolveParentPageId(raw) {
  if (raw == null || raw === "") return "";
  if (typeof raw === "object") {
    const id = raw._id || raw.id;
    return id != null ? String(id) : "";
  }
  return String(raw);
}

export function resolveParentPageSlug(raw, allPages = []) {
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && raw.slug) {
    return String(raw.slug).trim();
  }
  const id = resolveParentPageId(raw);
  if (!id) return "";
  const match = allPages.find((p) => String(p._id || p.id) === id);
  return match?.slug ? String(match.slug).trim() : "";
}
