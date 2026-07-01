import PropTypes from "prop-types";
import { DATE_RANGE_PRESETS, CHANNEL_FILTER_OPTIONS } from "../constants/analyticsConstants";

export default function AnalyticsToolbar({
  activePreset,
  onPresetChange,
  startDate,
  endDate,
  onDateRangeChange,
  activeChannel,
  onChannelChange,
  trackingStartedAt,
  loading,
}) {
  const sinceTrackingAvailable = Boolean(trackingStartedAt);

  const handleFromChange = (e) => {
    const nextStart = e.target.value;
    if (!nextStart) return;
    onDateRangeChange({ startDate: nextStart, endDate, preset: null });
  };

  const handleToChange = (e) => {
    const nextEnd = e.target.value;
    if (!nextEnd) return;
    onDateRangeChange({ startDate, endDate: nextEnd, preset: null });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marketing Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visitor analytics, attribution, and conversion performance
        </p>
        {loading ? <p className="mt-0.5 text-xs text-gray-400">Updating…</p> : null}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {DATE_RANGE_PRESETS.map((preset) => {
            const isSinceTracking = preset.id === "sinceTracking";
            const disabled = loading || (isSinceTracking && !sinceTrackingAvailable);
            const isActive = activePreset === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                title={
                  isSinceTracking && !sinceTrackingAvailable
                    ? "Tracking start date not configured"
                    : undefined
                }
                onClick={() => onPresetChange(preset.id)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isActive
                    ? "border-gray-400 bg-gray-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="analytics-from-date" className="text-sm font-medium text-gray-700">
                From
              </label>
              <input
                id="analytics-from-date"
                type="date"
                disabled={loading}
                value={startDate}
                max={endDate}
                onChange={handleFromChange}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm disabled:opacity-60 min-w-[10.5rem]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="analytics-to-date" className="text-sm font-medium text-gray-700">
                To
              </label>
              <input
                id="analytics-to-date"
                type="date"
                disabled={loading}
                value={endDate}
                min={startDate}
                onChange={handleToChange}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm disabled:opacity-60 min-w-[10.5rem]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:min-w-[12rem]">
            <label htmlFor="analytics-channel-filter" className="text-sm font-medium text-gray-700">
              Channel
            </label>
            <select
              id="analytics-channel-filter"
              disabled={loading}
              value={activeChannel || "all"}
              onChange={(e) => onChannelChange(e.target.value)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm disabled:opacity-60"
            >
              {CHANNEL_FILTER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

AnalyticsToolbar.propTypes = {
  activePreset: PropTypes.string,
  onPresetChange: PropTypes.func.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  activeChannel: PropTypes.string,
  onChannelChange: PropTypes.func.isRequired,
  trackingStartedAt: PropTypes.string,
  loading: PropTypes.bool,
};
