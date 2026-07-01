function toNumber(value, fallback = 0) {
  if (value == null || Number.isNaN(Number(value))) return fallback;
  return Number(value);
}

export function formatCurrency(value, currency = 'GBP') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-GB').format(toNumber(value));
}

export function formatPercent(value, fractionDigits = 2) {
  return `${toNumber(value).toFixed(fractionDigits)}%`;
}

export function formatMultiplier(value) {
  return `${formatNumber(toNumber(value))}x`;
}

export function formatUkDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortChartDay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function calcAov(revenue, orders, currency = 'GBP') {
  if (!orders || orders <= 0) return formatCurrency(0, currency);
  return formatCurrency(Number(revenue) / Number(orders), currency);
}
