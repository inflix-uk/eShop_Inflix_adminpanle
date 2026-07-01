/**
 * Full-page skeleton loader for admin tabs.
 *
 * Used as the <Suspense> fallback for lazy-loaded admin routes. Because every
 * admin page renders its own <Side> sidebar + <Top> bar internally (there is no
 * persistent layout shell), the plain "Loading..." fallback blanks the entire
 * screen — sidebar included — while the route's JS chunk downloads.
 *
 * This skeleton reproduces that same shell (fixed 72-wide sidebar rail, sticky
 * top bar, content area with stat cards + a table) so switching tabs shows a
 * stable, layout-matching placeholder instead of bare text.
 *
 * Layout classes intentionally mirror:
 *   - Side.jsx : "hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col"
 *   - page body: "lg:pl-72"
 *   - Top.jsx  : "sticky top-0 z-30 flex h-16 ... border-b border-gray-200 bg-white"
 */
import { TableSkeleton, StatCardsSkeleton } from "./Skeletons";

/** Faux sidebar rail — logo block + grouped nav-link placeholders. */
function SidebarSkeleton() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-hidden border-r border-gray-200 bg-white px-6 pb-4">
        {/* Logo area */}
        <div className="flex h-16 shrink-0 items-center">
          <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Nav sections / links */}
        <div className="flex flex-col gap-y-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, section) => (
            <div key={section} className="space-y-2">
              <div className="h-2.5 w-20 rounded bg-gray-100" />
              {Array.from({ length: 4 }).map((_, link) => (
                <div key={link} className="flex items-center gap-x-3 rounded-md p-2">
                  <div className="h-5 w-5 shrink-0 rounded bg-gray-200" />
                  <div
                    className="h-3 rounded bg-gray-100"
                    style={{ width: `${55 + ((link * 13 + section * 7) % 35)}%` }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Faux top bar — matches the sticky h-16 header. */
function TopBarSkeleton() {
  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="h-6 w-6 animate-pulse rounded bg-gray-200 lg:hidden" />
      <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div className="ml-auto flex items-center gap-x-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="hidden h-8 w-8 animate-pulse rounded-full bg-gray-200 sm:block" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300" />
      </div>
    </div>
  );
}

/**
 * Lightweight centered fallback for sidebar-less pages (login, forgot/reset
 * password, superadmin login). A full sidebar skeleton would be misleading
 * there, so show a simple centered card placeholder instead.
 */
export function AuthSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4"
    >
      <span className="sr-only">Loading…</span>
      <div className="w-full max-w-sm animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mx-auto h-10 w-32 rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-100" />
        <div className="h-10 w-full rounded bg-gray-100" />
        <div className="h-10 w-full rounded bg-gray-100" />
        <div className="h-10 w-full rounded bg-gray-300" />
      </div>
    </div>
  );
}

export default function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading page">
      <span className="sr-only">Loading…</span>

      <SidebarSkeleton />

      <div className="lg:pl-72">
        <TopBarSkeleton />
        <main className="py-5">
          <div className="space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Page heading */}
            <div className="animate-pulse space-y-2">
              <div className="h-7 w-56 rounded bg-gray-200" />
              <div className="h-3 w-80 max-w-full rounded bg-gray-100" />
            </div>

            {/* Metric cards */}
            <StatCardsSkeleton count={4} />

            {/* Primary content table */}
            <TableSkeleton rows={8} columns={6} />
          </div>
        </main>
      </div>
    </div>
  );
}
