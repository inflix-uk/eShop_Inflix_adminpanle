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
 * Fetch all homepage features
 * @returns {Promise<Array>} Array of homepage features
 */
export const getAllHomepageFeatures = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/homepage-features`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data || [];
    } else {
      toast.error('Failed to load homepage features');
      return [];
    }
  } catch (error) {
    console.error('Error fetching homepage features:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load homepage features');
    }
    return [];
  }
};

/**
 * Create a new homepage feature
 * @param {Object} featureData - The feature data
 * @returns {Promise<Object|null>} Created feature or null
 */
export const createHomepageFeature = async (featureData) => {
  try {
    const formData = new FormData();
    
    if (featureData.iconImage && featureData.iconImage instanceof File) {
      formData.append('iconImage', featureData.iconImage);
      delete featureData.iconImage;
    }
    
    formData.append('featureData', JSON.stringify(featureData));

    const response = await axios.post(
      `${API_BASE_URL}create/homepage-feature`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Homepage feature created successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to create homepage feature');
      return null;
    }
  } catch (error) {
    console.error('Error creating homepage feature:', error);
    toast.error(
      error.response?.data?.message || 'Failed to create homepage feature'
    );
    return null;
  }
};

/**
 * Update an existing homepage feature
 * @param {string} id - Feature ID
 * @param {Object} featureData - The feature data
 * @returns {Promise<Object|null>} Updated feature or null
 */
export const updateHomepageFeature = async (id, featureData) => {
  try {
    const formData = new FormData();
    
    if (featureData.iconImage && featureData.iconImage instanceof File) {
      formData.append('iconImage', featureData.iconImage);
      delete featureData.iconImage;
    }
    
    formData.append('featureData', JSON.stringify(featureData));

    const response = await axios.put(
      `${API_BASE_URL}update/homepage-feature/${id}`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Homepage feature updated successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to update homepage feature');
      return null;
    }
  } catch (error) {
    console.error('Error updating homepage feature:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update homepage feature'
    );
    return null;
  }
};

/**
 * Delete a homepage feature
 * @param {string} id - Feature ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteHomepageFeature = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/homepage-feature/${id}`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Homepage feature deleted successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to delete homepage feature');
      return false;
    }
  } catch (error) {
    console.error('Error deleting homepage feature:', error);
    toast.error(
      error.response?.data?.message || 'Failed to delete homepage feature'
    );
    return false;
  }
};

/**
 * Delete icon image from a homepage feature
 * @param {string} id - Feature ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteHomepageFeatureImage = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/homepage-feature-image/${id}`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Image deleted successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to delete image');
      return false;
    }
  } catch (error) {
    console.error('Error deleting homepage feature image:', error);
    toast.error(
      error.response?.data?.message || 'Failed to delete image'
    );
    return false;
  }
};

/**
 * Toggle active status of a homepage feature
 * @param {string} id - Feature ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<boolean>} True if successful
 */
export const toggleHomepageFeatureStatus = async (id, isActive) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}toggle/homepage-feature/${id}`,
      { isActive },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success(`Feature ${isActive ? 'activated' : 'deactivated'} successfully`);
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update feature status');
      return false;
    }
  } catch (error) {
    console.error('Error toggling homepage feature status:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update feature status'
    );
    return false;
  }
};

/**
 * Reorder homepage features
 * @param {Array} featureIds - Array of feature IDs in new order
 * @returns {Promise<boolean>} True if successful
 */
export const reorderHomepageFeatures = async (featureIds) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}reorder/homepage-features`,
      { featureIds },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Features reordered successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to reorder features');
      return false;
    }
  } catch (error) {
    console.error('Error reordering homepage features:', error);
    toast.error(
      error.response?.data?.message || 'Failed to reorder features'
    );
    return false;
  }
};
