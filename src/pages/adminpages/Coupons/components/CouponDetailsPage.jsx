import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../../../../context/Auth";

const money = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `£${amount.toFixed(2)}`;
};

const statusClass = (status) => {
  if (status === "Delivered") return "bg-green-100 text-green-800";
  if (status === "Approved" || status === "Shipped") return "bg-blue-100 text-blue-800";
  if (status === "Cancelled" || status === "Refunded") return "bg-red-100 text-red-800";
  if (status === "Pending") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-700";
};

const CouponDetailsPage = ({ coupon, onBack }) => {
  const auth = useAuth();
  const [liveCoupon, setLiveCoupon] = useState(coupon);
  const [usageDetails, setUsageDetails] = useState([]);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLiveCoupon(coupon);
  }, [coupon]);

  useEffect(() => {
    if (!coupon?._id) {
      setLoading(false);
      setUsageDetails([]);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    axios
      .get(`${auth.ip}get/coupon/${coupon._id}`)
      .then((response) => {
        if (cancelled) return;
        if (response.data?.status === 201) {
          setLiveCoupon(response.data.coupon || coupon);
          setUsageDetails(Array.isArray(response.data.usage) ? response.data.usage : []);
          setTotalDiscountAmount(Number(response.data.totalDiscount) || 0);
        } else {
          setError(response.data?.message || "Could not load coupon usage");
          setUsageDetails([]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load coupon usage");
        setUsageDetails([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.ip, coupon]);

  const shown = liveCoupon || coupon;
  const usageLimit = Number(shown?.usage);
  const hasLimit = Number.isFinite(usageLimit) && usageLimit > 0;
  const timesUsed = loading ? Number(shown?.used) || 0 : usageDetails.length;
  const usedRatio = hasLimit ? Math.min(100, Math.round((timesUsed / usageLimit) * 100)) : 0;

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Coupon Details: {shown?.code || "-"}
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Paid orders that redeemed this coupon
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Coupon Value</h3>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {shown?.discount_type === "percentage"
              ? `${shown?.discount}%`
              : money(shown?.discount ?? 0)}
          </p>
          {shown?.discount_type === "percentage" && (
            <p className="text-xs text-gray-500">Up to {money(shown?.upto ?? 0)}</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Usage Limit</h3>
          <p className="mt-1 text-xl font-bold text-gray-800">
            {hasLimit ? usageLimit : "Unlimited"}
          </p>
          <p className="text-xs text-gray-500">
            {shown?.allowMultiple ? "Same customer can reuse" : "Once per customer"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Times Used</h3>
          <p className="mt-1 text-xl font-bold text-blue-600">{timesUsed}</p>
          {hasLimit && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${usedRatio > 70 ? "bg-orange-500" : "bg-blue-600"}`}
                style={{ width: `${usedRatio}%` }}
              />
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Discount Given</h3>
          <p className="mt-1 text-xl font-bold text-red-600">
            {loading ? "—" : money(totalDiscountAmount)}
          </p>
          <p className="text-xs text-gray-500">
            Min order {Number(shown?.minOrderValue) > 0 ? money(shown.minOrderValue) : "none"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Coupon Code</h4>
          <p className="mt-1 font-semibold">{shown?.code}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Type</h4>
          <p className="mt-1 font-semibold capitalize">{shown?.discount_type || "-"}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Expiry</h4>
          <p className="mt-1 font-semibold">
            {shown?.expiryDate ? new Date(shown.expiryDate).toLocaleDateString() : "No expiry"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Usage History</h3>
          <p className="text-sm text-gray-500">
            Paid orders only. Unpaid attempts are not listed.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={7}>
                    Loading usage…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-red-600" colSpan={7}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && usageDetails.map((detail) => (
                <tr key={detail.id || detail.orderNumber} className="hover:bg-gray-50 transition-colors">
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
                    {detail.date ? new Date(detail.date).toLocaleString() : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {money(detail.orderAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {money(detail.discount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(detail.status)}`}>
                      {detail.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && !error && usageDetails.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={7}>
                    No paid orders have used this coupon yet.
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
    minOrderValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    expiryDate: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default React.memo(CouponDetailsPage);
