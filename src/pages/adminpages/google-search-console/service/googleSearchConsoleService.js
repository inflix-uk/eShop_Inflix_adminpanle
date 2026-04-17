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
 * Fetch Google Search Console verification code
 * @returns {Promise<Object>} Object with verificationCode and isActive
 */
export const getGoogleSearchConsoleVerification = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}get/google-search-console-verification`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return {
        verificationCode: response.data.data?.verificationCode || '',
        isActive: response.data.data?.isActive || false,
      };
    } else {
      toast.error('Failed to load verification code');
      return { verificationCode: '', isActive: false };
    }
  } catch (error) {
    console.error('Error fetching Google Search Console verification:', error);
    // Don't show error toast if endpoint doesn't exist yet (backward compatibility)
    if (error.response?.status !== 404) {
      toast.error('Failed to load verification code');
    }
    return { verificationCode: '', isActive: false };
  }
};

/**
 * Update Google Search Console verification code
 * @param {string} verificationCode - The verification code from Google
 * @returns {Promise<boolean>} True if successful
 */
export const updateGoogleSearchConsoleVerification = async (verificationCode) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}update/google-search-console-verification`,
      { verificationCode: verificationCode.trim() },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Verification code updated successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to update verification code');
      return false;
    }
  } catch (error) {
    console.error('Error updating Google Search Console verification:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update verification code'
    );
    return false;
  }
};

/**
 * Delete Google Search Console verification code
 * @returns {Promise<boolean>} True if successful
 */
export const deleteGoogleSearchConsoleVerification = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}delete/google-search-console-verification`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Verification code removed successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to remove verification code');
      return false;
    }
  } catch (error) {
    console.error('Error deleting Google Search Console verification:', error);
    toast.error(
      error.response?.data?.message || 'Failed to remove verification code'
    );
    return false;
  }
};
