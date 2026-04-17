import PropTypes from 'prop-types';

/**
 * ConversationItem Component
 * Displays a single conversation in the admin panel
 */
const ConversationItem = ({ conversation, isSelected = false, onClick, onAssignToOrder }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const truncateMessage = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text || 'No messages yet';
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0 mr-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              conversation.isReturnOrder
                ? 'bg-red-500'
                : conversation.orderNumber
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
            }`}
          >
            {conversation.isReturnOrder ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            ) : conversation.orderNumber ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
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
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold truncate ${
                conversation.isReturnOrder ? 'text-red-700' : 'text-gray-900'
              }`}>
                {conversation.isReturnOrder
                  ? `Return ${conversation.returnOrderNumber || 'Order'}`
                  : conversation.orderNumber
                    ? `Order #${conversation.orderNumber}`
                    : 'General Chat'}
              </h3>
              {/* Assign to Order button - only for general chat */}
              {!conversation.orderNumber && !conversation.isReturnOrder && onAssignToOrder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignToOrder(conversation);
                  }}
                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
                  title="Assign to Order"
                  aria-label="Assign general chat to an order"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
              {/* Unread badge - inline with title */}
              {conversation.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(conversation.lastMessageTime)}
            </span>
          </div>

          {(conversation.orderStatus || conversation.returnOrderStatus) && (
            <p className={`text-xs mb-1 ${conversation.isReturnOrder ? 'text-red-600' : 'text-gray-600'}`}>
              Status: <span className="font-medium">{conversation.isReturnOrder ? conversation.returnOrderStatus : conversation.orderStatus}</span>
            </p>
          )}

          <p className="text-sm text-gray-600 truncate">
            {truncateMessage(conversation.lastMessage)}
          </p>

          {/* Tags */}
          {conversation.tags && conversation.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-2">
              {conversation.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Attachment indicator */}
          {conversation.hasAttachments && (
            <span className="inline-block mt-2 text-xs text-gray-500">
              📎 Has attachments
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ConversationItem.propTypes = {
  conversation: PropTypes.shape({
    conversationId: PropTypes.string.isRequired,
    orderId: PropTypes.string,
    orderNumber: PropTypes.string,
    orderStatus: PropTypes.string,
    returnOrderId: PropTypes.string,
    returnOrderNumber: PropTypes.string,
    returnOrderStatus: PropTypes.string,
    isReturnOrder: PropTypes.bool,
    lastMessage: PropTypes.string,
    lastMessageTime: PropTypes.string.isRequired,
    unreadCount: PropTypes.number,
    hasAttachments: PropTypes.bool,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onAssignToOrder: PropTypes.func
};

export default ConversationItem;
