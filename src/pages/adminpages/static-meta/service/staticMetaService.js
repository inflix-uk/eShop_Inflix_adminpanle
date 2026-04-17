import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetch all static meta pages
 * @returns {Promise<Array>} Array of static meta pages
 */
export const fetchStaticMetaPages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/static-meta-pages`);
    
    if (response.data.success) {
      // Transform the data to match our component's expected structure
      return response.data.data.map(page => ({
        id: page._id,
        pageName: page.pageName,
        path: page.path,
        titleTag: page.titleTag,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords || '',
        canonicalUrl: page.canonicalUrl || '',
        metaSchemas: page.metaSchemas || [],
        isPublished: page.isPublished,
        updatedAt: page.updatedAt
      }));
    } else {
      toast.error('Failed to load pages');
      return [];
    }
  } catch (error) {
    console.error('Error fetching static meta pages:', error);
    toast.error('Failed to load pages');
    return [];
  }
};

/**
 * Toggle publish status of a static meta page
 * @param {string} id - Page ID
 * @returns {Promise<Object>} Response data
 */
export const togglePublishStatus = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}toggle-publish/static-meta-page/${id}`);
    
    if (response.data.success) {
      toast.success('Page status updated');
    } else {
      toast.error(response.data.message || 'Failed to update page status');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error toggling publish status:', error);
    toast.error('Failed to update page status');
    throw error;
  }
};

/**
 * Update an existing static meta page
 * @param {string} id - Page ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Response data
 */
export const updateStaticMetaPage = async (id, updateData) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}update/static-meta-page/${id}`,
      updateData
    );
    
    if (response.data.success) {
      toast.success("Meta information updated successfully");
    } else {
      toast.error(response.data.message || "Failed to update meta information");
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating static meta page:', error);
    toast.error(error.response?.data?.message || "Failed to update meta information");
    throw error;
  }
};

/**
 * Create a new static meta page
 * @param {Object} pageData - New page data
 * @returns {Promise<Object>} Response data with new page
 */
export const createStaticMetaPage = async (pageData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}create/static-meta-page`,
      pageData
    );
    
    if (response.data.success) {
      toast.success("New page created successfully");
      
      // Format the response data to match our component's expected structure
      return {
        success: true,
        data: {
          id: response.data.data._id,
          pageName: response.data.data.pageName,
          path: response.data.data.path,
          titleTag: response.data.data.titleTag,
          metaDescription: response.data.data.metaDescription,
          metaKeywords: response.data.data.metaKeywords || '',
          canonicalUrl: response.data.data.canonicalUrl || '',
          metaSchemas: response.data.data.metaSchemas || [],
          isPublished: response.data.data.isPublished,
          updatedAt: response.data.data.updatedAt
        }
      };
    } else {
      toast.error(response.data.message || "Failed to create new page");
      return { success: false };
    }
  } catch (error) {
    console.error('Error creating static meta page:', error);
    toast.error(error.response?.data?.message || "Failed to create new page");
    throw error;
  }
};

/**
 * Delete a static meta page
 * @param {string} id - Page ID to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteStaticMetaPage = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/static-meta-page/${id}`);
    
    if (response.data.success) {
      toast.success("Page deleted successfully");
    } else {
      toast.error(response.data.message || "Failed to delete page");
    }
    
    return response.data;
  } catch (error) {
    console.error('Error deleting static meta page:', error);
    toast.error(error.response?.data?.message || "Failed to delete page");
    throw error;
  }
};
