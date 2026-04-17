import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
import {
  getMessagesByConversation,
  sendMessage,
  deleteMessage,
  editMessage,
  mapMessageAttachments,
} from "../../../messages/service";
import {
  initializeSocket,
  joinConversation,
  leaveConversation,
  onNewMessage,
} from "../../../messages/socket";
import { ChatWindow, FilePreviewModal } from "../../../messages/components/chatWindow";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ADMIN_ID = "66cdf5f6dec61c826428d298";

const OrderChatModal = ({ isOpen, onClose, order }) => {
  // Message state
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  // File state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Get user info from order
  const userId = order?.contactDetails?.userId || order?.user?._id || order?.user;
  const customerName = order?.shippingDetails?.firstName
    ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName || ""}`
    : "Customer";

  // Create selected user object for ChatWindow
  const selectedUser = {
    _id: userId,
    name: customerName,
    email: order?.contactDetails?.email || "",
    phoneNumber: order?.shippingDetails?.phoneNumber || "",
  };

  // Fetch messages for this order
  const fetchMessages = useCallback(async () => {
    if (!userId || !order?._id) return;

    setIsLoading(true);
    try {
      const result = await getMessagesByConversation(userId, order._id);
      if (result.success && result.messages) {
        setMessages(mapMessageAttachments(result.messages));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, order?._id]);

  // Initialize socket and fetch messages when modal opens
  useEffect(() => {
    if (isOpen && userId && order?._id) {
      // Initialize socket
      initializeSocket();

      // Fetch existing messages
      fetchMessages();

      // Join conversation room
      joinConversation(userId, order._id);

      // Listen for new messages
      const cleanupNewMessage = onNewMessage((newMessage) => {
        // Check if message is for this conversation
        const involvesThisOrder =
          (newMessage.orderId === order._id || newMessage.orderId === order._id.toString());
        const involvesUser =
          (newMessage.sender === userId && newMessage.receiver === ADMIN_ID) ||
          (newMessage.sender === ADMIN_ID && newMessage.receiver === userId);

        if (involvesThisOrder && involvesUser) {
          setMessages((prevMessages) => {
            const exists = prevMessages.some((msg) => msg._id === newMessage._id);
            if (!exists) {
              const processedMessage = {
                ...newMessage,
                files: (newMessage.attachments || []).map(
                  (attachment) => `${BACKEND_URL}${attachment.path}`
                ),
              };
              return [...prevMessages, processedMessage].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
              );
            }
            return prevMessages;
          });
        }
      });

      // Cleanup on unmount or modal close
      return () => {
        cleanupNewMessage();
        leaveConversation(userId, order._id);
      };
    }
  }, [isOpen, userId, order?._id, fetchMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!userId || (!messageText.trim() && uploadedFiles.length === 0)) return;
    if (isSending) return;

    setIsSending(true);

    try {
      if (editingMessage) {
        // Edit existing message
        const result = await editMessage(editingMessage._id, messageText);
        if (result.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === editingMessage._id
                ? { ...msg, message: messageText, edited: true, editedAt: new Date().toISOString() }
                : msg
            )
          );
          setMessageText("");
          setEditingMessage(null);
          toast.success("Message updated");
        } else {
          toast.error(result.error || "Failed to update message");
        }
      } else {
        // Send new message
        const result = await sendMessage(
          ADMIN_ID,
          userId,
          messageText,
          uploadedFiles,
          order._id
        );

        if (result.success) {
          if (result.message) {
            const newMessage = {
              ...result.message,
              files: (result.message.attachments || []).map(
                (attachment) => `${BACKEND_URL}${attachment.path}`
              ),
            };
            setMessages((prev) => {
              const exists = prev.some((msg) => msg._id === newMessage._id);
              if (!exists) {
                return [...prev, newMessage].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
              }
              return prev;
            });
          }
          setMessageText("");
          setUploadedFiles([]);
        } else {
          toast.error(result.error || "Failed to send message");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId) => {
    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Message deleted");
      } else {
        toast.error(result.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error deleting message");
    }
  };

  // Edit message handler
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageText(message.message);
    setUploadedFiles([]);
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  // File upload handler with compression
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

  // Remove file handler
  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Check if file is image
  const isImage = (file) => file.type.startsWith("image/");

  // Preview handler
  const handlePreview = (fileUrl) => {
    setPreviewFile(fileUrl);
  };

  // Close preview handler
  const closePreview = () => {
    setPreviewFile(null);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 lg:inset-20 flex items-center justify-center">
        <div className="relative bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50 flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                Chat with {customerName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Order:{" "}
                <span className="font-medium text-blue-600">
                  #{order.orderNumber}
                </span>
                {order.contactDetails?.email && (
                  <>
                    {" | "}
                    <span className="text-gray-600">{order.contactDetails.email}</span>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading messages...</span>
                </div>
              </div>
            ) : (
              <ChatWindow
                selectedUser={selectedUser}
                messages={messages}
                currentUserId={ADMIN_ID}
                messageText={messageText}
                onMessageChange={(e) => setMessageText(e.target.value)}
                onSendMessage={handleSendMessage}
                onSendPreloadedMessage={(text) => setMessageText(text)}
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
                orderNumber={order.orderNumber}
                orderId={order._id}
                userId={userId}
                conversationId={order._id}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
                isSending={isSending}
              />
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal fileUrl={previewFile} onClose={closePreview} />
    </div>
  );
};

OrderChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
};

export default OrderChatModal;
