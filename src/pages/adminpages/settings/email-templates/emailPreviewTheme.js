/**
 * Maps Site theme (same API as Site wide color) to email-style colors + typography
 * so admin previews match transactional emails (`emailBranding.js`).
 */
import {
  DEFAULT_TYPOGRAPHY,
  ALLOWED_FONTS,
  ALLOWED_WEIGHTS,
} from "../../site-wide-color/typographyDefaults";

const DEFAULT_PRIMARY = "#25af60";
const DEFAULT_SECONDARY = "#0e231c";

function normalizeTypography(raw) {
  const base = DEFAULT_TYPOGRAPHY;
  if (!raw || typeof raw !== "object") {
    return {
      h1: { ...base.h1 },
      h2: { ...base.h2 },
      h3: { ...base.h3 },
      p: { ...base.p },
    };
  }
  const pick = (key) => {
    const r = raw[key] || {};
    const rf = typeof r.font === "string" ? r.font.trim() : "";
    const font =
      ALLOWED_FONTS.find((f) => f.toLowerCase() === rf.toLowerCase()) ?? base[key].font;
    return {
      font,
      weight: ALLOWED_WEIGHTS.includes(Number(r.weight)) ? Number(r.weight) : base[key].weight,
      style: r.style === "italic" ? "italic" : "normal",
    };
  };
  return {
    h1: pick("h1"),
    h2: pick("h2"),
    h3: pick("h3"),
    p: pick("p"),
  };
}

function normalizeHex(input, fallback) {
  if (typeof input !== "string") return fallback;
  const v = input.trim();
  if (!v || v.toLowerCase() === "transparent") return fallback;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

function hexToRgb(hex) {
  const h = normalizeHex(hex, DEFAULT_PRIMARY).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function mixRgb(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgbToCss(rgb) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function rgbToHex(rgb) {
  const h = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

function mixHex(a, b, t) {
  return rgbToCss(mixRgb(hexToRgb(a), hexToRgb(b), t));
}

function fontFamilyStack(level) {
  const name = level && level.font ? String(level.font) : "Roboto";
  if (name === "Georgia") {
    return "Georgia, 'Times New Roman', Times, serif";
  }
  return `'${name.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}', Arial, Helvetica, sans-serif`;
}

function typographyLevelToInlineCss(level) {
  return `font-family: ${fontFamilyStack(level)}; font-weight: ${level.weight}; font-style: ${level.style};`;
}

function escapeHtmlAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildGoogleFontsCss2Href(typography) {
  const levels = [typography.h1, typography.h2, typography.h3, typography.p];
  const byFont = new Map();

  for (const lev of levels) {
    if (!lev || lev.font === "Georgia") continue;
    if (!byFont.has(lev.font)) {
      byFont.set(lev.font, { normal: new Set(), italic: new Set() });
    }
    const g = byFont.get(lev.font);
    if (lev.style === "italic") g.italic.add(lev.weight);
    else g.normal.add(lev.weight);
  }

  if (byFont.size === 0) return "";

  const families = [];
  for (const [fontName, { normal, italic }] of byFont) {
    const enc = encodeURIComponent(fontName).replace(/%20/g, "+");
    const hasItalic = italic.size > 0;
    if (!hasItalic) {
      const weights = [...normal].sort((a, b) => a - b);
      if (weights.length === 0) continue;
      families.push(`${enc}:wght@${weights.join(";")}`);
    } else {
      const pairs = [];
      for (const w of [...normal].sort((a, b) => a - b)) pairs.push(`0,${w}`);
      for (const w of [...italic].sort((a, b) => a - b)) pairs.push(`1,${w}`);
      const uniq = [...new Set(pairs)];
      families.push(`${enc}:ital,wght@${uniq.join(";")}`);
    }
  }

  if (families.length === 0) return "";

  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

function googleFontsLinkTag(href) {
  if (!href) return "";
  return `<link href="${escapeHtmlAttr(href)}" rel="stylesheet" />`;
}

/**
 * @param {{ primaryColor?: string, secondaryColor?: string, typography?: object } | null | undefined} siteTheme from `getSiteTheme()`
 */
export function computeEmailPreviewBranding(siteTheme) {
  const primaryHex = normalizeHex(String(siteTheme?.primaryColor || ""), DEFAULT_PRIMARY);
  const secondaryHex = normalizeHex(String(siteTheme?.secondaryColor || ""), DEFAULT_SECONDARY);

  const typography = normalizeTypography(siteTheme?.typography);
  const googleFontsHref = buildGoogleFontsCss2Href(typography);

  const primaryRgb = hexToRgb(primaryHex);
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  const cream = { r: 255, g: 250, b: 233 };

  const heroHeaderBg = rgbToCss(mixRgb(primaryRgb, black, 0.78));
  const footerBg = rgbToCss(mixRgb(primaryRgb, black, 0.75));
  const heroHighlightRgb = rgbToCss(mixRgb(primaryRgb, white, 0.72));
  const accentRgbCss = rgbToCss(primaryRgb);
  const mintBg = rgbToCss(mixRgb(primaryRgb, white, 0.92));
  const textDarkRgb = mixRgb(primaryRgb, black, 0.55);
  const textDark = rgbToCss(textDarkRgb);
  const helpPanelBg = rgbToCss(mixRgb(mixRgb(primaryRgb, cream, 0.5), white, 0.85));
  const darkAccent = mixHex(primaryHex, "#000000", 0.15);

  /** Status email–style header: deep tint of primary (replaces fixed navy when using theme) */
  const statusHeaderBg = rgbToCss(mixRgb(primaryRgb, black, 0.42));
  const statusBorderAccent = rgbToCss(mixRgb(primaryRgb, black, 0.2));
  const tradeInTint = { r: 240, g: 253, b: 244 };
  const tradeInPanelBg = rgbToCss(mixRgb(primaryRgb, tradeInTint, 0.55));

  return {
    primaryHex,
    secondaryHex,
    heroHeaderBg,
    footerBg,
    heroHighlightRgb,
    accentRgbCss,
    accentHex: primaryHex,
    mintBg,
    textDark,
    helpPanelBg,
    tradeInPanelBg,
    darkAccent,
    statusHeaderBg,
    statusBorderAccent,
    googleFontsLinkHtml: googleFontsLinkTag(googleFontsHref),
    typo_h1: typographyLevelToInlineCss(typography.h1),
    typo_h2: typographyLevelToInlineCss(typography.h2),
    typo_h3: typographyLevelToInlineCss(typography.h3),
    typo_p: typographyLevelToInlineCss(typography.p),
    typography,
    logoUrl: "",
    logoAlt: "Store",
    storeUrl:
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        String(import.meta.env.VITE_FRONTEND_URL || "").replace(/\/+$/, "")) ||
      "",
  };
}

/**
 * Branding payload from `GET /email-branding/preview` (mirrors `getEmailBranding()` + store URL).
 * @param {object | null | undefined} api
 * @returns {ReturnType<typeof computeEmailPreviewBranding> | null}
 */
export function previewBrandingFromApi(api) {
  if (!api || typeof api !== "object" || !api.primaryHex) return null;
  const primaryHex = normalizeHex(String(api.primaryHex), DEFAULT_PRIMARY);
  const primaryRgb = hexToRgb(primaryHex);
  const black = { r: 0, g: 0, b: 0 };
  const statusBorderAccent = rgbToCss(mixRgb(primaryRgb, black, 0.2));
  const darkAccent = mixHex(primaryHex, "#000000", 0.15);
  const storeUrl =
    String(api.storeUrl || "").trim() ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      String(import.meta.env.VITE_FRONTEND_URL || "").replace(/\/+$/, "")) ||
    "https://www.";

  return {
    primaryHex,
    secondaryHex: api.secondaryHex
      ? normalizeHex(String(api.secondaryHex), DEFAULT_SECONDARY)
      : DEFAULT_SECONDARY,
    heroHeaderBg: api.heroHeaderBg,
    footerBg: api.footerBg,
    heroHighlightRgb: api.heroHighlightRgb,
    accentRgbCss: api.accentRgbCss,
    accentHex: api.accentHex || primaryHex,
    mintBg: api.mintBg,
    textDark: api.textDark,
    helpPanelBg: api.helpPanelBg,
    tradeInPanelBg: api.tradeInPanelBg || api.mintBg,
    darkAccent,
    statusHeaderBg: api.statusHeaderBg,
    statusBorderAccent,
    googleFontsLinkHtml: googleFontsLinkTag(api.googleFontsHref || ""),
    typo_h1: api.typo_h1,
    typo_h2: api.typo_h2,
    typo_h3: api.typo_h3,
    typo_p: api.typo_p,
    logoUrl: api.logoUrl || "",
    logoAlt: api.logoAlt || "Store",
    storeUrl,
    typography: null,
  };
}

/**
 * Prefer server `emailBranding` (logo + exact tints); else compute from Site theme only.
 * @param {{ siteTheme?: object, emailBranding?: object } | null} payload
 */
export function buildPreviewBranding(payload) {
  const fromApi = previewBrandingFromApi(payload?.emailBranding);
  if (fromApi) return fromApi;
  const local = computeEmailPreviewBranding(payload?.siteTheme);
  const storeUrl =
    local.storeUrl ||
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      String(import.meta.env.VITE_FRONTEND_URL || "").replace(/\/+$/, "")) ||
    "https://www.";
  return { ...local, storeUrl };
}
