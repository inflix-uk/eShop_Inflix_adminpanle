import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { FiSend, FiPaperclip, FiEdit2, FiMessageSquare, FiZap } from 'react-icons/fi';
import { getActivePreloadedMessages, improveMessageWithAI } from '../../service';
import { toast } from 'react-toastify';

/**
 * ChatInput Component
 * Input area for typing and sending messages
 */
const ChatInput = ({
  messageText,
  onMessageChange,
  onSend,
  onSendPreloaded,
  onFileSelect,
  uploadedFiles,
  onRemoveFile,
  isImage,
  fileInputRef,
  disabled = false,
  editingMessage = null,
  onCancelEdit = null,
  isSending = false
}) => {
  const textareaRef = useRef(null);
  const [showPreloadedMessages, setShowPreloadedMessages] = useState(false);
  const [preloadedMessages, setPreloadedMessages] = useState([]);
  const [isLoadingPreloaded, setIsLoadingPreloaded] = useState(false);
  const [isImprovingMessage, setIsImprovingMessage] = useState(false);
  const preloadedRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
    // If Shift+Enter, allow default behavior (new line)
  };

  // Fetch preloaded messages when dropdown opens
  const handleTogglePreloaded = async () => {
    if (!showPreloadedMessages) {
      setIsLoadingPreloaded(true);
      try {
        const result = await getActivePreloadedMessages();
        if (result.success) {
          setPreloadedMessages(result.messages || []);
        }
      } catch (error) {
        console.error('Error fetching preloaded messages:', error);
      } finally {
        setIsLoadingPreloaded(false);
      }
    }
    setShowPreloadedMessages(!showPreloadedMessages);
  };

  // Handle selecting a preloaded message - add to input field
  const handleSelectPreloaded = (message) => {
    if (onSendPreloaded) {
      onSendPreloaded(message);
    }
    setShowPreloadedMessages(false);
    // Focus the textarea after selecting
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle AI message improvement
  const handleImproveMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Please type a message first');
      return;
    }

    setIsImprovingMessage(true);
    try {
      const result = await improveMessageWithAI(messageText);
      if (result.success) {
        // Create a synthetic event to update the message
        const syntheticEvent = { target: { value: result.improvedMessage } };
        onMessageChange(syntheticEvent);
        toast.success('Message improved!');
      } else {
        toast.error(result.error || 'Failed to improve message');
      }
    } catch (error) {
      console.error('Error improving message:', error);
      toast.error('Failed to improve message');
    } finally {
      setIsImprovingMessage(false);
      // Focus the textarea after improving
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (preloadedRef.current && !preloadedRef.current.contains(event.target)) {
        setShowPreloadedMessages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea and reset height when message is cleared
  useEffect(() => {
    if (textareaRef.current) {
      if (messageText === '') {
        textareaRef.current.style.height = '40px';
      } else {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
      }
    }
  }, [messageText]);

  return (
    <div className="p-2 sm:p-3 md:p-4 border-t border-gray-300">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {/* Edit Mode Banner */}
        {editingMessage && (
          <div className="bg-blue-100 border border-blue-300 rounded-md p-1.5 sm:p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FiEdit2 className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm text-blue-800 font-medium">
                Editing message
              </span>
            </div>
            <button
              onClick={onCancelEdit}
              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {/* File Preview Area */}
        {!editingMessage && uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 bg-gray-100 p-1.5 sm:p-2 rounded-md">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative">
                {isImage(file) ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 flex items-center justify-center rounded">
                    <FiPaperclip size={18} className="sm:w-6 sm:h-6" />
                  </div>
                )}
                <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center hover:bg-red-600 text-xs sm:text-sm"
                  aria-label={`Remove file ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          {!editingMessage && (
            <>
              <label htmlFor="fileInput" className="cursor-pointer flex-shrink-0">
                <FiPaperclip
                  size={18}
                  className="text-gray-500 hover:text-gray-700 sm:w-5 sm:h-5"
                />
              </label>
              <input
                id="fileInput"
                type="file"
                multiple
                onChange={onFileSelect}
                className="hidden"
                ref={fileInputRef}
              />
            </>
          )}
          <textarea
            ref={textareaRef}
            className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
            placeholder="Type a message... (Shift+Enter for new line)"
            value={messageText}
            onChange={onMessageChange}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              minHeight: '36px',
              maxHeight: '120px'
            }}
          />
          <button
            onClick={onSend}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
              editingMessage
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={disabled}
            aria-label={editingMessage ? 'Update message' : 'Send message'}
          >
            {isSending ? (
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : editingMessage ? (
              <span className="text-xs sm:text-sm font-medium">Update</span>
            ) : (
              <FiSend size={18} className="sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Preloaded Messages Button */}
          {!editingMessage && (
            <div className="relative" ref={preloadedRef}>
              <button
                onClick={handleTogglePreloaded}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
                  showPreloadedMessages
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Quick replies"
                title="Quick replies"
              >
                <FiMessageSquare size={18} className="sm:w-5 sm:h-5" />
              </button>

              {/* Preloaded Messages Dropdown */}
              {showPreloadedMessages && (
                <div className="absolute bottom-full right-0 mb-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700">Quick Replies</h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {isLoadingPreloaded ? (
                      <div className="p-3 sm:p-4 text-center">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : preloadedMessages.length === 0 ? (
                      <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                        No quick replies available
                      </div>
                    ) : (
                      <div className="py-1">
                        {preloadedMessages.map((msg) => (
                          <button
                            key={msg._id}
                            onClick={() => handleSelectPreloaded(msg.message)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <p className="line-clamp-2">{msg.message}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Improve Message Button */}
          {!editingMessage && (
            <button
              onClick={handleImproveMessage}
              disabled={isImprovingMessage || !messageText.trim()}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
                isImprovingMessage
                  ? 'bg-purple-100 text-purple-700'
                  : messageText.trim()
                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Improve with AI"
              title="Improve with AI"
            >
              {isImprovingMessage ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <FiZap size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ChatInput.propTypes = {
  messageText: PropTypes.string.isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  onSendPreloaded: PropTypes.func,
  onFileSelect: PropTypes.func.isRequired,
  uploadedFiles: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  isImage: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  editingMessage: PropTypes.object,
  onCancelEdit: PropTypes.func,
  isSending: PropTypes.bool
};

export default ChatInput;
