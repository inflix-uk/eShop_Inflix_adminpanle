/**
 * Skeleton placeholder for the conversation list shown while visitors load.
 * Mirrors the layout of <VisitorItem /> so the swap-in feels seamless.
 */
export default function ConversationListSkeleton({ count = 8 }) {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 animate-pulse">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {/* Name + time */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-3.5 bg-slate-200 rounded w-32" />
                <div className="h-3 bg-slate-100 rounded w-10 ml-2" />
              </div>
              {/* Last message preview */}
              <div className="h-3 bg-slate-100 rounded w-48 mb-2" />
              {/* Email / tag row */}
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
