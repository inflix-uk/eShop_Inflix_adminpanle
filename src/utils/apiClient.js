import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

axios.defaults.withCredentials = true;
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default apiClient;
