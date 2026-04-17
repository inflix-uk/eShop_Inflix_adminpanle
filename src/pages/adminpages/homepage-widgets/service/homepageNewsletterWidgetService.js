import axios from "axios";
import { toast } from "react-toastify";
import {
  getHeaders,
  getUploadHeaders,
  resolveSliderImageUrl,
} from "./homepageSliderWidgetService";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export { resolveSliderImageUrl as resolveNewsletterImageUrl };

/**
 * @returns {Promise<{ heading: string, description: string, placeholder: string, buttonLabel: string, imageUrl: string, updatedAt: string | null } | null>}
 */
export async function fetchHomepageNewsletterWidget() {
  try {
    const response = await axios.get(`${API_BASE_URL}homepage-newsletter-widget`, {
      headers: getHeaders(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to load newsletter widget");
      return null;
    }
    const d = response.data.data || {};
    return {
      heading: d.heading || "",
      description: d.description || "",
      placeholder: d.placeholder || "Enter your email",
      buttonLabel: d.buttonLabel || "Subscribe",
      imageUrl: d.imageUrl || "",
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    console.error("fetchHomepageNewsletterWidget:", error);
    toast.error(
      error.response?.data?.message || "Failed to load homepage newsletter widget"
    );
    return null;
  }
}

/**
 * @param {{ heading: string, description: string, placeholder: string, buttonLabel: string, imageUrl: string }} fields
 * @param {File | null} heroImage
 */
export async function saveHomepageNewsletterWidget(fields, heroImage) {
  try {
    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify({
        heading: fields.heading,
        description: fields.description,
        placeholder: fields.placeholder,
        buttonLabel: fields.buttonLabel,
        imageUrl: heroImage ? "" : (fields.imageUrl || "").trim(),
      })
    );
    if (heroImage) {
      formData.append("heroImage", heroImage);
    }

    const response = await axios.post(
      `${API_BASE_URL}homepage-newsletter-widget`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to save newsletter widget");
      return null;
    }

    toast.success(response.data.message || "Newsletter widget saved");
    const d = response.data.data || {};
    return {
      heading: d.heading || "",
      description: d.description || "",
      placeholder: d.placeholder || "Enter your email",
      buttonLabel: d.buttonLabel || "Subscribe",
      imageUrl: d.imageUrl || "",
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    console.error("saveHomepageNewsletterWidget:", error);
    toast.error(
      error.response?.data?.message || "Failed to save homepage newsletter widget"
    );
    return null;
  }
}
