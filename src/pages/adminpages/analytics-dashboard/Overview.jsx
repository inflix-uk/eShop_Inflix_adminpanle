import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Side from "../nav/Side";
import Top from "../nav/Top";
import AnalyticsToolbar from "./components/AnalyticsToolbar";
import DataQualitySection from "./components/DataQualitySection";
import KpiCard from "./components/KpiCard";
import OrdersProductsSoldModal from "./components/OrdersProductsSoldModal";
import ProfitDataQualitySection from "./components/ProfitDataQualitySection";
import ProfitabilityPoasSection from "./components/ProfitabilityPoasSection";
import SectionCard from "./components/SectionCard";
import PerformanceTable from "./components/PerformanceTable";
import VisitorAnalyticsSection from "./components/VisitorAnalyticsSection";
import TrackingStartedBanner from "./components/TrackingStartedBanner";
import UnavailableNotice from "./components/UnavailableNotice";
import ZextonsAdvertisingSection from "./components/ZextonsAdvertisingSection";
import { useAnalyticsOverview } from "./hooks/useAnalyticsOverview";
import {
  ZEXTONS_CAMPAIGN_COLUMNS,
  ZEXTONS_CAMPAIGN_ROAS_COLUMNS,
  ZEXTONS_MEDIUM_COLUMNS,
  ZEXTONS_REVENUE_COLUMNS,
  TOP_CAMPAIGN_COLUMNS,
  TOP_LANDING_COLUMNS,
  TOP_TRAFFIC_COLUMNS,
  PROFIT_BY_SOURCE_COLUMNS,
  PROFIT_BY_CAMPAIGN_COLUMNS,
  FRAUD_SOURCE_COLUMNS,
  FRAUD_CAMPAIGN_COLUMNS,
  ROAS_POAS_COLUMNS,
} from "./constants/analyticsConstants";
import {
  getUkTodayYmd,
  isValidYmd,
  resolvePresetDateRange,
} from "./utils/analyticsDatePresets";
import {
  mapAdvertisingPerformanceZextons,
  mapCampaignRoasCpa,
  mapDailyOrdersRevenue,
  mapDataQuality,
  mapProfitDataQuality,
  mapProfitability,
  mapTopCampaignsSummary,
  mapTopLandingPages,
  mapTopTrafficSources,
  mapOrdersProductsSoldModal,
  mapVisitorsByDevice,
  mapProfitBySource,
  mapProfitByCampaign,
  mapFraudInsights,
  mapFraudAdjustedAdvertising,
  mapRoasVsPoas,
  mapZextonsKpiMetrics,
  mapZextonsRevenueByCampaign,
  mapZextonsRevenueByMedium,
  mapZextonsRevenueBySource,
} from "./utils/analyticsOverviewMappers";

export default function AnalyticsOverview() {
  const [selectedPage] = useState("analytics-overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("last30");
  const [activeChannel, setActiveChannel] = useState("all");
  const [dateRange, setDateRange] = useState(() => resolvePresetDateRange("last30"));
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  const { startDate, endDate } = dateRange;
  const { data, loading, error, retry } = useAnalyticsOverview({
    startDate,
    endDate,
    rangePreset: activePreset,
    channel: activeChannel,
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
      profitDataQuality: mapProfitDataQuality(data.dataQuality),
      kpiMetrics: mapZextonsKpiMetrics(data.kpis, data.meta),
      revenueBySource: mapZextonsRevenueBySource(
        data.revenueBySource,
        data.revenueByChannel,
        currency
      ),
      revenueByCampaign: mapZextonsRevenueByCampaign(data.revenueByCampaign, currency),
      revenueByMedium: mapZextonsRevenueByMedium(data.revenueByMedium, currency),
      topTrafficSources: mapTopTrafficSources(
        data.revenueBySource,
        data.revenueByChannel,
        currency
      ),
      topCampaigns: mapTopCampaignsSummary(data.revenueByCampaign, currency),
      topLandingPages: mapTopLandingPages(data.topLandingPages),
      visitorsByDevice: mapVisitorsByDevice(data.visitorsByDevice),
      profitBySource: mapProfitBySource(data.profitBySource, currency),
      profitByCampaign: mapProfitByCampaign(data.profitByCampaign, currency),
      fraudInsights: mapFraudInsights(data.fraudInsights, currency),
      fraudAdjusted: mapFraudAdjustedAdvertising(data.advertisingPerformance, data.meta),
      roasVsPoas: mapRoasVsPoas(data.roasVsPoas, currency),
      advertisingPerformance: mapAdvertisingPerformanceZextons(data.advertisingPerformance, data.meta),
      campaignRoasCpa: mapCampaignRoasCpa(
        data.campaignRoasCpa || data.campaignRoasRoi || data.campaignPerformance,
        currency
      ),
      profitability: mapProfitability(data.profitability, data.meta),
      dailyOrdersRevenue: mapDailyOrdersRevenue(data.dailyOrdersRevenue),
      ordersProductsSold: mapOrdersProductsSoldModal(
        data.kpis,
        data.topSellingProducts || data.productsSold,
        data.meta
      ),
      trackingStarted: viewModelTrackingLabel(data.meta?.trackingStartedAt),
      preTrackingNote: data.meta?.preTrackingNote,
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
              activeChannel={activeChannel}
              onChannelChange={setActiveChannel}
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
                <TrackingStartedBanner
                  trackingStarted={viewModel.trackingStarted}
                  preTrackingNote={viewModel.preTrackingNote}
                />

                <DataQualitySection data={viewModel.dataQuality} />

                <ProfitDataQualitySection data={viewModel.profitDataQuality} />

                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                  {viewModel.kpiMetrics.map((metric) => (
                    <KpiCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      tone={metric.tone}
                      small={metric.small}
                      title={metric.title}
                      actionHint={metric.actionHint}
                      onClick={
                        metric.opensOrdersModal
                          ? () => setOrdersModalOpen(true)
                          : undefined
                      }
                    />
                  ))}
                </div>

                <OrdersProductsSoldModal
                  isOpen={ordersModalOpen}
                  onClose={() => setOrdersModalOpen(false)}
                  data={viewModel.ordersProductsSold}
                />

                <section className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Revenue performance</h2>
                  <div className="grid gap-6 lg:grid-cols-2 items-stretch">
                    <SectionCard title="Revenue by source" className="h-full">
                      <PerformanceTable
                        columns={ZEXTONS_REVENUE_COLUMNS}
                        rows={viewModel.revenueBySource}
                      />
                    </SectionCard>
                    <SectionCard title="Revenue by campaign" className="h-full">
                      <PerformanceTable
                        columns={ZEXTONS_CAMPAIGN_COLUMNS}
                        rows={viewModel.revenueByCampaign}
                      />
                    </SectionCard>
                  </div>
                </section>

                <SectionCard title="Revenue by medium">
                  <PerformanceTable columns={ZEXTONS_MEDIUM_COLUMNS} rows={viewModel.revenueByMedium} />
                </SectionCard>

                <SectionCard>
                  <ZextonsAdvertisingSection
                    data={viewModel.advertisingPerformance}
                    onSpendSaved={retry}
                  />
                </SectionCard>

                <SectionCard title="Campaign ROAS & CPA">
                  <PerformanceTable
                    columns={ZEXTONS_CAMPAIGN_ROAS_COLUMNS}
                    rows={viewModel.campaignRoasCpa}
                    rowKey="name"
                    emptyMessage="No Google Ads spend in this date range. Add spend in Advertising performance above (campaign + date + amount)."
                  />
                </SectionCard>

                <ProfitabilityPoasSection
                  profitability={viewModel.profitability}
                  fraudAdjusted={viewModel.fraudAdjusted}
                />

                <div className="grid gap-6 lg:grid-cols-2 items-stretch">
                  <SectionCard title="Profit by source" className="h-full">
                    {viewModel.profitBySource.unavailable ? (
                      <UnavailableNotice message={viewModel.profitBySource.emptyMessage} />
                    ) : (
                      <PerformanceTable
                        columns={PROFIT_BY_SOURCE_COLUMNS}
                        rows={viewModel.profitBySource.rows}
                      />
                    )}
                  </SectionCard>

                  <SectionCard title="Profit by campaign" className="h-full">
                    {viewModel.profitByCampaign.unavailable ? (
                      <UnavailableNotice message={viewModel.profitByCampaign.emptyMessage} />
                    ) : (
                      <PerformanceTable
                        columns={PROFIT_BY_CAMPAIGN_COLUMNS}
                        rows={viewModel.profitByCampaign.rows}
                      />
                    )}
                  </SectionCard>
                </div>

                <SectionCard
                  title="ROAS vs POAS (fraud-adjusted)"
                  subtitle={viewModel.roasVsPoas.subtitle}
                >
                  {viewModel.roasVsPoas.unavailable ? (
                    <UnavailableNotice message={viewModel.roasVsPoas.emptyMessage} />
                  ) : (
                    <PerformanceTable
                      columns={ROAS_POAS_COLUMNS}
                      rows={viewModel.roasVsPoas.rows}
                      rowKey="source"
                      emptyMessage="No revenue orders in this range for ROAS vs POAS."
                    />
                  )}
                </SectionCard>

                <VisitorAnalyticsSection
                  visitorsByDevice={viewModel.visitorsByDevice}
                  dailyOrdersRevenue={viewModel.dailyOrdersRevenue}
                />

                <div className="grid gap-6 lg:grid-cols-2 items-stretch">
                  <SectionCard title="Top traffic sources" className="h-full">
                    <PerformanceTable
                      columns={TOP_TRAFFIC_COLUMNS}
                      rows={viewModel.topTrafficSources}
                      emptyMessage="No traffic source orders in this range."
                    />
                  </SectionCard>
                  <SectionCard title="Top campaigns" className="h-full">
                    <PerformanceTable
                      columns={TOP_CAMPAIGN_COLUMNS}
                      rows={viewModel.topCampaigns}
                      emptyMessage="No campaign orders in this range."
                    />
                  </SectionCard>
                </div>

                <SectionCard title="Top landing pages">
                  {viewModel.topLandingPages.unavailable ? (
                    <UnavailableNotice message={viewModel.topLandingPages.emptyMessage} />
                  ) : (
                    <PerformanceTable
                      columns={TOP_LANDING_COLUMNS}
                      rows={viewModel.topLandingPages.rows}
                      rowKey="landingPage"
                      emptyMessage="No landing page sessions recorded in this range."
                    />
                  )}
                </SectionCard>

                <section className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900">Fraud insights</h2>
                  {viewModel.fraudInsights.unavailable ? (
                    <UnavailableNotice message={viewModel.fraudInsights.emptyMessage} />
                  ) : (
                    <div className="grid gap-6 lg:grid-cols-2 items-stretch">
                      <SectionCard title="Fraud rate by source" className="h-full">
                        <PerformanceTable
                          columns={FRAUD_SOURCE_COLUMNS}
                          rows={viewModel.fraudInsights.bySource}
                          emptyMessage="No revenue orders in this range."
                        />
                      </SectionCard>
                      <SectionCard title="Fraud rate by campaign" className="h-full">
                        <PerformanceTable
                          columns={FRAUD_CAMPAIGN_COLUMNS}
                          rows={viewModel.fraudInsights.byCampaign}
                          emptyMessage="No revenue orders in this range."
                        />
                      </SectionCard>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function viewModelTrackingLabel(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
