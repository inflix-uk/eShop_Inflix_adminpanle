import PropTypes from 'prop-types';
import { IoMdTrash } from 'react-icons/io';
import { FiEdit2 } from 'react-icons/fi';
import ReturnRequestDetails from './ReturnRequestDetails';
import FileAttachment from './FileAttachment';

/**
 * MessageBubble Component
 * Displays a single message bubble
 */
const MessageBubble = ({
  message,
  isSent,
  onDelete,
  onEdit,
  onPreview,
  orderNumber = null
}) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message._id);
    }
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-2 sm:px-4`}>
      <div className="relative max-w-[85%] sm:max-w-xs md:max-w-md overflow-hidden">
        <div
          className={`px-3 sm:px-4 py-1.5 sm:py-2 pt-2 sm:pt-3 pr-10 sm:pr-14 rounded-lg shadow ${
            isSent
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-200 text-gray-800 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.message}</p>

          {/* Order Badge - Only show if orderId exists but we're not in an order-specific conversation */}
          {message.orderId && !orderNumber && (
            <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
              isSent
                ? 'bg-blue-700 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}>
              📦 Order Message
            </div>
          )}

          {/* Return Request Details */}
          {message.requestOrder && (
            <ReturnRequestDetails requestOrder={message.requestOrder} />
          )}

          {/* Timestamp and Read Status */}
          {message.createdAt && (
            <p
              className={`mt-1 text-[10px] sm:text-xs flex items-center ${
                isSent ? 'text-gray-100' : 'text-gray-600'
              }`}
            >
              <span>{new Date(message.createdAt).toLocaleString()}</span>
              {message.edited && (
                <span className="ml-1 italic opacity-75">(edited)</span>
              )}
              {/* Read Status Checkmarks - Only for sent (admin) messages */}
              {isSent && (
                <span className="ml-1.5 sm:ml-2" title={message.readStatus ? 'Read' : 'Sent'}>
                  {message.readStatus ? (
                    <span className="text-blue-300 font-bold">✓✓</span>
                  ) : (
                    <span className="text-gray-300">✓</span>
                  )}
                </span>
              )}
            </p>
          )}

          {/* File Attachments */}
          <FileAttachment files={message.files} onPreview={onPreview} />
        </div>

        {/* Edit and Delete Buttons (available for all messages) */}
        <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 flex gap-1 sm:gap-2">
          <button
            onClick={() => onEdit(message)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-0.5"
            aria-label="Edit message"
            title="Edit message"
          >
            <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 transition-colors p-0.5"
            aria-label="Delete message"
            title="Delete message"
          >
            <IoMdTrash size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    files: PropTypes.arrayOf(PropTypes.string),
    requestOrder: PropTypes.object,
    orderId: PropTypes.string,
    edited: PropTypes.bool,
    editedAt: PropTypes.string,
    readStatus: PropTypes.bool
  }).isRequired,
  isSent: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  orderNumber: PropTypes.string
};

export default MessageBubble;
