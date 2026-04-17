import React from "react";
import PropTypes from "prop-types";

const CouponDetailsPage = ({ coupon, onBack }) => {
  // Dummy data for coupon usage details (replace with API data when ready)
  const usageDetails = [
    { id: 1, orderNumber: "ORD-2025-0842", user: "John Doe", email: "john@example.com", date: "2025-08-01", amount: "£45.99", discount: "£10.00", status: "Completed" },
    { id: 2, orderNumber: "ORD-2025-0851", user: "Jane Smith", email: "jane@example.com", date: "2025-08-03", amount: "£32.50", discount: "£10.00", status: "Completed" },
    { id: 3, orderNumber: "ORD-2025-0867", user: "Mike Johnson", email: "mike@example.com", date: "2025-08-05", amount: "£78.25", discount: "£10.00", status: "Processing" },
    { id: 4, orderNumber: "ORD-2025-0892", user: "Sarah Williams", email: "sarah@example.com", date: "2025-08-07", amount: "£55.75", discount: "£10.00", status: "Completed" },
    { id: 5, orderNumber: "ORD-2025-0913", user: "Alex Brown", email: "alex@example.com", date: "2025-08-10", amount: "£29.99", discount: "£10.00", status: "Pending" },
  ];

  const totalDiscountAmount = usageDetails.reduce(
    (sum, d) => sum + parseFloat(String(d.discount).replace("£", "")),
    0
  );

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Coupon Details: {coupon?.code || "-"}
            </h1>
            <p className="text-sm text-white/80 mt-1">
              View performance, usage history and limits
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Coupons
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Coupon Value</h3>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {coupon?.discount_type === "percentage"
              ? `${coupon?.discount}%`
              : `£${coupon?.discount ?? 0}`}
          </p>
          {coupon?.discount_type === "percentage" && (
            <p className="text-xs text-gray-500">Up to £{coupon?.upto ?? 0}</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Usage Limit</h3>
          <p className="mt-1 text-xl font-bold text-gray-800">
            {coupon?.usage ?? 0}
          </p>
          <p className="text-xs text-gray-500">Maximum redemptions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Times Used</h3>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {coupon?.used ?? 0}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                (Number(coupon?.used ?? 0) / Number(coupon?.usage || 1)) > 0.7
                  ? "bg-orange-500"
                  : "bg-blue-600"
              }`}
              style={{
                width: `${
                  Math.min(
                    100,
                    Math.round(
                      (Number(coupon?.used ?? 0) / Number(coupon?.usage || 1)) *
                        100
                    )
                  ) || 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Discount Given</h3>
          <p className="mt-1 text-xl font-bold text-red-600">
            £{totalDiscountAmount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">Across all orders</p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Coupon Code</h4>
          <p className="mt-1 font-semibold">{coupon?.code}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Type</h4>
          <p className="mt-1 font-semibold capitalize">
            {coupon?.discount_type || "-"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Expiry</h4>
          <p className="mt-1 font-semibold">
            {coupon?.expiryDate
              ? new Date(coupon.expiryDate).toLocaleDateString()
              : "No expiry"}
          </p>
        </div>
      </div>

      {/* Usage history */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Usage History</h3>
          <p className="text-sm text-gray-500">Detailed record of coupon redemptions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageDetails.map((detail) => (
                <tr key={detail.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {detail.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {detail.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {detail.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(detail.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {detail.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {detail.discount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${
                        detail.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : detail.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {detail.status}
                    </span>
                  </td>
                </tr>
              ))}
              {usageDetails.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={7}>
                    No usage yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

CouponDetailsPage.propTypes = {
  coupon: PropTypes.shape({
    _id: PropTypes.string,
    code: PropTypes.string,
    discount_type: PropTypes.string,
    discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    upto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    usage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    used: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    allowMultiple: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    expiryDate: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default React.memo(CouponDetailsPage);
