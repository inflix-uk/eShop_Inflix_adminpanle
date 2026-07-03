/** Default booking service card background when no CMS value is set. */
export const DEFAULT_BOOKING_SERVICE_CARD_BG = "#ffffff";

export function adminDisplayBookingServiceCardBg(stored) {
  const v = typeof stored === "string" ? stored.trim() : "";
  if (!v) return DEFAULT_BOOKING_SERVICE_CARD_BG;
  return v;
}
