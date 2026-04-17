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
 * Fetch all deals
 * @returns {Promise<Array>} Array of deals
 */
export const fetchAllDeals = async () => {
  // Use /get/all/deals for admin dashboard to show ALL deals (published, unpublished, expired)
  console.log('🔵 fetchAllDeals called - Making API request to:', `${API_BASE_URL}get/all/deals`);
  console.log('🔵 Headers:', getHeaders());
  try {
    const response = await axios.get(`${API_BASE_URL}get/all/deals`, {
      headers: getHeaders()
    });
    
    console.log('✅ Deals API Response:', response.data); // Debug log
    
    // Handle response structure: { message, status, deals }
    if (response.data.status === 200 || response.status === 200) {
      // Response structure: { message, status, deals }
      const deals = response.data.deals || response.data.data || [];
      console.log('Parsed deals:', deals); // Debug log
      return deals;
    } else if (response.data.success) {
      // Alternative structure: { success, data }
      return response.data.data || [];
    } else {
      toast.error('Failed to load deals');
      return [];
    }
  } catch (error) {
    console.error('Error fetching deals:', error);
    console.error('Error details:', error.response?.data); // Debug log
    toast.error('Failed to load deals');
    return [];
  }
};

/**
 * Fetch single deal by ID
 * @param {string} id - Deal ID
 * @returns {Promise<Object>} Deal data
 */
export const fetchDealById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/deal/${id}`, {
      headers: getHeaders()
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      toast.error('Failed to load deal details');
      return null;
    }
  } catch (error) {
    console.error('Error fetching deal:', error);
    toast.error('Failed to load deal details');
    return null;
  }
};

/**
 * Create a new deal
 * @param {Object} dealData - Deal data
 * @returns {Promise<Object>} Response data
 */
export const createDeal = async (dealData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}create/deal`, dealData, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.data.status === 201 || response.status === 201) {
      toast.success(response.data.message || 'Deal created successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to create deal');
      return null;
    }
  } catch (error) {
    console.error('Error creating deal:', error);
    toast.error('An error occurred while creating the deal');
    return null;
  }
};

/**
 * Update an existing deal
 * @param {string} id - Deal ID
 * @param {Object} dealData - Updated deal data
 * @returns {Promise<Object>} Response data
 */
export const updateDeal = async (id, dealData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}update/deal/${id}`, dealData, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.data.status === 200 || response.status === 200) {
      toast.success(response.data.message || 'Deal updated successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to update deal');
      return null;
    }
  } catch (error) {
    console.error('Error updating deal:', error);
    toast.error('An error occurred while updating the deal');
    return null;
  }
};

/**
 * Mark deal as expired
 * @param {string} id - Deal ID
 * @returns {Promise<Object>} Response data
 */
export const expireDeal = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}expire/deal/${id}`, {}, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.data.status === 200 || response.status === 200) {
      toast.success(response.data.message || 'Deal marked as expired');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to expire deal');
      return null;
    }
  } catch (error) {
    console.error('Error expiring deal:', error);
    toast.error('An error occurred while expiring the deal');
    return null;
  }
};

/**
 * Unexpire a deal (reactivate it)
 * @param {string} id - Deal ID
 * @returns {Promise<Object>} Response data
 */
export const unexpireDeal = async (id) => {
  try {
    const response = await axios.put(`${API_BASE_URL}update/deal/${id}`, {
      isExpired: false
    }, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.data.status === 200 || response.status === 200) {
      toast.success(response.data.message || 'Deal reactivated successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to reactivate deal');
      return null;
    }
  } catch (error) {
    console.error('Error unexpiring deal:', error);
    toast.error('An error occurred while reactivating the deal');
    return null;
  }
};

/**
 * Delete a deal
 * @param {string} id - Deal ID
 * @returns {Promise<Object>} Response data
 */
export const deleteDeal = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/deal/${id}`, {
      headers: getHeaders()
    });
    
    if (response.data.success || response.status === 200 || response.status === 201) {
      toast.success(response.data.message || 'Deal deleted successfully');
      return response.data;
    } else {
      toast.error(response.data.message || 'Failed to delete the deal');
      return null;
    }
  } catch (error) {
    console.error('Error deleting deal:', error);
    toast.error('An error occurred while deleting the deal');
    return null;
  }
};

