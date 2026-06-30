import PropTypes from "prop-types";

export default function BarChart({ data, valueKey, secondaryKey, labelKey = "day" }) {
  if (!data.length) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-gray-500">
        No daily data for this period
      </div>
    );
  }

  const maxPrimary = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const maxSecondary = secondaryKey
    ? Math.max(...data.map((d) => d[secondaryKey] || 0), 1)
    : 1;

  return (
    <div className="h-56 flex items-end justify-between gap-2 px-2 pt-4">
      {data.map((item) => {
        const primaryH = `${((item[valueKey] || 0) / maxPrimary) * 100}%`;
        const secondaryH = secondaryKey
          ? `${((item[secondaryKey] || 0) / maxSecondary) * 100}%`
          : null;
        return (
          <div key={item[labelKey] || item.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-full h-40 flex items-end justify-center gap-1">
              <div
                className="w-3 sm:w-4 rounded-t bg-blue-500/90"
                style={{ height: primaryH }}
                title={`Orders: ${item[valueKey]}`}
              />
              {secondaryKey && (
                <div
                  className="w-3 sm:w-4 rounded-t bg-teal-400/90"
                  style={{ height: secondaryH }}
                  title={`Revenue: ${item[secondaryKey]}`}
                />
              )}
            </div>
            <span className="text-[11px] text-gray-500 truncate w-full text-center">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  valueKey: PropTypes.string.isRequired,
  secondaryKey: PropTypes.string,
  labelKey: PropTypes.string,
};
