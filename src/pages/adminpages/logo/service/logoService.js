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
 * Fetch current logo
 * @returns {Promise<Object>} Object with logo URL and metadata
 */
export const getLogo = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/logo`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return {
        logoUrl: response.data.data?.logoUrl || '',
        altText: response.data.data?.altText || 'Logo',
        faviconUrl: response.data.data?.faviconUrl || '',
        updatedAt: response.data.data?.updatedAt || null,
      };
    } else {
      toast.error('Failed to load logo');
      return {
        logoUrl: '',
        altText: 'Logo',
        faviconUrl: '',
        updatedAt: null,
      };
    }
  } catch (error) {
    console.error('Error fetching logo:', error);
    // Don't show error toast if endpoint doesn't exist yet (backward compatibility)
    if (error.response?.status !== 404) {
      toast.error('Failed to load logo');
    }
    return { logoUrl: '', altText: 'Logo', faviconUrl: '', updatedAt: null };
  }
};

/**
 * Update logo
 * @param {File} logoFile - The logo image file
 * @param {string} altText - Alt text for the logo
 * @returns {Promise<boolean>} True if successful
 */
export const updateLogo = async (logoFile, altText = 'Logo') => {
  try {
    const formData = new FormData();
    
    if (logoFile && logoFile instanceof File) {
      formData.append('logo', logoFile);
    }
    
    formData.append('altText', altText.trim() || 'Logo');

    const response = await axios.post(
      `${API_BASE_URL}update/logo`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Logo updated successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update logo');
      return false;
    }
  } catch (error) {
    console.error('Error updating logo:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update logo'
    );
    return false;
  }
};

/**
 * Delete logo
 * @returns {Promise<boolean>} True if successful
 */
export const deleteLogo = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/logo`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Logo removed successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to remove logo');
      return false;
    }
  } catch (error) {
    console.error('Error deleting logo:', error);
    toast.error(
      error.response?.data?.message || 'Failed to remove logo'
    );
    return false;
  }
};

/**
 * Update favicon (PNG or ICO, 512×512)
 * @param {File} faviconFile
 * @returns {Promise<boolean>}
 */
export const updateFavicon = async (faviconFile) => {
  try {
    const formData = new FormData();
    if (faviconFile && faviconFile instanceof File) {
      formData.append('favicon', faviconFile);
    }

    const response = await axios.post(
      `${API_BASE_URL}update/favicon`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Favicon updated successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update favicon');
      return false;
    }
  } catch (error) {
    console.error('Error updating favicon:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update favicon'
    );
    return false;
  }
};

/**
 * Delete favicon
 * @returns {Promise<boolean>}
 */
export const deleteFavicon = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/favicon`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Favicon removed successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to remove favicon');
      return false;
    }
  } catch (error) {
    console.error('Error deleting favicon:', error);
    toast.error(
      error.response?.data?.message || 'Failed to remove favicon'
    );
    return false;
  }
};
