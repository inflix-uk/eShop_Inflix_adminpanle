import { COLOR_PICKER_FALLBACK } from "./bodyBackgroundDefaults";

export const normalizeHex = (value) => {
  const v = (value || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
};

export const hexForColorInput = (value) => normalizeHex(value) ?? COLOR_PICKER_FALLBACK;
