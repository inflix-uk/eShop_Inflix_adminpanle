import PropTypes from 'prop-types';
import ConversationItem from './ConversationItem';

/**
 * ConversationList Component
 * Displays all conversations for a selected user with full user details
 */
const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  selectedUser,
  onBack,
  onStartNewChat,
  onAssignToOrder
}) => {
  // Calculate total unread messages across all conversations
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <div className="w-full md:w-1/3 lg:w-[30%] xl:w-1/4 border-r border-gray-300 bg-white flex flex-col">
      {/* User Details Header */}
      <div className="border-b border-gray-300 bg-gradient-to-r from-blue-50 to-emerald-50">
        {/* Back Button Row */}
        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
            aria-label="Go back to users"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Start New Chat Button */}
            {onStartNewChat && (
              <button
                onClick={onStartNewChat}
                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors"
                aria-label="Start new chat"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
            {/* Total Unread Badge */}
            {totalUnread > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {totalUnread} unread
              </div>
            )}
          </div>
        </div>

        {/* User Details Card */}
        <div className="p-2 sm:p-3 md:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-500 text-white rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold capitalize shadow-md">
                {selectedUser?.name?.charAt(0) || 'U'}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 capitalize truncate">
                {selectedUser?.name || 'Unknown User'}
              </h2>

              {/* Email */}
              {selectedUser?.email && (
                <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{selectedUser.email}</span>
                </div>
              )}

              {/* Phone */}
              {selectedUser?.phoneNumber && (
                <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{selectedUser.phoneNumber}</span>
                </div>
              )}

              {/* Conversations Count */}
              <div className="flex items-center mt-1.5 sm:mt-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversationId}
              conversation={conversation}
              isSelected={conversation.conversationId === selectedConversationId}
              onClick={() => onSelectConversation(conversation)}
              onAssignToOrder={onAssignToOrder}
            />
          ))
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
            <p className="text-gray-500 text-sm">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.arrayOf(
    PropTypes.shape({
      conversationId: PropTypes.string.isRequired,
      orderId: PropTypes.string,
      orderNumber: PropTypes.string,
      lastMessage: PropTypes.string,
      lastMessageTime: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedConversationId: PropTypes.string,
  onSelectConversation: PropTypes.func.isRequired,
  selectedUser: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  onBack: PropTypes.func.isRequired,
  onStartNewChat: PropTypes.func,
  onAssignToOrder: PropTypes.func
};

export default ConversationList;
