import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import AnalyticsReportShell from './components/AnalyticsReportShell';
import AnalyticsReportLoadState from './components/AnalyticsReportLoadState';
import ReportDateFilterCard from './components/ReportDateFilterCard';
import { getCampaignAnalytics } from './service/adCampaignAnalyticsService';
import {
  formatConvRate,
  formatCurrency,
  formatNumber,
  formatUkDate,
} from './utils/adPerformanceOrderDisplay';
import {
  getUkTodayYmd,
  isValidYmd,
  resolvePresetDateRange,
} from './utils/analyticsDatePresets';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/** Empty string = all mediums (API omits medium filter). */
const ALL_MEDIUMS = '';

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

function resolveMediumFromParams(searchParams) {
  const raw = searchParams.get('medium');
  if (raw == null || raw === '' || raw === 'all' || raw === 'All') return ALL_MEDIUMS;
  return raw;
}

export default function CampaignAnalyticsReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePreset, setActivePreset] = useState(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    return from && to ? null : 'last30';
  });
  const [dateRange, setDateRange] = useState(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (isValidYmd(from) && isValidYmd(to)) {
      return { startDate: from, endDate: to };
    }
    return resolvePresetDateRange('last30');
  });
  const [medium, setMedium] = useState(() => resolveMediumFromParams(searchParams));
  const [groupBy, setGroupBy] = useState(() =>
    searchParams.get('groupBy') === 'term' ? 'term' : 'campaign'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const { startDate, endDate } = dateRange;

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignAnalytics({
        from: startDate,
        to: endDate,
        medium,
        groupBy,
      });
      if (data?.success && data?.stats) {
        setStats(data.stats);
      } else {
        throw new Error(data?.message || 'Unexpected response');
      }
    } catch (err) {
      setStats(null);
      setError(err?.response?.data?.message || err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, medium, groupBy]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Keep medium in sync with URL; default is All mediums when param missing.
  useEffect(() => {
    setMedium(resolveMediumFromParams(searchParams));
  }, [searchParams]);

  const handleMediumChange = useCallback(
    (nextMedium) => {
      const value = nextMedium === 'all' ? ALL_MEDIUMS : nextMedium;
      setMedium(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value) next.delete('medium');
          else next.set('medium', value);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

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

  const totals = stats?.totals || {};
  const rows = stats?.rows || [];

  const chartData = useMemo(() => {
    const top = rows.slice(0, 10);
    return {
      labels: top.map((r) => r.name || '(unnamed)'),
      datasets: [
        {
          label: 'Clicks',
          data: top.map((r) => r.clicks || 0),
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
        },
        {
          label: 'Visitors',
          data: top.map((r) => r.visitors || 0),
          backgroundColor: 'rgba(147, 51, 234, 0.85)',
        },
        {
          label: 'Conversions',
          data: top.map((r) => r.conversions || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
        },
      ],
    };
  }, [rows]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
      },
      scales: {
        x: { ticks: { maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true },
      },
    }),
    []
  );

  const summaryCards = [
    { key: 'campaigns', label: 'Campaigns', value: formatNumber(totals.campaigns ?? 0) },
    { key: 'clicks', label: 'Link clicks', value: formatNumber(totals.clicks ?? 0) },
    { key: 'visitors', label: 'Visitors', value: formatNumber(totals.visitors ?? 0) },
    { key: 'conversions', label: 'Conversions', value: formatNumber(totals.conversions ?? 0) },
    { key: 'revenue', label: 'Revenue', value: formatCurrency(totals.revenue ?? 0) },
    {
      key: 'conversionRate',
      label: 'Conversion rate',
      value:
        totals.conversionRate == null || Number.isNaN(Number(totals.conversionRate))
          ? 'N/A'
          : formatConvRate(totals.conversionRate),
    },
  ];

  const nameHeader = groupBy === 'term' ? 'Term' : 'Campaign';

  return (
    <AnalyticsReportShell selectedPage="campaign-analytics" title="Campaign analytics">
      <div>
        <Link
          to="/admin/analytics/overview"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          Back to analytics dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Campaign analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Email marketing campaign performance — from link click to purchase.
        </p>
      </div>

      <ReportDateFilterCard
        startDate={startDate}
        endDate={endDate}
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
        onDateRangeChange={handleDateRangeChange}
        loading={loading}
      >
        <div className="flex flex-wrap gap-2 pb-0.5">
          {[
            { id: ALL_MEDIUMS, label: 'All mediums' },
            { id: 'Email', label: 'Email only' },
          ].map((opt) => {
            const isActive = medium === opt.id;
            return (
              <button
                key={opt.label}
                type="button"
                disabled={loading}
                onClick={() => handleMediumChange(opt.id)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 pb-0.5">
          {[
            { id: 'campaign', label: 'By campaign' },
            { id: 'term', label: 'By term (utm_term)' },
          ].map((opt) => {
            const isActive = groupBy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={loading}
                onClick={() => setGroupBy(opt.id)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </ReportDateFilterCard>

      <AnalyticsReportLoadState loading={loading} error={error} onRetry={loadReport}>
        {stats?.historicalOrdersWarning ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {stats.historicalOrdersWarning}
          </div>
        ) : null}

        {stats?.clickTrackingStartedAt ? (
          <p className="text-sm text-gray-500">
            Click tracking started since {formatUkDate(stats.clickTrackingStartedAt)}.
          </p>
        ) : null}

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          {summaryCards.map((card) => (
            <SummaryCard key={card.key} label={card.label} value={card.value} />
          ))}
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Top 10 performance</h2>
          <div style={{ height: 340 }}>
            {rows.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No campaign data for this period.
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Performance table</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Conv. rate = conversions ÷ unique visitors · Click→purchase = conversions ÷ link
              clicks
            </p>
          </div>
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No campaign data for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      nameHeader,
                      'Source',
                      'Medium',
                      'Clicks',
                      'Visitors',
                      'Conversions',
                      'Conv. rate',
                      'Click→purchase',
                      'Revenue',
                      'AOV',
                      'Last click',
                    ].map((label) => (
                      <th key={label} className="px-3 py-2.5 font-medium text-left whitespace-nowrap">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => {
                    const ordersUrl = `/admin/analytics/campaign-orders?groupBy=${encodeURIComponent(
                      groupBy
                    )}&value=${encodeURIComponent(row.name || '')}&from=${startDate}&to=${endDate}${
                      medium ? `&medium=${encodeURIComponent(medium)}` : ''
                    }`;
                    return (
                      <tr key={`${row.name}-${row.source}-${row.medium}`} className="hover:bg-gray-50/80">
                        <td className="px-3 py-2.5 whitespace-nowrap font-medium">
                          <Link
                            to={ordersUrl}
                            className="text-emerald-700 hover:underline"
                          >
                            {row.name || '(unnamed)'}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{row.source || '—'}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{row.medium || '—'}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatNumber(row.clicks)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatNumber(row.visitors)}</td>
                        <td className="px-3 py-2.5 tabular-nums">{formatNumber(row.conversions)}</td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {formatConvRate(row.conversionRate)}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {formatConvRate(row.clickToPurchaseRate)}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">{formatCurrency(row.aov)}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {formatUkDate(row.lastClickAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AnalyticsReportLoadState>
    </AnalyticsReportShell>
  );
}
