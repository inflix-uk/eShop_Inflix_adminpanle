import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getSiteScriptsSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}site-scripts`, {
      headers: getHeaders(),
    });

    if (response.data.success) {
      return response.data.data;
    }
    toast.error("Failed to load site scripts");
    return null;
  } catch (error) {
    console.error("Error fetching site scripts:", error);
    if (error.response?.status !== 404) {
      toast.error("Failed to load site scripts");
    }
    return null;
  }
};

export const saveSiteScriptsSettings = async (payload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}site-scripts`,
      payload,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success("Site scripts saved successfully");
      return response.data.data;
    }
    toast.error(response.data.message || "Failed to save site scripts");
    return null;
  } catch (error) {
    console.error("Error saving site scripts:", error);
    toast.error(
      error.response?.data?.message || "Failed to save site scripts"
    );
    return null;
  }
};
