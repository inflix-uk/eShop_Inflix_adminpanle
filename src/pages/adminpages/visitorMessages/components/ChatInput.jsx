import { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiZap, FiPaperclip, FiX, FiImage, FiFile } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  getActivePreloadedMessages,
  improveMessageWithAI,
} from "../../messages/service";

export default function ChatInput({ value, onChange, onSend, isSending, uploadedFiles = [], onFilesChange }) {
  const [showPreloadedMessages, setShowPreloadedMessages] = useState(false);
  const [preloadedMessages, setPreloadedMessages] = useState([]);
  const [isLoadingPreloaded, setIsLoadingPreloaded] = useState(false);
  const [isImprovingMessage, setIsImprovingMessage] = useState(false);
  const preloadedRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesChange([...uploadedFiles, ...files]);
    }
    e.target.value = ""; // Reset input
  };

  // Remove file from list
  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  // Check if file is an image
  const isImage = (file) => file.type.startsWith("image/");

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
        console.error("Error fetching preloaded messages:", error);
      } finally {
        setIsLoadingPreloaded(false);
      }
    }
    setShowPreloadedMessages(!showPreloadedMessages);
  };

  // Handle selecting a preloaded message
  const handleSelectPreloaded = (message) => {
    onChange(message);
    setShowPreloadedMessages(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle AI message improvement
  const handleImproveMessage = async () => {
    if (!value.trim()) {
      toast.error("Please type a message first");
      return;
    }

    setIsImprovingMessage(true);
    try {
      const result = await improveMessageWithAI(value);
      if (result.success) {
        onChange(result.improvedMessage);
        toast.success("Message improved!");
      } else {
        toast.error(result.error || "Failed to improve message");
      }
    } catch (error) {
      console.error("Error improving message:", error);
      toast.error("Failed to improve message");
    } finally {
      setIsImprovingMessage(false);
      if (inputRef.current) {
        inputRef.current.focus();
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSend = value.trim() || uploadedFiles.length > 0;

  return (
    <div className="p-4 border-t border-slate-200 bg-white">
      {/* File Preview Area */}
      {uploadedFiles.length > 0 && (
        <div className="max-w-2xl mx-auto mb-3 flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="relative group bg-slate-100 rounded-lg p-2 flex items-center gap-2"
            >
              {isImage(file) ? (
                <div className="w-12 h-12 rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center">
                  <FiFile className="w-5 h-5 text-slate-500" />
                </div>
              )}
              <div className="max-w-[120px]">
                <p className="text-xs text-slate-700 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto flex gap-3 items-center">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex-shrink-0"
          aria-label="Attach file"
          title="Attach file"
        >
          <FiPaperclip className="w-5 h-5" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-5 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={!canSend || isSending}
          className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all flex-shrink-0"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>

        {/* Quick Replies Button */}
        <div className="relative" ref={preloadedRef}>
          <button
            onClick={handleTogglePreloaded}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              showPreloadedMessages
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-label="Quick replies"
            title="Quick replies"
          >
            <FiMessageSquare className="w-5 h-5" />
          </button>

          {/* Preloaded Messages Dropdown */}
          {showPreloadedMessages && (
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h4 className="text-sm font-medium text-slate-700">
                  Quick Replies
                </h4>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {isLoadingPreloaded ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : preloadedMessages.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No quick replies available
                  </div>
                ) : (
                  <div className="py-1">
                    {preloadedMessages.map((msg) => (
                      <button
                        key={msg._id}
                        onClick={() => handleSelectPreloaded(msg.message)}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-100 last:border-b-0"
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

        {/* AI Improve Button */}
        <button
          onClick={handleImproveMessage}
          disabled={isImprovingMessage || !value.trim()}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
            isImprovingMessage
              ? "bg-purple-100 text-purple-700"
              : value.trim()
              ? "bg-purple-50 text-purple-600 hover:bg-purple-100"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          aria-label="Improve with AI"
          title="Improve with AI"
        >
          {isImprovingMessage ? (
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiZap className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
