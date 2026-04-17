import axios from 'axios';

// Get backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const EXCLUDED_USER_ID = '66cdf5f6dec61c826428d298';

/**
 * Fetch users who have sent messages
 * @returns {Promise} - Response data containing filtered users with message counts
 */
export const getUsersWithMessages = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/users/whosend/messages`);
    return {
      success: true,
      data: response.data,
      users: response.data.filteredUsers
    };
  } catch (error) {
    console.error('Error fetching users with messages:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch users'
    };
  }
};

/**
 * Fetch all users for dropdown selection
 * @returns {Promise} - Response data containing all users
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/users/basic-info`);
    return {
      success: true,
      data: response.data,
      users: response.data.users,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch users'
    };
  }
};

/**
 * Fetch conversations for a specific user (Admin view)
 * @param {string} userId - The customer user ID to fetch conversations for
 * @returns {Promise} - Response data containing conversations with unread counts for admin
 */
export const getConversationsForUser = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}admin/conversations/${userId}`);
    return {
      success: true,
      data: response.data,
      conversations: response.data.conversations
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch conversations'
    };
  }
};

/**
 * Fetch all conversations across all users (for Chat List view)
 * @returns {Promise} - Response data containing all conversations with user info
 */
export const getAllConversations = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}messages/all-conversations`);
    return {
      success: true,
      data: response.data,
      conversations: response.data.conversations
    };
  } catch (error) {
    console.error('Error fetching all conversations:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch all conversations'
    };
  }
};

/**
 * Fetch messages for a specific conversation
 * @param {string} userId - The user ID
 * @param {string} orderId - The order ID (or 'general' for general chat)
 * @returns {Promise} - Response data containing messages
 */
export const getMessagesByConversation = async (userId, orderId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/messages/${userId}/${orderId}`);
    return {
      success: true,
      data: response.data,
      messages: response.data.messages
    };
  } catch (error) {
    console.error('Error fetching messages by conversation:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch messages'
    };
  }
};

/**
 * Fetch messages for a specific user (deprecated - use getMessagesByConversation)
 * @param {string} receiverId - The user ID to fetch messages for
 * @returns {Promise} - Response data containing messages
 */
export const getMessagesForUser = async (receiverId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/messages/senderid/${receiverId}`);
    return {
      success: true,
      data: response.data,
      messages: response.data.messages
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch messages'
    };
  }
};

/**
 * Send a message to a user
 * @param {string} senderId - The sender's user ID
 * @param {string} receiverId - The receiver's user ID
 * @param {string} message - The message text
 * @param {File[]} files - Array of files to attach
 * @param {string} orderId - Optional order ID to link the message to
 * @returns {Promise} - Response data with the new message
 */
export const sendMessage = async (senderId, receiverId, message, files = [], orderId = null) => {
  try {
    const formData = new FormData();
    formData.append('sender', senderId);
    formData.append('receiver', receiverId);
    formData.append('message', message);

    if (orderId && orderId !== 'general') {
      formData.append('orderId', orderId);
    }

    if (files && Array.isArray(files)) {
      files.forEach((file) => formData.append('files', file));
    }

    console.log('📤 Sending message to backend:', {
      url: `${BACKEND_URL}send/messages/senderid/${receiverId}`,
      senderId,
      receiverId,
      message,
      orderId,
      filesCount: files?.length || 0
    });

    const response = await axios.post(
      `${BACKEND_URL}send/messages/senderid/${receiverId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    return {
      success: true,
      data: response.data,
      message: response.data.newMessage
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send message'
    };
  }
};

/**
 * Delete a single message
 * @param {string} messageId - The message ID to delete
 * @returns {Promise} - Response data confirming deletion
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}delete/message/${messageId}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete message'
    };
  }
};

/**
 * Edit/Update a message
 * @param {string} messageId - The message ID to edit
 * @param {string} newMessage - The new message text
 * @returns {Promise} - Response data confirming update
 */
export const editMessage = async (messageId, newMessage) => {
  try {
    const response = await axios.put(`${BACKEND_URL}update/message/${messageId}`, {
      message: newMessage
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error editing message:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to edit message'
    };
  }
};

/**
 * Delete all messages for a specific user
 * @param {string} userId - The user ID to delete all messages for
 * @returns {Promise} - Response data confirming deletion
 */
export const deleteAllMessagesForUser = async (userId) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}delete/allmessage/ofThisUser/${userId}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting all messages:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to delete all messages'
    };
  }
};

/**
 * Format users data from API response
 * @param {Object[]} users - Array of raw user data
 * @returns {Object[]} - Formatted users
 */
export const formatUsers = (users) => {
  return users.map((u) => ({
    _id: u._id,
    name: `${u.firstname} ${u.lastname}`.trim(),
    email: u.email || '',
    phoneNumber: u.phoneNumber || '',
    unreadCount: u.unreadCount || 0,
    tags: u.tags || []
  }));
};

/**
 * Filter out excluded user from users list
 * @param {Object[]} users - Array of users
 * @returns {Object[]} - Filtered users
 */
export const filterExcludedUser = (users) => {
  return users.filter((user) =>
    user.id !== EXCLUDED_USER_ID && user._id !== EXCLUDED_USER_ID
  );
};

/**
 * Helper to join URL parts without double slashes
 * @param {string} base - Base URL
 * @param {string} path - Path to append
 * @returns {string} - Joined URL
 */
const joinUrl = (base, path) => {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Map message attachments to file URLs
 * @param {Object[]} messages - Array of messages
 * @returns {Object[]} - Messages with mapped file URLs
 */
export const mapMessageAttachments = (messages) => {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }
  return messages.map((msg) => {
    const files = (msg.attachments || []).map(
      (attachment) => joinUrl(BACKEND_URL, attachment.path)
    );
    return {
      ...msg,
      files
    };
  });
};

/**
 * Get all predefined tags
 * @returns {Promise} - Response data with predefined tags
 */
export const getPredefinedTags = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}conversation/tags/predefined/all`);
    return {
      success: true,
      tags: response.data.tags,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching predefined tags:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch predefined tags'
    };
  }
};

/**
 * Get tags for a specific conversation
 * @param {string} userId - The user ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise} - Response data with conversation tags
 */
export const getConversationTags = async (userId, conversationId) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}conversation/tags/${userId}/${conversationId}`
    );
    return {
      success: true,
      tags: response.data.tags,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching conversation tags:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch tags'
    };
  }
};

/**
 * Add a tag to a conversation
 * @param {string} userId - The user ID
 * @param {string} conversationId - The conversation ID
 * @param {string} tagName - The tag name
 * @param {string} tagColor - The tag color (hex code)
 * @param {string} orderId - Optional order ID
 * @returns {Promise} - Response data
 */
export const addTagToConversation = async (
  userId,
  conversationId,
  tagName,
  tagColor,
  orderId = null
) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}conversation/tags/${userId}/${conversationId}`,
      {
        tagName,
        tagColor,
        orderId
      }
    );
    return {
      success: true,
      tags: response.data.tags,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error adding tag:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to add tag'
    };
  }
};

/**
 * Remove a tag from a conversation
 * @param {string} userId - The user ID
 * @param {string} conversationId - The conversation ID
 * @param {string} tagName - The tag name to remove
 * @returns {Promise} - Response data
 */
export const removeTagFromConversation = async (userId, conversationId, tagName) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}conversation/tags/${userId}/${conversationId}/${encodeURIComponent(
        tagName
      )}`
    );
    return {
      success: true,
      tags: response.data.tags,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error removing tag:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to remove tag'
    };
  }
};

/**
 * Send email notification to a user manually
 * @param {string} userId - The user ID to send notification to
 * @returns {Promise} - Response data
 */
export const sendEmailNotificationToUser = async (userId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}send/email-notification/${userId}`);
    return {
      success: true,
      message: response.data.message,
      email: response.data.email
    };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send email notification'
    };
  }
};

/**
 * Get orders for a specific user (for admin to start new chats)
 * @param {string} userId - The user ID
 * @returns {Promise} - Response data with user's orders
 */
export const getOrdersForUser = async (userId) => {
  try {
    const response = await axios.post(`${BACKEND_URL}get/order/user`, { userId });
    return {
      success: true,
      orders: response.data.orders || [],
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching orders for user:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch orders'
    };
  }
};

/**
 * Get return orders for a specific user (for admin to start new chats)
 * @param {string} userId - The user ID
 * @returns {Promise} - Response data with user's return orders
 */
export const getReturnOrdersForUser = async (userId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}get/return-orders/user/${userId}`);
    return {
      success: true,
      returnOrders: response.data.returnOrders || [],
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching return orders for user:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch return orders'
    };
  }
};

/**
 * Assign all general chat messages to a specific order
 * @param {string} userId - The user ID
 * @param {string} orderId - The order ID to assign messages to
 * @returns {Promise} - Response data with assignment result
 */
export const assignGeneralChatToOrder = async (userId, orderId) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}assign/general-chat-to-order/${userId}/${orderId}`
    );
    return {
      success: true,
      message: response.data.message,
      assignedCount: response.data.assignedCount,
      orderId: response.data.orderId
    };
  } catch (error) {
    console.error('Error assigning general chat to order:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to assign messages to order'
    };
  }
};

/**
 * Toggle read status of the last message in a conversation
 * @param {string} userId - The user ID
 * @param {string} orderId - The order ID (or 'general' for general chat)
 * @returns {Promise} - Response data with new read status
 */
export const toggleLastMessageReadStatus = async (userId, orderId) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}toggle/message/read-status/${userId}/${orderId || 'general'}`
    );
    return {
      success: true,
      message: response.data.message,
      readStatus: response.data.readStatus,
      messageId: response.data.messageId
    };
  } catch (error) {
    console.error('Error toggling read status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to toggle read status'
    };
  }
};

// Default export containing all service methods
const messagesService = {
  getUsersWithMessages,
  getAllUsers,
  getConversationsForUser,
  getMessagesByConversation,
  getMessagesForUser,
  sendMessage,
  deleteMessage,
  editMessage,
  deleteAllMessagesForUser,
  formatUsers,
  filterExcludedUser,
  mapMessageAttachments,
  getPredefinedTags,
  getConversationTags,
  addTagToConversation,
  removeTagFromConversation,
  sendEmailNotificationToUser,
  toggleLastMessageReadStatus,
  getOrdersForUser,
  getReturnOrdersForUser,
  assignGeneralChatToOrder
};

export default messagesService;
