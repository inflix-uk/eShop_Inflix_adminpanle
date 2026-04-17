import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/** @typedef {{ id: string, heading: string, description: string, imageUrl: string, imageFile: File | null, imagePreview: string | null }} HomepageSliderSlide */

export const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getUploadHeaders = () => ({
  "x-user-role": "admin",
});

export function createSlideId() {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** @returns {HomepageSliderSlide} */
export function createEmptySlide() {
  return {
    id: createSlideId(),
    heading: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    imagePreview: null,
  };
}

/**
 * Absolute URL for <img src> (blob, absolute, or backend-relative).
 * @param {string} url
 */
export function resolveSliderImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = (API_BASE_URL || "").replace(/\/$/, "");
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

/**
 * @param {HomepageSliderSlide} slide
 */
export function getSlideDisplaySrc(slide) {
  if (slide.imagePreview) return slide.imagePreview;
  return resolveSliderImageUrl(slide.imageUrl || "");
}

/**
 * Map API slide to editor shape (raw imageUrl from server).
 * @param {{ id?: string, _id?: string, heading?: string, description?: string, imageUrl?: string }} raw
 * @returns {HomepageSliderSlide}
 */
export function mapApiSlideToClient(raw) {
  const id = raw.id || raw._id;
  return {
    id: id != null ? String(id) : createSlideId(),
    heading: raw.heading || "",
    description: raw.description || "",
    imageUrl: raw.imageUrl || "",
    imageFile: null,
    imagePreview: null,
  };
}

/**
 * @returns {Promise<{ slides: HomepageSliderSlide[], isEnabled: boolean, updatedAt: string | null } | null>}
 */
export async function fetchHomepageSliderWidget() {
  try {
    const response = await axios.get(`${API_BASE_URL}homepage-slider-widget`, {
      headers: getHeaders(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to load slider");
      return null;
    }
    const d = response.data.data || {};
    const slides = (d.slides || []).map(mapApiSlideToClient);
    return {
      slides,
      isEnabled: d.isEnabled !== false,
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    console.error("fetchHomepageSliderWidget:", error);
    toast.error(
      error.response?.data?.message || "Failed to load homepage slider"
    );
    return null;
  }
}

/**
 * @param {HomepageSliderSlide[]} slides
 * @param {boolean} isEnabled
 * @returns {Promise<{ slides: HomepageSliderSlide[], isEnabled: boolean, updatedAt: string | null } | null>}
 */
export async function saveHomepageSliderWidget(slides, isEnabled = true) {
  try {
    const formData = new FormData();
    const payload = slides.map((s) => {
      const idStr = String(s.id || "");
      const validMongo = /^[a-f\d]{24}$/i.test(idStr);
      return {
        ...(validMongo ? { id: idStr } : {}),
        heading: s.heading,
        description: s.description,
        imageUrl: s.imageFile ? "" : (s.imageUrl || "").trim(),
      };
    });
    formData.append("slides", JSON.stringify(payload));
    formData.append("isEnabled", isEnabled ? "true" : "false");

    slides.forEach((s, i) => {
      if (s.imageFile) {
        formData.append(`slideImage_${i}`, s.imageFile);
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}homepage-slider-widget`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to save slider");
      return null;
    }

    toast.success(response.data.message || "Slider saved");
    const d = response.data.data || {};
    const nextSlides = (d.slides || []).map(mapApiSlideToClient);
    return {
      slides: nextSlides,
      isEnabled: d.isEnabled !== false,
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    console.error("saveHomepageSliderWidget:", error);
    toast.error(
      error.response?.data?.message || "Failed to save homepage slider"
    );
    return null;
  }
}
