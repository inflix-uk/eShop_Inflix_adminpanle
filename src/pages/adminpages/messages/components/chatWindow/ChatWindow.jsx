import PropTypes from 'prop-types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

/**
 * ChatWindow Component
 * Main chat window container
 */
const ChatWindow = ({
  selectedUser,
  messages,
  currentUserId,
  messageText,
  onMessageChange,
  onSendMessage,
  onSendPreloadedMessage,
  onDeleteMessage,
  onEditMessage,
  onPreview,
  uploadedFiles,
  onRemoveFile,
  isImage,
  onFileSelect,
  fileInputRef,
  messagesEndRef,
  onBack,
  showBackButton = false,
  orderNumber = null,
  orderId = null,
  userId = null,
  conversationId = null,
  editingMessage = null,
  onCancelEdit = null,
  isSending = false,
  onSendEmail = null,
  onReadStatusToggle = null
}) => {
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  const isDisabled = isSending || (!messageText.trim() && uploadedFiles.length === 0);

  return (
    <>
      <ChatHeader
        selectedUser={selectedUser}
        messages={messages}
        onBack={onBack}
        showBackButton={showBackButton}
        orderNumber={orderNumber}
        userId={userId}
        conversationId={conversationId}
        orderId={orderId}
        onSendEmail={onSendEmail}
        onReadStatusToggle={onReadStatusToggle}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        onDeleteMessage={onDeleteMessage}
        onEditMessage={onEditMessage}
        onPreview={onPreview}
        messagesEndRef={messagesEndRef}
        orderNumber={orderNumber}
      />

      <ChatInput
        messageText={messageText}
        onMessageChange={onMessageChange}
        onSend={onSendMessage}
        onSendPreloaded={onSendPreloadedMessage}
        onFileSelect={onFileSelect}
        uploadedFiles={uploadedFiles}
        onRemoveFile={onRemoveFile}
        isImage={isImage}
        fileInputRef={fileInputRef}
        disabled={isDisabled}
        editingMessage={editingMessage}
        onCancelEdit={onCancelEdit}
        isSending={isSending}
      />
    </>
  );
};

ChatWindow.propTypes = {
  selectedUser: PropTypes.shape({
    name: PropTypes.string
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      sender: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired
    })
  ).isRequired,
  currentUserId: PropTypes.string.isRequired,
  messageText: PropTypes.string.isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  onSendPreloadedMessage: PropTypes.func,
  onDeleteMessage: PropTypes.func.isRequired,
  onEditMessage: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  uploadedFiles: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  isImage: PropTypes.func.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
  orderNumber: PropTypes.string,
  orderId: PropTypes.string,
  userId: PropTypes.string,
  conversationId: PropTypes.string,
  editingMessage: PropTypes.object,
  onCancelEdit: PropTypes.func,
  isSending: PropTypes.bool,
  onSendEmail: PropTypes.func,
  onReadStatusToggle: PropTypes.func
};

export default ChatWindow;
