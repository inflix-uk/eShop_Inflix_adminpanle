import { UNAVAILABLE_LABEL } from '../constants/analyticsConstants';
import {
  calcAov,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatShortChartDay,
} from './analyticsFormatters';

export function mapDataQuality(meta, dataQuality) {
  const visitorSessions =
    dataQuality?.visitorSessionsAvailability === 'unavailable' ||
    dataQuality?.visitorSessionsInRange == null
      ? UNAVAILABLE_LABEL
      : formatNumber(dataQuality.visitorSessionsInRange);

  const trackingStarted = meta?.trackingStartedAt
    ? new Date(meta.trackingStartedAt).toLocaleDateString('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  return {
    selectedRange: meta?.selectedRangeLabel || '—',
    trackingStarted,
    visitorSessions,
    allOrdersInRange: formatNumber(dataQuality?.allOrdersInRange ?? dataQuality?.ordersInRange ?? 0),
    revenueOrdersInRange: formatNumber(dataQuality?.revenueOrdersInRange ?? 0),
    ordersWithMarketingAttribution: formatNumber(
      dataQuality?.ordersWithMarketingAttribution ?? 0
    ),
    ordersWithoutMarketingAttribution: formatNumber(
      dataQuality?.ordersWithoutMarketingAttribution ?? 0
    ),
    ordersWithUtmSource: formatNumber(dataQuality?.ordersWithUtmSource ?? 0),
    ordersWithGclid: formatNumber(dataQuality?.ordersWithGclid ?? 0),
    ordersWithFbclid: formatNumber(dataQuality?.ordersWithFbclid ?? 0),
    ordersWithReferrer: formatNumber(dataQuality?.ordersWithReferrer ?? 0),
    rangeIncludesPreTrackingPeriod: meta?.preTrackingNote
      ? meta.preTrackingNote
      : meta?.rangeIncludesPreTrackingPeriod
        ? 'Yes'
        : 'No',
    preTrackingWarn: meta?.rangeIncludesPreTrackingPeriod === true,
    revenueMetricsNote:
      meta?.revenueMetricsNote ||
      'Revenue metrics only include Pending, Approved, Shipped, and Delivered orders.',
  };
}

export function mapKpiMetrics(kpis, meta) {
  const currency = meta?.currency || 'GBP';
  const uniqueVisitors = kpis?.uniqueVisitorsInRange ?? kpis?.visitors ?? 0;
  const sessions = kpis?.visitorSessionsInRange ?? 0;
  const trafficDenominator = meta?.trafficKpiDenominator ?? meta?.conversionRateDenominator;
  const useVisitors =
    trafficDenominator === 'visitors' ||
    trafficDenominator === 'unique_visitors' ||
    (trafficDenominator == null && uniqueVisitors > 0);

  const trafficKpi = useVisitors
    ? {
        label: 'Visitors',
        value: formatNumber(uniqueVisitors),
        tone: 'blue',
        title: 'Unique visitors (distinct visitorId) in the selected UK date range',
      }
    : {
        label: 'Sessions',
        value: formatNumber(sessions),
        tone: 'blue',
        title: 'Visitor sessions recorded in the selected UK date range',
      };

  const conversionDenominator = meta?.conversionRateDenominator;
  const conversionTitle =
    conversionDenominator === 'unique_visitors'
      ? 'Calculated from converted visitors divided by visitors'
      : conversionDenominator === 'sessions'
        ? 'Calculated from converted sessions divided by sessions'
        : sessions === 0 && uniqueVisitors === 0
          ? 'No tracked sessions in range'
          : 'Conversion rate is unavailable for the selected range';

  let conversionValue = UNAVAILABLE_LABEL;
  if (kpis?.conversionRate != null && kpis?.conversionRateAvailability === 'available') {
    conversionValue = formatPercent(kpis.conversionRate);
  } else if (sessions === 0 && uniqueVisitors === 0) {
    conversionValue = 'No sessions';
  }

  return [
    trafficKpi,
    {
      label: 'Conversion rate',
      value: conversionValue,
      tone: 'pink',
      small: true,
      title: conversionTitle,
    },
    {
      label: 'Orders',
      value: formatNumber(kpis?.orders ?? 0),
      tone: 'purple',
      title:
        'Revenue orders in range — Pending, Approved, Shipped, and Delivered with value > 0',
    },
    {
      label: 'Sales units',
      value: formatNumber(kpis?.salesUnits ?? 0),
      tone: 'green',
    },
    {
      label: 'Revenue',
      value: formatCurrency(kpis?.revenue ?? 0, currency),
      tone: 'teal',
    },
    {
      label: 'AOV',
      value: formatCurrency(kpis?.aov ?? 0, currency),
      tone: 'slate',
    },
  ];
}

export function mapRevenueBySource(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.source,
    orders: formatNumber(row.orders),
    revenue: formatCurrency(row.revenue, currency),
    aov: calcAov(row.revenue, row.orders, currency),
  }));
}

export function mapRevenueByMedium(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.medium,
    orders: formatNumber(row.orders),
    revenue: formatCurrency(row.revenue, currency),
    aov: calcAov(row.revenue, row.orders, currency),
  }));
}

export function mapRevenueByChannel(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.channel,
    orders: formatNumber(row.orders),
    revenue: formatCurrency(row.revenue, currency),
    aov: calcAov(row.revenue, row.orders, currency),
  }));
}

export function mapRevenueByCampaign(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.campaign,
    orders: formatNumber(row.orders),
    revenue: formatCurrency(row.revenue, currency),
    aov: calcAov(row.revenue, row.orders, currency),
  }));
}

export function mapCampaignPerformance(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.name,
    orders: formatNumber(row.orders),
    revenue: formatCurrency(row.revenue, currency),
    aov:
      row.aov == null
        ? UNAVAILABLE_LABEL
        : formatCurrency(row.aov, currency),
  }));
}

export function mapProductPerformance(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.name,
    orders: formatNumber(row.orders),
    unitsSold: formatNumber(row.unitsSold),
    revenue: formatCurrency(row.revenue, currency),
  }));
}

export function mapTopSellingProducts(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.name,
    sales: formatNumber(row.unitsSold),
    revenue: formatCurrency(row.revenue, currency),
  }));
}

export function mapTopRevenueProducts(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.name,
    revenue: formatCurrency(row.revenue, currency),
  }));
}

export function mapDailyOrdersRevenue(rows) {
  return (rows || []).map((row) => ({
    day: formatShortChartDay(row.date),
    date: row.date,
    orders: row.orders ?? 0,
    revenue: row.revenue ?? 0,
  }));
}

export function mapDonutSegments(segments) {
  return (segments || []).map((seg) => ({
    label: seg.label,
    value: seg.percentage ?? seg.value ?? 0,
    color: seg.color,
  }));
}
