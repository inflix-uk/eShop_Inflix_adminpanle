import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AnalyticsReportShell from './components/AnalyticsReportShell';
import AnalyticsReportLoadState from './components/AnalyticsReportLoadState';
import { getCampaignOrders } from './service/adCampaignAnalyticsService';
import {
  formatCurrency,
  formatUkDate,
} from './utils/adPerformanceOrderDisplay';

function statusPillClass(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('deliver') || s.includes('complete') || s === 'paid') {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  if (s.includes('fail') || s.includes('cancel') || s.includes('refund')) {
    return 'bg-red-50 text-red-800 border-red-200';
  }
  return 'bg-sky-50 text-sky-800 border-sky-200';
}

export default function CampaignOrdersReport() {
  const [searchParams] = useSearchParams();
  const groupBy = searchParams.get('groupBy') || 'campaign';
  const value = searchParams.get('value') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const medium = searchParams.get('medium') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const backHref = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (medium) params.set('medium', medium);
    if (groupBy) params.set('groupBy', groupBy);
    const qs = params.toString();
    return `/admin/analytics/campaign-analytics${qs ? `?${qs}` : ''}`;
  }, [from, to, medium, groupBy]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignOrders({
        from,
        to,
        groupBy,
        value,
        medium,
      });
      if (data?.success && data?.stats) {
        setStats(data.stats);
      } else {
        throw new Error(data?.message || 'Unexpected response');
      }
    } catch (err) {
      setStats(null);
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [from, to, groupBy, value, medium]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const orders = stats?.orders || [];

  return (
    <AnalyticsReportShell selectedPage="campaign-analytics" title="Campaign orders">
      <div>
        <Link to={backHref} className="text-sm font-medium text-emerald-700 hover:underline">
          Back to campaign analytics
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Campaign orders</h1>
        <p className="mt-1 text-sm text-gray-600">
          Attributed orders for{' '}
          <span className="font-medium text-gray-900">{value || stats?.value || '—'}</span>
          {from && to ? (
            <>
              {' '}
              · {from} → {to}
            </>
          ) : null}
        </p>
      </div>

      <AnalyticsReportLoadState loading={loading} error={error} onRetry={loadOrders}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Orders</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stats?.orderCount ?? orders.length}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {formatCurrency(stats?.revenue ?? 0)}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500 shadow-sm">
            No attributed orders for this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order._id || order.orderNumber}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {order.orderNumber || order._id}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {order.customerName || order.customerEmail || 'Customer'}
                      {order.createdAt ? ` · ${formatUkDate(order.createdAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${statusPillClass(
                        order.status
                      )}`}
                    >
                      {order.status || 'Unknown'}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-gray-900">
                      {formatCurrency(order.total ?? order.grandTotal ?? 0)}
                    </span>
                  </div>
                </div>

                {(order.products || order.items || []).length > 0 ? (
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                    {(order.products || order.items || []).map((product, idx) => (
                      <li
                        key={`${order._id}-${idx}`}
                        className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50"
                      >
                        <div className="h-12 w-12 shrink-0 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center text-[10px] text-gray-500">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            'No img'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty {product.quantity ?? 1} ·{' '}
                            {formatCurrency(product.price ?? 0)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </AnalyticsReportLoadState>
    </AnalyticsReportShell>
  );
}
