import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getRobotsSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}robots-settings`, {
      headers: getHeaders(),
    });
    if (response.data.success) {
      return response.data.data;
    }
    toast.error("Failed to load robots settings");
    return null;
  } catch (error) {
    console.error("Error fetching robots settings:", error);
    toast.error("Failed to load robots settings");
    return null;
  }
};

export const saveRobotsSettings = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}robots-settings`, payload, {
      headers: getHeaders(),
    });
    if (response.data.success) {
      toast.success("Robots settings saved successfully");
      return response.data.data;
    }
    toast.error(response.data.message || "Failed to save robots settings");
    return null;
  } catch (error) {
    console.error("Error saving robots settings:", error);
    toast.error(
      error.response?.data?.message || "Failed to save robots settings"
    );
    return null;
  }
};
