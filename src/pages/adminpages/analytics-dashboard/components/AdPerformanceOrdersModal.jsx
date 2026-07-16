import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import {
  consentLabel,
  displayOrDash,
  formatCurrency,
  formatUkDate,
} from '../utils/adPerformanceOrderDisplay';

export default function AdPerformanceOrdersModal({
  isOpen,
  onClose,
  loading,
  error,
  source,
  campaign,
  orders = [],
  summary,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-performance-orders-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="min-w-0">
            <h2
              id="ad-performance-orders-title"
              className="m-0 text-xl font-semibold leading-tight text-gray-900"
            >
              Orders — {displayOrDash(source)} / {displayOrDash(campaign)}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {summary?.orderCount != null
                ? `${summary.orderCount} orders · ${formatCurrency(summary.revenue ?? 0)}`
                : 'Consent-safe attribution view'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">Loading orders…</p>
          ) : null}

          {!loading && error ? (
            <p className="py-10 text-center text-sm text-red-700">{error}</p>
          ) : null}

          {!loading && !error && orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">No orders for this campaign.</p>
          ) : null}

          {!loading && !error && orders.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      'Order',
                      'Customer',
                      'Date',
                      'Total',
                      'Source',
                      'Campaign',
                      'UTM source',
                      'UTM medium',
                      'UTM campaign',
                      'gclid',
                      'fbclid',
                      'ttclid',
                      'msclkid',
                      'Consent',
                      'First touch',
                      'Last touch',
                    ].map((label) => (
                      <th key={label} className="px-3 py-2.5 font-medium whitespace-nowrap text-left">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {orders.map((order) => {
                    const attr = order.marketingAttribution || order.attribution || {};
                    return (
                      <tr key={order._id || order.orderNumber || order.id} className="hover:bg-gray-50/80">
                        <td className="px-3 py-2.5 whitespace-nowrap font-medium text-gray-900">
                          {displayOrDash(order.orderNumber || order._id)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {displayOrDash(order.customerName || order.customerEmail)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {formatUkDate(order.createdAt)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">
                          {formatCurrency(order.total ?? order.grandTotal ?? 0)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(order.source || attr.resolvedPlatform)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(order.campaign || attr.utmCampaign)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.utmSource)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.utmMedium)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.utmCampaign)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.gclid)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.fbclid)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.ttclid)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{displayOrDash(attr.msclkid)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {consentLabel(order.conversionConsent || order.consent)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {formatUkDate(attr.firstTouchTimestamp || attr.firstVisitAt)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {formatUkDate(attr.lastTouchTimestamp || attr.lastVisitAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

AdPerformanceOrdersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  source: PropTypes.string,
  campaign: PropTypes.string,
  orders: PropTypes.arrayOf(PropTypes.object),
  summary: PropTypes.object,
};
