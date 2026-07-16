import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsReportShell from './components/AnalyticsReportShell';
import AnalyticsReportLoadState from './components/AnalyticsReportLoadState';
import ReportDateFilterCard from './components/ReportDateFilterCard';
import AdSpendManagementPanel from './components/AdSpendManagementPanel';
import AdPerformanceOrdersModal from './components/AdPerformanceOrdersModal';
import {
  getAdPerformanceOrders,
  getAdPerformanceReport,
} from './service/adCampaignAnalyticsService';
import {
  formatConvRate,
  formatCpa,
  formatCurrency,
  formatNumber,
  formatRoas,
  formatUkDate,
} from './utils/adPerformanceOrderDisplay';
import {
  getUkTodayYmd,
  isValidYmd,
  resolvePresetDateRange,
} from './utils/analyticsDatePresets';

function SummaryCard({ label, value, sub, tone = 'emerald' }) {
  const tones = {
    emerald: 'border-emerald-100 bg-emerald-50',
    orange: 'border-orange-100 bg-orange-50',
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.emerald}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-500">{sub}</p> : null}
    </div>
  );
}

export default function AdPerformanceReport() {
  const [activePreset, setActivePreset] = useState('last30');
  const [dateRange, setDateRange] = useState(() => resolvePresetDateRange('last30'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState('');
  const [modalCampaign, setModalCampaign] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalOrders, setModalOrders] = useState([]);
  const [modalSummary, setModalSummary] = useState(null);

  const { startDate, endDate } = dateRange;

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdPerformanceReport({ from: startDate, to: endDate });
      if (data?.success && data?.report) {
        setReport(data.report);
      } else {
        throw new Error(data?.message || 'Unexpected response');
      }
    } catch (err) {
      setReport(null);
      setError(err?.response?.data?.message || err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handlePresetChange = useCallback((presetId) => {
    setActivePreset(presetId);
    setDateRange(resolvePresetDateRange(presetId));
  }, []);

  const handleDateRangeChange = useCallback(({ startDate: nextStart, endDate: nextEnd, preset }) => {
    if (!isValidYmd(nextStart) || !isValidYmd(nextEnd)) return;
    let start = nextStart;
    let end = nextEnd;
    if (start > end) [start, end] = [end, start];
    const today = getUkTodayYmd();
    if (end > today) end = today;
    if (start > today) start = today;
    setActivePreset(preset ?? null);
    setDateRange({ startDate: start, endDate: end });
  }, []);

  const openOrdersModal = async (source, campaign) => {
    setModalSource(source);
    setModalCampaign(campaign);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalOrders([]);
    setModalSummary(null);
    try {
      const data = await getAdPerformanceOrders({
        from: startDate,
        to: endDate,
        source,
        campaign,
      });
      if (data?.success) {
        setModalOrders(data.orders || []);
        setModalSummary(data.summary || null);
      } else {
        throw new Error(data?.message || 'Failed to load orders');
      }
    } catch (err) {
      setModalOrders([]);
      setModalSummary(null);
      setModalError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setModalLoading(false);
    }
  };

  const summary = report?.summary || {};
  const revenueBySource = report?.revenueBySource || [];
  const campaigns = report?.campaigns || [];

  const revenueCards = [
    {
      key: 'totalRevenue',
      label: 'Total revenue',
      value: formatCurrency(summary.totalRevenue ?? 0),
      sub: `${formatNumber(summary.totalOrders ?? 0)} orders`,
    },
    { key: 'consentedRevenue', label: 'Consented revenue', value: formatCurrency(summary.consentedRevenue ?? 0) },
    { key: 'unattributedRevenue', label: 'Unattributed revenue', value: formatCurrency(summary.unattributedRevenue ?? 0) },
    { key: 'googleRevenue', label: 'Google revenue', value: formatCurrency(summary.googleRevenue ?? 0) },
    { key: 'metaRevenue', label: 'Meta revenue', value: formatCurrency(summary.metaRevenue ?? 0) },
    { key: 'tiktokRevenue', label: 'TikTok revenue', value: formatCurrency(summary.tiktokRevenue ?? 0) },
    { key: 'organicDirectRevenue', label: 'Organic / direct revenue', value: formatCurrency(summary.organicDirectRevenue ?? 0) },
    { key: 'averageOrderValue', label: 'AOV', value: formatCurrency(summary.averageOrderValue ?? 0) },
  ];

  const spendCards = [
    { key: 'totalSpend', label: 'Total spend', value: formatCurrency(summary.totalSpend ?? 0) },
    { key: 'blendedRoas', label: 'Blended ROAS', value: formatRoas(summary.blendedRoas) },
    { key: 'blendedCpa', label: 'Blended CPA', value: formatCpa(summary.blendedCpa) },
  ];

  return (
    <AnalyticsReportShell selectedPage="ad-performance-report" title="Ad performance report">
      <div>
        <Link
          to="/admin/analytics/overview"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          Back to analytics dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Ad performance report</h1>
        <p className="mt-1 text-sm text-gray-600">
          Consent-aware revenue, spend, ROAS, and CPA by campaign.
        </p>
      </div>

      <ReportDateFilterCard
        startDate={startDate}
        endDate={endDate}
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
        onDateRangeChange={handleDateRangeChange}
        loading={loading}
      />

      <AnalyticsReportLoadState loading={loading} error={error} onRetry={loadReport}>
        {summary.currencyWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Multi-currency spend detected. ROAS uses GBP-only spend.
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {revenueCards.map((card) => (
            <SummaryCard key={card.key} label={card.label} value={card.value} sub={card.sub} />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {spendCards.map((card) => (
            <SummaryCard
              key={card.key}
              label={card.label}
              value={card.value}
              tone="orange"
            />
          ))}
        </div>

        <AdSpendManagementPanel from={startDate} to={endDate} />

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Revenue by source</h2>
          </div>
          {revenueBySource.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No orders for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {['Source', 'Orders', 'Revenue', 'Spend'].map((label) => (
                      <th key={label} className="px-3 py-2.5 font-medium text-left whitespace-nowrap">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {revenueBySource.map((row) => (
                    <tr key={row.source} className="hover:bg-gray-50/80">
                      <td className="px-3 py-2.5 font-medium text-gray-900">{row.source}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatNumber(row.orders)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatCurrency(row.revenue)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatCurrency(row.spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Campaign performance</h2>
            <p className="mt-0.5 text-xs text-gray-500">Click a row to open attributed orders.</p>
          </div>
          {campaigns.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No campaign data for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      'Source',
                      'Campaign',
                      'Orders',
                      'Revenue',
                      'Spend',
                      'ROAS',
                      'CPA',
                      'AOV',
                      'Conv. rate',
                      'Consented rev.',
                      'First order',
                      'Last order',
                    ].map((label) => (
                      <th key={label} className="px-3 py-2.5 font-medium text-left whitespace-nowrap">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((row) => (
                    <tr
                      key={`${row.source}-${row.campaign}`}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-emerald-50/60"
                      onClick={() => openOrdersModal(row.source, row.campaign)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openOrdersModal(row.source, row.campaign);
                        }
                      }}
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap">{row.source}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-medium text-gray-900">
                        {row.campaign}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{formatNumber(row.orders)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatCurrency(row.revenue)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatCurrency(row.spend)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatRoas(row.roas)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatCpa(row.cpa)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatCurrency(row.aov)}</td>
                      <td className="px-3 py-2.5 tabular-nums">{formatConvRate(row.conversionRate)}</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {formatCurrency(row.consentedRevenue)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {formatUkDate(row.firstOrderAt)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {formatUkDate(row.lastOrderAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AnalyticsReportLoadState>

      <AdPerformanceOrdersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        loading={modalLoading}
        error={modalError}
        source={modalSource}
        campaign={modalCampaign}
        orders={modalOrders}
        summary={modalSummary}
      />
    </AnalyticsReportShell>
  );
}
