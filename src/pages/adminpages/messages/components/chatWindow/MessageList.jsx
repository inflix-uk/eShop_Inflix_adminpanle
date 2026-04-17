import PropTypes from 'prop-types';
import MessageBubble from './MessageBubble';

/**
 * MessageList Component
 * Displays the list of messages in the chat
 */
const MessageList = ({
  messages,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  onPreview,
  messagesEndRef,
  orderNumber = null
}) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg, index) => (
        <div
          key={msg._id}
          ref={index === messages.length - 1 ? messagesEndRef : null}
        >
          <MessageBubble
            message={msg}
            isSent={msg.sender === currentUserId}
            onDelete={onDeleteMessage}
            onEdit={onEditMessage}
            onPreview={onPreview}
            orderNumber={orderNumber}
          />
        </div>
      ))}
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      sender: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired
    })
  ).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onDeleteMessage: PropTypes.func.isRequired,
  onEditMessage: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  orderNumber: PropTypes.string
};

export default MessageList;
