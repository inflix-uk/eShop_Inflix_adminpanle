import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export async function fetchAuditLogs(params = {}) {
  const response = await axios.get(`${API_BASE_URL}audit-logs`, {
    headers: getHeaders(),
    params,
  });
  if (!response.data?.success) {
    throw new Error(response.data?.error || "Failed to fetch audit logs");
  }
  return response.data;
}

export async function fetchSlowestRoutes(params = {}) {
  const response = await axios.get(`${API_BASE_URL}audit-logs/slowest`, {
    headers: getHeaders(),
    params,
  });
  if (!response.data?.success) {
    throw new Error(response.data?.error || "Failed to fetch slowest routes");
  }
  return response.data;
}
