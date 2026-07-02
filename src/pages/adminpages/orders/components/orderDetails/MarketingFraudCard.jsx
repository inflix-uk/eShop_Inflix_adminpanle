import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { setOrderFraudFlag } from "../../../analytics-dashboard/service/analyticsOrderFraudService";

function formatAttribution(order) {
  const normalized = order?.marketingAttribution?.normalized || {};
  const parts = [
    normalized.source && `Source: ${normalized.source}`,
    normalized.medium && `Medium: ${normalized.medium}`,
    normalized.campaign && `Campaign: ${normalized.campaign}`,
    normalized.channel && `Channel: ${normalized.channel}`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "No marketing attribution";
}

export default function MarketingFraudCard({ orderId, order, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState(order?.marketingFraud?.reason || "");

  const flagged = order?.marketingFraud?.flagged === true;

  const handleToggle = async () => {
    if (!orderId) return;

    const nextFlagged = !flagged;
    if (nextFlagged && !reason.trim()) {
      toast.warn("Add a short reason before flagging this order.");
      return;
    }

    setSaving(true);
    try {
      const response = await setOrderFraudFlag(orderId, {
        flagged: nextFlagged,
        reason: nextFlagged ? reason.trim() : null,
      });

      if (response?.success) {
        toast.success(response.message || "Fraud flag updated");
        onUpdated?.(response.order);
      } else {
        toast.error(response?.message || "Failed to update fraud flag");
      }
    } catch {
      toast.error("Failed to update fraud flag");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Marketing & fraud</h2>
          <p className="mt-1 text-xs text-gray-500">{formatAttribution(order)}</p>
        </div>
        {flagged ? (
          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            Flagged
          </span>
        ) : null}
      </div>

      <p className="text-sm text-gray-600">
        Flagged orders are excluded from fraud-adjusted ROAS/POAS in Marketing Analytics.
      </p>

      <div className="space-y-2">
        <label htmlFor="fraud-reason" className="text-sm font-medium text-gray-700">
          Reason (required to flag)
        </label>
        <input
          id="fraud-reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={saving}
          placeholder="e.g. chargeback, test order, duplicate"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
          flagged
            ? "bg-gray-700 hover:bg-gray-800"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {saving ? "Saving…" : flagged ? "Remove fraud flag" : "Flag for fraud exclusion"}
      </button>

      {flagged && order?.marketingFraud?.flaggedAt ? (
        <p className="text-xs text-gray-500">
          Flagged at {new Date(order.marketingFraud.flaggedAt).toLocaleString("en-GB")}
        </p>
      ) : null}
    </div>
  );
}

MarketingFraudCard.propTypes = {
  orderId: PropTypes.string.isRequired,
  order: PropTypes.object,
  onUpdated: PropTypes.func,
};
