/** Default booking package card theme (PSM / podcast studio). */
export const DEFAULT_BOOKING_MODULE_UI = {
  serviceCardBgColor: "#0c0c0c",
  buttonBgColor: "#c2fc12",
  buttonTextColor: "#050505",
  listTextColor: "#9ca3af",
  headingColor: "#f5f0e8",
  subheadingColor: "#9ca3af",
  descriptionColor: "#9ca3af",
};

const KEYS = Object.keys(DEFAULT_BOOKING_MODULE_UI);

function isHex6(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(value || "").trim());
}

function resolveField(raw, key) {
  const trimmed = String(raw ?? "").trim();
  if (trimmed && isHex6(trimmed)) return trimmed.toLowerCase();
  return DEFAULT_BOOKING_MODULE_UI[key];
}

export function adminDisplayBookingModuleUi(stored) {
  const src = stored && typeof stored === "object" ? stored : {};
  const out = {};
  for (const key of KEYS) {
    out[key] = resolveField(src[key], key);
  }
  return out;
}

/** @deprecated use adminDisplayBookingModuleUi */
export const DEFAULT_BOOKING_SERVICE_CARD_BG =
  DEFAULT_BOOKING_MODULE_UI.serviceCardBgColor;

export function adminDisplayBookingServiceCardBg(stored) {
  return resolveField(stored, "serviceCardBgColor");
}
