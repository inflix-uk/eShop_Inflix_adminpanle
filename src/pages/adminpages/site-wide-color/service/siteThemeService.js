import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getSiteTheme = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}site-theme`, {
      headers: getHeaders(),
    });
    if (response.data.success) {
      return {
        primaryColor: response.data.data?.primaryColor || "#16a34a",
        secondaryColor: response.data.data?.secondaryColor || "#15803d",
        updatedAt: response.data.data?.updatedAt || null,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching site theme:", error);
    return null;
  }
};

export const saveSiteTheme = async (primaryColor, secondaryColor) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}site-theme`,
      { primaryColor, secondaryColor },
      { headers: getHeaders() }
    );
    if (response.data.success) {
      toast.success("Site colors saved");      return true;
    }
    toast.error(response.data.message || "Failed to save");
    return false;
  } catch (error) {
    console.error("Error saving site theme:", error);
    toast.error(
      error.response?.data?.message || "Failed to save site colors"
    );
    return false;
  }
};
