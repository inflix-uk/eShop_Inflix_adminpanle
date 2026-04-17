import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import EmptyState from "./EmptyState";

export default function ChatPanel({
  selectedVisitor,
  messages,
  isLoadingMessages,
  replyText,
  setReplyText,
  isSending,
  onSendReply,
  onBack,
  visitorTyping,
  uploadedFiles,
  onFilesChange,
}) {
  return (
    <div
      className={`${
        selectedVisitor ? "flex" : "hidden md:flex"
      } flex-1 flex-col`}
    >
      {selectedVisitor ? (
        <>
          <ChatHeader visitor={selectedVisitor} onBack={onBack} />
          <MessageList
            messages={messages}
            isLoading={isLoadingMessages}
            visitorTyping={visitorTyping}
            visitorName={selectedVisitor?.name}
          />
          <ChatInput
            value={replyText}
            onChange={setReplyText}
            onSend={onSendReply}
            isSending={isSending}
            uploadedFiles={uploadedFiles}
            onFilesChange={onFilesChange}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
