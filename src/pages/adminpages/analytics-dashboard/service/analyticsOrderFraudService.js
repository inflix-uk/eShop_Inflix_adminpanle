import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? String(import.meta.env.VITE_BACKEND_URL).replace(/\/$/, '')
  : '';

function analyticsApiUrl(resourcePath) {
  const path = String(resourcePath).replace(/^\//, '');
  return `${API_BASE_URL}/${path}`;
}

/**
 * PATCH /analytics/order/:id/fraud — flag or unflag order for analytics exclusion.
 */
export async function setOrderFraudFlag(orderId, { flagged, reason }) {
  const response = await axios.patch(
    analyticsApiUrl(`analytics/order/${orderId}/fraud`),
    { flagged, reason },
    { headers: { 'x-user-role': 'admin' } }
  );
  return response.data;
}
