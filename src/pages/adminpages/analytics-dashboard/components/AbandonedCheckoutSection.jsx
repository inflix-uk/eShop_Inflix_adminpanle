import PropTypes from "prop-types";

const METRIC_TONES = {
  blue: "border-blue-100 bg-blue-50 text-blue-900",
  green: "border-emerald-100 bg-emerald-50 text-emerald-900",
  red: "border-red-100 bg-red-50 text-red-700",
  amber: "border-amber-100 bg-amber-50 text-amber-800",
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

export default function AbandonedCheckoutSection({ data }) {
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
        <MetricTile label="Checkout started" value={data.paymentIntentsInRange} tone="blue" />
        <MetricTile label="Completed" value={data.paymentIntentsCompleted} tone="green" />
        <MetricTile label="Failed payment" value={data.paymentIntentsFailed} tone="red" />
        <MetricTile label="Abandoned" value={data.paymentIntentsAbandoned} tone="amber" />
        <MetricTile label="Completion rate" value={data.completionRate} tone="slate" />
        <MetricTile label="Abandonment rate" value={data.abandonmentRate} tone="slate" />
      </div>
    </div>
  );
}

AbandonedCheckoutSection.propTypes = {
  data: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    emptyMessage: PropTypes.string.isRequired,
    note: PropTypes.string,
    paymentIntentsInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    paymentIntentsCompleted: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    paymentIntentsFailed: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    paymentIntentsAbandoned: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    abandonmentRate: PropTypes.string.isRequired,
    completionRate: PropTypes.string.isRequired,
  }).isRequired,
};
