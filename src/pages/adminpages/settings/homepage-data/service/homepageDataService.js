import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

/**
 * Admin: homepage SEO slice only (Meta Title, Description, meta keywords, Meta Schema).
 */
export const getHomepageSeo = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}homepage-data/seo`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch homepage SEO");
    }

    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching homepage SEO:", error);
    toast.error("Failed to load homepage SEO");
    return null;
  }
};

/**
 * Admin: partial update of homepage SEO (JSON). No blocks required.
 */
export const patchHomepageSeo = async ({ metaTitle, metaDescription, metaTags, metaSchema }) => {
  try {
    const response = await fetch(`${BACKEND_URL}homepage-data/seo`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({
        metaTitle,
        metaDescription,
        metaTags,
        metaSchema,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || "Failed to save homepage SEO");
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error patching homepage SEO:", error);
    toast.error(error.message || "Failed to save homepage SEO");
    throw error;
  }
};

export const getHomepageData = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}homepage-data`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch homepage data");
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    toast.error("Failed to load homepage data");
    return null;
  }
};

/**
 * Saves homepage blocks. Pass an object with `blocks` plus optional multipart fields:
 * `blockImageCount`, `blockImages_0`..File, `blockImagePath_0`..string (paths are inside JSON payload).
 */
export const saveHomepageData = async (homepagePayload) => {
  try {
    const payload = { ...homepagePayload };
    const formData = new FormData();

    const blockImageCount = parseInt(payload.blockImageCount || "0", 10);
    for (let i = 0; i < blockImageCount; i++) {
      const key = `blockImages_${i}`;
      const file = payload[key];
      if (file && file instanceof File) {
        formData.append(key, file);
      }
      delete payload[key];
    }

    formData.append("homepageData", JSON.stringify(payload));

    const response = await fetch(`${BACKEND_URL}homepage-data`, {
      method: "POST",
      headers: {
        "x-user-role": "admin",
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to save homepage data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving homepage data:", error);
    toast.error("Failed to save homepage data");
    throw error;
  }
};

export const uploadHomepageImage = async (file, fieldName) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("fieldName", fieldName);

    const response = await fetch(`${BACKEND_URL}homepage-data/upload-image`, {
      method: "POST",
      headers: {
        "x-user-role": "admin",
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.imageUrl || data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error("Failed to upload image");
    throw error;
  }
};
