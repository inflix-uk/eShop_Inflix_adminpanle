import PropTypes from "prop-types";

export default function DonutChart({ segments, centerLabel = "Total" }) {
  if (!segments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-sm text-gray-500">
        No data for this period
      </div>
    );
  }

  let offset = 0;
  const gradientParts = segments.map((seg) => {
    const start = offset;
    offset += seg.value;
    return `${seg.color} ${start}% ${offset}%`;
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative h-44 w-44 rounded-full"
        style={{
          background: `conic-gradient(${gradientParts.join(", ")})`,
        }}
      >
        <div className="absolute inset-6 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">{centerLabel}</span>
          <span className="text-lg font-semibold text-gray-900">100%</span>
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-600">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span>
              {seg.label} ({seg.value}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

DonutChart.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  centerLabel: PropTypes.string,
};
