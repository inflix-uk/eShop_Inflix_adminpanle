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
 * Fetch current Stripe settings
 * @returns {Promise<Object>} Stripe settings with masked keys
 */
export const getStripeSettings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}stripe/settings`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      toast.error('Failed to load Stripe settings');
      return null;
    }
  } catch (error) {
    console.error('Error fetching Stripe settings:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load Stripe settings');
    }
    return null;
  }
};

/**
 * Save Stripe settings
 * @param {Object} settings - The settings to save
 * @param {string} settings.secretKey - Stripe secret key
 * @param {string} settings.publishableKey - Stripe publishable key
 * @param {string} settings.webhookSecret - Stripe webhook secret
 * @param {boolean} settings.isActive - Whether settings are active
 * @returns {Promise<boolean>} True if successful
 */
export const saveStripeSettings = async (settings) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}stripe/settings`,
      settings,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Stripe settings saved successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to save Stripe settings');
      return null;
    }
  } catch (error) {
    console.error('Error saving Stripe settings:', error);
    toast.error(
      error.response?.data?.message || 'Failed to save Stripe settings'
    );
    return null;
  }
};

/**
 * Test Stripe connection
 * @returns {Promise<Object>} Connection test result
 */
export const testStripeConnection = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}stripe/test-connection`,
      {},
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Stripe connection successful!');
      return response.data;
    } else {
      toast.error(response.data.message || 'Stripe connection failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing Stripe connection:', error);
    toast.error(
      error.response?.data?.message || 'Stripe connection test failed'
    );
    return null;
  }
};
