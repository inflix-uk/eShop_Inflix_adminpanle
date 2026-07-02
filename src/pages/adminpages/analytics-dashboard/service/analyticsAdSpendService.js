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
  'Content-Type': 'application/json',
});

export async function saveAdSpendEntry(payload) {
  const response = await axios.post(analyticsApiUrl('analytics/ad-spend'), payload, {
    headers: getHeaders(),
  });
  return response.data;
}

export async function importAdSpendCsv(csv, defaults) {
  const response = await axios.post(
    analyticsApiUrl('analytics/ad-spend/import'),
    { csv, defaults },
    { headers: getHeaders() }
  );
  return response.data;
}

export async function downloadAdSpendTemplate() {
  const response = await axios.get(analyticsApiUrl('analytics/ad-spend/template'), {
    headers: { 'x-user-role': 'admin' },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ad-spend-template.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
