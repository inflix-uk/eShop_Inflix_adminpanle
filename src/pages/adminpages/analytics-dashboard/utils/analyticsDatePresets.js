import { ANALYTICS_TIMEZONE } from '../constants/analyticsConstants';

/**
 * Current calendar date in UK (YYYY-MM-DD). No UTC conversion — plain calendar string for the API.
 */
export function getUkTodayYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ANALYTICS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function ymdFromParts(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Add calendar days in UK timezone (avoids DST edge cases by anchoring at UK noon).
 */
export function addUkCalendarDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return ymdFromParts(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, anchor.getUTCDate());
}

/** ISO instant → UK calendar YYYY-MM-DD */
export function trackingStartedToYmd(isoString) {
  if (!isoString) return null;
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: ANALYTICS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoString));
  return formatted || null;
}

/**
 * Map toolbar preset to plain YYYY-MM-DD start/end (UK calendar days).
 * @param {string} presetId
 * @param {string|null|undefined} trackingStartedAtIso
 */
export function resolvePresetDateRange(presetId, trackingStartedAtIso) {
  const today = getUkTodayYmd();
  const yesterday = addUkCalendarDays(today, -1);

  switch (presetId) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'yesterday':
      return { startDate: yesterday, endDate: yesterday };
    case 'last7':
      return { startDate: addUkCalendarDays(today, -6), endDate: today };
    case 'last30':
      return { startDate: addUkCalendarDays(today, -29), endDate: today };
    case 'sinceTracking': {
      const trackingYmd = trackingStartedToYmd(trackingStartedAtIso);
      if (trackingYmd) {
        return { startDate: trackingYmd, endDate: today };
      }
      return { startDate: addUkCalendarDays(today, -29), endDate: today };
    }
    default:
      return { startDate: addUkCalendarDays(today, -29), endDate: today };
  }
}

export function isValidYmd(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
