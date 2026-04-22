import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getSmtpSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}smtp/settings`, { headers: getHeaders() });
    if (response.data.success) {
      return response.data.data;
    }
    toast.error(response.data.message || "Failed to load SMTP settings");
    return null;
  } catch (error) {
    console.error("Error fetching SMTP settings:", error);
    toast.error(error.response?.data?.message || "Failed to load SMTP settings");
    return null;
  }
};

export const saveSmtpSettings = async (settings) => {
  try {
    const response = await axios.post(`${API_BASE_URL}smtp/settings`, settings, { headers: getHeaders() });
    if (response.data.success) {
      toast.success("SMTP settings saved successfully");
      return response.data.data;
    }
    toast.error(response.data.message || "Failed to save SMTP settings");
    return null;
  } catch (error) {
    console.error("Error saving SMTP settings:", error);
    toast.error(error.response?.data?.message || "Failed to save SMTP settings");
    return null;
  }
};

export const testSmtpConnection = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}smtp/test-connection`, payload, { headers: getHeaders() });
    if (response.data.success) {
      toast.success("SMTP connection successful");
      return response.data;
    }
    toast.error(response.data.message || "SMTP connection failed");
    return null;
  } catch (error) {
    console.error("Error testing SMTP connection:", error);
    toast.error(error.response?.data?.message || error.response?.data?.error || "SMTP connection test failed");
    return null;
  }
};
