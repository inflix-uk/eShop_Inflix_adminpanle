export const ANALYTICS_TIMEZONE = 'Europe/London';

export const DATE_RANGE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'sinceTracking', label: 'Since tracking started' },
];

export const UNAVAILABLE_LABEL = 'Unavailable';

/** Shown when per-row visitor / conversion metrics are not yet computed (Zextons parity Phase 2). */
export const LIMITED_DATA_LABEL = 'Limited data';

/** Display labels for traffic source rows (Zextons-style naming). */
export const TRAFFIC_SOURCE_LABELS = {
  google: 'Google Ads',
  facebook: 'Meta Ads',
  meta: 'Meta Ads',
  instagram: 'Meta Ads',
  ig: 'ig',
  bing: 'Organic Search',
  organic: 'Organic Search',
  newsletter: 'CRM',
  email: 'CRM',
  direct: 'Direct',
  '(direct)': 'Direct',
  referral: 'Referral',
};

/** Normalized attribution channel → Zextons-style source label fallback. */
export const CHANNEL_SOURCE_LABELS = {
  paid_search: 'Google Ads',
  paid_social: 'Meta Ads',
  email: 'CRM',
  direct: 'Direct',
  referral: 'Referral',
  organic: 'Organic Search',
};

export const ZEXTONS_REVENUE_COLUMNS = [
  { key: 'name', label: 'Source' },
  { key: 'visitors', label: 'Visitors', align: 'right' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'aov', label: 'AOV', align: 'right' },
  { key: 'conversionRate', label: 'Conv. rate', align: 'right' },
  { key: 'fraudRate', label: 'Fraud rate', align: 'right' },
];

export const ZEXTONS_CAMPAIGN_COLUMNS = [
  { key: 'name', label: 'Campaign' },
  { key: 'visitors', label: 'Visitors', align: 'right' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'aov', label: 'AOV', align: 'right' },
  { key: 'conversionRate', label: 'Conv. rate', align: 'right' },
];

export const ZEXTONS_MEDIUM_COLUMNS = [
  { key: 'name', label: 'Medium' },
  { key: 'visitors', label: 'Visitors', align: 'right' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'aov', label: 'AOV', align: 'right' },
  { key: 'conversionRate', label: 'Conv. rate', align: 'right' },
];

export const ZEXTONS_CAMPAIGN_ROAS_COLUMNS = [
  { key: 'source', label: 'Source' },
  { key: 'name', label: 'Campaign' },
  { key: 'spend', label: 'Spend', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'roas', label: 'ROAS', align: 'right' },
  { key: 'cpa', label: 'CPA', align: 'right' },
];

export const TOP_TRAFFIC_COLUMNS = [
  { key: 'name', label: 'Source' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
];

export const TOP_CAMPAIGN_COLUMNS = [
  { key: 'name', label: 'Campaign' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
];

export const TOP_LANDING_COLUMNS = [
  { key: 'landingPage', label: 'Landing page' },
  { key: 'sessions', label: 'Sessions', align: 'right' },
];

export const DEVICE_COLUMNS = [
  { key: 'label', label: 'Device' },
  { key: 'sessions', label: 'Sessions', align: 'right' },
  { key: 'visitors', label: 'Visitors', align: 'right' },
];

export const PROFIT_BY_SOURCE_COLUMNS = [
  { key: 'name', label: 'Source' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'estCost', label: 'Est. cost', align: 'right' },
  { key: 'grossProfit', label: 'Gross profit', align: 'right' },
  { key: 'margin', label: 'Margin', align: 'right' },
  { key: 'spend', label: 'Ad spend', align: 'right' },
  { key: 'roas', label: 'ROAS', align: 'right' },
  { key: 'poas', label: 'POAS', align: 'right' },
  { key: 'fraudAdjustedRoas', label: 'FA ROAS', align: 'right' },
  { key: 'fraudAdjustedPoas', label: 'FA POAS', align: 'right' },
];

export const PROFIT_BY_CAMPAIGN_COLUMNS = [
  { key: 'name', label: 'Campaign' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'estCost', label: 'Est. cost', align: 'right' },
  { key: 'grossProfit', label: 'Gross profit', align: 'right' },
  { key: 'margin', label: 'Margin', align: 'right' },
  { key: 'spend', label: 'Ad spend', align: 'right' },
  { key: 'roas', label: 'ROAS', align: 'right' },
  { key: 'poas', label: 'POAS', align: 'right' },
  { key: 'excludedRevenue', label: 'Excluded rev.', align: 'right' },
  { key: 'excludedProfit', label: 'Excluded profit', align: 'right' },
];

export const FRAUD_SOURCE_COLUMNS = [
  { key: 'name', label: 'Source' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'fraudOrders', label: 'Flagged', align: 'right' },
  { key: 'fraudRate', label: 'Fraud rate', align: 'right' },
];

export const FRAUD_CAMPAIGN_COLUMNS = [
  { key: 'name', label: 'Campaign' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'fraudOrders', label: 'Flagged', align: 'right' },
  { key: 'fraudRate', label: 'Fraud rate', align: 'right' },
];

export const ROAS_POAS_COLUMNS = [
  { key: 'source', label: 'Source' },
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'grossProfit', label: 'Gross profit', align: 'right' },
  { key: 'adSpend', label: 'Ad spend', align: 'right' },
  { key: 'roas', label: 'ROAS', align: 'right' },
  { key: 'poas', label: 'POAS', align: 'right' },
  { key: 'faRevenue', label: 'FA revenue', align: 'right' },
  { key: 'faProfit', label: 'FA profit', align: 'right' },
  { key: 'fraudAdjustedRoas', label: 'FA ROAS', align: 'right' },
  { key: 'fraudAdjustedPoas', label: 'FA POAS', align: 'right' },
  { key: 'excludedOrders', label: 'Excluded orders', align: 'right' },
];

/** Must match keys in backend `analyticsOrderMatch.CHANNEL_FILTERS`. */
export const CHANNEL_FILTER_OPTIONS = [
  { id: 'all', label: 'All channels' },
  { id: 'google', label: 'Google' },
  { id: 'facebook', label: 'Facebook / Meta' },
  { id: 'paid_search', label: 'Paid search' },
  { id: 'paid_social', label: 'Paid social' },
  { id: 'email', label: 'Email' },
  { id: 'direct', label: 'Direct' },
  { id: 'referral', label: 'Referral' },
];
