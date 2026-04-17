import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getSiteWideSchema = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}site-wide-schema`, {
      headers: getHeaders(),
    });

    if (response.data.success) {
      return response.data.data;
    }
    toast.error("Failed to load site-wide schema");
    return null;
  } catch (error) {
    console.error("Error fetching site-wide schema:", error);
    if (error.response?.status !== 404) {
      toast.error("Failed to load site-wide schema");
    }
    return null;
  }
};

export const saveSiteWideSchema = async (payload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}site-wide-schema`,
      payload,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success("Site-wide schema saved successfully");
      return response.data.data;
    }
    toast.error(response.data.message || "Failed to save site-wide schema");
    return null;
  } catch (error) {
    console.error("Error saving site-wide schema:", error);
    toast.error(
      error.response?.data?.message || "Failed to save site-wide schema"
    );
    return null;
  }
};
