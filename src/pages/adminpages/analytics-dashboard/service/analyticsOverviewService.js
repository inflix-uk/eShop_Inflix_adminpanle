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

/**
 * GET /analytics/overview — UK reporting timezone is applied on the backend.
 * @param {{ startDate: string, endDate: string, channel?: string }} params
 */
export const fetchAnalyticsOverview = async ({ startDate, endDate, channel, rangePreset }) => {
  const params = { startDate, endDate };
  if (channel && channel !== 'all') {
    params.channel = channel;
  }
  if (rangePreset) {
    params.rangePreset = rangePreset;
  }

  const response = await axios.get(analyticsApiUrl('analytics/overview'), {
    headers: getHeaders(),
    params,
  });

  return response.data;
};
