import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Chat Window Service
 * Handles all API calls for chat window components
 */

/**
 * Fetch order details by ID
 * @param {string} orderId - The order ID
 * @returns {Promise} - Response data containing order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/order/${orderId}`);
    return {
      success: true,
      order: response.data.order,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch order details'
    };
  }
};

/**
 * Get all orders for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise} - Response data containing user's orders
 */
export const getUserOrders = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/orders/user/${userId}`);
    return {
      success: true,
      orders: response.data.orders,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch user orders'
    };
  }
};

/**
 * Update order status
 * @param {string} orderId - The order ID
 * @param {string} status - The new status
 * @returns {Promise} - Response data
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${BACKEND_URL}update/order/status/${orderId}`, {
      status
    });
    return {
      success: true,
      order: response.data.order,
      message: response.data.message
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
 * Get tracking information for an order
 * @param {string} orderId - The order ID
 * @returns {Promise} - Response data containing tracking info
 */
export const getOrderTracking = async (orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/order/tracking/${orderId}`);
    return {
      success: true,
      tracking: response.data.tracking,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch tracking information'
    };
  }
};

/**
 * Add tracking number to an order
 * @param {string} orderId - The order ID
 * @param {string} trackingNumber - The tracking number
 * @param {string} carrier - The carrier name (optional)
 * @returns {Promise} - Response data
 */
export const addTrackingNumber = async (orderId, trackingNumber, carrier = null) => {
  try {
    const response = await axios.put(`${BACKEND_URL}update/order/tracking/${orderId}`, {
      trackingNumber,
      carrier
    });
    return {
      success: true,
      order: response.data.order,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error adding tracking number:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to add tracking number'
    };
  }
};

/**
 * Get user details by ID
 * @param {string} userId - The user ID
 * @returns {Promise} - Response data containing user details
 */
export const getUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/user/${userId}`);
    return {
      success: true,
      user: response.data.user,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch user details'
    };
  }
};

/**
 * Upload file/attachment
 * @param {File} file - The file to upload
 * @param {string} type - The type of upload (message, order, etc.)
 * @returns {Promise} - Response data with file URL
 */
export const uploadFile = async (file, type = 'message') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post(`${BACKEND_URL}upload/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      fileUrl: response.data.fileUrl,
      fileName: response.data.fileName,
      data: response.data
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to upload file'
    };
  }
};

/**
 * Download file/attachment
 * @param {string} fileUrl - The file URL
 * @returns {Promise} - Blob data
 */
export const downloadFile = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'blob'
    });

    return {
      success: true,
      blob: response.data
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to download file'
    };
  }
};

/**
 * Mark messages as read for a conversation
 * @param {string} userId - The user ID
 * @param {string} orderId - The order ID (or 'general')
 * @returns {Promise} - Response data
 */
export const markMessagesAsRead = async (userId, orderId) => {
  try {
    const response = await axios.put(`${BACKEND_URL}messages/mark-read`, {
      userId,
      orderId
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data
    };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to mark messages as read'
    };
  }
};

/**
 * Get message statistics for a user
 * @param {string} userId - The user ID
 * @returns {Promise} - Response data with message stats
 */
export const getMessageStats = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}messages/stats/${userId}`);
    return {
      success: true,
      stats: response.data.stats,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching message stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch message stats'
    };
  }
};

/**
 * Search messages by keyword
 * @param {string} userId - The user ID
 * @param {string} keyword - The search keyword
 * @param {string} orderId - Optional order ID to filter by
 * @returns {Promise} - Response data with search results
 */
export const searchMessages = async (userId, keyword, orderId = null) => {
  try {
    const params = { keyword };
    if (orderId) params.orderId = orderId;

    const response = await axios.get(`${BACKEND_URL}messages/search/${userId}`, {
      params
    });
    return {
      success: true,
      messages: response.data.messages,
      data: response.data
    };
  } catch (error) {
    console.error('Error searching messages:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to search messages'
    };
  }
};

/**
 * Get product details by ID
 * @param {string} productId - The product ID
 * @returns {Promise} - Response data containing product details
 */
export const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/product/${productId}`);
    return {
      success: true,
      product: response.data.product,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch product details'
    };
  }
};

/**
 * Format order data for display
 * @param {Object} order - Raw order object
 * @returns {Object} - Formatted order object
 */
export const formatOrderData = (order) => {
  return {
    ...order,
    formattedDate: new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    formattedTotal: `£${parseFloat(order.grandTotal || order.totalPrice).toFixed(2)}`,
    itemsCount: order.cartItems?.length || order.products?.length || 0
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file type icon based on mime type
 * @param {string} mimeType - The file mime type
 * @returns {string} - Icon name or emoji
 */
export const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return '📄';

  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';

  return '📄';
};

// Default export containing all service methods
const chatWindowService = {
  getOrderDetails,
  getUserOrders,
  updateOrderStatus,
  getOrderTracking,
  addTrackingNumber,
  getUserDetails,
  uploadFile,
  downloadFile,
  markMessagesAsRead,
  getMessageStats,
  searchMessages,
  getProductDetails,
  formatOrderData,
  formatFileSize,
  getFileTypeIcon
};

export default chatWindowService;
