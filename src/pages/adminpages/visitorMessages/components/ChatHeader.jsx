import { getInitials } from "../utils/helpers";

export default function ChatHeader({ visitor, onBack }) {
  return (
    <div className="h-[72px] px-5 flex items-center justify-between border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(visitor.name)}
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{visitor.name}</h2>
          <p className="text-xs text-slate-500">{visitor.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {visitor.phoneNumber && (
          <span className="hidden sm:block text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full mr-2">
            {visitor.phoneNumber}
          </span>
        )}
        {visitor.orderNumber && (
          <span className="hidden sm:block text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full font-medium">
            Order: {visitor.orderNumber}
          </span>
        )}
      </div>
    </div>
  );
}
