import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

function RouteErrorFallback({ error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">
          This page could not be loaded
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Reload the page to try again. If it keeps happening, share a
          screenshot of this screen.
        </p>
        {/* The reason, so that a screenshot is enough to diagnose it */}
        {error?.message && (
          <p className="mt-4 break-words rounded-md bg-gray-50 px-3 py-2 text-left font-mono text-xs text-gray-500">
            {error.message}
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white"
          >
            Reload page
          </button>
          <Link
            to="/admin/dashboard"
            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

RouteErrorFallback.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
};

/**
 * The error screen around one route's page.
 *
 * <Routes> reuses the same boundary instance as the admin moves between
 * routes, so a page that failed once left every page after it showing the
 * error as well, until a full refresh. resetKeys clears it on navigation.
 */
export default function RouteErrorBoundary({ children }) {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[pathname]}>
      {children}
    </ErrorBoundary>
  );
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
