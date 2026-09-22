import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getDashboardSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}dashboard-settings`, {
      headers: getHeaders(),
    });
    if (response.data.success) {
      return response.data.data;
    }
    toast.error("Failed to load dashboard settings");
    return null;
  } catch (error) {
    console.error("Error fetching dashboard settings:", error);
    toast.error("Failed to load dashboard settings");
    return null;
  }
};

export const saveDashboardSettings = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}dashboard-settings`, payload, {
      headers: getHeaders(),
    });
    if (response.data.success) {
      toast.success("Dashboard settings saved");
      return response.data.data;
    }
    toast.error(response.data.message || "Failed to save dashboard settings");
    return null;
  } catch (error) {
    console.error("Error saving dashboard settings:", error);
    toast.error(error.response?.data?.message || "Failed to save dashboard settings");
    return null;
  }
};
