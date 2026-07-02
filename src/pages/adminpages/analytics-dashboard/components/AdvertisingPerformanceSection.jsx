import PropTypes from "prop-types";

const METRIC_TONES = {
  blue: "border-blue-100 bg-blue-50 text-blue-900",
  green: "border-emerald-100 bg-emerald-50 text-emerald-900",
  slate: "border-slate-200 bg-slate-50 text-slate-800",
};

function MetricTile({ label, value, tone = "slate" }) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${METRIC_TONES[tone] || METRIC_TONES.slate}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

MetricTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.string,
};

export default function AdvertisingPerformanceSection({ data }) {
  if (data.unavailable) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
        <p className="text-sm text-gray-600">{data.emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">{data.note}</p>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricTile label="Google Ads spend" value={data.totalSpend} tone="blue" />
        <MetricTile label="Attributed revenue" value={data.attributedRevenue} tone="green" />
        <MetricTile label="Blended ROAS" value={data.blendedRoas} tone="slate" />
        <MetricTile label="Blended ROI" value={data.blendedRoi} tone="slate" />
        <MetricTile label="Blended CAC" value={data.blendedCac} tone="slate" />
        <MetricTile label="Campaigns with spend" value={data.campaignCount} tone="slate" />
      </div>
    </div>
  );
}

AdvertisingPerformanceSection.propTypes = {
  data: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    emptyMessage: PropTypes.string.isRequired,
    note: PropTypes.string,
    totalSpend: PropTypes.string.isRequired,
    attributedRevenue: PropTypes.string.isRequired,
    blendedRoas: PropTypes.string.isRequired,
    blendedRoi: PropTypes.string.isRequired,
    blendedCac: PropTypes.string.isRequired,
    campaignCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};
