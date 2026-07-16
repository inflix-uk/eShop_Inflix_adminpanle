import { formatCurrency, formatNumber, formatPercent, formatUkDate } from './analyticsFormatters';

export { formatCurrency, formatNumber, formatPercent, formatUkDate };

export function formatRoas(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(2)}x`;
}

export function formatCpa(value, currency = 'GBP') {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return formatCurrency(value, currency);
}

export function formatConvRate(value) {
  if (value == null || Number.isNaN(Number(value))) return 'N/A';
  return formatPercent(value, 1);
}

export function consentLabel(consent) {
  if (!consent) return 'Unknown';
  const analytics = Boolean(consent.analytics);
  const marketing = Boolean(consent.marketing);
  if (analytics && marketing) return 'Analytics + Marketing';
  if (analytics) return 'Analytics only';
  if (marketing) return 'Marketing only';
  return 'Rejected';
}

export function displayOrDash(value) {
  if (value == null || value === '') return '—';
  return value;
}
