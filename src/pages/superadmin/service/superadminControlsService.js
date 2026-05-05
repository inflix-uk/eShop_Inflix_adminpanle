import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const headers = {
  "Content-Type": "application/json",
  "x-user-role": "superadmin",
};

const normalizeRouteList = (items) => {
  if (!Array.isArray(items)) return [];
  return [...new Set(
    items
      .map((item) => String(item || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase())
      .filter(Boolean)
  )];
};

export async function fetchSuperadminControls() {
  try {
    const response = await axios.get(`${API_BASE_URL}superadmin/controls`, { headers });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to load superadmin controls");
      return null;
    }
    const d = response.data.data || {};
    return {
      routeBlockingEnabled: d.routeBlockingEnabled !== false,
      disabledMarketingRoutes: normalizeRouteList(d.disabledMarketingRoutes),
      disabledAdminRoutes: normalizeRouteList(d.disabledAdminRoutes),
      adminRouteModules: Array.isArray(d.adminRouteModules)
        ? d.adminRouteModules.map((module) => ({
            id: String(module?.id || ""),
            label: String(module?.label || ""),
            description: String(module?.description || ""),
            routes: normalizeRouteList(module?.routes),
            enabled: module?.enabled !== false,
          }))
        : [],
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to load superadmin controls");
    return null;
  }
}

export async function updateSuperadminControls(payload) {
  try {
    const normalizedPayload = {
      ...payload,
      ...(payload.disabledMarketingRoutes !== undefined
        ? { disabledMarketingRoutes: normalizeRouteList(payload.disabledMarketingRoutes) }
        : {}),
      ...(payload.disabledAdminRoutes !== undefined
        ? { disabledAdminRoutes: normalizeRouteList(payload.disabledAdminRoutes) }
        : {}),
    };
    const response = await axios.put(
      `${API_BASE_URL}superadmin/controls`,
      normalizedPayload,
      { headers }
    );
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to update controls");
      return null;
    }
    toast.success(response.data?.message || "Controls updated");
    const d = response.data.data || {};
    return {
      routeBlockingEnabled: d.routeBlockingEnabled !== false,
      disabledMarketingRoutes: normalizeRouteList(d.disabledMarketingRoutes),
      disabledAdminRoutes: normalizeRouteList(d.disabledAdminRoutes),
      adminRouteModules: Array.isArray(d.adminRouteModules)
        ? d.adminRouteModules.map((module) => ({
            id: String(module?.id || ""),
            label: String(module?.label || ""),
            description: String(module?.description || ""),
            routes: normalizeRouteList(module?.routes),
            enabled: module?.enabled !== false,
          }))
        : [],
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update controls");
    return null;
  }
}
