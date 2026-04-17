import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Orders Service - Handles all API calls related to orders
 */

/**
 * Fetch orders with server-side pagination, filtering, and search
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} limit - Number of orders per page (default: 25)
 * @param {string} filter - Status filter (all, pending, shipped, etc.)
 * @param {string} search - Search query
 * @returns {Promise} - Response data containing orders
 */
export const getOrders = async (page = 1, limit = 25, filter = 'all', search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      filter: filter,
      search: search
    });

    const response = await axios.get(`${BACKEND_URL}get/order?${params.toString()}`);
    return {
      success: true,
      data: response.data,
      status: response.data.status,
      hasMore: response.data.hasMore ?? false,
      pagination: response.data.pagination || null
    };
  } catch (error) {
    console.error(`Error fetching orders (page ${page}):`, error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch orders'
    };
  }
};

/**
 * Fetch orders for CSV export (dedicated API with full product details)
 * @param {string} filter - Status filter (all, pending, shipped, etc.)
 * @param {string} search - Search query
 * @returns {Promise} - Response data containing orders for export
 */
export const getOrdersForExport = async (filter = 'all', search = '') => {
  try {
    const params = new URLSearchParams({
      filter: filter,
      search: search
    });

    const response = await axios.get(`${BACKEND_URL}get/order/export?${params.toString()}`);
    return {
      success: true,
      orders: response.data.orders,
      totalCount: response.data.totalCount,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching export data:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch export data'
    };
  }
};

/**
 * Fetch order statistics
 * @returns {Promise} - Response data containing stats
 */
export const getStats = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/stats4`);
    return {
      success: true,
      data: response.data,
      stats: response.data.stats
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch statistics'
    };
  }
};

/**
 * Fetch order statistics for tabs
 * Returns: totalOrders, pendingOrders, approvedOrders, shippedOrders
 * @returns {Promise} - Response data containing order stats
 */
export const getOrderStats = async () => {
  try {
    // Use stats4 endpoint with all-time filter (works on current production)
    const response = await axios.get(`${BACKEND_URL}get/stats4?filter=all`);

    const stats = response.data.stats || {};
    return {
      success: true,
      stats: {
        totalOrders: stats.totalOrders || 0,
        pendingOrders: stats.pendingOrders || 0,
        approvedOrders: stats.approvedOrders || 0,
        shippedOrders: stats.shippedOrders || 0,
      }
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    // Return default stats on error to prevent UI crash
    return {
      success: false,
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        shippedOrders: 0,
      },
      error: error.response?.data?.message || error.message || 'Failed to fetch order statistics'
    };
  }
};

/**
 * Update order status
 * @param {string} orderId - The order ID to update
 * @param {object} updateData - The update data containing status and other fields
 * @returns {Promise} - Response data
 */
export const updateOrderStatus = async (orderId, updateData) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}update/order/${orderId}`, updateData);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update order status'
    };
  }
};

/**
 * Delete an order
 * @param {string} orderId - The order ID to delete
 * @returns {Promise} - Response data
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}delete/order/${orderId}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error deleting order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete order'
    };
  }
};

/**
 * Fetch a single order by ID
 * @param {string} orderId - The order ID to fetch
 * @returns {Promise} - Response data containing order details
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/order/${orderId}`);
    return {
      success: true,
      data: response.data,
      order: response.data.order
    };
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch order'
    };
  }
};

/**
 * Fetch cart details for a specific order (on-demand loading)
 * @param {string} orderId - The order ID to fetch cart for
 * @returns {Promise} - Response data containing cart items
 */
export const getOrderCart = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/order/cart/${orderId}`);
    return {
      success: true,
      cart: response.data.cart,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching order cart:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch cart'
    };
  }
};

/**
 * Fetch a single order by ID (Admin view with full details)
 * @param {string} orderId - The order ID to fetch
 * @returns {Promise} - Response data containing order details
 */
export const getOrderByAdmin = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/order/admin/${orderId}`);
    return {
      success: true,
      data: response.data,
      order: response.data.order,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching order by admin:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch order details'
    };
  }
};

/**
 * Fetch all coupons
 * @returns {Promise} - Response data containing all coupons
 */
export const getCoupons = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/all/coupons`);
    return {
      success: true,
      data: response.data,
      coupons: response.data.coupon,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch coupons'
    };
  }
};

/**
 * Update shipping details only (status, provider, trackingNumber, notes)
 * @param {string} orderId - The order ID to update
 * @param {object} updateData - The shipping update data
 * @returns {Promise} - Response data
 */
export const updateOrderShipping = async (orderId, updateData) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}update/order/shipping/${orderId}`, updateData);
    return {
      success: true,
      data: response.data,
      order: response.data.order,
      message: response.data.message,
      status: response.status
    };
  } catch (error) {
    console.error('Error updating shipping details:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update shipping details'
    };
  }
};

/**
 * Update order (full update with all order data)
 * @param {string} orderId - The order ID to update
 * @param {object} orderData - The complete order data to update
 * @returns {Promise} - Response data
 */
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}update/order/${orderId}`, orderData);
    return {
      success: true,
      data: response.data,
      order: response.data.order,
      status: response.status
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update order'
    };
  }
};

/**
 * Bulk update orders
 * @param {Array} orderIds - Array of order IDs to update
 * @param {object} updateData - The update data to apply to all orders
 * @returns {Promise} - Response data
 */
export const bulkUpdateOrders = async (orderIds, updateData) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}update/orders/bulk`, {
      orderIds,
      updateData
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error bulk updating orders:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to bulk update orders'
    };
  }
};

/**
 * Export orders data
 * @param {object} filters - Filter criteria for export
 * @returns {Promise} - Response data containing export file
 */
export const exportOrders = async (filters = {}) => {
  try {
    const response = await axios.post(`${BACKEND_URL}export/orders`, filters, {
      responseType: 'blob'
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error exporting orders:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to export orders'
    };
  }
};

/**
 * Get available (unused) labels
 * @param {number} limit - Maximum number of labels to fetch
 * @returns {Promise} - Response data containing available labels
 */
export const getAvailableLabels = async (limit = 100) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/labels?used=false&limit=${limit}`);
    return {
      success: true,
      labels: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching available labels:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch available labels'
    };
  }
};

/**
 * Get label assigned to an order
 * @param {string} orderId - The order ID to get label for
 * @returns {Promise} - Response data containing the label
 */
export const getLabelOfOrder = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}order/${orderId}/label`);
    return {
      success: true,
      label: response.data.label
    };
  } catch (error) {
    // 404 means no label assigned, which is not an error
    if (error.response?.status === 404) {
      return {
        success: true,
        label: null
      };
    }
    console.error('Error fetching order label:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch order label'
    };
  }
};

/**
 * Assign a label to an order
 * @param {string} orderId - The order ID to assign label to
 * @param {string} labelId - The label ID to assign
 * @returns {Promise} - Response data
 */
export const assignLabelToOrder = async (orderId, labelId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}assign/label/to/order`, {
      orderId,
      labelId
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error assigning label to order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to assign label to order'
    };
  }
};

/**
 * Get unread message counts for multiple orders
 * @param {Array} orderIds - Array of order IDs to get counts for
 * @returns {Promise} - Response data containing unread counts map
 */
export const getUnreadCountsForOrders = async (orderIds) => {
  try {
    if (!orderIds || orderIds.length === 0) {
      return { success: true, unreadCounts: {} };
    }

    const response = await axios.post(`${BACKEND_URL}messages/orders/unread-counts`, {
      orderIds
    });

    return {
      success: true,
      unreadCounts: response.data.unreadCounts || {}
    };
  } catch (error) {
    console.error('Error fetching unread counts for orders:', error);
    return {
      success: false,
      unreadCounts: {},
      error: error.response?.data?.message || error.message || 'Failed to fetch unread counts'
    };
  }
};

// Default export containing all service methods
const ordersService = {
  getOrders,
  getOrdersForExport,
  getStats,
  getOrderStats,
  updateOrderStatus,
  updateOrderShipping,
  deleteOrder,
  getOrderById,
  getOrderCart,
  getOrderByAdmin,
  getCoupons,
  updateOrder,
  bulkUpdateOrders,
  exportOrders,
  getAvailableLabels,
  getLabelOfOrder,
  assignLabelToOrder,
  getUnreadCountsForOrders
};

export default ordersService;
