import PropTypes from "prop-types";
import PerformanceTable from "./PerformanceTable";

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

const SOURCE_COLUMNS = [
  { key: "name", label: "Source" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
];

const CAMPAIGN_COLUMNS = [
  { key: "name", label: "Campaign" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
];

export default function EmailAnalyticsSection({ data }) {
  if (data.unavailable) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
        <p className="text-sm text-gray-600">{data.emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">{data.note}</p>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Email orders" value={data.orders} tone="blue" />
        <MetricTile label="Email revenue" value={data.revenue} tone="green" />
        <MetricTile label="Email AOV" value={data.aov} tone="slate" />
        <MetricTile label="New subscribers" value={data.newSubscribersInRange} tone="slate" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By source</h3>
          <PerformanceTable columns={SOURCE_COLUMNS} rows={data.bySource} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By campaign</h3>
          <PerformanceTable columns={CAMPAIGN_COLUMNS} rows={data.byCampaign} />
        </div>
      </div>
    </div>
  );
}

EmailAnalyticsSection.propTypes = {
  data: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    emptyMessage: PropTypes.string.isRequired,
    note: PropTypes.string,
    orders: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    revenue: PropTypes.string.isRequired,
    aov: PropTypes.string.isRequired,
    newSubscribersInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    bySource: PropTypes.array.isRequired,
    byCampaign: PropTypes.array.isRequired,
  }).isRequired,
};
