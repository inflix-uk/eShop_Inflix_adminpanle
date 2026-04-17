import PropTypes from "prop-types";
import { Clock, Coffee } from "lucide-react";
import VisitorItem from "./VisitorItem";

export default function ConversationList({
  visitors,
  selectedVisitor,
  searchTerm,
  setSearchTerm,
  unreadCount,
  isLoading,
  onSelectVisitor,
  onDeleteVisitor,
  onTransferVisitor,
  visitorTyping = {},
  onOpenAutoReply,
  autoReplyEnabled,
  onOpenAway,
  isAway,
}) {
  return (
    <div
      className={`${
        selectedVisitor ? "hidden md:flex" : "flex"
      } w-full md:w-96 flex-col border-r border-slate-200`}
    >
      {/* Header */}
      <div className="p-5 bg-blue-600">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Live Chat</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur text-white text-xs font-semibold rounded-full">
                {unreadCount} new
              </span>
            )}
            {/* Away Button */}
            <button
              onClick={onOpenAway}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAway
                  ? "bg-amber-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              title="Away Status"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Away</span>
              {isAway && (
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              )}
            </button>
            {/* Auto-Reply Button */}
            <button
              onClick={onOpenAutoReply}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                autoReplyEnabled
                  ? "bg-white text-blue-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              title="Auto-Reply Settings"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Reply</span>
              {autoReplyEnabled && (
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No conversations</p>
            <p className="text-slate-400 text-sm mt-1">Messages will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visitors.map((visitor) => (
              <VisitorItem
                key={visitor._id}
                visitor={visitor}
                isSelected={selectedVisitor?._id === visitor._id}
                onClick={() => onSelectVisitor(visitor)}
                onDelete={onDeleteVisitor}
                onTransfer={onTransferVisitor}
                isTyping={!!visitorTyping[visitor._id]}
                typingText={visitorTyping[visitor._id]?.text}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ConversationList.propTypes = {
  visitors: PropTypes.array.isRequired,
  selectedVisitor: PropTypes.object,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
  isLoading: PropTypes.bool,
  onSelectVisitor: PropTypes.func.isRequired,
  onDeleteVisitor: PropTypes.func.isRequired,
  onTransferVisitor: PropTypes.func.isRequired,
  visitorTyping: PropTypes.object,
  onOpenAutoReply: PropTypes.func.isRequired,
  autoReplyEnabled: PropTypes.bool,
  onOpenAway: PropTypes.func.isRequired,
  isAway: PropTypes.bool,
};

ConversationList.defaultProps = {
  selectedVisitor: null,
  unreadCount: 0,
  isLoading: false,
  visitorTyping: {},
  autoReplyEnabled: false,
  isAway: false,
};
