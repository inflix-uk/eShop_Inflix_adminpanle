import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? String(import.meta.env.VITE_BACKEND_URL).replace(/\/$/, '')
  : '';

function analyticsApiUrl(resourcePath) {
  const path = String(resourcePath).replace(/^\//, '');
  return `${API_BASE_URL}/${path}`;
}

const getHeaders = () => ({
  'x-user-role': 'admin',
});

const requestConfig = (params) => ({
  headers: getHeaders(),
  params,
  withCredentials: true,
});

/**
 * GET analytics/ad-performance?from=&to=
 */
export async function getAdPerformanceReport({ from, to }) {
  const response = await axios.get(
    analyticsApiUrl('analytics/ad-performance'),
    requestConfig({ from, to })
  );
  return response.data;
}

/**
 * GET analytics/ad-performance/orders?from=&to=&source=&campaign=
 */
export async function getAdPerformanceOrders({ from, to, source, campaign }) {
  const response = await axios.get(
    analyticsApiUrl('analytics/ad-performance/orders'),
    requestConfig({ from, to, source, campaign })
  );
  return response.data;
}

/**
 * GET analytics/campaigns?from&to&medium&groupBy
 */
export async function getCampaignAnalytics({ from, to, medium, groupBy }) {
  const params = { from, to, groupBy };
  if (medium) params.medium = medium;
  const response = await axios.get(
    analyticsApiUrl('analytics/campaigns'),
    requestConfig(params)
  );
  return response.data;
}

/**
 * GET analytics/campaigns/orders?from&to&groupBy&value&medium
 */
export async function getCampaignOrders({ from, to, groupBy, value, medium }) {
  const params = { from, to, groupBy, value };
  if (medium) params.medium = medium;
  const response = await axios.get(
    analyticsApiUrl('analytics/campaigns/orders'),
    requestConfig(params)
  );
  return response.data;
}
