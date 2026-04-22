import axios from "axios";
import { toast } from "react-toastify";
import { getHeaders } from "./homepageSliderWidgetService";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * @returns {Promise<{ data: object, persisted: boolean } | null>}
 */
export async function fetchContactUsWidget() {
  try {
    const response = await axios.get(`${API_BASE_URL}contact-us-widget`, {
      headers: getHeaders(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to load contact widget");
      return null;
    }
    return {
      data: response.data.data || {},
      persisted: Boolean(response.data.persisted),
    };
  } catch (error) {
    console.error("fetchContactUsWidget:", error);
    toast.error(error.response?.data?.message || "Failed to load contact widget");
    return null;
  }
}

/**
 * @param {object} payload full widget document fields
 */
export async function saveContactUsWidget(payload) {
  try {
    const response = await axios.post(`${API_BASE_URL}contact-us-widget`, payload, {
      headers: getHeaders(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to save contact widget");
      return null;
    }
    toast.success(response.data.message || "Contact widget saved");
    return response.data.data || null;
  } catch (error) {
    console.error("saveContactUsWidget:", error);
    toast.error(error.response?.data?.message || "Failed to save contact widget");
    return null;
  }
}
