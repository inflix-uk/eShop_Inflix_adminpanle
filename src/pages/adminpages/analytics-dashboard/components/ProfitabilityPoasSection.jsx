import PropTypes from "prop-types";

const TILE_STYLES = {
  green: {
    wrap: "bg-emerald-50",
    label: "text-emerald-700",
    value: "text-emerald-900",
  },
  teal: {
    wrap: "bg-cyan-50",
    label: "text-cyan-700",
    value: "text-cyan-900",
  },
  purple: {
    wrap: "bg-purple-50",
    label: "text-purple-700",
    value: "text-purple-900",
  },
  indigo: {
    wrap: "bg-indigo-50",
    label: "text-indigo-700",
    value: "text-indigo-900",
  },
  rose: {
    wrap: "bg-rose-50",
    label: "text-rose-700",
    value: "text-rose-900",
  },
  orange: {
    wrap: "bg-orange-50",
    label: "text-orange-700",
    value: "text-orange-900",
  },
};

function MetricTile({ label, value, tone }) {
  const styles = TILE_STYLES[tone] || TILE_STYLES.green;

  return (
    <div className={`rounded-lg px-4 py-4 ${styles.wrap}`}>
      <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${styles.value}`}>{value}</p>
    </div>
  );
}

MetricTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.oneOf(["green", "teal", "purple", "indigo", "rose", "orange"]).isRequired,
};

export default function ProfitabilityPoasSection({ profitability, fraudAdjusted }) {
  const pf = profitability || {};
  const fa = fraudAdjusted || {};

  if (pf.unavailable) {
    return (
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Profitability &amp; POAS</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">{pf.emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Profitability &amp; POAS</h2>

      {pf.partial ? (
        <p className="text-sm text-amber-800 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2">
          {pf.partialMessage}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricTile label="Gross profit" value={pf.grossProfit} tone="green" />
        <MetricTile label="Margin %" value={pf.grossMarginPercent} tone="teal" />
        <MetricTile label="Fraud-adjusted ROAS" value={fa.fraudAdjustedRoas} tone="purple" />
        <MetricTile label="Fraud-adjusted POAS" value={fa.fraudAdjustedPoas} tone="indigo" />
        <MetricTile label="Excluded revenue" value={fa.excludedRevenue} tone="rose" />
        <MetricTile label="Excluded profit" value={fa.excludedProfit} tone="orange" />
      </div>
    </section>
  );
}

ProfitabilityPoasSection.propTypes = {
  profitability: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    partial: PropTypes.bool,
    emptyMessage: PropTypes.string.isRequired,
    partialMessage: PropTypes.string,
    grossProfit: PropTypes.string.isRequired,
    grossMarginPercent: PropTypes.string.isRequired,
  }).isRequired,
  fraudAdjusted: PropTypes.shape({
    fraudAdjustedRoas: PropTypes.string.isRequired,
    fraudAdjustedPoas: PropTypes.string.isRequired,
    excludedRevenue: PropTypes.string.isRequired,
    excludedProfit: PropTypes.string.isRequired,
  }).isRequired,
};
