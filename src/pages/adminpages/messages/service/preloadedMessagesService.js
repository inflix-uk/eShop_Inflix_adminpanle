import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get all preloaded messages
 * @returns {Promise} - Response data containing all preloaded messages
 */
export const getAllPreloadedMessages = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}preloaded-messages`);
    return {
      success: true,
      messages: response.data.messages,
      count: response.data.count
    };
  } catch (error) {
    console.error('Error fetching preloaded messages:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch preloaded messages'
    };
  }
};

/**
 * Get active preloaded messages only
 * @returns {Promise} - Response data containing active preloaded messages
 */
export const getActivePreloadedMessages = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}preloaded-messages/active`);
    return {
      success: true,
      messages: response.data.messages,
      count: response.data.count
    };
  } catch (error) {
    console.error('Error fetching active preloaded messages:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch active preloaded messages'
    };
  }
};

/**
 * Get a single preloaded message by ID
 * @param {string} id - The preloaded message ID
 * @returns {Promise} - Response data containing the preloaded message
 */
export const getPreloadedMessageById = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_URL}preloaded-messages/${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error fetching preloaded message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch preloaded message'
    };
  }
};

/**
 * Create a new preloaded message
 * @param {Object} data - The preloaded message data
 * @param {string} data.message - The message content
 * @param {boolean} data.isActive - Whether the message is active
 * @returns {Promise} - Response data with the created message
 */
export const createPreloadedMessage = async (data) => {
  try {
    const response = await axios.post(`${BACKEND_URL}preloaded-messages`, data);
    return {
      success: true,
      message: response.data.message,
      preloadedMessage: response.data.preloadedMessage
    };
  } catch (error) {
    console.error('Error creating preloaded message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create preloaded message'
    };
  }
};

/**
 * Update a preloaded message
 * @param {string} id - The preloaded message ID
 * @param {Object} data - The updated data
 * @returns {Promise} - Response data with the updated message
 */
export const updatePreloadedMessage = async (id, data) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}preloaded-messages/${id}`, data);
    return {
      success: true,
      message: response.data.message,
      preloadedMessage: response.data.preloadedMessage
    };
  } catch (error) {
    console.error('Error updating preloaded message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to update preloaded message'
    };
  }
};

/**
 * Delete a preloaded message
 * @param {string} id - The preloaded message ID
 * @returns {Promise} - Response data confirming deletion
 */
export const deletePreloadedMessage = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}preloaded-messages/${id}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting preloaded message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete preloaded message'
    };
  }
};

/**
 * Toggle active status of a preloaded message
 * @param {string} id - The preloaded message ID
 * @returns {Promise} - Response data with the updated message
 */
export const togglePreloadedMessageStatus = async (id) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}preloaded-messages/toggle/${id}`);
    return {
      success: true,
      message: response.data.message,
      preloadedMessage: response.data.preloadedMessage
    };
  } catch (error) {
    console.error('Error toggling preloaded message status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to toggle status'
    };
  }
};

/**
 * Improve a message using AI (OpenAI)
 * @param {string} message - The message to improve
 * @returns {Promise} - Response data with improved message
 */
export const improveMessageWithAI = async (message) => {
  try {
    const response = await axios.post(`${BACKEND_URL}ai/improve-message`, { message });
    return {
      success: true,
      originalMessage: response.data.originalMessage,
      improvedMessage: response.data.improvedMessage
    };
  } catch (error) {
    console.error('Error improving message with AI:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to improve message'
    };
  }
};

const preloadedMessagesService = {
  getAllPreloadedMessages,
  getActivePreloadedMessages,
  getPreloadedMessageById,
  createPreloadedMessage,
  updatePreloadedMessage,
  deletePreloadedMessage,
  togglePreloadedMessageStatus,
  improveMessageWithAI
};

export default preloadedMessagesService;
