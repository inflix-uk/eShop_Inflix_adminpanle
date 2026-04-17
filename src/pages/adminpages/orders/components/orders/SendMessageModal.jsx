import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { sendMessage } from "../../../messages/service";

const ADMIN_ID = "66cdf5f6dec61c826428d298";

const SendMessageModal = ({ isOpen, onClose, order }) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !order) return null;

  // userId is stored in contactDetails.userId
  const userId = order.contactDetails?.userId || order.user?._id || order.user;
  const customerName = order.shippingDetails?.firstName
    ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName || ""}`
    : "Customer";

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!userId) {
      toast.error("User information not found for this order");
      return;
    }

    setIsSending(true);

    try {
      const result = await sendMessage(
        ADMIN_ID,
        userId,
        messageText,
        [], // No file attachments
        order._id // Order ID to link conversation to this order
      );

      if (result.success) {
        toast.success(`Message sent to ${customerName} for Order #${order.orderNumber}`);
        setMessageText("");
        onClose();
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Send Message
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                To: <span className="font-medium text-gray-700">{customerName}</span>
                {" | "}
                Order: <span className="font-medium text-blue-600">#{order.orderNumber}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
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

          {/* Body */}
          <div className="px-6 py-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Sending...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SendMessageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
};

export default SendMessageModal;
