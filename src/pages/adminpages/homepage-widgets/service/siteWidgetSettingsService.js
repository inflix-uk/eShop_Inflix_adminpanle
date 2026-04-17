import axios from "axios";
import { toast } from "react-toastify";
import { getHeaders } from "./homepageSliderWidgetService";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * @returns {Promise<{ sliderEnabled: boolean, newsletterEnabled: boolean, faqEnabled: boolean, videoEnabled: boolean, mapEnabled: boolean, galleryEnabled: boolean, iconBoxEnabled: boolean, testimonialsEnabled: boolean, trustpilotWidgetEnabled: boolean, siteBannersEnabled: boolean, categoryCardsEnabled: boolean, promotionalSectionsEnabled: boolean, latestBlogsEnabled: boolean, htmlCssEnabled: boolean, updatedAt: string | null } | null>}
 */
export async function fetchSiteWidgetSettings() {
  try {
    const response = await axios.get(`${API_BASE_URL}site-widget-settings`, {
      headers: getHeaders(),
    });
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to load widget settings");
      return null;
    }
    const d = response.data.data || {};
    return {
      sliderEnabled: d.sliderEnabled !== false,
      newsletterEnabled: d.newsletterEnabled !== false,
      faqEnabled: d.faqEnabled !== false,
      videoEnabled: d.videoEnabled !== false,
      mapEnabled: d.mapEnabled !== false,
      galleryEnabled: d.galleryEnabled !== false,
      iconBoxEnabled: d.iconBoxEnabled !== false,
      testimonialsEnabled: d.testimonialsEnabled !== false,
      trustpilotWidgetEnabled: d.trustpilotWidgetEnabled !== false,
      siteBannersEnabled: d.siteBannersEnabled !== false,
      categoryCardsEnabled: d.categoryCardsEnabled !== false,
      promotionalSectionsEnabled: d.promotionalSectionsEnabled !== false,
      latestBlogsEnabled: d.latestBlogsEnabled !== false,
      htmlCssEnabled: d.htmlCssEnabled !== false,
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    console.error("fetchSiteWidgetSettings:", error);
    toast.error(
      error.response?.data?.message || "Failed to load widget settings"
    );
    return null;
  }
}

/**
 * @param {{ sliderEnabled?: boolean, newsletterEnabled?: boolean, faqEnabled?: boolean, videoEnabled?: boolean, mapEnabled?: boolean, galleryEnabled?: boolean, iconBoxEnabled?: boolean, testimonialsEnabled?: boolean }} body
 */
export async function putSiteWidgetSettings(body) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}site-widget-settings`,
      body,
      { headers: getHeaders() }
    );
    if (!response.data?.success) {
      toast.error(response.data?.message || "Failed to save");
      return null;
    }
    toast.success(response.data.message || "Saved");
    const d = response.data.data || {};
    return {
      sliderEnabled: d.sliderEnabled !== false,
      newsletterEnabled: d.newsletterEnabled !== false,
      faqEnabled: d.faqEnabled !== false,
      videoEnabled: d.videoEnabled !== false,
      mapEnabled: d.mapEnabled !== false,
      galleryEnabled: d.galleryEnabled !== false,
      iconBoxEnabled: d.iconBoxEnabled !== false,
      testimonialsEnabled: d.testimonialsEnabled !== false,
      trustpilotWidgetEnabled: d.trustpilotWidgetEnabled !== false,
      siteBannersEnabled: d.siteBannersEnabled !== false,
      categoryCardsEnabled: d.categoryCardsEnabled !== false,
      promotionalSectionsEnabled: d.promotionalSectionsEnabled !== false,
      latestBlogsEnabled: d.latestBlogsEnabled !== false,
      htmlCssEnabled: d.htmlCssEnabled !== false,
      updatedAt: d.updatedAt || null,
    };
  } catch (error) {
    console.error("putSiteWidgetSettings:", error);
    toast.error(
      error.response?.data?.message || "Failed to save widget settings"
    );
    return null;
  }
}
