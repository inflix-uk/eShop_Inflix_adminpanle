import PropTypes from 'prop-types';

/**
 * Placeholder strip for live Google Ads metrics.
 * Wire to Google Ads API later; keep layout parity with the porting guide.
 */
export default function AdSpendManagementPanel({ from, to }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Google Ads Performance</h3>
          <p className="mt-0.5 text-xs text-gray-600">
            Live API metrics for {from} → {to}. Connect Google Ads API to populate this strip.
          </p>
        </div>
        <span className="inline-flex items-center rounded-md border border-orange-200 bg-white px-2.5 py-1 text-xs font-medium text-orange-800">
          Not connected
        </span>
      </div>
    </div>
  );
}

AdSpendManagementPanel.propTypes = {
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};
