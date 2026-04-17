import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get headers with admin role
 */
const getHeaders = () => ({
  'x-user-role': 'admin',
  'Content-Type': 'application/json'
});

/**
 * Get headers for file upload
 */
const getUploadHeaders = () => ({
  'x-user-role': 'admin',
  // Don't set Content-Type for FormData, browser will set it with boundary
});

/**
 * Fetch Buy Now Pay Later banner
 * @returns {Promise<Object|null>} Banner data or null
 */
export const getBuyNowPayLater = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/buy-now-pay-later`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching Buy Now Pay Later:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load Buy Now Pay Later banner');
    }
    return null;
  }
};

/**
 * Update Buy Now Pay Later banner
 * @param {Object} bannerData - The banner data
 * @returns {Promise<boolean>} True if successful
 */
export const updateBuyNowPayLater = async (bannerData) => {
  try {
    const formData = new FormData();
    
    if (bannerData.backgroundImage && bannerData.backgroundImage instanceof File) {
      formData.append('backgroundImage', bannerData.backgroundImage);
      delete bannerData.backgroundImage;
    }
    
    if (bannerData.paymentImages && Array.isArray(bannerData.paymentImages)) {
      bannerData.paymentImages.forEach((img, index) => {
        if (img instanceof File) {
          formData.append(`paymentImage${index}`, img);
        } else if (img && typeof img === 'string') {
          // Keep existing image URL
          formData.append(`paymentImage${index}`, img);
        }
      });
      delete bannerData.paymentImages;
    }
    
    formData.append('bannerData', JSON.stringify(bannerData));

    const response = await axios.post(
      `${API_BASE_URL}update/buy-now-pay-later`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Buy Now Pay Later banner updated successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update banner');
      return false;
    }
  } catch (error) {
    console.error('Error updating Buy Now Pay Later:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update banner'
    );
    return false;
  }
};

/**
 * Fetch Sell/Buy Cards
 * @returns {Promise<Object|null>} Cards data or null
 */
export const getSellBuyCards = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/sell-buy-cards`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching Sell/Buy Cards:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load Sell/Buy Cards');
    }
    return null;
  }
};

/**
 * Update Sell/Buy Cards
 * @param {Object} cardsData - The cards data
 * @returns {Promise<boolean>} True if successful
 */
export const updateSellBuyCards = async (cardsData) => {
  try {
    const formData = new FormData();
    
    // Sell card images
    if (cardsData.sellCard?.backgroundImage && cardsData.sellCard.backgroundImage instanceof File) {
      formData.append('sellBackgroundImage', cardsData.sellCard.backgroundImage);
      delete cardsData.sellCard.backgroundImage;
    }
    
    if (cardsData.sellCard?.productImage && cardsData.sellCard.productImage instanceof File) {
      formData.append('sellProductImage', cardsData.sellCard.productImage);
      delete cardsData.sellCard.productImage;
    }
    
    // Buy card images
    if (cardsData.buyCard?.backgroundImage && cardsData.buyCard.backgroundImage instanceof File) {
      formData.append('buyBackgroundImage', cardsData.buyCard.backgroundImage);
      delete cardsData.buyCard.backgroundImage;
    }
    
    if (cardsData.buyCard?.productImage && cardsData.buyCard.productImage instanceof File) {
      formData.append('buyProductImage', cardsData.buyCard.productImage);
      delete cardsData.buyCard.productImage;
    }
    
    formData.append('cardsData', JSON.stringify(cardsData));

    const response = await axios.post(
      `${API_BASE_URL}update/sell-buy-cards`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Sell/Buy Cards updated successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update cards');
      return false;
    }
  } catch (error) {
    console.error('Error updating Sell/Buy Cards:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update cards'
    );
    return false;
  }
};

/**
 * Fetch Tiny Phone Banner
 * @returns {Promise<Object|null>} Banner data or null
 */
export const getTinyPhoneBanner = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/tiny-phone-banner`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching Tiny Phone Banner:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load Tiny Phone Banner');
    }
    return null;
  }
};

/**
 * Update Tiny Phone Banner
 * @param {Object} bannerData - The banner data
 * @returns {Promise<boolean>} True if successful
 */
export const updateTinyPhoneBanner = async (bannerData) => {
  try {
    const formData = new FormData();

    if (bannerData.backgroundImage && bannerData.backgroundImage instanceof File) {
      formData.append('backgroundImage', bannerData.backgroundImage);
      delete bannerData.backgroundImage;
    }

    if (bannerData.centerImage && bannerData.centerImage instanceof File) {
      formData.append('centerImage', bannerData.centerImage);
      delete bannerData.centerImage;
    }

    if (bannerData.rightImage && bannerData.rightImage instanceof File) {
      formData.append('rightImage', bannerData.rightImage);
      delete bannerData.rightImage;
    }

    formData.append('bannerData', JSON.stringify(bannerData));

    const response = await axios.post(
      `${API_BASE_URL}update/tiny-phone-banner`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Tiny Phone Banner updated successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update banner');
      return false;
    }
  } catch (error) {
    console.error('Error updating Tiny Phone Banner:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update banner'
    );
    return false;
  }
};

/**
 * Delete image from promotional section
 * @param {string} sectionType - Type of section (buy-now-pay-later, sell-buy-cards, tiny-phone-banner)
 * @param {string} imageField - Image field name
 * @param {number} [imageIndex] - Index for payment images (0, 1, 2)
 * @returns {Promise<boolean>} True if successful
 */
export const deletePromotionalImage = async (sectionType, imageField, imageIndex = null) => {
  try {
    const payload = { sectionType, imageField };
    if (imageIndex !== null) {
      payload.imageIndex = imageIndex;
    }

    const response = await axios.delete(
      `${API_BASE_URL}delete/promotional-image`,
      {
        headers: getHeaders(),
        data: payload
      }
    );

    if (response.data.success) {
      toast.success('Image deleted successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to delete image');
      return false;
    }
  } catch (error) {
    console.error('Error deleting promotional image:', error);
    toast.error(
      error.response?.data?.message || 'Failed to delete image'
    );
    return false;
  }
};
