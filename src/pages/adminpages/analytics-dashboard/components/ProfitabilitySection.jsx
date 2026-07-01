import PropTypes from "prop-types";

const METRIC_TONES = {
  blue: "border-blue-100 bg-blue-50 text-blue-900",
  green: "border-emerald-100 bg-emerald-50 text-emerald-900",
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

export default function ProfitabilitySection({ data }) {
  if (data.unavailable) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
        <p className="text-sm text-gray-600">{data.emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.partial ? (
        <p className="text-sm text-amber-800 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2">
          {data.partialMessage}
        </p>
      ) : null}

      <p className="text-xs text-gray-500">{data.note}</p>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricTile label="Gross profit" value={data.grossProfit} tone="green" />
        <MetricTile label="Gross margin" value={data.grossMarginPercent} tone="blue" />
        <MetricTile label="Revenue (costed lines)" value={data.revenueWithCost} tone="slate" />
        <MetricTile label="COGS" value={data.cogs} tone="amber" />
        <MetricTile label="Cost coverage" value={data.costCoveragePercent} tone="slate" />
        <MetricTile label="Lines with cost" value={data.lineItemsWithCost} tone="slate" />
      </div>

      {data.lineItemsMissingCost !== "0" && (
        <p className="text-xs text-amber-700">
          {data.lineItemsMissingCost} of {data.lineItemsInRange} revenue line(s) missing variant Cost
          — excluded from margin until Cost is set in Product Central.
        </p>
      )}

      <p className="text-xs text-gray-400">{data.roasNote}</p>
    </div>
  );
}

ProfitabilitySection.propTypes = {
  data: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    partial: PropTypes.bool,
    emptyMessage: PropTypes.string.isRequired,
    partialMessage: PropTypes.string,
    note: PropTypes.string,
    roasNote: PropTypes.string,
    grossProfit: PropTypes.string.isRequired,
    grossMarginPercent: PropTypes.string.isRequired,
    revenueWithCost: PropTypes.string.isRequired,
    cogs: PropTypes.string.isRequired,
    costCoveragePercent: PropTypes.string.isRequired,
    lineItemsWithCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lineItemsMissingCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lineItemsInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};
