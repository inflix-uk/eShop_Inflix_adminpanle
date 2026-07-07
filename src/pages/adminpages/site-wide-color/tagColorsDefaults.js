export const DEFAULT_TAG_COLORS = {
  h1: "#111827",
  h2: "#111827",
  h3: "#1f2937",
  h4: "#1f2937",
  h5: "#374151",
  h6: "#374151",
  p: "#374151",
  span: "#374151",
  label: "#374151",
};

export const TAG_COLOR_KEYS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "label"];

export function adminDisplayTagColors(stored) {
  const src = stored && typeof stored === "object" ? stored : {};
  const out = {};
  for (const key of TAG_COLOR_KEYS) {
    const v = typeof src[key] === "string" ? src[key].trim() : "";
    out[key] = v || DEFAULT_TAG_COLORS[key];
  }
  return out;
}
