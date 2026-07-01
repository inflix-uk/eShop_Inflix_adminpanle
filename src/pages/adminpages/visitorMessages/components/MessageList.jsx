import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageListSkeleton from "./MessageListSkeleton";

export default function MessageList({ messages, isLoading, visitorTyping, visitorName }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // Scroll to bottom - instant on initial load, smooth for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const isInitialLoad = prevMessagesLengthRef.current === 0;
      const behavior = isInitialLoad ? "instant" : "smooth";

      messagesEndRef.current?.scrollIntoView({ behavior });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]);

  // Scroll when typing indicator appears
  useEffect(() => {
    if (visitorTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [visitorTyping]);

  // Reset on unmount or when messages clear
  useEffect(() => {
    return () => {
      prevMessagesLengthRef.current = 0;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
      {isLoading ? (
        <MessageListSkeleton />
      ) : (
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} visitorName={visitorName} />
          ))}

          {/* Visitor Typing Indicator with Live Text */}
          {visitorTyping && (
            <div className="flex items-end gap-2 animate-fadeIn">
              {/* Visitor Avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {visitorTyping.visitorName
                  ? visitorTyping.visitorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "V"}
              </div>
              <div className="bg-white text-slate-800 shadow-sm border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                {/* Show what visitor is typing */}
                {visitorTyping.text ? (
                  <>
                    <p className="text-sm text-slate-600 italic">
                      {visitorTyping.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {visitorTyping.visitorName || "Visitor"} is typing
                      </span>
                      <div className="flex gap-0.5">
                        <span
                          className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {visitorTyping.visitorName || "Visitor"} is typing
                    </span>
                    <div className="flex gap-1">
                      <span
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
