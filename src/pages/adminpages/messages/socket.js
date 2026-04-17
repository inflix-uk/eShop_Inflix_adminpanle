import { io } from 'socket.io-client';

// Socket.IO client configuration
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const ADMIN_ID = '66cdf5f6dec61c826428d298'; // Hardcoded admin ID

let socket = null;

/**
 * Initialize socket connection
 * @returns Socket instance
 */
export const initializeSocket = () => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
      // Auto-join admin room on connect
      joinAdminRoom();
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      // Re-join admin room on reconnect
      joinAdminRoom();
    });
  }

  return socket;
};

/**
 * Get current socket instance
 * @returns Socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected manually');
  }
};

/**
 * Join admin's personal room
 */
export const joinAdminRoom = () => {
  if (socket && socket.connected) {
    socket.emit('join', ADMIN_ID);
    console.log(`👤 Joined admin room: user:${ADMIN_ID}`);
  }
};

/**
 * Join a conversation room
 * @param {string} userId - The customer's user ID
 * @param {string|null} orderId - The order ID (or 'general')
 */
export const joinConversation = (userId, orderId) => {
  if (socket && socket.connected) {
    socket.emit('join-conversation', { userId, orderId: orderId || 'general' });
    const room = orderId && orderId !== 'general'
      ? `conversation:${userId}:${orderId}`
      : `conversation:${userId}:general`;
    console.log(`💬 Joined conversation room: ${room}`);
  }
};

/**
 * Leave a conversation room
 * @param {string} userId - The customer's user ID
 * @param {string|null} orderId - The order ID (or 'general')
 */
export const leaveConversation = (userId, orderId) => {
  if (socket && socket.connected) {
    socket.emit('leave-conversation', { userId, orderId: orderId || 'general' });
    const room = orderId && orderId !== 'general'
      ? `conversation:${userId}:${orderId}`
      : `conversation:${userId}:general`;
    console.log(`👋 Left conversation room: ${room}`);
  }
};

/**
 * Listen for new messages
 * @param {Function} callback - Function to call when new message arrives
 * @returns {Function} Cleanup function to remove listener
 */
export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new-message', callback);
    console.log('👂 Listening for new messages');

    // Return cleanup function
    return () => {
      socket?.off('new-message', callback);
      console.log('🔇 Stopped listening for new messages');
    };
  }

  return () => {}; // No-op if socket doesn't exist
};

/**
 * Listen for message updates
 * @param {Function} callback - Function to call when message is updated
 * @returns {Function} Cleanup function to remove listener
 */
export const onMessageUpdated = (callback) => {
  if (socket) {
    socket.on('message-updated', callback);
    console.log('👂 Listening for message updates');

    // Return cleanup function
    return () => {
      socket?.off('message-updated', callback);
      console.log('🔇 Stopped listening for message updates');
    };
  }

  return () => {}; // No-op if socket doesn't exist
};

/**
 * Listen for message deletions
 * @param {Function} callback - Function to call when message is deleted
 * @returns {Function} Cleanup function to remove listener
 */
export const onMessageDeleted = (callback) => {
  if (socket) {
    socket.on('message-deleted', callback);
    console.log('👂 Listening for message deletions');

    // Return cleanup function
    return () => {
      socket?.off('message-deleted', callback);
      console.log('🔇 Stopped listening for message deletions');
    };
  }

  return () => {}; // No-op if socket doesn't exist
};

/**
 * Listen for messages read receipts
 * @param {Function} callback - Function to call when messages are read by customer
 * @returns {Function} Cleanup function to remove listener
 */
export const onMessagesRead = (callback) => {
  if (socket) {
    socket.on('messages-read', callback);
    console.log('👂 Listening for read receipts');

    // Return cleanup function
    return () => {
      socket?.off('messages-read', callback);
      console.log('🔇 Stopped listening for read receipts');
    };
  }

  return () => {}; // No-op if socket doesn't exist
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinAdminRoom,
  joinConversation,
  leaveConversation,
  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
  onMessagesRead
};
