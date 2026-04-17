import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


/**
 * Return Orders Service - Handles all API calls related to return orders and requests
 */

// ========================================================================
// USER FUNCTIONS
// ========================================================================

/**
 * Fetch all users basic info for dropdown selection
 * @returns {Promise} - Response data containing users with basic info
 */
export const getUsersBasicInfo = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/users/basic-info`);
    return {
      success: true,
      data: response.data,
      users: response.data.users || [],
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching users basic info:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch users'
    };
  }
};

/**
 * Fetch order numbers for a specific user (fast endpoint for dropdowns)
 * @param {string} userId - The user ID
 * @returns {Promise} - Response data containing order numbers
 */
export const getOrderNumbersByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/order-numbers/user/${userId}`);
    return {
      success: true,
      data: response.data,
      orders: response.data.orders || [],
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching order numbers for user:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch order numbers'
    };
  }
};

// ========================================================================
// RETURN ORDERS FUNCTIONS
// ========================================================================

/**
 * Fetch return orders by date filter
 * @param {string} dateFilter - Date filter: 'initial' (last 7 days) or 'remaining' (older)
 * @returns {Promise} - Response data containing return orders
 */
export const getReturnOrders = async (dateFilter = 'initial') => {
  try {
    const response = await axios.get(`${BACKEND_URL}getallreturn/orders?dateFilter=${dateFilter}`);
    return {
      success: true,
      data: response.data,
      returnOrders: response.data.returnOrders,
      status: response.data.status
    };
  } catch (error) {
    console.error(`Error fetching ${dateFilter} return orders:`, error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch return orders'
    };
  }
};

/**
 * Fetch return order statistics
 * @returns {Promise} - Response data containing stats
 */
export const getReturnOrderStats = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/stats2`);
    return {
      success: true,
      data: response.data,
      stats: response.data.stats
    };
  } catch (error) {
    console.error('Error fetching return order stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch statistics'
    };
  }
};

/**
 * Fetch return requests
 * @returns {Promise} - Response data containing return requests
 */
export const getReturnRequests = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}getallrequest/orders`);
    return {
      success: true,
      data: response.data,
      returnRequests: response.data.data,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching return requests:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch return requests'
    };
  }
};

/**
 * Fetch return request statistics
 * @returns {Promise} - Response data containing stats
 */
export const getReturnRequestStats = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/stats3`);
    return {
      success: true,
      data: response.data,
      stats: response.data.stats
    };
  } catch (error) {
    console.error('Error fetching return request stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch statistics'
    };
  }
};

/**
 * Update return order status
 * @param {string} orderId - The return order ID to update
 * @param {string} status - The new status
 * @returns {Promise} - Response data
 */
export const updateReturnOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}returnOrder/updateStatus/${orderId}`, { status });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Error updating return order status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update status'
    };
  }
};

/**
 * Delete a return order
 * @param {string} orderId - The return order ID to delete
 * @returns {Promise} - Response data
 */
export const deleteReturnOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}delete/return/${orderId}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error deleting return order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete return order'
    };
  }
};

/**
 * Fetch a single return request by ID
 * @param {string} requestId - The return request ID to fetch
 * @returns {Promise} - Response data containing return request details
 */
export const getReturnRequestById = async (requestId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/request/${requestId}`);
    return {
      success: true,
      data: response.data,
      returnRequest: response.data.data,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching return request by ID:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch return request'
    };
  }
};

/**
 * Fetch a single return order by ID
 * @param {string} orderId - The return order ID to fetch
 * @returns {Promise} - Response data containing return order details
 */
export const getReturnOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/return/${orderId}`);
    return {
      success: true,
      data: response.data,
      returnOrder: response.data.returnOrder,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching return order by ID:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch return order'
    };
  }
};

/**
 * Update a return order
 * @param {string} orderId - The return order ID to update
 * @param {FormData} formData - The form data containing updated order information
 * @returns {Promise} - Response data
 */
export const updateReturnOrder = async (orderId, formData) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}update/return/${orderId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Return order updated successfully',
      status: response.status
    };
  } catch (error) {
    console.error('Error updating return order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update return order'
    };
  }
};

/**
 * Update return request status
 * @param {string} requestId - The return request ID to update
 * @param {string} status - The new status
 * @returns {Promise} - Response data
 */
export const updateReturnRequestStatus = async (requestId, status) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}updatestatus/requestorder/${requestId}`, { status });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Error updating return request status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update status'
    };
  }
};

/**
 * Delete a return request
 * @param {string} requestId - The return request ID to delete
 * @returns {Promise} - Response data
 */
export const deleteReturnRequest = async (requestId) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}delete/request/${requestId}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Return request deleted successfully',
      status: response.status
    };
  } catch (error) {
    console.error('Error deleting return request:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete return request'
    };
  }
};

// ========================================================================
// RETURN ORDER OPTIONS (Dynamic Dropdowns)
// ========================================================================

/**
 * Fetch all return order options grouped by type
 * @returns {Promise} - Response data containing grouped options
 */
export const getReturnOrderOptionsGrouped = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}return-order-options/grouped`);
    return {
      success: true,
      data: response.data,
      options: response.data.options,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching return order options:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch options'
    };
  }
};

/**
 * Fetch return order options by type
 * @param {string} type - Option type: 'account', 'platform', 'status', 'customerAsks'
 * @returns {Promise} - Response data containing options
 */
export const getReturnOrderOptionsByType = async (type) => {
  try {
    const response = await axios.get(`${BACKEND_URL}return-order-options/type/${type}`);
    return {
      success: true,
      data: response.data,
      options: response.data.options,
      status: response.data.status
    };
  } catch (error) {
    console.error(`Error fetching ${type} options:`, error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch options'
    };
  }
};

/**
 * Create a new return order option
 * @param {string} name - Option name
 * @param {string} type - Option type: 'account', 'platform', 'status', 'customerAsks'
 * @returns {Promise} - Response data containing created option
 */
export const createReturnOrderOption = async (name, type) => {
  try {
    const response = await axios.post(`${BACKEND_URL}return-order-options`, { name, type });
    return {
      success: true,
      data: response.data,
      option: response.data.option,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error creating return order option:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create option'
    };
  }
};

/**
 * Seed default return order options
 * @returns {Promise} - Response data
 */
export const seedReturnOrderOptions = async () => {
  try {
    const response = await axios.post(`${BACKEND_URL}return-order-options/seed`);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error seeding return order options:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to seed options'
    };
  }
};

/**
 * Update a return order option
 * @param {string} id - Option ID
 * @param {string} name - New option name
 * @returns {Promise} - Response data containing updated option
 */
export const updateReturnOrderOption = async (id, name) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}return-order-options/${id}`, { name });
    return {
      success: true,
      data: response.data,
      option: response.data.option,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error updating return order option:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update option'
    };
  }
};

/**
 * Delete a return order option
 * @param {string} id - Option ID to delete
 * @returns {Promise} - Response data
 */
export const deleteReturnOrderOption = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}return-order-options/${id}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error deleting return order option:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete option'
    };
  }
};

/**
 * Cache helper functions for return orders
 */

/**
 * Check if cache is valid (created today)
 * @returns {boolean} - True if cache is valid
 */
export const isCacheValid = () => {
  const cacheDate = localStorage.getItem('returnOrdersRemainingCacheDate');
  if (!cacheDate) return false;

  const today = new Date().toDateString();
  return cacheDate === today;
};

/**
 * Save remaining orders to cache
 * @param {Array} orders - Orders to cache
 */
export const saveRemainingOrdersToCache = (orders) => {
  const today = new Date().toDateString();
  localStorage.setItem('returnOrdersRemainingCache', JSON.stringify(orders));
  localStorage.setItem('returnOrdersRemainingCacheDate', today);
};

/**
 * Get remaining orders from cache
 * @returns {Array} - Cached orders
 */
export const getRemainingOrdersFromCache = () => {
  const cachedOrders = localStorage.getItem('returnOrdersRemainingCache');
  return cachedOrders ? JSON.parse(cachedOrders) : [];
};

// ========================================================================
// LABEL FUNCTIONS
// ========================================================================

/**
 * Fetch available (unused) labels
 * @param {number} limit - Maximum number of labels to fetch (default: 100)
 * @returns {Promise} - Response data containing available labels
 */
export const getAvailableLabels = async (limit = 100) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/labels?used=false&limit=${limit}`);
    return {
      success: true,
      data: response.data,
      labels: response.data.data || [],
      status: response.status
    };
  } catch (error) {
    console.error('Error fetching labels:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch labels'
    };
  }
};

/**
 * Get label assigned to a return order
 * @param {string} orderId - The return order ID
 * @returns {Promise} - Response data containing the label
 */
export const getLabelOfReturnOrder = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}return-order/${orderId}/label`);
    return {
      success: true,
      data: response.data,
      label: response.data.label,
      status: response.status
    };
  } catch (error) {
    // 404 is expected when no label is assigned
    if (error.response?.status === 404) {
      return {
        success: true,
        label: null,
        status: 404
      };
    }
    console.error('Error fetching label for return order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch label'
    };
  }
};

/**
 * Assign label to a return order
 * @param {string} orderId - The return order ID
 * @param {string} labelId - The label ID to assign
 * @returns {Promise} - Response data
 */
export const assignLabelToReturnOrder = async (orderId, labelId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}assign/label/to/return-order`, {
      orderId,
      labelId
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      status: response.status
    };
  } catch (error) {
    console.error('Error assigning label:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to assign label'
    };
  }
};

// Default export containing all service methods
const returnOrdersService = {
  // User functions
  getUsersBasicInfo,
  getOrderNumbersByUserId,
  // Return Orders
  getReturnOrders,
  getReturnOrderStats,
  getReturnRequests,
  getReturnRequestStats,
  getReturnRequestById,
  getReturnOrderById,
  updateReturnOrder,
  updateReturnRequestStatus,
  updateReturnOrderStatus,
  deleteReturnOrder,
  deleteReturnRequest,
  isCacheValid,
  saveRemainingOrdersToCache,
  getRemainingOrdersFromCache,
  // Return Order Options (Dynamic Dropdowns)
  getReturnOrderOptionsGrouped,
  getReturnOrderOptionsByType,
  createReturnOrderOption,
  updateReturnOrderOption,
  deleteReturnOrderOption,
  seedReturnOrderOptions,
  // Labels
  getAvailableLabels,
  getLabelOfReturnOrder,
  assignLabelToReturnOrder
};

export default returnOrdersService;
