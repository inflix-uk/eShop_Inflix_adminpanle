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
 * Fetch all shipping settings
 */
export const getShippingSettings = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}shipping/settings`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      toast.error('Failed to load shipping settings');
      return null;
    }
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to load shipping settings');
    }
    return null;
  }
};

/**
 * Add a new shipping method
 */
export const addShippingMethod = async (method) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}shipping/methods`,
      method,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Shipping method added successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to add shipping method');
      return null;
    }
  } catch (error) {
    console.error('Error adding shipping method:', error);
    toast.error(
      error.response?.data?.message || 'Failed to add shipping method'
    );
    return null;
  }
};

/**
 * Update a shipping method
 */
export const updateShippingMethod = async (methodId, updates) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}shipping/methods/${methodId}`,
      updates,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Shipping method updated successfully');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to update shipping method');
      return null;
    }
  } catch (error) {
    console.error('Error updating shipping method:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update shipping method'
    );
    return null;
  }
};

/**
 * Delete a shipping method
 */
export const deleteShippingMethod = async (methodId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}shipping/methods/${methodId}`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Shipping method deleted successfully');
      return true;
    } else {
      toast.error(response.data.message || 'Failed to delete shipping method');
      return false;
    }
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    toast.error(
      error.response?.data?.message || 'Failed to delete shipping method'
    );
    return false;
  }
};

/**
 * Toggle shipping method status
 */
export const toggleShippingMethodStatus = async (methodId) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}shipping/methods/${methodId}/toggle`,
      {},
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success(response.data.message);
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to toggle shipping method');
      return null;
    }
  } catch (error) {
    console.error('Error toggling shipping method:', error);
    toast.error(
      error.response?.data?.message || 'Failed to toggle shipping method'
    );
    return null;
  }
};

/**
 * Update free shipping settings
 */
export const updateFreeShipping = async (settings) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}shipping/free-shipping`,
      settings,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Free shipping settings updated');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to update free shipping settings');
      return null;
    }
  } catch (error) {
    console.error('Error updating free shipping:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update free shipping settings'
    );
    return null;
  }
};

/**
 * Reorder shipping methods
 */
export const reorderShippingMethods = async (methodIds) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}shipping/methods/reorder`,
      { methodIds },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      toast.success('Shipping methods reordered');
      return response.data.data;
    } else {
      toast.error(response.data.message || 'Failed to reorder shipping methods');
      return null;
    }
  } catch (error) {
    console.error('Error reordering shipping methods:', error);
    toast.error(
      error.response?.data?.message || 'Failed to reorder shipping methods'
    );
    return null;
  }
};
