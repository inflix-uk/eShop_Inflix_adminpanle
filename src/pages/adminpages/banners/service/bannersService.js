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
  // Let axios set Content-Type with boundary automatically for FormData
});

/**
 * Fetch all banners
 * @returns {Promise<Array>} Array of banners
 */
export const fetchAllBanners = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/all/banners`, {
      headers: getHeaders()
    });
    
    if (response.data.status === 200 || response.status === 200) {
      const banners = response.data.banners || response.data.data || [];
      return banners;
    } else if (response.data.success) {
      return response.data.data || [];
    } else {
      toast.error('Failed to load banners');
      return [];
    }
  } catch (error) {
    console.error('Error fetching banners:', error);
    toast.error('Failed to load banners');
    return [];
  }
};

/**
 * Fetch single banner by ID
 * @param {string} id - Banner ID
 * @returns {Promise<Object>} Banner data
 */
export const fetchBannerById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/banner/${id}`, {
      headers: getHeaders()
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      toast.error('Failed to load banner details');
      return null;
    }
  } catch (error) {
    console.error('Error fetching banner:', error);
    toast.error('Failed to load banner details');
    return null;
  }
};

/**
 * Create a new banner
 * @param {Object} bannerData - Banner data with FormData for images
 * @returns {Promise<Object>} Response data
 */
export const createBanner = async (bannerData) => {
  try {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Append image files if they exist
    if (bannerData.imageLarge && bannerData.imageLarge instanceof File) {
      formData.append('imageLarge', bannerData.imageLarge);
      delete bannerData.imageLarge;
    }
    
    if (bannerData.imageSmall && bannerData.imageSmall instanceof File) {
      formData.append('imageSmall', bannerData.imageSmall);
      delete bannerData.imageSmall;
    }
    
    if (bannerData.extraImage && bannerData.extraImage instanceof File) {
      formData.append('extraImage', bannerData.extraImage);
      delete bannerData.extraImage;
    }
    
    // Append all other banner data as JSON string
    formData.append('bannerData', JSON.stringify(bannerData));
    
    const response = await axios.post(`${API_BASE_URL}create/banner`, formData, {
      headers: getUploadHeaders()
    });
    
    if (response.data.success || response.data.status === 201 || response.status === 201) {
      toast.success(response.data.message || 'Banner created successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to create banner');
      return null;
    }
  } catch (error) {
    console.error('Error creating banner:', error);
    toast.error(error.response?.data?.message || 'An error occurred while creating the banner');
    return null;
  }
};

/**
 * Update an existing banner
 * @param {string} id - Banner ID
 * @param {Object} bannerData - Updated banner data
 * @returns {Promise<Object>} Response data
 */
export const updateBanner = async (id, bannerData) => {
  try {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Append image files if they exist
    if (bannerData.imageLarge && bannerData.imageLarge instanceof File) {
      formData.append('imageLarge', bannerData.imageLarge);
      delete bannerData.imageLarge;
    }
    
    if (bannerData.imageSmall && bannerData.imageSmall instanceof File) {
      formData.append('imageSmall', bannerData.imageSmall);
      delete bannerData.imageSmall;
    }
    
    if (bannerData.extraImage && bannerData.extraImage instanceof File) {
      formData.append('extraImage', bannerData.extraImage);
      delete bannerData.extraImage;
    }
    
    // Append all other banner data as JSON string
    formData.append('bannerData', JSON.stringify(bannerData));
    
    const response = await axios.put(`${API_BASE_URL}update/banner/${id}`, formData, {
      headers: getUploadHeaders()
    });
    
    if (response.data.success || response.data.status === 200 || response.status === 200) {
      toast.success(response.data.message || 'Banner updated successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to update banner');
      return null;
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    toast.error(error.response?.data?.message || 'An error occurred while updating the banner');
    return null;
  }
};

/**
 * Delete a banner
 * @param {string} id - Banner ID
 * @returns {Promise<Object>} Response data
 */
export const deleteBanner = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/banner/${id}`, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.status === 200 || response.status === 201) {
      toast.success(response.data.message || 'Banner deleted successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to delete the banner');
      return null;
    }
  } catch (error) {
    console.error('Error deleting banner:', error);
    toast.error('An error occurred while deleting the banner');
    return null;
  }
};

/**
 * Toggle banner active status
 * @param {string} id - Banner ID
 * @returns {Promise<Object>} Response data
 */
export const toggleBannerStatus = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}toggle/banner/${id}`, {}, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.data.status === 200 || response.status === 200) {
      toast.success(response.data.message || 'Banner status updated');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to update banner status');
      return null;
    }
  } catch (error) {
    console.error('Error toggling banner status:', error);
    toast.error('An error occurred while updating banner status');
    return null;
  }
};

/**
 * Reorder banners
 * @param {Array} reorderData - Array of {id, order} objects
 * @returns {Promise<Object>} Response data
 */
export const reorderBanners = async (reorderData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}reorder/banners`, { banners: reorderData }, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.data.status === 200 || response.status === 200) {
      toast.success(response.data.message || 'Banners reordered successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to reorder banners');
      return null;
    }
  } catch (error) {
    console.error('Error reordering banners:', error);
    toast.error('An error occurred while reordering banners');
    return null;
  }
};
