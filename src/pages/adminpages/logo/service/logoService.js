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
    const response = await axios.get(`${API_BASE_URL}get/logo`, {
      headers: getHeaders(),
      params: { _: Date.now() },
    });

    if (response.data.success) {
      return {
        logoUrl: response.data.data?.logoUrl || '',
        altText: response.data.data?.altText || 'Logo',
        faviconUrl: response.data.data?.faviconUrl || '',
        updatedAt: response.data.data?.updatedAt || null,
        faviconVersion: response.data.data?.faviconVersion ?? null,
      };
    } else {
      toast.error('Failed to load logo');
      return {
        logoUrl: '',
        altText: 'Logo',
        faviconUrl: '',
        updatedAt: null,
        faviconVersion: null,
      };
    }
  } catch (error) {
    console.error('Error fetching logo:', error);
    // Don't show error toast if endpoint doesn't exist yet (backward compatibility)
    if (error.response?.status !== 404) {
      toast.error('Failed to load logo');
    }
    return {
      logoUrl: '',
      altText: 'Logo',
      faviconUrl: '',
      updatedAt: null,
      faviconVersion: null,
    };
  }
};

/**
 * Update logo
 * @param {File|null} logoFile - The logo image file (optional if logoUrl provided)
 * @param {string} altText - Alt text for the logo
 * @param {string|null} logoUrl - Media library URL (optional if logoFile provided)
 * @returns {Promise<boolean>} True if successful
 */
export const updateLogo = async (logoFile, altText = 'Logo', logoUrl = null) => {
  try {
    const formData = new FormData();
    
    if (logoFile && logoFile instanceof File) {
      formData.append('logo', logoFile);
    } else if (logoUrl && typeof logoUrl === 'string') {
      formData.append('logoUrl', logoUrl);
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
 * Update favicon (PNG or ICO, 512×512) from file or media library URL
 * @param {File|null} faviconFile
 * @param {string|null} faviconUrl
 * @returns {Promise<{ faviconUrl: string; updatedAt: number; faviconVersion?: number } | null>}
 */
export const updateFavicon = async (faviconFile, faviconUrl = null) => {
  try {
    const formData = new FormData();
    if (faviconFile && faviconFile instanceof File) {
      formData.append('favicon', faviconFile);
    } else if (faviconUrl && typeof faviconUrl === 'string') {
      formData.append('faviconUrl', faviconUrl);
    }

    const response = await axios.post(
      `${API_BASE_URL}update/favicon`,
      formData,
      { headers: getUploadHeaders() }
    );

    if (response.data.success) {
      toast.success('Favicon updated successfully');
      return response.data.data || null;
    } else {
      toast.error(response.data.message || 'Failed to update favicon');
      return null;
    }
  } catch (error) {
    console.error('Error updating favicon:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update favicon'
    );
    return null;
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
