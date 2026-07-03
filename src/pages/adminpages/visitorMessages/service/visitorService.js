import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get all visitor conversations
 */
export const getAllVisitors = async () => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages`);
  return response.data;
};

/**
 * Get messages for a specific visitor
 */
export const getVisitorMessages = async (visitorId) => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages/${visitorId}`);
  return response.data;
};

/**
 * Mark conversation as read
 */
export const markAsRead = async (visitorId) => {
  const response = await axios.put(`${BACKEND_URL}visitor-messages/${visitorId}/read`);
  return response.data;
};

/**
 * Mark conversation as unread
 */
export const markAsUnread = async (visitorId) => {
  const response = await axios.put(`${BACKEND_URL}visitor-messages/${visitorId}/unread`);
  return response.data;
};

/**
 * Send reply to visitor (with optional files)
 */
export const sendReply = async (visitorId, message, files = []) => {
  const formData = new FormData();
  formData.append("message", message);

  // Append files if any
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await axios.post(
    `${BACKEND_URL}visitor-messages/${visitorId}/reply`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Delete conversation
 */
export const deleteConversation = async (visitorId) => {
  const response = await axios.delete(`${BACKEND_URL}visitor-messages/${visitorId}`);
  return response.data;
};

/**
 * Get unread count
 */
export const getUnreadCount = async () => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages/unread-count`);
  return response.data;
};

// ========================================================================
// AUTO-REPLY SETTINGS
// ========================================================================

/**
 * Get auto-reply settings
 */
export const getAutoReplySettings = async () => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages/auto-reply/settings`);
  return response.data;
};

/**
 * Save auto-reply settings
 */
export const saveAutoReplySettings = async (settings) => {
  const response = await axios.post(`${BACKEND_URL}visitor-messages/auto-reply/settings`, settings);
  return response.data;
};

/**
 * Toggle auto-reply on/off
 */
export const toggleAutoReply = async () => {
  const response = await axios.patch(`${BACKEND_URL}visitor-messages/auto-reply/toggle`);
  return response.data;
};

// ========================================================================
// TRANSFER TO MESSAGES
// ========================================================================

/**
 * Check if visitor email belongs to a registered user
 */
export const checkUserByEmail = async (email) => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages/check-user/${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * Transfer visitor conversation to order messages (general chat)
 */
export const transferToMessages = async (visitorId) => {
  const response = await axios.post(`${BACKEND_URL}visitor-messages/${visitorId}/transfer`);
  return response.data;
};

// ========================================================================
// AWAY STATUS SETTINGS
// ========================================================================

/**
 * Get away status settings
 */
export const getAwayStatus = async () => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages/away/settings`);
  return response.data;
};

/**
 * Save away status settings
 */
export const saveAwayStatus = async (settings) => {
  const response = await axios.post(`${BACKEND_URL}visitor-messages/away/settings`, settings);
  return response.data;
};

/**
 * Toggle away status on/off
 */
export const toggleAwayStatus = async () => {
  const response = await axios.patch(`${BACKEND_URL}visitor-messages/away/toggle`);
  return response.data;
};

// ========================================================================
// LIVE CHAT ENABLE / DISABLE
// ========================================================================

/**
 * Get live chat enabled settings
 */
export const getChatEnabledSettings = async () => {
  const response = await axios.get(`${BACKEND_URL}visitor-messages/chat-enabled/settings`);
  return response.data;
};

/**
 * Save live chat enabled settings
 */
export const saveChatEnabledSettings = async (isEnabled) => {
  const response = await axios.post(
    `${BACKEND_URL}visitor-messages/chat-enabled/settings`,
    { isEnabled }
  );
  return response.data;
};

/**
 * Toggle live chat on/off
 */
export const toggleChatEnabled = async () => {
  const response = await axios.patch(`${BACKEND_URL}visitor-messages/chat-enabled/toggle`);
  return response.data;
};
