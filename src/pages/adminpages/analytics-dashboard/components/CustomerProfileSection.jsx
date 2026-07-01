import PropTypes from "prop-types";
import DonutChart from "./DonutChart";

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

export default function CustomerProfileSection({ data }) {
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

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <MetricTile label="New customers" value={data.newCustomers} tone="blue" />
        <MetricTile label="Returning customers" value={data.returningCustomers} tone="green" />
        <MetricTile label="New customer share" value={data.newCustomerShare} tone="slate" />
        <MetricTile label="Returning share" value={data.returningCustomerShare} tone="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Orders by customer type</h3>
          <div className="grid gap-3 grid-cols-2">
            <MetricTile label="From new" value={data.ordersFromNewCustomers} tone="blue" />
            <MetricTile label="From returning" value={data.ordersFromReturningCustomers} tone="green" />
          </div>
          {data.ordersWithoutCustomerKey !== "0" && (
            <p className="mt-3 text-xs text-amber-700">
              {data.ordersWithoutCustomerKey} revenue order(s) in range have no customerKey and are
              excluded from this breakdown.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue by customer type</h3>
          <div className="grid gap-3 grid-cols-2 mb-4">
            <MetricTile label="New customer revenue" value={data.revenueFromNewCustomers} tone="blue" />
            <MetricTile
              label="Returning customer revenue"
              value={data.revenueFromReturningCustomers}
              tone="green"
            />
          </div>
          <DonutChart segments={data.revenueByCustomerType} centerLabel="Revenue" />
        </div>
      </div>
    </div>
  );
}

CustomerProfileSection.propTypes = {
  data: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    emptyMessage: PropTypes.string.isRequired,
    note: PropTypes.string,
    newCustomers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    returningCustomers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    newCustomerShare: PropTypes.string.isRequired,
    returningCustomerShare: PropTypes.string.isRequired,
    ordersFromNewCustomers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ordersFromReturningCustomers: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    revenueFromNewCustomers: PropTypes.string.isRequired,
    revenueFromReturningCustomers: PropTypes.string.isRequired,
    ordersWithoutCustomerKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    revenueByCustomerType: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};
