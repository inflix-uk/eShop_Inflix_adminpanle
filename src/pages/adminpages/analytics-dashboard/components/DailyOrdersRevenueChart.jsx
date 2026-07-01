import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { formatShortChartDay } from "../utils/analyticsFormatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return dt.toISOString().slice(0, 10);
}

function fillDailyGaps(rows) {
  if (!rows.length) return rows;

  const sorted = [...rows].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (sorted.length === 1) return sorted;

  const byDate = new Map(sorted.map((row) => [row.date, row]));
  const filled = [];
  let cursor = sorted[0].date;
  const end = sorted[sorted.length - 1].date;

  while (cursor <= end) {
    const existing = byDate.get(cursor);
    filled.push(
      existing || {
        date: cursor,
        day: formatShortChartDay(cursor),
        orders: 0,
        revenue: 0,
      }
    );
    cursor = addDaysYmd(cursor, 1);
  }

  return filled;
}

function niceAxisMax(value, tickCount = 5) {
  if (value <= 0) return tickCount;
  const roughStep = value / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = Math.ceil(roughStep / magnitude) * magnitude;
  return step * tickCount;
}

export default function DailyOrdersRevenueChart({ data }) {
  const chartRows = useMemo(() => fillDailyGaps(data), [data]);

  if (!chartRows.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-500">
        No daily data for this period
      </div>
    );
  }

  const maxRevenue = Math.max(...chartRows.map((row) => row.revenue || 0), 0);
  const maxOrders = Math.max(...chartRows.map((row) => row.orders || 0), 0);
  const revenueAxisMax = niceAxisMax(maxRevenue);
  const ordersAxisMax = niceAxisMax(maxOrders);

  const chartData = {
    labels: chartRows.map((row) => row.day),
    datasets: [
      {
        label: "Orders",
        data: chartRows.map((row) => row.orders || 0),
        backgroundColor: "#3b82f6",
        borderRadius: 3,
        yAxisID: "yOrders",
        maxBarThickness: 28,
      },
      {
        label: "Revenue (£)",
        data: chartRows.map((row) => row.revenue || 0),
        backgroundColor: "#2dd4bf",
        borderRadius: 3,
        yAxisID: "yRevenue",
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 18,
          color: "#4b5563",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Orders & revenue trend",
        color: "#374151",
        font: { size: 14, weight: "500" },
        padding: { bottom: 4 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        callbacks: {
          label(context) {
            const value = Number(context.raw ?? 0);
            if (context.dataset.yAxisID === "yRevenue") {
              return `Revenue: £${value.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            }
            return `Orders: ${value.toLocaleString("en-GB")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: "#e5e7eb" },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
          maxRotation: chartRows.length > 10 ? 45 : 0,
          minRotation: chartRows.length > 10 ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: chartRows.length > 20 ? 15 : undefined,
        },
      },
      yRevenue: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        max: revenueAxisMax || undefined,
        border: { display: false },
        grid: { color: "#f3f4f6" },
        ticks: {
          color: "#9ca3af",
          font: { size: 10 },
          padding: 6,
          callback: (value) =>
            value >= 1000 ? `£${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `£${value}`,
        },
      },
      yOrders: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        max: ordersAxisMax || undefined,
        border: { display: false },
        grid: { drawOnChartArea: false },
        ticks: {
          color: "#9ca3af",
          font: { size: 10 },
          padding: 6,
          stepSize: ordersAxisMax <= 10 ? 1 : undefined,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full min-w-0">
      <Bar data={chartData} options={options} />
    </div>
  );
}

DailyOrdersRevenueChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
