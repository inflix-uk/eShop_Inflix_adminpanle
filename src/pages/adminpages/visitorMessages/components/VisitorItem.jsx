import { getInitials, formatTime } from "../utils/helpers";

export default function VisitorItem({
  visitor,
  isSelected,
  onClick,
  onDelete,
  onTransfer,
  isTyping = false,
  typingText = "",
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(visitor._id);
  };

  const handleTransfer = (e) => {
    e.stopPropagation();
    onTransfer(visitor);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all hover:bg-slate-50 group ${
        isSelected ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
      } ${isTyping ? "bg-blue-50/50" : ""}`}
    >
      <div className="flex gap-3">
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
              isTyping
                ? "bg-blue-500 animate-pulse"
                : !visitor.isRead
                ? "bg-blue-600"
                : "bg-slate-400"
            }`}
          >
            {getInitials(visitor.name)}
          </div>
          {/* Unread count badge */}
          {!isTyping && visitor.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">
                {visitor.unreadCount > 99 ? "99+" : visitor.unreadCount}
              </span>
            </span>
          )}
          {isTyping && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[8px] text-white">...</span>
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`font-semibold truncate ${
                !visitor.isRead ? "text-slate-900" : "text-slate-600"
              }`}
            >
              {visitor.name || "Anonymous"}
            </h3>
            <span className="text-xs text-slate-400 ml-2">
              {formatTime(visitor.lastMessageAt)}
            </span>
          </div>

          {/* Show typing text or last message */}
          {isTyping ? (
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-blue-600 truncate italic">
                {typingText || "typing..."}
              </p>
              <div className="flex gap-0.5">
                <span
                  className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 truncate">
              {visitor.lastMessage || "Started a chat"}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            {visitor.orderNumber && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                #{visitor.orderNumber}
              </span>
            )}
            <span className="text-xs text-slate-400">{visitor.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Transfer to Messages Icon */}
          <button
            onClick={handleTransfer}
            title="Transfer to Messages"
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
          {/* Delete Icon */}
          <button
            onClick={handleDelete}
            title="Delete Conversation"
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
