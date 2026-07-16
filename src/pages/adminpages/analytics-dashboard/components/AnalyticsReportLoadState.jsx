import PropTypes from 'prop-types';

export default function AnalyticsReportLoadState({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500 shadow-sm">
        Loading report…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-red-800">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  return children;
}

AnalyticsReportLoadState.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  children: PropTypes.node,
};
