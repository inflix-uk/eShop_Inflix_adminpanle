import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import Top from "../nav/Top";
import Side from "../nav/Side";
import { ConversationList, ChatPanel, AutoReplyModal, NotificationModal, TransferModal, AwayModal } from "./components";
import {
  getAllVisitors,
  getVisitorMessages,
  markAsRead,
  sendReply,
  deleteConversation,
  adminSocketService,
  getAutoReplySettings,
  saveAutoReplySettings,
  checkUserByEmail,
  transferToMessages,
  getAwayStatus,
  saveAwayStatus,
  getChatEnabledSettings,
  saveChatEnabledSettings,
} from "./service";

// Unlock audio on first user interaction (browser autoplay policy workaround)
let audioUnlocked = false;
const unlockAudio = () => {
  if (audioUnlocked) return;
  const audio = new Audio("/visiterMessage.mp3");
  audio.volume = 0;
  audio.play().then(() => {
    audio.pause();
    audioUnlocked = true;
    console.log("Audio unlocked for notifications");
  }).catch(() => {});
};

export default function VisitorMessages() {
  const [selectedPage] = useState("visitor-messages");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Visitors state
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Search and reply state
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Typing indicator state
  const [visitorTyping, setVisitorTyping] = useState({});
  const typingTimeoutRef = useRef(null);

  // Auto-reply modal state
  const [isAutoReplyModalOpen, setIsAutoReplyModalOpen] = useState(false);
  const [autoReplySettings, setAutoReplySettings] = useState(null);
  const [isSavingAutoReply, setIsSavingAutoReply] = useState(false);

  // Notification modal state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    visitorName: "",
    message: "",
    conversationId: null,
    isNewUser: false, // true = new user (loop sound), false = returning user (single sound)
  });

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferVisitor, setTransferVisitor] = useState(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [transferCheckResult, setTransferCheckResult] = useState(null);

  // Away modal state
  const [isAwayModalOpen, setIsAwayModalOpen] = useState(false);
  const [awaySettings, setAwaySettings] = useState(null);
  const [isSavingAway, setIsSavingAway] = useState(false);

  // Live chat enable/disable state (controls storefront widget visibility)
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isTogglingChat, setIsTogglingChat] = useState(false);

  // Sidebar handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Unlock audio on first user interaction (for browser autoplay policy)
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  /**
   * Fetch all visitors
   */
  const fetchVisitors = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllVisitors();
      if (data.success) {
        setVisitors(data.visitors || []);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch messages for selected visitor
   */
  const fetchMessages = useCallback(
    async (visitorId) => {
      try {
        setIsLoadingMessages(true);
        const data = await getVisitorMessages(visitorId);
        if (data.success) {
          setMessages(data.messages || []);
          await markAsRead(visitorId);
          // Locally clear the unread badge instead of refetching the whole
          // visitor list — the server state is already updated by markAsRead.
          setVisitors((prev) =>
            prev.map((v) =>
              v._id === visitorId
                ? { ...v, isRead: true, unreadCount: 0 }
                : v
            )
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    []
  );

  /**
   * Initialize socket connection and event handlers
   */
  useEffect(() => {
    // Connect to socket
    console.log("🔌 Connecting to visitor chat socket...");
    adminSocketService.connect();

    // Handle new messages in real-time
    adminSocketService.onNewMessage((data) => {
      console.log("📩 onNewMessage callback triggered:", data);
      // Update messages if this is the current conversation
      if (selectedVisitor?._id === data.conversationId) {
        setMessages((prev) => {
          // Prevent duplicates - check by text, sender, and approximate time
          const messageTime = new Date(data.message.createdAt).getTime();
          const exists = prev.some((m) => {
            const existingTime = new Date(m.createdAt).getTime();
            const timeDiff = Math.abs(messageTime - existingTime);
            // Same text, sender, and within 5 seconds = duplicate
            return m.text === data.message.text &&
                   m.sender === data.message.sender &&
                   timeDiff < 5000;
          });
          if (exists) return prev;
          return [
            ...prev,
            {
              ...data.message,
              _id: `msg-${Date.now()}`,
            },
          ];
        });
      }

      // Update visitor's last message in the list
      setVisitors((prev) =>
        prev.map((v) =>
          v._id === data.conversationId
            ? {
                ...v,
                lastMessage: data.message.text,
                lastMessageAt: data.message.createdAt,
                isRead: selectedVisitor?._id === data.conversationId,
                unreadCount:
                  selectedVisitor?._id === data.conversationId
                    ? 0
                    : (v.unreadCount || 0) + (data.message.sender !== "admin" && data.message.sender !== "bot" ? 1 : 0),
              }
            : v
        )
      );

      // Show notification for user/visitor messages (not admin/bot)
      // This is for RETURNING users - just play sound once, no modal
      const sender = data.message?.sender || data.sender;
      console.log("📬 Message received - Sender:", sender, "Data:", data);

      // Check if message is from visitor/user (not admin or bot)
      const isFromVisitor = sender === "user" || sender === "visitor" ||
                            (sender !== "admin" && sender !== "bot");

      if (isFromVisitor) {
        console.log("🔔 Playing notification sound for RETURNING user (no modal)");
        // Just play notification.wav once - no modal for returning users
        try {
          const audio = new Audio("/notification.wav");
          audio.volume = 1.0;
          audio.play().catch((err) => {
            console.log("⚠️ Audio play failed:", err.message);
          });
        } catch (err) {
          console.log("Audio error:", err);
        }
      }
    });

    // Handle visitor typing
    adminSocketService.onVisitorTyping((data) => {
      setVisitorTyping((prev) => ({
        ...prev,
        [data.conversationId]: data.isTyping
          ? { text: data.text, visitorName: data.visitorName }
          : null,
      }));
    });

    // Handle new conversations - NEW USER (first time messaging)
    adminSocketService.onNewConversation((data) => {
      console.log("🆕 New conversation received:", data);
      toast.info(`New chat from ${data.visitor?.name || "Visitor"}`);

      // Immediately add new visitor to the list
      setVisitors((prev) => {
        // Check if already exists
        const exists = prev.some((v) => v._id === data.conversationId);
        if (exists) return prev;

        // Add new visitor at the top
        const newVisitor = {
          _id: data.conversationId,
          name: data.visitor?.name || "Visitor",
          email: data.visitor?.email || "",
          phoneNumber: data.visitor?.phoneNumber || "",
          lastMessage: "New conversation started",
          lastMessageAt: data.createdAt || new Date(),
          unreadCount: 1,
          isRead: false,
        };
        return [newVisitor, ...prev];
      });

      // Trigger notification for NEW USER - continuous ringing
      console.log("🔔 Triggering notification for NEW USER - continuous ringing");
      setNotificationData({
        visitorName: data.visitor?.name || "Visitor",
        message: data.initialMessage || "Started a new conversation",
        conversationId: data.conversationId,
        isNewUser: true, // New user - loop notification sound continuously
      });
      setIsNotificationOpen(true);

      // Also fetch to get full data
      fetchVisitors();
    });

    // Handle refresh requests
    adminSocketService.onRefreshVisitors(() => {
      fetchVisitors();
    });

    // Initial fetch
    fetchVisitors();

    // Cleanup on unmount
    return () => {
      adminSocketService.disconnect();
    };
  }, [fetchVisitors, selectedVisitor]);

  /**
   * Handle selecting a visitor
   */
  const handleSelectVisitor = (visitor) => {
    // Leave previous conversation
    if (selectedVisitor) {
      adminSocketService.leaveConversation(selectedVisitor._id);
    }

    setSelectedVisitor(visitor);

    // Join new conversation
    adminSocketService.joinConversation(visitor._id);

    fetchMessages(visitor._id);
  };

  /**
   * Handle reply text change with typing indicator
   */
  const handleReplyTextChange = (text) => {
    setReplyText(text);

    if (selectedVisitor) {
      if (text.trim()) {
        adminSocketService.emitTyping(selectedVisitor._id);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          adminSocketService.emitStopTyping(selectedVisitor._id);
        }, 2000);
      } else {
        adminSocketService.emitStopTyping(selectedVisitor._id);
      }
    }
  };

  /**
   * Handle sending reply (with optional files)
   */
  const handleSendReply = async () => {
    if ((!replyText.trim() && uploadedFiles.length === 0) || !selectedVisitor) return;

    const messageText = replyText.trim();
    const filesToSend = [...uploadedFiles];
    setReplyText("");
    setUploadedFiles([]);
    setIsSending(true);

    // Stop typing indicator
    adminSocketService.emitStopTyping(selectedVisitor._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const data = await sendReply(selectedVisitor._id, messageText, filesToSend);
      if (data.success) {
        // Emit via socket with attachments for OTHER receivers (visitors, other admins)
        adminSocketService.emitMessage(
          selectedVisitor._id,
          messageText,
          data.newMessage?.attachments || []
        );
        // Update our own UI with fresh data from server (includes attachments)
        await fetchMessages(selectedVisitor._id);
      }
    } catch (error) {
      toast.error("Error sending reply");
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle deleting conversation
   */
  const handleDeleteConversation = async (visitorId) => {
    if (!window.confirm("Delete this conversation?")) return;
    try {
      const data = await deleteConversation(visitorId);
      if (data.success) {
        if (selectedVisitor?._id === visitorId) {
          adminSocketService.leaveConversation(visitorId);
          setSelectedVisitor(null);
          setMessages([]);
        }
        fetchVisitors();
        adminSocketService.requestRefresh();
        toast.success("Deleted");
      }
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  /**
   * Handle going back (mobile)
   */
  const handleBack = () => {
    if (selectedVisitor) {
      adminSocketService.leaveConversation(selectedVisitor._id);
    }
    setSelectedVisitor(null);
  };

  /**
   * Fetch auto-reply settings
   */
  const fetchAutoReplySettings = useCallback(async () => {
    try {
      const data = await getAutoReplySettings();
      if (data.success) {
        setAutoReplySettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching auto-reply settings:", error);
    }
  }, []);

  /**
   * Handle saving auto-reply settings
   */
  const handleSaveAutoReply = async (settings) => {
    try {
      setIsSavingAutoReply(true);
      const data = await saveAutoReplySettings(settings);
      if (data.success) {
        setAutoReplySettings(data.settings);
        setIsAutoReplyModalOpen(false);
        toast.success("Auto-reply settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving auto-reply settings:", error);
      toast.error("Failed to save auto-reply settings");
    } finally {
      setIsSavingAutoReply(false);
    }
  };

  // Fetch auto-reply settings on mount
  useEffect(() => {
    fetchAutoReplySettings();
  }, [fetchAutoReplySettings]);

  /**
   * Fetch away status settings
   */
  const fetchAwayStatus = useCallback(async () => {
    try {
      const data = await getAwayStatus();
      if (data.success) {
        setAwaySettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching away status:", error);
    }
  }, []);

  /**
   * Handle saving away status settings
   */
  const handleSaveAwayStatus = async (settings) => {
    setIsSavingAway(true);
    try {
      const data = await saveAwayStatus(settings);
      if (data.success) {
        setAwaySettings(data.settings);
        setIsAwayModalOpen(false);
        toast.success(settings.isAway ? "Away mode enabled" : "Away mode disabled");
      }
    } catch (error) {
      console.error("Error saving away status:", error);
      toast.error("Failed to save away status");
    } finally {
      setIsSavingAway(false);
    }
  };

  // Fetch away status on mount
  useEffect(() => {
    fetchAwayStatus();
  }, [fetchAwayStatus]);

  /**
   * Fetch live chat enabled setting
   */
  const fetchChatEnabled = useCallback(async () => {
    try {
      const data = await getChatEnabledSettings();
      if (data?.success && data.settings) {
        setChatEnabled(!!data.settings.isEnabled);
      }
    } catch (error) {
      console.error("Error fetching chat enabled setting:", error);
    }
  }, []);

  useEffect(() => {
    fetchChatEnabled();
  }, [fetchChatEnabled]);

  /**
   * Toggle live chat on/off — hides/shows storefront chat widget
   */
  const handleToggleChatEnabled = async () => {
    if (isTogglingChat) return;
    setIsTogglingChat(true);
    const nextValue = !chatEnabled;
    // Optimistic update
    setChatEnabled(nextValue);
    try {
      const data = await saveChatEnabledSettings(nextValue);
      if (data?.success) {
        setChatEnabled(!!data.settings.isEnabled);
        toast.success(
          data.settings.isEnabled
            ? "Live chat enabled — visible on storefront"
            : "Live chat disabled — hidden on storefront"
        );
      } else {
        setChatEnabled(!nextValue);
        toast.error("Failed to update live chat status");
      }
    } catch (error) {
      console.error("Error toggling live chat:", error);
      setChatEnabled(!nextValue);
      toast.error("Failed to update live chat status");
    } finally {
      setIsTogglingChat(false);
    }
  };

  /**
   * Handle opening transfer modal and checking if user is registered
   */
  const handleOpenTransferModal = async (visitor) => {
    setTransferVisitor(visitor);
    setTransferCheckResult(null);
    setIsTransferModalOpen(true);
    setIsCheckingUser(true);

    try {
      const data = await checkUserByEmail(visitor.email);
      if (data.success) {
        setTransferCheckResult({
          isRegistered: data.isRegistered,
          user: data.user,
        });
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setTransferCheckResult({
        isRegistered: false,
        user: null,
      });
      toast.error("Failed to check user registration");
    } finally {
      setIsCheckingUser(false);
    }
  };

  /**
   * Handle closing transfer modal
   */
  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferVisitor(null);
    setTransferCheckResult(null);
  };

  /**
   * Handle confirming transfer
   */
  const handleConfirmTransfer = async () => {
    if (!transferVisitor || !transferCheckResult?.isRegistered) return;

    try {
      setIsCheckingUser(true);
      const data = await transferToMessages(transferVisitor._id);

      if (data.success) {
        toast.success(
          `Successfully transferred ${data.transferredCount} message(s) to ${data.userName}'s general chat`
        );

        // Clear selected visitor if it was the transferred one
        if (selectedVisitor?._id === transferVisitor._id) {
          adminSocketService.leaveConversation(transferVisitor._id);
          setSelectedVisitor(null);
          setMessages([]);
        }

        // Refresh visitors list
        fetchVisitors();
        adminSocketService.requestRefresh();

        // Close modal
        handleCloseTransferModal();
      }
    } catch (error) {
      console.error("Error transferring messages:", error);
      toast.error(error.response?.data?.message || "Failed to transfer messages");
    } finally {
      setIsCheckingUser(false);
    }
  };

  /**
   * Handle viewing message from notification
   */
  const handleViewNotificationMessage = () => {
    const { conversationId } = notificationData;
    if (conversationId) {
      // Find the visitor and select them
      const visitor = visitors.find((v) => v._id === conversationId);
      if (visitor) {
        handleSelectVisitor(visitor);
      }
    }
    setIsNotificationOpen(false);
  };

  // Filter visitors by search term
  const filteredVisitors = visitors.filter((v) => {
    const search = searchTerm.toLowerCase();
    return (
      v.name?.toLowerCase().includes(search) ||
      v.email?.toLowerCase().includes(search) ||
      v.phoneNumber?.includes(search)
    );
  });

  // Count unread conversations
  const unreadCount = visitors.filter((v) => !v.isRead).length;

  // Get typing indicator for selected visitor
  const currentTyping = selectedVisitor
    ? visitorTyping[selectedVisitor._id]
    : null;

  return (
    <>
      <Helmet>
        <title>Visitor Messages</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="h-[calc(100vh-64px)] bg-slate-100">
          <div className="h-full p-4 md:p-6">
            <div className="h-full bg-white rounded-2xl shadow-sm overflow-hidden flex">
              <ConversationList
                visitors={filteredVisitors}
                selectedVisitor={selectedVisitor}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                unreadCount={unreadCount}
                isLoading={isLoading}
                onSelectVisitor={handleSelectVisitor}
                onDeleteVisitor={handleDeleteConversation}
                onTransferVisitor={handleOpenTransferModal}
                visitorTyping={visitorTyping}
                onOpenAutoReply={() => setIsAutoReplyModalOpen(true)}
                autoReplyEnabled={autoReplySettings?.isEnabled}
                onOpenAway={() => setIsAwayModalOpen(true)}
                isAway={awaySettings?.isAway}
                chatEnabled={chatEnabled}
                onToggleChatEnabled={handleToggleChatEnabled}
                isTogglingChat={isTogglingChat}
              />
              <ChatPanel
                selectedVisitor={selectedVisitor}
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                replyText={replyText}
                setReplyText={handleReplyTextChange}
                isSending={isSending}
                onSendReply={handleSendReply}
                onBack={handleBack}
                visitorTyping={currentTyping}
                uploadedFiles={uploadedFiles}
                onFilesChange={setUploadedFiles}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Auto-Reply Modal */}
      <AutoReplyModal
        isOpen={isAutoReplyModalOpen}
        onClose={() => setIsAutoReplyModalOpen(false)}
        settings={autoReplySettings}
        onSave={handleSaveAutoReply}
        isSaving={isSavingAutoReply}
      />

      {/* Away Modal */}
      <AwayModal
        isOpen={isAwayModalOpen}
        onClose={() => setIsAwayModalOpen(false)}
        settings={awaySettings}
        onSave={handleSaveAwayStatus}
        isSaving={isSavingAway}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        visitorName={notificationData.visitorName}
        message={notificationData.message}
        onViewMessage={handleViewNotificationMessage}
        isNewUser={notificationData.isNewUser}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        visitor={transferVisitor}
        onConfirm={handleConfirmTransfer}
        isLoading={isCheckingUser}
        checkResult={transferCheckResult}
      />
    </>
  );
}
