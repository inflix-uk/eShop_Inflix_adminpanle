/** Keep in sync with backend `typographyConstants.js` + Next `app/lib/fonts.ts`. */
export const ALLOWED_FONTS = ["Inter", "Poppins", "Roboto", "Montserrat", "Georgia"];

export const ALLOWED_WEIGHTS = [400, 500, 600, 700];

export const ALLOWED_STYLES = [
  { value: "normal", label: "Normal" },
  { value: "italic", label: "Italic" },
];

export const DEFAULT_TYPOGRAPHY = {
  h1: { font: "Poppins", weight: 600, style: "normal" },
  h2: { font: "Georgia", weight: 400, style: "italic" },
  h3: { font: "Roboto", weight: 500, style: "normal" },
  p: { font: "Roboto", weight: 400, style: "normal" },
};
