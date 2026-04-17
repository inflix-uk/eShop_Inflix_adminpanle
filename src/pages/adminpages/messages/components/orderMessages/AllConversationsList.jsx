import PropTypes from 'prop-types';

/**
 * AllConversationsList Component
 * Displays all conversations across all users in a single list
 */
const AllConversationsList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false
}) => {
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

  const truncateMessage = (text, maxLength = 40) => {
    if (!text || text.length <= maxLength) return text || 'No messages yet';
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Conversations List */}
      {conversations.length > 0 ? (
        conversations.map((conversation) => {
          const isSelected = conversation.conversationId === selectedConversationId &&
                            conversation.user?._id === conversation.user?._id;

          return (
            <div
              key={`${conversation.user?._id}-${conversation.conversationId}`}
              onClick={() => onSelectConversation(conversation)}
              className={`p-2 sm:p-3 md:p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                {/* Avatar */}
                <div className="flex-shrink-0 mr-2 sm:mr-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-medium ${
                      conversation.isReturnOrder
                        ? 'bg-red-500'
                        : conversation.orderNumber
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                    }`}
                  >
                    {conversation.isReturnOrder ? (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                  {/* User name and unread badge row */}
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <h3 className={`text-xs sm:text-sm font-semibold truncate capitalize ${
                      conversation.isReturnOrder ? 'text-red-700' : 'text-gray-900'
                    }`}>
                      {conversation.user?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                  </div>

                  {/* Order/Chat type indicator */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    {conversation.isReturnOrder ? (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-700 text-[10px] sm:text-xs font-medium rounded">
                        Return {conversation.returnOrderNumber || 'Order'}
                      </span>
                    ) : conversation.orderNumber ? (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded">
                        Order #{conversation.orderNumber}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded">
                        General Chat
                      </span>
                    )}
                    {(conversation.orderStatus || conversation.returnOrderStatus) && (
                      <span className={`text-[10px] sm:text-xs ${conversation.isReturnOrder ? 'text-red-500' : 'text-gray-500'}`}>
                        {conversation.isReturnOrder ? conversation.returnOrderStatus : conversation.orderStatus}
                      </span>
                    )}
                  </div>

                  {/* Last message preview */}
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {truncateMessage(conversation.lastMessage)}
                  </p>

                  {/* Tags */}
                  {conversation.tags && conversation.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                      {conversation.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.name}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {conversation.tags.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{conversation.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
        </div>
      )}
    </div>
  );
};

AllConversationsList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
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
      user: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        phoneNumber: PropTypes.string
      }),
      tags: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          color: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  selectedConversationId: PropTypes.string,
  onSelectConversation: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default AllConversationsList;
