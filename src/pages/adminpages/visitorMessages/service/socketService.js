import { io } from "socket.io-client";

const BACKEND_URL  = import.meta.env.VITE_BACKEND_URL;

class AdminSocketService {
  constructor() {
    this.socket = null;
    this.currentConversationId = null;

    // Callbacks
    this.onNewMessageCallback = null;
    this.onVisitorTypingCallback = null;
    this.onNewConversationCallback = null;
    this.onRefreshVisitorsCallback = null;
  }

  /**
   * Connect to the socket server as admin
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${BACKEND_URL}visitor-chat`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("🟢 Admin connected to visitor chat socket, socket id:", this.socket.id);
      // Join admin room to receive all visitor updates
      this.socket.emit("admin:join");
      console.log("📢 Emitted admin:join to join admin-room");

      // Rejoin current conversation if any
      if (this.currentConversationId) {
        this.joinConversation(this.currentConversationId);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.log("❌ Socket connection error:", error.message);
    });

    this.socket.on("disconnect", () => {
      console.log("🔴 Admin disconnected from visitor chat socket");
    });

    // Listen for visitor typing
    this.socket.on("visitor:typing", (data) => {
      console.log("⌨️ Visitor typing:", data);
      if (this.onVisitorTypingCallback) {
        this.onVisitorTypingCallback({
          conversationId: data.conversationId,
          text: data.text,
          visitorName: data.visitorName,
          isTyping: true,
        });
      }
    });

    // Listen for visitor stop typing
    this.socket.on("visitor:stop-typing", (data) => {
      if (this.onVisitorTypingCallback) {
        this.onVisitorTypingCallback({
          conversationId: data.conversationId,
          text: "",
          isTyping: false,
        });
      }
    });

    // Listen for new visitor messages
    this.socket.on("visitor:new-message", (data) => {
      console.log("📩 New visitor message:", data);
      if (this.onNewMessageCallback) {
        this.onNewMessageCallback({
          conversationId: data.conversationId,
          message: {
            text: data.message,
            sender: data.sender,
            attachments: data.attachments || [],
            createdAt: data.createdAt,
          },
          visitorName: data.visitorName,
          visitorEmail: data.visitorEmail,
        });
      }
      // Clear typing when message is received
      if (this.onVisitorTypingCallback) {
        this.onVisitorTypingCallback({
          conversationId: data.conversationId,
          text: "",
          isTyping: false,
        });
      }
    });

    // Listen for new conversations
    this.socket.on("visitor:new-conversation", (data) => {
      console.log("🆕 New conversation:", data);
      if (this.onNewConversationCallback) {
        this.onNewConversationCallback(data);
      }
      // Also trigger refresh
      if (this.onRefreshVisitorsCallback) {
        this.onRefreshVisitorsCallback();
      }
    });

    // Listen for refresh visitors event
    this.socket.on("refresh:visitors", () => {
      if (this.onRefreshVisitorsCallback) {
        this.onRefreshVisitorsCallback();
      }
    });

    // Listen for admin messages (from other admins or self confirmation)
    this.socket.on("admin:new-message", (data) => {
      console.log("📤 Admin message broadcast:", data);
      if (this.onNewMessageCallback) {
        this.onNewMessageCallback({
          conversationId: data.conversationId,
          message: {
            text: data.message,
            sender: data.sender,
            attachments: data.attachments || [],
            createdAt: data.createdAt,
          },
        });
      }
    });

    // Listen for visitor disconnect
    this.socket.on("visitor:disconnected", (data) => {
      console.log("👋 Visitor disconnected:", data.conversationId);
      // Clear typing indicator
      if (this.onVisitorTypingCallback) {
        this.onVisitorTypingCallback({
          conversationId: data.conversationId,
          text: "",
          isTyping: false,
        });
      }
    });
  }

  /**
   * Disconnect from the socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join a specific conversation room
   */
  joinConversation(conversationId) {
    this.currentConversationId = conversationId;
    if (this.socket?.connected) {
      this.socket.emit("admin:join-conversation", conversationId);
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit("admin:leave-conversation", conversationId);
    }
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  /**
   * Emit admin typing event
   */
  emitTyping(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit("admin:typing", { conversationId });
    }
  }

  /**
   * Emit admin stop typing event
   */
  emitStopTyping(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit("admin:stop-typing", { conversationId });
    }
  }

  /**
   * Emit admin message (with optional attachments)
   */
  emitMessage(conversationId, message, attachments = []) {
    if (this.socket?.connected) {
      this.socket.emit("admin:new-message", { conversationId, message, attachments });
    }
  }

  /**
   * Request all admins to refresh their visitor list
   */
  requestRefresh() {
    if (this.socket?.connected) {
      this.socket.emit("refresh:visitors");
    }
  }

  // Callback setters
  onNewMessage(callback) {
    this.onNewMessageCallback = callback;
  }

  onVisitorTyping(callback) {
    this.onVisitorTypingCallback = callback;
  }

  onNewConversation(callback) {
    this.onNewConversationCallback = callback;
  }

  onRefreshVisitors(callback) {
    this.onRefreshVisitorsCallback = callback;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const adminSocketService = new AdminSocketService();
