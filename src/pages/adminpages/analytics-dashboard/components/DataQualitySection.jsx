import PropTypes from "prop-types";

export default function DataQualitySection({ data }) {
  const fields = [
    { label: "Selected range", value: data.selectedRange },
    { label: "Channel filter", value: data.channelFilter },
    { label: "Tracking started", value: data.trackingStarted },
    { label: "Visitor sessions in range", value: data.visitorSessions },
    { label: "All orders in range", value: data.allOrdersInRange },
    { label: "Revenue orders in range", value: data.revenueOrdersInRange },
    { label: "Non-revenue orders", value: data.nonRevenueOrdersInRange, warn: data.nonRevenueWarn },
    { label: "Failed orders", value: data.failedOrdersInRange, warn: data.failedOrdersWarn },
    { label: "Orders with marketingAttribution", value: data.ordersWithMarketingAttribution },
    { label: "Orders without marketingAttribution", value: data.ordersWithoutMarketingAttribution },
    { label: "Orders with UTM source", value: data.ordersWithUtmSource },
    { label: "Orders with gclid", value: data.ordersWithGclid },
    { label: "Orders with fbclid", value: data.ordersWithFbclid },
    { label: "Orders with referrer", value: data.ordersWithReferrer },
    {
      label: "Range includes pre-tracking period",
      value: data.rangeIncludesPreTrackingPeriod,
      warn: data.preTrackingWarn,
    },
    { label: "Funnel: page views", value: data.funnelPageViews },
    { label: "Funnel: add to cart", value: data.funnelAddToCart },
    { label: "Funnel: begin checkout", value: data.funnelBeginCheckout },
    { label: "Funnel: purchase events", value: data.funnelPurchase },
  ];

  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Data quality</h2>
        <p className="mt-1 text-xs text-gray-500">{data.revenueMetricsNote}</p>
      </div>
      <div className="p-5">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3"
            >
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                {field.label}
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  field.warn ? "text-amber-700" : "text-gray-900"
                }`}
              >
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

DataQualitySection.propTypes = {
  data: PropTypes.shape({
    selectedRange: PropTypes.string.isRequired,
    channelFilter: PropTypes.string.isRequired,
    trackingStarted: PropTypes.string.isRequired,
    visitorSessions: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    allOrdersInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    revenueOrdersInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nonRevenueOrdersInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    failedOrdersInRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nonRevenueWarn: PropTypes.bool,
    failedOrdersWarn: PropTypes.bool,
    funnelPageViews: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    funnelAddToCart: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    funnelBeginCheckout: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    funnelPurchase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ordersWithMarketingAttribution: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    ordersWithoutMarketingAttribution: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    ordersWithUtmSource: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ordersWithGclid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ordersWithFbclid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ordersWithReferrer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rangeIncludesPreTrackingPeriod: PropTypes.string.isRequired,
    preTrackingWarn: PropTypes.bool,
    revenueMetricsNote: PropTypes.string.isRequired,
  }).isRequired,
};
