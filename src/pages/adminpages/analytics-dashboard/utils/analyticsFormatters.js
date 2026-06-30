import { UNAVAILABLE_LABEL } from '../constants/analyticsConstants';

export function formatCurrency(value, currency = 'GBP') {
  if (value == null || Number.isNaN(Number(value))) return UNAVAILABLE_LABEL;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return UNAVAILABLE_LABEL;
  return new Intl.NumberFormat('en-GB').format(Number(value));
}

export function formatPercent(value, fractionDigits = 2) {
  if (value == null || Number.isNaN(Number(value))) return UNAVAILABLE_LABEL;
  return `${Number(value).toFixed(fractionDigits)}%`;
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
