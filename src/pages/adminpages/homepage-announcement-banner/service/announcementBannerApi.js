import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const headers = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export async function fetchAnnouncementBanner() {
  try {
    const response = await axios.get(`${API_BASE_URL}announcement-banner`, {
      headers: headers(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to load");
      return null;
    }
    return response.data.data;
  } catch (error) {
    console.error("fetchAnnouncementBanner:", error);
    toast.error(error.response?.data?.message || "Failed to load announcement banner");
    return null;
  }
}

/**
 * @param {{ masterEnabled: boolean, items: object[] }} body
 */
export async function saveAnnouncementBanner(body) {
  try {
    const response = await axios.put(`${API_BASE_URL}announcement-banner`, body, {
      headers: headers(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to save");
      return null;
    }
    toast.success(response.data.message || "Saved");
    return response.data.data;
  } catch (error) {
    console.error("saveAnnouncementBanner:", error);
    toast.error(error.response?.data?.message || "Failed to save");
    return null;
  }
}
