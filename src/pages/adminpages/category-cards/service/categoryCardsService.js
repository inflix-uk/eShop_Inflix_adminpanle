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
 * Fetch all category cards
 * @returns {Promise<Array>} Array of category cards
 */
export const getCategoryCardsSectionSettings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/category-cards/section-settings`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching category cards section settings:', error);
    return null;
  }
};

export const updateCategoryCardsSectionSettings = async (payload) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}category-cards/section-settings`,
      payload,
      { headers: getHeaders() }
    );
    if (response.data.success) {
      toast.success(response.data.message || 'Section settings saved');
      return response.data.data || null;
    }
    toast.error(response.data.message || 'Failed to save section settings');
    return null;
  } catch (error) {
    console.error('Error saving category cards section settings:', error);
    toast.error(
      error.response?.data?.message || 'Failed to save section settings'
    );
    return null;
  }
};

export const getAllCategoryCards = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/category-cards`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data || [];
    } else {
      toast.error('Failed to load category cards');
      return [];
    }
  } catch (error) {
    console.error('Error fetching category cards:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load category cards');
    }
    return [];
  }
};

/**
 * Create a new category card
 * @param {Object} cardData - The category card data
 * @returns {Promise<Object|null>} Created card or null
 */
export const createCategoryCard = async (cardData) => {
  try {
    const formData = new FormData();
    
    if (cardData.backgroundImage && cardData.backgroundImage instanceof File) {
      formData.append('backgroundImage', cardData.backgroundImage);
      delete cardData.backgroundImage;
    }
    
    if (cardData.categoryImage && cardData.categoryImage instanceof File) {
      formData.append('categoryImage', cardData.categoryImage);
      delete cardData.categoryImage;
    }
    
    formData.append('cardData', JSON.stringify(cardData));

    const response = await axios.post(
      `${API_BASE_URL}create/category-card`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Category card created successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to create category card');
      return null;
    }
  } catch (error) {
    console.error('Error creating category card:', error);
    toast.error(
      error.response?.data?.message || 'Failed to create category card'
    );
    return null;
  }
};

/**
 * Update an existing category card
 * @param {string} id - Card ID
 * @param {Object} cardData - The category card data
 * @returns {Promise<Object|null>} Updated card or null
 */
export const updateCategoryCard = async (id, cardData) => {
  try {
    const formData = new FormData();
    
    if (cardData.backgroundImage && cardData.backgroundImage instanceof File) {
      formData.append('backgroundImage', cardData.backgroundImage);
      delete cardData.backgroundImage;
    }
    
    if (cardData.categoryImage && cardData.categoryImage instanceof File) {
      formData.append('categoryImage', cardData.categoryImage);
      delete cardData.categoryImage;
    }
    
    formData.append('cardData', JSON.stringify(cardData));

    const response = await axios.put(
      `${API_BASE_URL}update/category-card/${id}`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Category card updated successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to update category card');
      return null;
    }
  } catch (error) {
    console.error('Error updating category card:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update category card'
    );
    return null;
  }
};

/**
 * Delete a category card
 * @param {string} id - Card ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteCategoryCard = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/category-card/${id}`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Category card deleted successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to delete category card');
      return false;
    }
  } catch (error) {
    console.error('Error deleting category card:', error);
    toast.error(
      error.response?.data?.message || 'Failed to delete category card'
    );
    return false;
  }
};

/**
 * Delete an image from a category card
 * @param {string} id - Card ID
 * @param {string} imageField - 'categoryImage' or 'backgroundImage'
 * @returns {Promise<boolean>} True if successful
 */
export const deleteCategoryCardImage = async (id, imageField) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/category-card-image/${id}`,
      {
        headers: getHeaders(),
        data: { imageField }
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
    console.error('Error deleting category card image:', error);
    toast.error(
      error.response?.data?.message || 'Failed to delete image'
    );
    return false;
  }
};

/**
 * Toggle active status of a category card
 * @param {string} id - Card ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<boolean>} True if successful
 */
export const toggleCategoryCardStatus = async (id, isActive) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}toggle/category-card/${id}`,
      { isActive },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success(`Category card ${isActive ? 'activated' : 'deactivated'} successfully`);
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update card status');
      return false;
    }
  } catch (error) {
    console.error('Error toggling category card status:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update card status'
    );
    return false;
  }
};

/**
 * Reorder category cards
 * @param {Array} cardIds - Array of card IDs in new order
 * @returns {Promise<boolean>} True if successful
 */
export const reorderCategoryCards = async (cardIds) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}reorder/category-cards`,
      { cardIds },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Category cards reordered successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to reorder cards');
      return false;
    }
  } catch (error) {
    console.error('Error reordering category cards:', error);
    toast.error(
      error.response?.data?.message || 'Failed to reorder cards'
    );
    return false;
  }
};
