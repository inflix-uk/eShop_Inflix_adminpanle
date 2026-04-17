export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Welcome to Live Chat
        </h3>
        <p className="text-slate-500 max-w-sm">
          Select a conversation from the left to start chatting with your visitors
        </p>
      </div>
    </div>
  );
}
