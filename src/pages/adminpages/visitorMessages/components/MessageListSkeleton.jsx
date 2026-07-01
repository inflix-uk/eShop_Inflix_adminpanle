/**
 * Skeleton placeholder for the chat panel shown while a conversation's
 * messages load. Alternates left (visitor) and right (admin) bubbles.
 */
export default function MessageListSkeleton({ count = 6 }) {
  return (
    <div className="max-w-2xl mx-auto space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => {
        const isAdmin = idx % 2 === 1;
        // Vary bubble widths so it reads like real conversation
        const widths = ["w-40", "w-56", "w-32", "w-64", "w-48", "w-36"];
        const width = widths[idx % widths.length];
        return (
          <div
            key={idx}
            className={`flex items-end gap-2 animate-pulse ${
              isAdmin ? "justify-end" : "justify-start"
            }`}
          >
            {!isAdmin && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
            )}
            <div
              className={`h-12 ${width} rounded-2xl ${
                isAdmin
                  ? "bg-blue-100 rounded-br-sm"
                  : "bg-slate-200 rounded-bl-sm"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
