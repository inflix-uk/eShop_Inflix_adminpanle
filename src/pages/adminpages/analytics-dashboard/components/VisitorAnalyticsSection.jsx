import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import DailyOrdersRevenueChart from "./DailyOrdersRevenueChart";

function DonutChart({ segments, centerLabel = "Sessions" }) {
  const [activeLabel, setActiveLabel] = useState(null);

  const totalSessions = useMemo(
    () => segments.reduce((sum, seg) => sum + (seg.sessions ?? 0), 0),
    [segments]
  );

  if (!segments.length || totalSessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-500">
        No data for this period
      </div>
    );
  }

  let offset = 0;
  const gradientParts = segments.map((seg) => {
    const pct = totalSessions > 0 ? (seg.sessions / totalSessions) * 100 : 0;
    const start = offset;
    offset += pct;
    return `${seg.color} ${start}% ${offset}%`;
  });

  const activeSegment = segments.find((seg) => seg.label === activeLabel);

  return (
    <div className="flex flex-col items-center py-2">
      <div
        className="relative h-52 w-52 rounded-full"
        style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
        onMouseLeave={() => setActiveLabel(null)}
      >
        {segments.map((seg, index) => {
          const startPct = segments
            .slice(0, index)
            .reduce(
              (sum, item) =>
                sum + (totalSessions > 0 ? (item.sessions / totalSessions) * 100 : 0),
              0
            );
          const slicePct = totalSessions > 0 ? (seg.sessions / totalSessions) * 100 : 0;
          const midAngle = ((startPct + slicePct / 2) / 100) * 360 - 90;
          const rad = (midAngle * Math.PI) / 180;
          const left = 50 + Math.cos(rad) * 34;
          const top = 50 + Math.sin(rad) * 34;

          return (
            <button
              key={seg.label}
              type="button"
              aria-label={`${seg.label}: ${seg.sessions}`}
              className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
              style={{ left: `${left}%`, top: `${top}%` }}
              onMouseEnter={() => setActiveLabel(seg.label)}
              onFocus={() => setActiveLabel(seg.label)}
              onBlur={() => setActiveLabel(null)}
            />
          );
        })}

        <div className="absolute inset-8 rounded-full bg-white flex flex-col items-center justify-center text-center px-2">
          {activeSegment ? (
            <>
              <span className="text-xs text-gray-500">{activeSegment.label}</span>
              <span className="text-lg font-semibold text-gray-900 tabular-nums">
                {activeSegment.sessions?.toLocaleString("en-GB")}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500">{centerLabel}</span>
              <span className="text-lg font-semibold text-gray-900 tabular-nums">
                {totalSessions.toLocaleString("en-GB")}
              </span>
            </>
          )}
        </div>

        {activeSegment ? (
          <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md pointer-events-none">
            {activeSegment.label}: {activeSegment.sessions?.toLocaleString("en-GB")}
          </div>
        ) : null}
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span>{seg.label}</span>
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
      sessions: PropTypes.number,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  centerLabel: PropTypes.string,
};

export default function VisitorAnalyticsSection({ visitorsByDevice, dailyOrdersRevenue }) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Visitor analytics</h2>

      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <h3 className="text-base font-semibold text-gray-900">Visitors by device</h3>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center min-h-[20rem]">
            {visitorsByDevice.unavailable ? (
              <p className="text-sm text-gray-500 text-center">{visitorsByDevice.emptyMessage}</p>
            ) : (
              <DonutChart segments={visitorsByDevice.segments} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <h3 className="text-base font-semibold text-gray-900">Daily orders &amp; revenue</h3>
          </div>
          <div className="p-5 flex-1 min-w-0">
            <DailyOrdersRevenueChart data={dailyOrdersRevenue} />
          </div>
        </div>
      </div>
    </section>
  );
}

VisitorAnalyticsSection.propTypes = {
  visitorsByDevice: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    emptyMessage: PropTypes.string.isRequired,
    segments: PropTypes.array,
  }).isRequired,
  dailyOrdersRevenue: PropTypes.array.isRequired,
};
