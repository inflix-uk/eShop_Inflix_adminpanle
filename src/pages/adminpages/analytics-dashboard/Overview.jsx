import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Side from "../nav/Side";
import Top from "../nav/Top";
import AnalyticsToolbar from "./components/AnalyticsToolbar";
import DataQualitySection from "./components/DataQualitySection";
import KpiCard from "./components/KpiCard";
import SectionCard from "./components/SectionCard";
import PerformanceTable from "./components/PerformanceTable";
import DonutChart from "./components/DonutChart";
import BarChart from "./components/BarChart";
import UnavailableNotice from "./components/UnavailableNotice";
import { useAnalyticsOverview } from "./hooks/useAnalyticsOverview";
import {
  getUkTodayYmd,
  isValidYmd,
  resolvePresetDateRange,
} from "./utils/analyticsDatePresets";
import {
  mapCampaignPerformance,
  mapDailyOrdersRevenue,
  mapDataQuality,
  mapDonutSegments,
  mapKpiMetrics,
  mapProductPerformance,
  mapRevenueByCampaign,
  mapRevenueByChannel,
  mapRevenueByMedium,
  mapRevenueBySource,
  mapTopRevenueProducts,
  mapTopSellingProducts,
} from "./utils/analyticsOverviewMappers";

const REVENUE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
];

const CHANNEL_COLUMNS = [
  { key: "name", label: "Channel" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
];

const MEDIUM_COLUMNS = [
  { key: "name", label: "Medium" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
];

const CAMPAIGN_COLUMNS = [
  { key: "name", label: "Campaign" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
];

const PRODUCT_PERFORMANCE_COLUMNS = [
  { key: "name", label: "Product" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "unitsSold", label: "Units sold", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
];

const PRODUCT_COLUMNS = [
  { key: "name", label: "Product" },
  { key: "sales", label: "Units sold", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
];

const TOP_REVENUE_COLUMNS = [
  { key: "name", label: "Product" },
  { key: "revenue", label: "Revenue", align: "right" },
];

export default function AnalyticsOverview() {
  const [selectedPage] = useState("analytics-overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("last30");
  const [dateRange, setDateRange] = useState(() => resolvePresetDateRange("last30"));

  const { startDate, endDate } = dateRange;
  const { data, loading, error, retry } = useAnalyticsOverview({
    startDate,
    endDate,
    rangePreset: activePreset,
  });

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  const trackingStartedAt = data?.meta?.trackingStartedAt ?? null;

  useEffect(() => {
    if (activePreset !== "sinceTracking" || !trackingStartedAt) return;
    const next = resolvePresetDateRange("sinceTracking", trackingStartedAt);
    setDateRange((prev) => {
      if (prev.startDate === next.startDate && prev.endDate === next.endDate) return prev;
      return next;
    });
  }, [activePreset, trackingStartedAt]);

  const handlePresetChange = useCallback(
    (presetId) => {
      setActivePreset(presetId);
      setDateRange(resolvePresetDateRange(presetId, trackingStartedAt));
    },
    [trackingStartedAt]
  );

  const handleDateRangeChange = useCallback(({ startDate: nextStart, endDate: nextEnd, preset }) => {
    if (!isValidYmd(nextStart) || !isValidYmd(nextEnd)) return;

    let start = nextStart;
    let end = nextEnd;
    if (start > end) {
      [start, end] = [end, start];
    }

    const today = getUkTodayYmd();
    if (end > today) end = today;
    if (start > today) start = today;

    setActivePreset(preset ?? null);
    setDateRange({ startDate: start, endDate: end });
  }, []);

  const currency = data?.meta?.currency || "GBP";

  const viewModel = useMemo(() => {
    if (!data) return null;

    return {
      dataQuality: mapDataQuality(data.meta, data.dataQuality),
      kpiMetrics: mapKpiMetrics(data.kpis, data.meta),
      revenueBySource: mapRevenueBySource(data.revenueBySource, currency),
      revenueByCampaign: mapRevenueByCampaign(data.revenueByCampaign, currency),
      revenueByMedium: mapRevenueByMedium(data.revenueByMedium, currency),
      revenueByChannel: mapRevenueByChannel(data.revenueByChannel, currency),
      campaignPerformance: mapCampaignPerformance(data.campaignPerformance, currency),
      productPerformance: mapProductPerformance(data.productPerformance, currency),
      topSellingProducts: mapTopSellingProducts(data.topSellingProducts, currency),
      topRevenueProducts: mapTopRevenueProducts(data.topRevenueProducts, currency),
      productRevenueSegments: mapDonutSegments(data.productRevenueSegments),
      ordersBySource: mapDonutSegments(data.ordersBySource),
      dailyOrdersRevenue: mapDailyOrdersRevenue(data.dailyOrdersRevenue),
    };
  }, [data, currency]);

  return (
    <>
      <Helmet>
        <title>Marketing Analytics | Admin</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
        />

        <main className="py-6 sm:py-8 bg-[#f8f9fb] min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-6">
            <AnalyticsToolbar
              activePreset={activePreset}
              onPresetChange={handlePresetChange}
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
              trackingStartedAt={trackingStartedAt}
              loading={loading}
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {loading && !data && (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
                Loading analytics…
              </div>
            )}

            {viewModel && (
              <>
                <DataQualitySection data={viewModel.dataQuality} />

                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                  {viewModel.kpiMetrics.map((metric) => (
                    <KpiCard key={metric.label} {...metric} />
                  ))}
                </div>

                <SectionCard
                  title="Revenue performance"
                  subtitle="Summary by acquisition channel and campaign"
                >
                  <div className="grid gap-6 xl:grid-cols-2">
                    <PerformanceTable
                      title="Summary by source"
                      columns={REVENUE_COLUMNS}
                      rows={viewModel.revenueBySource}
                    />
                    <PerformanceTable
                      title="Summary by campaign"
                      columns={REVENUE_COLUMNS}
                      rows={viewModel.revenueByCampaign}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Revenue by medium" subtitle="Performance grouped by traffic medium">
                  <PerformanceTable columns={MEDIUM_COLUMNS} rows={viewModel.revenueByMedium} />
                </SectionCard>

                <SectionCard
                  title="Revenue by channel"
                  subtitle="Performance grouped by normalized attribution channel"
                >
                  <PerformanceTable columns={CHANNEL_COLUMNS} rows={viewModel.revenueByChannel} />
                </SectionCard>

                <SectionCard
                  title="Campaign performance"
                  subtitle="Orders and revenue by campaign (attributed orders only)"
                >
                  <PerformanceTable
                    columns={CAMPAIGN_COLUMNS}
                    rows={viewModel.campaignPerformance}
                  />
                </SectionCard>

                <SectionCard
                  title="Advertising performance"
                  subtitle="Ad spend and platform metrics"
                >
                  <UnavailableNotice message="Ad spend and platform metrics are not connected yet. No data source available." />
                </SectionCard>

                <SectionCard title="Campaign ROAS & ROI" subtitle="Return on ad spend by campaign">
                  <UnavailableNotice message="ROAS and ROI require ad spend data, which is not available yet." />
                </SectionCard>

                <SectionCard title="Profitability & ROAS" subtitle="Margin and return on ad spend">
                  <UnavailableNotice message="Profit and margin require product cost data, which is not available yet." />
                </SectionCard>

                <SectionCard
                  title="Product performance (Top products)"
                  subtitle="Orders, units sold, and revenue by product"
                >
                  <PerformanceTable
                    columns={PRODUCT_PERFORMANCE_COLUMNS}
                    rows={viewModel.productPerformance}
                  />
                </SectionCard>

                <SectionCard
                  title="Customer profile (Last 6 months)"
                  subtitle="New vs returning customer trends"
                >
                  <UnavailableNotice message="Customer profile aggregation is not available from order data yet." />
                </SectionCard>

                <SectionCard title="Order analytics" subtitle="Orders mix and daily performance">
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Product by revenue</h3>
                      <DonutChart
                        segments={viewModel.productRevenueSegments}
                        centerLabel="Revenue"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Daily orders & revenue</h3>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-sm bg-blue-500" /> Orders
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-sm bg-teal-400" /> Revenue (£)
                          </span>
                        </div>
                      </div>
                      <BarChart
                        data={viewModel.dailyOrdersRevenue}
                        valueKey="orders"
                        secondaryKey="revenue"
                        labelKey="day"
                      />
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Orders by source</h3>
                    <DonutChart segments={viewModel.ordersBySource} centerLabel="Orders" />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Influencers & campaigns"
                  subtitle="Top performers from influencer marketing"
                >
                  <UnavailableNotice message="Influencer analytics are not connected yet." />
                </SectionCard>

                <SectionCard title="Top selling products" subtitle="Best performers in selected period">
                  <PerformanceTable columns={PRODUCT_COLUMNS} rows={viewModel.topSellingProducts} />
                </SectionCard>

                <SectionCard title="Top revenue" subtitle="Products ranked by revenue generated">
                  <PerformanceTable
                    columns={TOP_REVENUE_COLUMNS}
                    rows={viewModel.topRevenueProducts}
                  />
                </SectionCard>

                <SectionCard title="Track offline orders" subtitle="Orders placed outside online checkout">
                  <UnavailableNotice message="Offline order tracking is not available yet." />
                </SectionCard>

                <SectionCard title="Email analytics" subtitle="Campaign and source performance">
                  <UnavailableNotice message="Email analytics are not connected yet." />
                </SectionCard>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
