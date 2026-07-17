/** @typedef {'minutes' | 'hours'} DurationUnit */

export function normalizeDurationUnit(unit) {
  return unit === 'hours' ? 'hours' : 'minutes';
}

/** Format a canonical minute value for lists/UI using saved display unit. */
export function formatDurationLabel(durationMinutes, displayUnit = 'minutes', { short = true } = {}) {
  const minutes = Number(durationMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) return '—';

  const unit = normalizeDurationUnit(displayUnit);
  if (unit === 'hours') {
    const hours = minutes / 60;
    const value = Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 100) / 100);
    if (short) return `${value} hr`;
    return `${value} ${Number(hours) === 1 ? 'hour' : 'hours'}`;
  }

  if (short) return `${minutes} min`;
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

/** Convert canonical minutes → display number for the selected unit. */
export function minutesToDisplayValue(minutes, unit) {
  const m = Number(minutes);
  if (!Number.isFinite(m)) return 0;
  if (normalizeDurationUnit(unit) === 'hours') {
    const hours = m / 60;
    return Number.isInteger(hours) ? hours : Math.round(hours * 100) / 100;
  }
  return m;
}

/** Convert display number + unit → canonical minutes. */
export function displayValueToMinutes(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (normalizeDurationUnit(unit) === 'hours') {
    return Math.round(n * 60);
  }
  return Math.round(n);
}

/** Convert canonical hours (may be fractional) → display number. */
export function hoursToDisplayValue(hours, unit) {
  const h = Number(hours);
  if (!Number.isFinite(h)) return 0;
  if (normalizeDurationUnit(unit) === 'minutes') {
    return Math.round(h * 60);
  }
  return Number.isInteger(h) ? h : Math.round(h * 100) / 100;
}

/** Convert display number + unit → canonical hours. */
export function displayValueToHours(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (normalizeDurationUnit(unit) === 'minutes') {
    return n / 60;
  }
  return n;
}

export function UnitToggle({ value, onChange, disabled }) {
  const unit = normalizeDurationUnit(value);
  return (
    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('minutes')}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          unit === 'minutes'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } disabled:opacity-50`}
      >
        Min
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('hours')}
        className={`px-3 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
          unit === 'hours'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } disabled:opacity-50`}
      >
        Hour
      </button>
    </div>
  );
}
