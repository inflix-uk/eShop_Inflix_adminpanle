import {
  CHANNEL_SOURCE_LABELS,
  LIMITED_DATA_LABEL,
  TRAFFIC_SOURCE_LABELS,
} from '../constants/analyticsConstants';
import {
  calcAov,
  formatCurrency,
  formatMultiplier,
  formatNumber,
  formatPercent,
  formatShortChartDay,
} from './analyticsFormatters';

export function mapDataQuality(meta, dataQuality) {
  const visitorSessions = formatNumber(dataQuality?.visitorSessionsInRange ?? 0);

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
    ordersInRange: formatNumber(
      dataQuality?.allOrdersInRange ?? dataQuality?.ordersInRange ?? 0
    ),
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
    rangeIncludesPreTrackingPeriod: meta?.rangeIncludesPreTrackingPeriod ? 'Yes' : 'No',
    preTrackingWarn: meta?.rangeIncludesPreTrackingPeriod === true,
  };
}

function formatTrafficSourceName(source, channel) {
  if (source) {
    const key = String(source).toLowerCase();
    if (TRAFFIC_SOURCE_LABELS[key]) return TRAFFIC_SOURCE_LABELS[key];
    return source;
  }
  if (channel && CHANNEL_SOURCE_LABELS[channel]) return CHANNEL_SOURCE_LABELS[channel];
  return source || 'Unknown';
}

function formatDimensionName(value) {
  if (!value || value === '(not set)') return 'Direct';
  return formatTrafficSourceName(value, null) || value;
}

function mapEnrichedRevenueRow(row, nameKey, currency, { includeFraud = false } = {}) {
  const visitorsAvailable =
    row.visitorsAvailability === 'available' || row.visitors != null;
  const conversionAvailable =
    row.conversionRateAvailability === 'available' || row.conversionRate != null;

  const mapped = {
    name: formatDimensionName(row[nameKey]),
    visitors: visitorsAvailable
      ? formatNumber(row.visitors ?? 0)
      : LIMITED_DATA_LABEL,
    orders: formatNumber(row.orders ?? 0),
    revenue: formatCurrency(row.revenue ?? 0, currency),
    aov: calcAov(row.revenue, row.orders, currency),
    conversionRate: conversionAvailable
      ? formatPercent(row.conversionRate ?? 0)
      : LIMITED_DATA_LABEL,
  };

  if (includeFraud) {
    mapped.fraudRate = formatPercent(row.fraudRate ?? 0);
  }

  return mapped;
}

function mapZextonsExtendedRow({ name, orders, revenue }, currency, includeFraud = false) {
  const row = {
    name,
    visitors: LIMITED_DATA_LABEL,
    orders: formatNumber(orders ?? 0),
    revenue: formatCurrency(revenue ?? 0, currency),
    aov: calcAov(revenue, orders, currency),
    conversionRate: LIMITED_DATA_LABEL,
  };
  if (includeFraud) {
    row.fraudRate = LIMITED_DATA_LABEL;
  }
  return row;
}

export function mapProfitDataQuality(dataQuality) {
  const lineItemsInRange = Number(dataQuality?.lineItemsInRange ?? 0);
  const lineItemsMissingCost = Number(dataQuality?.lineItemsMissingCost ?? 0);

  return {
    show:
      dataQuality?.profitDataQualityAvailability === 'available' && lineItemsMissingCost > 0,
    lineItemsMissingCost: formatNumber(lineItemsMissingCost),
    lineItemsInRange: formatNumber(lineItemsInRange),
  };
}

export function mapZextonsKpiMetrics(kpis, meta) {
  const currency = meta?.currency || 'GBP';
  const uniqueVisitors = kpis?.uniqueVisitorsInRange ?? kpis?.visitors ?? 0;
  const sessions = kpis?.visitorSessionsInRange ?? 0;

  let conversionValue = LIMITED_DATA_LABEL;
  if (kpis?.conversionRate != null && kpis?.conversionRateAvailability === 'available') {
    conversionValue = formatPercent(kpis.conversionRate);
  } else if (sessions === 0 && uniqueVisitors === 0) {
    conversionValue = LIMITED_DATA_LABEL;
  }

  return [
    {
      label: 'Visitors',
      value: formatNumber(uniqueVisitors),
      tone: 'blue',
      title: 'Unique visitors (distinct visitorId) in the selected UK date range',
    },
    {
      label: 'Sessions',
      value: formatNumber(sessions),
      tone: 'indigo',
      title: 'Visitor sessions recorded in the selected UK date range',
    },
    {
      label: 'Orders',
      value: formatNumber(kpis?.orders ?? 0),
      tone: 'purple',
      title:
        'Revenue orders in range — Pending, Approved, Shipped, and Delivered with value > 0',
      actionHint: 'Click to view products sold',
      opensOrdersModal: true,
    },
    {
      label: 'Revenue',
      value: formatCurrency(kpis?.revenue ?? 0, currency),
      tone: 'teal',
    },
    {
      label: 'Conversion rate',
      value: conversionValue,
      tone: 'pink',
      small: true,
      title: 'Per-source conversion when visitor linkage is available',
    },
  ];
}

export function mapZextonsRevenueBySource(sourceRows, _channelRows, currency) {
  return (sourceRows || []).map((row) =>
    mapEnrichedRevenueRow(row, 'source', currency, { includeFraud: true })
  );
}

export function mapZextonsRevenueByCampaign(rows, currency) {
  return (rows || []).map((row) => mapEnrichedRevenueRow(row, 'campaign', currency));
}

export function mapZextonsRevenueByMedium(rows, currency) {
  return (rows || []).map((row) => {
    const mapped = mapEnrichedRevenueRow(row, 'medium', currency);
    // Keep analytics medium labels as stored (cpc, (direct), Email, social).
    mapped.name = row.medium || '(direct)';
    return mapped;
  });
}

export function mapTopTrafficSources(sourceRows, _channelRows, currency) {
  return (sourceRows || []).map((row) => ({
    name: row.source || 'Direct',
    orders: formatNumber(row.orders ?? 0),
    revenue: formatCurrency(row.revenue ?? 0, currency),
  }));
}

export function mapTopCampaignsSummary(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.campaign || '(unassigned)',
    orders: formatNumber(row.orders ?? 0),
    revenue: formatCurrency(row.revenue ?? 0, currency),
  }));
}

export function mapVisitorsByDevice(visitorsByDevice) {
  const devices = visitorsByDevice?.devices || [];
  const totalSessions = devices.reduce((sum, row) => sum + (row.sessions ?? 0), 0);

  const colorMap = {
    mobile: "#3b82f6",
    desktop: "#2dd4bf",
    tablet: "#a78bfa",
    unknown: "#fcd34d",
  };

  const segments = devices
    .map((row) => {
      const label = row.label || row.device || "Unknown";
      const sessions = row.sessions ?? 0;
      const deviceKey = String(row.device || label).toLowerCase();
      const value =
        totalSessions > 0 ? Math.round((sessions / totalSessions) * 1000) / 10 : 0;

      return {
        label,
        sessions,
        value,
        color: colorMap[deviceKey] || "#94a3b8",
      };
    })
    .filter((seg) => seg.sessions > 0);

  return {
    unavailable: visitorsByDevice?.availability !== 'available',
    emptyMessage: 'No visitor sessions recorded in this range.',
    totalSessions,
    segments: segments || [],
    rows: devices.map((row) => ({
      label: row.label || row.device,
      sessions: formatNumber(row.sessions ?? 0),
      visitors: formatNumber(row.visitors ?? 0),
    })),
  };
}

function formatRatioOrNa(value, availability) {
  if (availability !== 'available' || value == null) return 'N/A';
  return formatMultiplier(value);
}

function formatMarginOrNa(value, availability) {
  if (availability !== 'available' || value == null) return 'N/A';
  return formatPercent(value);
}

export function mapProfitBySource(profitBySource, currency) {
  const rows = profitBySource?.rows || [];
  return {
    unavailable: profitBySource?.availability !== 'available' || rows.length === 0,
    emptyMessage: 'No revenue orders in this range for profit breakdown.',
    rows: rows.map((row) => ({
      name: formatDimensionName(row.source),
      orders: formatNumber(row.orders ?? 0),
      revenue: formatCurrency(row.revenue ?? 0, currency),
      estCost: formatCurrency(row.cogs ?? 0, currency),
      grossProfit: formatCurrency(row.grossProfit ?? 0, currency),
      margin: formatMarginOrNa(row.margin, row.marginAvailability),
      spend: formatCurrency(row.spend ?? 0, currency),
      roas: formatRatioOrNa(row.roas, row.roasAvailability),
      poas: formatRatioOrNa(row.poas, row.poasAvailability),
      fraudAdjustedRoas: formatRatioOrNa(
        row.fraudAdjustedRoas,
        row.fraudAdjustedRoasAvailability
      ),
      fraudAdjustedPoas: formatRatioOrNa(
        row.fraudAdjustedPoas,
        row.fraudAdjustedPoasAvailability
      ),
    })),
  };
}

export function mapProfitByCampaign(profitByCampaign, currency) {
  const rows = profitByCampaign?.rows || [];
  return {
    unavailable: profitByCampaign?.availability !== 'available' || rows.length === 0,
    emptyMessage: 'No revenue orders in this range for campaign profit breakdown.',
    rows: rows.map((row) => ({
      name: formatDimensionName(row.campaign),
      orders: formatNumber(row.orders ?? 0),
      revenue: formatCurrency(row.revenue ?? 0, currency),
      estCost: formatCurrency(row.cogs ?? 0, currency),
      grossProfit: formatCurrency(row.grossProfit ?? 0, currency),
      margin: formatMarginOrNa(row.margin, row.marginAvailability),
      spend: formatCurrency(row.spend ?? 0, currency),
      roas: formatRatioOrNa(row.roas, row.roasAvailability),
      poas: formatRatioOrNa(row.poas, row.poasAvailability),
      excludedRevenue: formatCurrency(row.excludedRevenue ?? 0, currency),
      excludedProfit: formatCurrency(row.excludedProfit ?? 0, currency),
    })),
  };
}

export function mapFraudInsights(fraudInsights, currency) {
  const fi = fraudInsights || {};
  const unavailable = fi.availability !== 'available';

  return {
    unavailable,
    emptyMessage: 'No revenue orders in this range.',
    bySource: (fi.bySource || []).map((row) => ({
      name: row.source || 'Direct',
      orders: formatNumber(row.orders ?? 0),
      fraudOrders: formatNumber(row.fraudOrders ?? 0),
      fraudRate: formatPercent(row.fraudRate ?? 0),
    })),
    byCampaign: (fi.byCampaign || []).map((row) => ({
      name: row.campaign || '(unassigned)',
      orders: formatNumber(row.orders ?? 0),
      fraudOrders: formatNumber(row.fraudOrders ?? 0),
      fraudRate: formatPercent(row.fraudRate ?? 0),
    })),
    totals: {
      fraudOrders: formatNumber(fi.totals?.fraudOrders ?? 0),
      excludedRevenue: formatCurrency(fi.totals?.excludedRevenue ?? 0, currency),
      excludedProfit: formatCurrency(fi.totals?.excludedProfit ?? 0, currency),
      fraudRate: formatPercent(fi.totals?.fraudRate ?? 0),
    },
  };
}

export function mapFraudAdjustedAdvertising(advertisingPerformance, meta) {
  const ap = advertisingPerformance || {};
  const currency = meta?.currency || 'GBP';

  return {
    fraudAdjustedRoas: formatMultiplier(
      ap.fraudAdjustedRoasAvailability === 'available' ? ap.fraudAdjustedRoas : 0
    ),
    fraudAdjustedPoas: formatMultiplier(
      ap.fraudAdjustedPoasAvailability === 'available' ? ap.fraudAdjustedPoas : 0
    ),
    excludedRevenue: formatCurrency(ap.excludedRevenue ?? 0, currency),
    excludedProfit: formatCurrency(ap.excludedProfit ?? 0, currency),
  };
}

export function mapRoasVsPoas(roasVsPoas, currency = 'GBP') {
  const data = roasVsPoas || {};
  const rows = data.rows || [];
  const unavailable = data.availability !== 'available' || rows.length === 0;

  return {
    unavailable,
    emptyMessage: 'No revenue orders in this range for ROAS vs POAS.',
    subtitle:
      'Fraud-adjusted (FA) columns exclude orders flagged as marketing fraud. ROAS/POAS need ad spend; POAS also needs product Cost.',
    rows: rows.map((row) => ({
      source: row.source || 'Direct',
      revenue: formatCurrency(row.revenue ?? 0, currency),
      grossProfit: formatCurrency(row.grossProfit ?? 0, currency),
      adSpend: formatCurrency(row.adSpend ?? 0, currency),
      roas: formatRatioOrNa(row.roas, row.roasAvailability),
      poas: formatRatioOrNa(row.poas, row.poasAvailability),
      faRevenue: formatCurrency(row.faRevenue ?? 0, currency),
      faProfit: formatCurrency(row.faProfit ?? 0, currency),
      fraudAdjustedRoas: formatRatioOrNa(
        row.fraudAdjustedRoas,
        row.fraudAdjustedRoasAvailability
      ),
      fraudAdjustedPoas: formatRatioOrNa(
        row.fraudAdjustedPoas,
        row.fraudAdjustedPoasAvailability
      ),
      excludedOrders: formatNumber(row.excludedOrders ?? 0),
    })),
  };
}

export function mapTopLandingPages(topLandingPages) {
  const pages = topLandingPages?.pages || [];
  return {
    unavailable: topLandingPages?.availability !== 'available' || pages.length === 0,
    emptyMessage: 'No landing page sessions recorded in this range.',
    rows: pages.map((row) => ({
      landingPage: row.landingPage || '/',
      sessions: formatNumber(row.sessions ?? 0),
    })),
  };
}

/**
 * Campaign ROAS & CPA table — prefer dedicated campaignRoasCpa rows (spend only).
 * Falls back to campaignRoasRoi / campaignPerformance filtered by spend.
 */
export function mapCampaignRoasCpa(rows, currency) {
  const list = Array.isArray(rows) ? rows : [];

  return list
    .filter((row) => {
      const spend = Number(row.spend);
      return (
        row.spendAvailability === 'available' ||
        (Number.isFinite(spend) && spend > 0)
      );
    })
    .map((row) => {
      const spend = Number(row.spend) || 0;
      const orders = Number(row.orders) || 0;
      const revenue = Number(row.revenue) || 0;
      const roas =
        row.roas != null
          ? Number(row.roas)
          : spend > 0
            ? revenue / spend
            : 0;
      const cpa =
        row.cpa != null
          ? Number(row.cpa)
          : row.cac != null
            ? Number(row.cac)
            : spend > 0 && orders > 0
              ? spend / orders
              : 0;

      return {
        source: row.source || 'Google Ads',
        name: row.campaign || row.name || '(unnamed)',
        spend: formatCurrency(spend, currency),
        revenue: formatCurrency(revenue, currency),
        orders: formatNumber(orders),
        roas: formatMultiplier(Number.isFinite(roas) ? roas : 0),
        cpa: formatCurrency(Number.isFinite(cpa) ? cpa : 0, currency),
      };
    });
}

export function mapAdvertisingPerformanceZextons(advertisingPerformance, meta) {
  const base = mapAdvertisingPerformance(advertisingPerformance, meta);
  const ap = advertisingPerformance || {};

  return {
    ...base,
    poas: formatMultiplier(ap.poasAvailability === 'available' ? ap.poas : 0),
    costPerAcquisition: base.blendedCac,
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

  let conversionValue = formatPercent(0);
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

export function mapAdvertisingPerformance(advertisingPerformance, meta) {
  const ap = advertisingPerformance || {};
  const unavailable = ap.availability !== 'available';
  const currency = meta?.currency || 'GBP';

  return {
    unavailable,
    emptyMessage:
      'No Google Ads spend recorded for this date range. Add spend below or import a CSV.',
    note: 'Spend is stored in MarketingAdSpend (platform: google_ads). Campaign names should match order UTM campaign values.',
    totalSpend: formatCurrency(ap.totalSpend ?? 0, currency),
    attributedRevenue: formatCurrency(ap.attributedRevenue ?? 0, currency),
    blendedRoas: formatMultiplier(ap.blendedRoas),
    blendedRoi: formatPercent(ap.blendedRoi ?? 0),
    blendedCac: formatCurrency(ap.blendedCac ?? 0, currency),
    campaignCount: formatNumber(ap.campaignCount ?? 0),
  };
}

export function mapCampaignRoasRoi(rows, currency) {
  return (rows || []).map((row) => ({
    name: row.name,
    spend: formatCurrency(row.spend ?? 0, currency),
    revenue: formatCurrency(row.revenue ?? 0, currency),
    orders: formatNumber(row.orders ?? 0),
    roas: formatMultiplier(row.roasAvailability === 'available' ? row.roas : 0),
    roi: formatPercent(row.roiAvailability === 'available' ? row.roi : 0),
    cac: formatCurrency(row.cacAvailability === 'available' ? row.cac : 0, currency),
    hasSpend: row.spendAvailability === 'available',
  }));
}

export function mapEmailAnalytics(emailAnalytics, meta) {
  const ea = emailAnalytics || {};
  const unavailable = ea.availability !== 'available';
  const currency = meta?.currency || 'GBP';

  const mapRows = (rows) =>
    (rows || []).map((row) => ({
      name: row.name,
      orders: formatNumber(row.orders ?? 0),
      revenue: formatCurrency(row.revenue ?? 0, currency),
      aov: calcAov(row.revenue, row.orders, currency),
    }));

  return {
    unavailable,
    emptyMessage:
      'No email-attributed orders or newsletter signups in this range. Use utm_source/medium email or newsletter on campaign links.',
    note: 'Email orders use normalized attribution channel email. New subscribers come from the Newsletter collection.',
    orders: formatNumber(ea.orders ?? 0),
    revenue: formatCurrency(ea.revenue ?? 0, currency),
    aov: calcAov(ea.revenue, ea.orders, currency),
    newSubscribersInRange: formatNumber(ea.newSubscribersInRange ?? 0),
    bySource: mapRows(ea.bySource),
    byCampaign: mapRows(ea.byCampaign),
  };
}

export function mapInfluencerAnalytics(influencers, meta) {
  const inf = influencers || {};
  const unavailable = inf.availability !== 'available';
  const currency = meta?.currency || 'GBP';

  const mapRows = (rows) =>
    (rows || []).map((row) => ({
      name: row.name,
      orders: formatNumber(row.orders ?? 0),
      revenue: formatCurrency(row.revenue ?? 0, currency),
      aov: calcAov(row.revenue, row.orders, currency),
    }));

  return {
    unavailable,
    emptyMessage:
      'No influencer-attributed orders in this range. Tag links with utm_source=influencer or utm_medium=influencer and utm_content for the creator name.',
    note: 'Influencer grouping uses utm_content when present, otherwise utm_campaign.',
    orders: formatNumber(inf.orders ?? 0),
    revenue: formatCurrency(inf.revenue ?? 0, currency),
    aov: calcAov(inf.revenue, inf.orders, currency),
    topInfluencers: mapRows(inf.topInfluencers),
    topInfluencerCampaigns: mapRows(inf.topInfluencerCampaigns),
  };
}

export function mapOfflineOrders(offlineOrders, meta) {
  const off = offlineOrders || {};
  const unavailable = off.availability !== 'available';
  const currency = meta?.currency || 'GBP';

  const formatUkDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      timeZone: meta?.timezone || 'Europe/London',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return {
    unavailable,
    emptyMessage:
      'No offline orders logged in this range. Record via POST /analytics/offline-order or scripts/importMarketingOfflineOrders.js.',
    note: 'Offline sales are stored separately from online checkout orders in MarketingOfflineOrder.',
    orders: formatNumber(off.orders ?? 0),
    revenue: formatCurrency(off.revenue ?? 0, currency),
    aov: calcAov(off.revenue, off.orders, currency),
    byChannel: (off.byChannel || []).map((row) => ({
      channelLabel: row.channelLabel || row.channel,
      orders: formatNumber(row.orders ?? 0),
      revenue: formatCurrency(row.revenue ?? 0, currency),
    })),
    recentOrders: (off.recentOrders || []).map((row) => ({
      orderNumber: row.orderNumber || '—',
      orderDate: formatUkDate(row.orderDate),
      channelLabel: row.channelLabel || row.channel,
      totalValue: formatCurrency(row.totalValue ?? 0, currency),
    })),
  };
}

export function mapProfitability(profitability, meta) {
  const pf = profitability || {};
  const unavailable = pf.availability === 'unavailable';
  const partial = pf.availability === 'partial';
  const currency = meta?.currency || 'GBP';

  return {
    unavailable,
    partial,
    emptyMessage:
      'No revenue order lines in this range. Profitability needs completed orders with products in the cart.',
    partialMessage:
      'Product variant Cost is missing or zero on order lines in this range. Add Cost in Product Central to enable gross margin and POAS.',
    note: 'Gross margin uses variant Cost × quantity against line revenue (salePrice × qty). Coupons are not allocated to individual lines.',
    roasNote: 'ROAS above uses imported Google Ads spend when available.',
    grossProfit: formatCurrency(pf.grossProfit ?? 0, currency),
    grossMarginPercent: formatPercent(pf.grossMarginPercent ?? 0),
    revenueWithCost: formatCurrency(pf.revenueWithCost ?? 0, currency),
    cogs: formatCurrency(pf.cogs ?? 0, currency),
    costCoveragePercent: formatPercent(pf.costCoveragePercent ?? 0),
    lineItemsWithCost: formatNumber(pf.lineItemsWithCost ?? 0),
    lineItemsMissingCost: formatNumber(pf.lineItemsMissingCost ?? 0),
    lineItemsInRange: formatNumber(pf.lineItemsInRange ?? 0),
  };
}

export function mapCustomerProfile(customerProfile, meta) {
  const cp = customerProfile || {};
  const unavailable = cp.availability !== 'available';
  const currency = meta?.currency || 'GBP';

  return {
    unavailable,
    emptyMessage:
      'No orders with customerKey in this date range. New vs returning metrics need customerKey on revenue-eligible orders.',
    note: 'Based on order.customerKey (logged-in user or hashed guest email) for revenue-eligible orders in the selected UK date range.',
    newCustomers: formatNumber(cp.newCustomers ?? 0),
    returningCustomers: formatNumber(cp.returningCustomers ?? 0),
    newCustomerShare: formatPercent(cp.newCustomerShare ?? 0),
    returningCustomerShare: formatPercent(cp.returningCustomerShare ?? 0),
    ordersFromNewCustomers: formatNumber(cp.ordersFromNewCustomers ?? 0),
    ordersFromReturningCustomers: formatNumber(cp.ordersFromReturningCustomers ?? 0),
    revenueFromNewCustomers: formatCurrency(cp.revenueFromNewCustomers ?? 0, currency),
    revenueFromReturningCustomers: formatCurrency(cp.revenueFromReturningCustomers ?? 0, currency),
    ordersWithoutCustomerKey: formatNumber(cp.ordersWithoutCustomerKey ?? 0),
    revenueByCustomerType: mapDonutSegments(cp.revenueByCustomerType),
  };
}

export function mapAbandonedCheckout(abandonedCheckout) {
  const ac = abandonedCheckout || {};
  const unavailable = ac.availability !== 'available';

  return {
    unavailable,
    emptyMessage:
      'No checkout activity logged in this date range. Metrics appear after shoppers reach checkout and a PaymentIntent is created.',
    note: 'Based on distinct Stripe PaymentIntents logged in CheckoutLog for the selected UK date range.',
    paymentIntentsInRange: formatNumber(ac.paymentIntentsInRange ?? 0),
    paymentIntentsCompleted: formatNumber(ac.paymentIntentsCompleted ?? 0),
    paymentIntentsFailed: formatNumber(ac.paymentIntentsFailed ?? 0),
    paymentIntentsAbandoned: formatNumber(ac.paymentIntentsAbandoned ?? 0),
    abandonmentRate: formatPercent(ac.abandonmentRate ?? 0),
    completionRate: formatPercent(ac.completionRate ?? 0),
  };
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
    aov: formatCurrency(row.aov ?? 0, currency),
  }));
}

export function mapOrdersProductsSoldModal(kpis, productsSold, meta) {
  const currency = meta?.currency || 'GBP';

  return {
    subtitle: 'Revenue orders in selected range (Pending, Approved, Shipped, Delivered)',
    orders: formatNumber(kpis?.orders ?? 0),
    unitsSold: formatNumber(kpis?.salesUnits ?? 0),
    revenue: formatCurrency(kpis?.revenue ?? 0, currency),
    products: (productsSold || []).map((row) => ({
      name: row.name,
      qty: formatNumber(row.unitsSold ?? row.qty ?? 0),
      revenue: formatCurrency(row.revenue ?? 0, currency),
      orders: formatNumber(row.orders ?? 0),
    })),
  };
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
