import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import imageCompression from "browser-image-compression";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to join URL parts without double slashes
const joinUrl = (base, path) => {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// Layout Components
import Top from "../nav/Top";
import Side from "../nav/Side";

// Services
import {
  getUsersWithMessages,
  getAllUsers,
  getConversationsForUser,
  getAllConversations,
  getMessagesByConversation,
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
} from "./service";

// Socket.IO
import {
  initializeSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  onNewMessage,
  onMessagesRead,
} from "./socket";

// Utilities
import { playNotificationSound } from "./utils/notificationSound";

// Components
import {
  UserList,
  UserDropdown,
  ConversationList,
  AllConversationsList,
  AdminOrderSelectionPanel,
  AssignToOrderPanel,
  PreloadedMessagesModal,
} from "./components/orderMessages";
import { ChatWindow, FilePreviewModal } from "./components/chatWindow";

/**
 * OrderMessages Component
 * Main page for managing order messages
 */
export default function OrderMessages() {
  const ADMIN_ID = "66cdf5f6dec61c826428d298";
  const [progress, setProgress] = useState(0);
  const [selectedPage, setSelectedPage] = useState("order-messages");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // View mode state ('users' or 'chats')
  const [viewMode, setViewMode] = useState("users");
  const [allConversations, setAllConversations] = useState([]);
  const [isLoadingAllConversations, setIsLoadingAllConversations] =
    useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState(""); // Tag filter for chats

  // User state
  const [users, setUsers] = useState([]);
  const [dropdownUsers, setDropdownUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("unread");

  // Conversation state
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);

  // Message state
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // File state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  // Order selection state (for starting new chats)
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [userReturnOrders, setUserReturnOrders] = useState([]);
  const [isLoadingReturnOrders, setIsLoadingReturnOrders] = useState(false);

  // Assign general chat to order state
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Preloaded messages modal state
  const [showPreloadedMessagesModal, setShowPreloadedMessagesModal] =
    useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Sidebar handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Get selected user
  const selectedUser = users.find((u) => u._id === selectedUserId) || null;

  // Filter users based on search term and read status
  const filteredUsers = users
    .filter((u) => u._id !== "66cdf5f6dec61c826428d298")
    .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((u) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "read") return u.unreadCount === 0;
      if (activeFilter === "unread") return u.unreadCount > 0;
      return true;
    });

  // Get all unique tags from conversations for dropdown
  const allUniqueTags = [
    ...new Map(
      allConversations
        .flatMap((conv) => conv.tags || [])
        .map((tag) => [tag.name, tag])
    ).values(),
  ];

  // Filter conversations based on search term, read status, and tag
  const filteredConversations = allConversations
    .filter((conv) => {
      if (searchTerm === "") return true;
      const search = searchTerm.toLowerCase();
      return (
        (conv.user?.name && conv.user.name.toLowerCase().includes(search)) ||
        (conv.user?.email && conv.user.email.toLowerCase().includes(search)) ||
        (conv.orderNumber && conv.orderNumber.toLowerCase().includes(search)) ||
        (conv.returnOrderNumber &&
          conv.returnOrderNumber.toLowerCase().includes(search)) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(search))
      );
    })
    .filter((conv) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "read") return conv.unreadCount === 0;
      if (activeFilter === "unread") return conv.unreadCount > 0;
      return true;
    })
    .filter((conv) => {
      if (!selectedTagFilter) return true;
      return conv.tags?.some((tag) => tag.name === selectedTagFilter);
    });

  // Handle view mode change - reset search and filters when switching tabs
  const handleViewModeChange = (mode) => {
    setSearchTerm(""); // Reset search
    setSelectedTagFilter(""); // Reset tag filter
    setViewMode(mode);

    // Fetch fresh data when switching tabs
    if (mode === "users") {
      fetchUsers(false); // Fetch users without showing progress
    } else if (mode === "chats") {
      fetchAllConversations(); // Fetch all conversations
    }
  };

  /**
   * Fetch users who have sent messages
   */
  const fetchUsers = useCallback(async (showProgress = true) => {
    try {
      if (showProgress) setProgress(30);

      const result = await getUsersWithMessages();

      if (showProgress) setProgress(60);

      if (result.success) {
        const formatted = formatUsers(result.users);
        setUsers(formatted);
      } else {
        toast.error(result.error || "Failed to fetch users");
      }

      if (showProgress) setProgress(100);
    } catch (error) {
      if (showProgress) setProgress(100);
      console.error("Error in fetchUsers:", error);
    }
  }, []);

  /**
   * Fetch all users for dropdown
   */
  const fetchDropdownUsers = useCallback(async () => {
    try {
      const result = await getAllUsers();

      if (result.success && result.status === 201) {
        const filtered = filterExcludedUser(result.users);
        setDropdownUsers(filtered);
      } else {
        toast.error(result.error || "Failed to fetch users for dropdown");
      }
    } catch (error) {
      console.error("Error in fetchDropdownUsers:", error);
    }
  }, []);

  /**
   * Fetch conversations for selected user
   */
  const fetchConversations = useCallback(async (userId, showToast = false) => {
    try {
      const result = await getConversationsForUser(userId);

      if (result.success && result.conversations) {
        setConversations(result.conversations);
      } else {
        if (showToast) {
          toast.error(result.error || "Failed to fetch conversations");
        }
      }
    } catch (error) {
      console.error("Error in fetchConversations:", error);
    }
  }, []);

  /**
   * Fetch all conversations across all users (for Chat List view)
   */
  const fetchAllConversations = useCallback(async (showProgress = true) => {
    try {
      setIsLoadingAllConversations(true);
      if (showProgress) setProgress(30);

      const result = await getAllConversations();

      if (showProgress) setProgress(60);

      if (result.success && result.conversations) {
        setAllConversations(result.conversations);
      } else {
        toast.error(result.error || "Failed to fetch all conversations");
      }

      if (showProgress) setProgress(100);
    } catch (error) {
      if (showProgress) setProgress(100);
      console.error("Error in fetchAllConversations:", error);
    } finally {
      setIsLoadingAllConversations(false);
    }
  }, []);

  /**
   * Handle selecting a conversation from All Conversations list
   */
  const handleSelectFromAllConversations = useCallback(
    async (conversation) => {
      const userId = conversation.user?._id;
      const orderId = conversation.orderId;
      const conversationId = conversation.conversationId;

      if (!userId) {
        toast.error("User information not found");
        return;
      }

      // Set the user
      setSelectedUserId(userId);

      // Find or create user in users list
      const existingUser = users.find((u) => u._id === userId);
      if (!existingUser && conversation.user) {
        setUsers((prev) => [
          ...prev,
          {
            _id: userId,
            name: conversation.user.name,
            email: conversation.user.email,
            phoneNumber: conversation.user.phoneNumber,
            unreadCount: conversation.unreadCount || 0,
          },
        ]);
      }

      // Set conversation details
      setSelectedConversationId(conversationId);
      setSelectedOrderId(orderId || null);
      setSelectedOrderNumber(conversation.orderNumber || null);

      // Fetch messages for this conversation
      try {
        const result = await getMessagesByConversation(userId, conversationId);
        if (result.success && result.messages) {
          setMessages(mapMessageAttachments(result.messages));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }

      // Join socket room
      joinConversation(userId, conversationId);
    },
    [users]
  );

  /**
   * Fetch messages for selected conversation
   */
  const fetchMessagesByConversation = useCallback(async (userId, orderId) => {
    try {
      const result = await getMessagesByConversation(userId, orderId);

      if (result.success) {
        const mappedMessages = mapMessageAttachments(result.messages);
        setMessages(mappedMessages);
      } else {
        toast.error(result.error || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error in fetchMessagesByConversation:", error);
    }
  }, []);

  /**
   * Send a message or update an existing message
   */
  const handleSendMessage = async () => {
    if (!selectedUserId || (!messageText.trim() && uploadedFiles.length === 0))
      return;

    // Prevent multiple sends
    if (isSending) return;

    setIsSending(true);

    try {
      // If editing, update the existing message
      if (editingMessage) {
        const result = await editMessage(editingMessage._id, messageText);

        if (result.success) {
          // Update the message in the UI immediately
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === editingMessage._id
                ? {
                    ...msg,
                    message: messageText,
                    edited: true,
                    editedAt: new Date().toISOString(),
                  }
                : msg
            )
          );

          setMessageText("");
          setEditingMessage(null);

          // Refresh conversations to update last message time
          fetchConversations(selectedUserId, false);

          toast.success("Message updated successfully");
        } else {
          toast.error(result.error || "Failed to update message");
        }
      } else {
        // Send new message
        const result = await sendMessage(
          ADMIN_ID,
          selectedUserId,
          messageText,
          uploadedFiles,
          selectedOrderId
        );

        if (result.success) {
          // Add the sent message to the UI immediately
          if (result.message) {
            const newMessage = {
              ...result.message,
              files: (result.message.attachments || []).map(
                (attachment) => joinUrl(BACKEND_URL, attachment.path)
              ),
            };

            setMessages((prevMessages) => {
              const exists = prevMessages.some(
                (msg) => msg._id === newMessage._id
              );
              if (!exists) {
                return [...prevMessages, newMessage].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
              }
              return prevMessages;
            });
          }

          setMessageText("");
          setUploadedFiles([]);

          // Refresh conversations to update last message time
          fetchConversations(selectedUserId, false);

          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          toast.error(result.error || "Failed to send message");
        }
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error(
        editingMessage ? "Error updating message" : "Error sending message"
      );
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Add preloaded message to input field
   */
  const handleSendPreloadedMessage = (preloadedText) => {
    if (!preloadedText) return;
    setMessageText(preloadedText);
  };

  /**
   * Handle editing a message
   */
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageText(message.message);
    // Clear uploaded files when editing (can't edit attachments)
    setUploadedFiles([]);
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  /**
   * Delete a single message
   */
  const handleDeleteMessage = async (messageId) => {
    try {
      const result = await deleteMessage(messageId);

      if (result.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        toast.error(result.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error in handleDeleteMessage:", error);
      toast.error("Error deleting message");
    }
  };

  /**
   * Delete all messages for a user
   */
  const handleDeleteAllMessages = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete all messages for this user?"
      )
    ) {
      return;
    }

    try {
      const result = await deleteAllMessagesForUser(userId);

      if (result.success) {
        if (selectedUserId === userId) {
          setMessages([]);
          setSelectedUserId(null);
        }
        await fetchUsers(false);
        toast.success("All messages deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete messages");
      }
    } catch (error) {
      console.error("Error in handleDeleteAllMessages:", error);
      toast.error("Error deleting messages");
    }
  };

  /**
   * Send email notification to a user
   */
  const handleSendEmailNotification = async (userId) => {
    try {
      const result = await sendEmailNotificationToUser(userId);

      if (result.success) {
        toast.success(`Email sent to ${result.email}`);
      } else {
        toast.error(result.error || "Failed to send email notification");
      }
    } catch (error) {
      console.error("Error in handleSendEmailNotification:", error);
      toast.error("Error sending email notification");
    }
  };

  /**
   * Handle toggle read/unread status for conversation messages
   */
  const handleReadStatusToggle = async (newReadStatus) => {
    try {
      // Refresh users list to update unread counts
      await fetchUsers(false);
      // Refresh conversations to update unread counts
      if (selectedUserId) {
        await fetchConversations(selectedUserId, false);
      }
      // Refresh messages to update read status indicators
      if (selectedUserId && selectedOrderId !== null) {
        await fetchMessagesByConversation(selectedUserId, selectedOrderId);
      }
      toast.success(
        `Conversation marked as ${newReadStatus ? "read" : "unread"}`
      );

      // Notify sidebar to refresh unread count
      window.dispatchEvent(new CustomEvent("sidebar-refresh-unread-count"));
    } catch (error) {
      console.error("Error refreshing after read status toggle:", error);
      toast.error("Failed to refresh data");
    }
  };

  /**
   * Fetch orders for the selected user (for starting new chats)
   */
  const fetchUserOrders = useCallback(async (userId) => {
    try {
      setIsLoadingOrders(true);
      const result = await getOrdersForUser(userId);

      if (result.success) {
        // Sort orders by date (newest first)
        const sortedOrders = (result.orders || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUserOrders(sortedOrders);
      } else {
        toast.error(result.error || "Failed to fetch orders");
        setUserOrders([]);
      }
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Error fetching orders");
      setUserOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  /**
   * Fetch return orders for the selected user (for starting new chats)
   */
  const fetchUserReturnOrders = useCallback(async (userId) => {
    try {
      setIsLoadingReturnOrders(true);
      const result = await getReturnOrdersForUser(userId);

      if (result.success) {
        // Sort return orders by date (newest first)
        const sortedReturnOrders = (result.returnOrders || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUserReturnOrders(sortedReturnOrders);
      } else {
        toast.error(result.error || "Failed to fetch return orders");
        setUserReturnOrders([]);
      }
    } catch (error) {
      console.error("Error fetching user return orders:", error);
      toast.error("Error fetching return orders");
      setUserReturnOrders([]);
    } finally {
      setIsLoadingReturnOrders(false);
    }
  }, []);

  /**
   * Handle starting a new chat - show order selection panel
   */
  const handleStartNewChat = () => {
    if (!selectedUserId) return;
    setShowOrderSelection(true);
    setSelectedConversationId(null);
    setSelectedOrderId(null);
    setSelectedOrderNumber(null);
    setMessages([]);
    fetchUserOrders(selectedUserId);
    fetchUserReturnOrders(selectedUserId);
  };

  /**
   * Handle selecting an order to start a chat
   */
  const handleSelectOrderForChat = (order) => {
    setShowOrderSelection(false);
    setSelectedConversationId(order._id);
    setSelectedOrderId(order._id);
    setSelectedOrderNumber(order.orderNumber);
    setMessages([]);
    fetchMessagesByConversation(selectedUserId, order._id);
  };

  /**
   * Handle selecting a return order to start a chat
   * Uses a special format: "return_" prefix to identify return orders
   */
  const handleSelectReturnOrderForChat = (returnOrder) => {
    setShowOrderSelection(false);
    // Use "return_" prefix to identify this as a return order conversation
    const returnOrderConversationId = `return_${returnOrder._id}`;
    setSelectedConversationId(returnOrderConversationId);
    setSelectedOrderId(returnOrderConversationId);
    // Display RMA number or fallback to Return Order ID
    setSelectedOrderNumber(
      returnOrder.rma || `Return #${returnOrder._id.slice(-6)}`
    );
    setMessages([]);
    fetchMessagesByConversation(selectedUserId, returnOrderConversationId);
  };

  /**
   * Handle starting a general chat (no order)
   */
  const handleStartGeneralChatForUser = () => {
    setShowOrderSelection(false);
    setSelectedConversationId("general");
    setSelectedOrderId("general");
    setSelectedOrderNumber(null);
    setMessages([]);
    fetchMessagesByConversation(selectedUserId, "general");
  };

  /**
   * Handle canceling order selection
   */
  const handleCancelOrderSelection = () => {
    setShowOrderSelection(false);
  };

  /**
   * Handle opening assign panel - when assign icon is clicked on general chat
   */
  const handleOpenAssignPanel = () => {
    if (!selectedUserId) return;
    setShowAssignPanel(true);
    setShowOrderSelection(false);
    fetchUserOrders(selectedUserId);
  };

  /**
   * Handle assigning general chat messages to an order
   */
  const handleAssignToOrder = async (order) => {
    if (!selectedUserId || !order._id) return;

    // Confirm the action
    const confirmMessage = `Are you sure you want to assign all general chat messages to Order #${order.orderNumber}?\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setIsAssigning(true);

    try {
      const result = await assignGeneralChatToOrder(selectedUserId, order._id);

      if (result.success) {
        toast.success(
          `${result.assignedCount} message(s) assigned to Order #${order.orderNumber}`
        );

        // Close the assign panel
        setShowAssignPanel(false);

        // Refresh conversations to reflect the changes
        await fetchConversations(selectedUserId, false);

        // Notify sidebar to refresh unread count
        window.dispatchEvent(new CustomEvent("sidebar-refresh-unread-count"));

        // If we were viewing general chat, clear messages since they moved
        if (selectedOrderId === "general") {
          setMessages([]);
        }
      } else {
        toast.error(result.error || "Failed to assign messages to order");
      }
    } catch (error) {
      console.error("Error assigning general chat to order:", error);
      toast.error("Error assigning messages to order");
    } finally {
      setIsAssigning(false);
    }
  };

  /**
   * Handle canceling assign panel
   */
  const handleCancelAssignPanel = () => {
    setShowAssignPanel(false);
  };

  /**
   * Handle file upload with compression
   */
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedBlob = await imageCompression(file, options);

          const finalFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
            lastModified: compressedBlob.lastModified,
          });

          newFiles.push(finalFile);
        } catch (error) {
          console.error("Image compression error:", error);
          newFiles.push(file);
        }
      } else {
        newFiles.push(file);
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  /**
   * Remove file from upload list
   */
  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Check if file is an image
   */
  const isImage = (file) => file.type.startsWith("image/");

  /**
   * Handle file preview
   */
  const handlePreview = (fileUrl) => {
    setPreviewFile(fileUrl);
  };

  /**
   * Close file preview
   */
  const closePreview = () => {
    setPreviewFile(null);
  };

  /**
   * Handle user selection from list
   */
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setSelectedConversationId(null);
    setSelectedOrderId(null);
    setSelectedOrderNumber(null);
    setMessages([]);
    fetchConversations(userId, true);
  };

  /**
   * Handle conversation selection
   */
  const handleSelectConversation = (conversation) => {
    setSelectedConversationId(conversation.conversationId);
    setSelectedOrderId(conversation.orderId || "general");
    setSelectedOrderNumber(conversation.orderNumber || null);
    fetchMessagesByConversation(
      selectedUserId,
      conversation.orderId || "general"
    );
  };

  /**
   * Handle back to user list
   */
  const handleBackToUsers = () => {
    setSelectedUserId(null);
    setSelectedConversationId(null);
    setSelectedOrderId(null);
    setSelectedOrderNumber(null);
    setConversations([]);
    setMessages([]);
  };

  /**
   * Handle user selection from dropdown
   * Opens a general chat with the selected user
   */
  const handleSelectUserFromDropdown = (userId) => {
    setSelectedUserId(userId);
    setDropdownOpen(false);
    setDropdownSearchTerm("");

    // Open general chat directly
    setSelectedConversationId("general");
    setSelectedOrderId("general");
    setSelectedOrderNumber(null);

    // Fetch messages for general conversation
    fetchMessagesByConversation(userId, "general");

    // Also fetch conversations list for the user
    fetchConversations(userId, false);
  };

  // Initialize Socket.IO and fetch initial data
  useEffect(() => {
    // Initialize socket connection
    initializeSocket();

    // Fetch initial data
    fetchUsers(true);
    fetchDropdownUsers();

    // Listen for new messages to update user list
    const cleanupNewMessage = onNewMessage((newMessage) => {
      console.log("📨 Admin received new message:", newMessage);

      // Play notification sound if message is from customer (not from admin)
      const adminId = "66cdf5f6dec61c826428d298";
      if (newMessage.sender !== adminId) {
        playNotificationSound();
      }

      // Refresh users list to update unread counts
      fetchUsers(false);

      // If message is for current conversation, add it to messages
      if (
        selectedUserId &&
        selectedOrderId !== null &&
        (newMessage.orderId || "general") === (selectedOrderId || "general")
      ) {
        // Check if message involves the selected user
        const adminId = "66cdf5f6dec61c826428d298";
        const involvesSelectedUser =
          (newMessage.sender === selectedUserId &&
            newMessage.receiver === adminId) ||
          (newMessage.sender === adminId &&
            newMessage.receiver === selectedUserId);

        if (involvesSelectedUser) {
          setMessages((prevMessages) => {
            const exists = prevMessages.some(
              (msg) => msg._id === newMessage._id
            );
            if (!exists) {
              return [...prevMessages, newMessage].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
              );
            }
            return prevMessages;
          });

          // Refresh conversations to update last message
          fetchConversations(selectedUserId, false);
        }
      }
    });

    // Listen for read receipts - when customer reads admin's messages
    const cleanupReadReceipts = onMessagesRead((data) => {
      console.log("📖 Read receipt received:", data);

      // Update messages to show as read if this is the current conversation
      if (
        selectedUserId === data.userId &&
        (selectedOrderId || "general") === data.orderId
      ) {
        const adminId = "66cdf5f6dec61c826428d298";
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.sender === adminId ? { ...msg, readStatus: true } : msg
          )
        );
      }
    });

    // Cleanup on unmount
    return () => {
      cleanupNewMessage();
      cleanupReadReceipts();
      disconnectSocket();
    };
  }, [
    fetchUsers,
    fetchDropdownUsers,
    fetchConversations,
    selectedUserId,
    selectedOrderId,
  ]);

  // Fetch conversations when user is selected
  useEffect(() => {
    if (selectedUserId && !selectedConversationId) {
      fetchConversations(selectedUserId, true);
    }
  }, [selectedUserId, selectedConversationId, fetchConversations]);

  // Fetch all conversations when switching to 'chats' view mode
  useEffect(() => {
    if (viewMode === "chats") {
      fetchAllConversations(true);
    }
  }, [viewMode, fetchAllConversations]);

  // Join/leave conversation rooms when conversation changes
  useEffect(() => {
    if (selectedUserId && selectedConversationId && selectedOrderId !== null) {
      // Fetch initial messages
      fetchMessagesByConversation(selectedUserId, selectedOrderId);

      // Join the conversation room
      joinConversation(selectedUserId, selectedOrderId);

      console.log(
        `💬 Joined conversation: user=${selectedUserId}, order=${selectedOrderId}`
      );

      // Cleanup: leave conversation when it changes
      return () => {
        leaveConversation(selectedUserId, selectedOrderId);
        console.log(
          `👋 Left conversation: user=${selectedUserId}, order=${selectedOrderId}`
        );
      };
    } else {
      setMessages([]);
    }
  }, [
    selectedUserId,
    selectedConversationId,
    selectedOrderId,
    fetchMessagesByConversation,
  ]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUserId]);

  return (
    <>
      <Helmet>
        <title>Order Messages</title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Messages
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-0 flex-wrap">
                <button
                  onClick={() => setShowPreloadedMessagesModal(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <span className="hidden sm:inline">
                    Add Preloaded Messages
                  </span>
                  <span className="sm:hidden">Add</span>
                </button>
                <UserDropdown
                  users={dropdownUsers}
                  selectedUserId={selectedUserId}
                  selectedUser={selectedUser}
                  isOpen={dropdownOpen}
                  onToggle={() => setDropdownOpen(!dropdownOpen)}
                  searchTerm={dropdownSearchTerm}
                  onSearchChange={(e) => setDropdownSearchTerm(e.target.value)}
                  onSelectUser={handleSelectUserFromDropdown}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="mt-2 sm:mt-4">
              <div className="block md:hidden">
                {!selectedUserId && !selectedConversationId ? (
                  viewMode === "users" ? (
                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                      <UserList
                        users={filteredUsers}
                        selectedUserId={selectedUserId}
                        searchTerm={searchTerm}
                        onSearchChange={(e) => setSearchTerm(e.target.value)}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        onSelectUser={handleSelectUser}
                        onDeleteAllMessages={handleDeleteAllMessages}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                        totalUsers={
                          searchTerm || activeFilter !== "unread"
                            ? filteredUsers.length
                            : users.length
                        }
                        totalChats={
                          searchTerm ||
                          activeFilter !== "unread" ||
                          selectedTagFilter
                            ? filteredConversations.length
                            : allConversations.length
                        }
                      />
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] flex flex-col">
                      {/* Search */}
                      <div className="p-2 sm:p-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {/* Toggle */}
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-200">
                        <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                          <button
                            onClick={() => handleViewModeChange("users")}
                            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              viewMode === "users"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            Users (
                            {searchTerm || activeFilter !== "unread"
                              ? filteredUsers.length
                              : users.length}
                            )
                          </button>
                          <button
                            onClick={() => handleViewModeChange("chats")}
                            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                              viewMode === "chats"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            Chats (
                            {searchTerm ||
                            activeFilter !== "unread" ||
                            selectedTagFilter
                              ? filteredConversations.length
                              : allConversations.length}
                            )
                          </button>
                        </div>
                      </div>
                      {/* Filter Buttons */}
                      <div className="p-2 sm:p-3 border-b border-gray-300 bg-gray-50">
                        <div className="flex gap-1.5 sm:gap-2">
                          {[
                            { value: "all", label: "All" },
                            { value: "read", label: "Read" },
                            { value: "unread", label: "Unread" },
                          ].map((filter) => (
                            <button
                              key={filter.value}
                              onClick={() => setActiveFilter(filter.value)}
                              className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                                activeFilter === filter.value
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Tag Filter Dropdown */}
                      {allUniqueTags.length > 0 && (
                        <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-200">
                          <select
                            value={selectedTagFilter}
                            onChange={(e) =>
                              setSelectedTagFilter(e.target.value)
                            }
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">All Tags</option>
                            {allUniqueTags.map((tag) => (
                              <option key={tag.name} value={tag.name}>
                                {tag.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <AllConversationsList
                        conversations={filteredConversations}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={handleSelectFromAllConversations}
                        isLoading={isLoadingAllConversations}
                      />
                    </div>
                  )
                ) : showAssignPanel ? (
                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                    <AssignToOrderPanel
                      selectedUser={selectedUser}
                      orders={userOrders}
                      isLoading={isLoadingOrders || isAssigning}
                      onSelectOrder={handleAssignToOrder}
                      onCancel={handleCancelAssignPanel}
                    />
                  </div>
                ) : showOrderSelection ? (
                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                    <AdminOrderSelectionPanel
                      selectedUser={selectedUser}
                      orders={userOrders}
                      returnOrders={userReturnOrders}
                      isLoading={isLoadingOrders}
                      isLoadingReturnOrders={isLoadingReturnOrders}
                      onSelectOrder={handleSelectOrderForChat}
                      onSelectReturnOrder={handleSelectReturnOrderForChat}
                      onStartGeneralChat={handleStartGeneralChatForUser}
                      onCancel={handleCancelOrderSelection}
                    />
                  </div>
                ) : !selectedConversationId ? (
                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                    <ConversationList
                      conversations={conversations}
                      selectedConversationId={selectedConversationId}
                      onSelectConversation={handleSelectConversation}
                      selectedUser={selectedUser}
                      onBack={handleBackToUsers}
                      onStartNewChat={handleStartNewChat}
                      onAssignToOrder={handleOpenAssignPanel}
                    />
                  </div>
                ) : (
                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                    <ChatWindow
                      selectedUser={
                        selectedUser ||
                        dropdownUsers.find((u) => u.id === selectedUserId)
                      }
                      messages={messages}
                      currentUserId={ADMIN_ID}
                      messageText={messageText}
                      onMessageChange={(e) => setMessageText(e.target.value)}
                      onSendMessage={handleSendMessage}
                      onSendPreloadedMessage={handleSendPreloadedMessage}
                      onDeleteMessage={handleDeleteMessage}
                      onEditMessage={handleEditMessage}
                      onPreview={handlePreview}
                      uploadedFiles={uploadedFiles}
                      onRemoveFile={removeFile}
                      isImage={isImage}
                      onFileSelect={handleFileUpload}
                      fileInputRef={fileInputRef}
                      messagesEndRef={messagesEndRef}
                      onBack={() => setSelectedConversationId(null)}
                      showBackButton={true}
                      orderNumber={selectedOrderNumber}
                      orderId={selectedOrderId}
                      userId={selectedUserId}
                      conversationId={selectedConversationId}
                      editingMessage={editingMessage}
                      onCancelEdit={handleCancelEdit}
                      isSending={isSending}
                      onSendEmail={handleSendEmailNotification}
                      onReadStatusToggle={handleReadStatusToggle}
                    />
                  </div>
                )}
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex bg-gray-100 border border-gray-300 rounded-lg overflow-hidden h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
                {/* Panel 1: User List or All Conversations List */}
                {viewMode === "users" ? (
                  <UserList
                    users={filteredUsers}
                    selectedUserId={selectedUserId}
                    searchTerm={searchTerm}
                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onSelectUser={handleSelectUser}
                    onDeleteAllMessages={handleDeleteAllMessages}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    totalUsers={
                      searchTerm || activeFilter !== "unread"
                        ? filteredUsers.length
                        : users.length
                    }
                    totalChats={
                      searchTerm ||
                      activeFilter !== "unread" ||
                      selectedTagFilter
                        ? filteredConversations.length
                        : allConversations.length
                    }
                  />
                ) : (
                  <div className="w-1/2 md:w-[40%] lg:w-[30%] border-r border-gray-300 bg-white flex flex-col">
                    {/* Search and Toggle for Chat List view */}
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {/* View Mode Toggle */}
                    <div className="px-3 py-2 border-b border-gray-200">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => handleViewModeChange("users")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === "users"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                          <span>
                            Users (
                            {searchTerm || activeFilter !== "unread"
                              ? filteredUsers.length
                              : users.length}
                            )
                          </span>
                        </button>
                        <button
                          onClick={() => handleViewModeChange("chats")}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === "chats"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>
                            Chats (
                            {searchTerm ||
                            activeFilter !== "unread" ||
                            selectedTagFilter
                              ? filteredConversations.length
                              : allConversations.length}
                            )
                          </span>
                        </button>
                      </div>
                    </div>
                    {/* Filter Buttons */}
                    <div className="p-3 border-b border-gray-300 bg-gray-50">
                      <div className="flex gap-2">
                        {[
                          { value: "all", label: "All" },
                          { value: "read", label: "Read" },
                          { value: "unread", label: "Unread" },
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              activeFilter === filter.value
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Tag Filter Dropdown */}
                    {allUniqueTags.length > 0 && (
                      <div className="px-3 py-2 border-b border-gray-200">
                        <select
                          value={selectedTagFilter}
                          onChange={(e) => setSelectedTagFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">All Tags</option>
                          {allUniqueTags.map((tag) => (
                            <option key={tag.name} value={tag.name}>
                              {tag.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* All Conversations List */}
                    <AllConversationsList
                      conversations={filteredConversations}
                      selectedConversationId={selectedConversationId}
                      onSelectConversation={handleSelectFromAllConversations}
                      isLoading={isLoadingAllConversations}
                    />
                  </div>
                )}

                {/* Panel 2: Conversation List (when user selected and in users mode) */}
                {viewMode === "users" &&
                  selectedUserId &&
                  !showOrderSelection &&
                  !showAssignPanel && (
                    <ConversationList
                      conversations={conversations}
                      selectedConversationId={selectedConversationId}
                      onSelectConversation={handleSelectConversation}
                      selectedUser={selectedUser}
                      onBack={handleBackToUsers}
                      onStartNewChat={handleStartNewChat}
                      onAssignToOrder={handleOpenAssignPanel}
                    />
                  )}

                {/* Panel 3: Order Selection / Assign Panel / Chat Window */}
                <div
                  className={`flex-1 flex flex-col ${
                    !selectedConversationId &&
                    !showOrderSelection &&
                    !showAssignPanel
                      ? "bg-white"
                      : ""
                  }`}
                >
                  {showAssignPanel ? (
                    <AssignToOrderPanel
                      selectedUser={selectedUser}
                      orders={userOrders}
                      isLoading={isLoadingOrders || isAssigning}
                      onSelectOrder={handleAssignToOrder}
                      onCancel={handleCancelAssignPanel}
                    />
                  ) : showOrderSelection ? (
                    <AdminOrderSelectionPanel
                      selectedUser={selectedUser}
                      orders={userOrders}
                      returnOrders={userReturnOrders}
                      isLoading={isLoadingOrders}
                      isLoadingReturnOrders={isLoadingReturnOrders}
                      onSelectOrder={handleSelectOrderForChat}
                      onSelectReturnOrder={handleSelectReturnOrderForChat}
                      onStartGeneralChat={handleStartGeneralChatForUser}
                      onCancel={handleCancelOrderSelection}
                    />
                  ) : selectedConversationId ? (
                    <ChatWindow
                      selectedUser={
                        selectedUser ||
                        dropdownUsers.find((u) => u.id === selectedUserId)
                      }
                      messages={messages}
                      currentUserId={ADMIN_ID}
                      messageText={messageText}
                      onMessageChange={(e) => setMessageText(e.target.value)}
                      onSendMessage={handleSendMessage}
                      onSendPreloadedMessage={handleSendPreloadedMessage}
                      onDeleteMessage={handleDeleteMessage}
                      onEditMessage={handleEditMessage}
                      onPreview={handlePreview}
                      uploadedFiles={uploadedFiles}
                      onRemoveFile={removeFile}
                      isImage={isImage}
                      onFileSelect={handleFileUpload}
                      fileInputRef={fileInputRef}
                      messagesEndRef={messagesEndRef}
                      showBackButton={false}
                      orderNumber={selectedOrderNumber}
                      orderId={selectedOrderId}
                      userId={selectedUserId}
                      conversationId={selectedConversationId}
                      editingMessage={editingMessage}
                      onCancelEdit={handleCancelEdit}
                      isSending={isSending}
                      onSendEmail={handleSendEmailNotification}
                      onReadStatusToggle={handleReadStatusToggle}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          className="w-24 h-24 mx-auto text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p className="text-xl text-gray-500">
                          {viewMode === "chats"
                            ? "Select a conversation to start chatting"
                            : selectedUserId
                            ? "Select a conversation to start chatting"
                            : "Select a user to view conversations"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal fileUrl={previewFile} onClose={closePreview} />

      {/* Preloaded Messages Modal */}
      <PreloadedMessagesModal
        isOpen={showPreloadedMessagesModal}
        onClose={() => setShowPreloadedMessagesModal(false)}
      />
    </>
  );
}
