/**
 * Messages Service Index
 * Exports all service methods for easy importing
 */

export {
  getUsersWithMessages,
  getAllUsers,
  getConversationsForUser,
  getAllConversations,
  getMessagesByConversation,
  getMessagesForUser,
  sendMessage,
  deleteMessage,
  editMessage,
  deleteAllMessagesForUser,
  formatUsers,
  filterExcludedUser,
  mapMessageAttachments,
  sendEmailNotificationToUser,
  getOrdersForUser,
  getReturnOrdersForUser,
  assignGeneralChatToOrder,
  default as messagesService
} from './messagesService';

export {
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
  default as chatWindowService
} from './chatWindowService';

export {
  getAllPreloadedMessages,
  getActivePreloadedMessages,
  getPreloadedMessageById,
  createPreloadedMessage,
  updatePreloadedMessage,
  deletePreloadedMessage,
  togglePreloadedMessageStatus,
  improveMessageWithAI,
  default as preloadedMessagesService
} from './preloadedMessagesService';
