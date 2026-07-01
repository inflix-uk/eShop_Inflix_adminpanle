/**
 * Shared skeleton loaders for admin list pages.
 *
 * Dependency-free (Tailwind only). Use while the primary list/grid data is
 * loading instead of a blank screen or a bare spinner.
 *
 *   {isLoading ? <TableSkeleton rows={8} columns={6} /> : <RealTable ... />}
 *   {isLoading ? <CardGridSkeleton count={12} /> : <RealGrid ... />}
 */

/** Generic table skeleton — configurable row/column count. */
export function TableSkeleton({ rows = 8, columns = 6, showHeader = true }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white" aria-hidden="true">
      <div className="animate-pulse">
        {showHeader && (
          <div className="flex gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-3.5 flex-1 rounded bg-gray-200" />
            ))}
          </div>
        )}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 border-b border-gray-100 px-4 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={`h-3 rounded bg-gray-100 ${c === 0 ? "flex-[1.5]" : "flex-1"}`}
                style={{ width: c === columns - 1 ? "60%" : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card/grid skeleton — for product grids, media libraries, card layouts. */
export function CardGridSkeleton({ count = 12, columns = 4 }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="aspect-square w-full bg-gray-200" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Compact list skeleton — for simple vertical lists (categories, roles, etc.). */
export function ListSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-40 rounded bg-gray-200" />
              <div className="h-2.5 w-24 rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-8 w-20 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

/** Stat-card row skeleton — for the metric cards above lists. */
export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 h-3 w-24 rounded bg-gray-100" />
          <div className="h-6 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
