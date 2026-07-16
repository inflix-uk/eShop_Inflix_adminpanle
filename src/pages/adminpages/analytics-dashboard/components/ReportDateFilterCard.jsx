import PropTypes from 'prop-types';

const DEFAULT_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
];

export default function ReportDateFilterCard({
  startDate,
  endDate,
  activePreset,
  onPresetChange,
  onDateRangeChange,
  loading,
  presets = DEFAULT_PRESETS,
  children,
}) {
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase text-gray-500" htmlFor="report-from">
            From
          </label>
          <input
            id="report-from"
            type="date"
            disabled={loading}
            value={startDate}
            max={endDate}
            onChange={handleFromChange}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm disabled:opacity-60 min-w-[10.5rem]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase text-gray-500" htmlFor="report-to">
            To
          </label>
          <input
            id="report-to"
            type="date"
            disabled={loading}
            value={endDate}
            min={startDate}
            onChange={handleToChange}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm disabled:opacity-60 min-w-[10.5rem]"
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-0.5">
          {presets.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={loading}
                onClick={() => onPresetChange(preset.id)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}

ReportDateFilterCard.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  activePreset: PropTypes.string,
  onPresetChange: PropTypes.func.isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  children: PropTypes.node,
};
