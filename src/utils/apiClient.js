import axios from 'axios';
import { store } from '../redux/store/store';
import { logout, login } from '../redux/reducers/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function isAdminRole(role) {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'admin' || normalized === 'superadmin';
}

function handleAuthFailure() {
  store.dispatch(logout());
  const path = window.location.pathname || '';
  const onAdminApp = path === '/' || path.startsWith('/admin');
  if (onAdminApp && path !== '/') {
    window.location.replace('/');
  }
}

function attachAuthInterceptor(client) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const message = String(error.response?.data?.message || '').toLowerCase();
      const requestUrl = String(error.config?.url || '');
      const isAuthAttempt =
        requestUrl.includes('login') || requestUrl.includes('superadmin/login');

      if (status === 401 && !isAuthAttempt) {
        handleAuthFailure();
      } else if (status === 403 && message.includes('admin access')) {
        handleAuthFailure();
      }

      return Promise.reject(error);
    }
  );
}

axios.defaults.withCredentials = true;
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

attachAuthInterceptor(axios);
attachAuthInterceptor(apiClient);

export async function syncAdminSession() {
  try {
    const response = await apiClient.get('auth/me');
    const serverUser = response.data?.user;
    if (!serverUser || !isAdminRole(serverUser.role)) {
      store.dispatch(logout());
      return null;
    }
    store.dispatch(login(serverUser));
    return serverUser;
  } catch {
    store.dispatch(logout());
    return null;
  }
}

export default apiClient;
