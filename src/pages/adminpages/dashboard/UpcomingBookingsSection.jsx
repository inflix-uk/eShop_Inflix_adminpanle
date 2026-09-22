import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const RANGES = [
  { id: "today", label: "Today", summaryKey: "today" },
  { id: "week", label: "This week", summaryKey: "week" },
  { id: "month", label: "Next 30 days", summaryKey: "month" },
  { id: "all", label: "All upcoming", summaryKey: "all" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-gray-100 text-gray-800",
};

const PAYMENT_COLORS = {
  unpaid: "bg-gray-100 text-gray-700",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

function addDays(yyyyMmDd, days) {
  const [year, month, day] = String(yyyyMmDd).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dayLabel(dateStr, today) {
  if (!dateStr) return "Unscheduled";
  if (dateStr === today) return "Today";
  if (today && dateStr === addDays(today, 1)) return "Tomorrow";
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function weekdayLine(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function money(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  return `£${value.toFixed(2)}`;
}

export default function UpcomingBookingsSection({ apiBase }) {
  const [range, setRange] = useState("week");
  const [status, setStatus] = useState("active");
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0, all: 0 });
  const [today, setToday] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiBase}get/booking/upcoming`, {
          params: {
            range,
            status,
            type: type || undefined,
            search: search || undefined,
          },
        });
        if (cancelled) return;
        setBookings(Array.isArray(response.data?.bookings) ? response.data.bookings : []);
        setSummary(response.data?.summary || { today: 0, week: 0, month: 0, all: 0 });
        setToday(response.data?.today || "");
      } catch (error) {
        if (!cancelled) {
          console.log("Error fetching upcoming bookings:", error);
          setBookings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (apiBase) load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, range, status, type, search]);

  const groups = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = booking.date || "unscheduled";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(booking);
    });
    return Array.from(map.entries());
  }, [bookings]);

  return (
    <section className="mt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-blue-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3a.75.75 0 011.5 0v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Bookings</h2>
        </div>
        <Link
          to="/admin/settings/booking?tab=bookings"
          className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Manage all bookings
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ml-1 h-4 w-4">
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5 mb-6">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((item) => {
            const active = range === item.id;
            const count = summary[item.summaryKey] ?? 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setRange(item.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? "bg-white/20 text-white" : "bg-white text-blue-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="sr-only">Search bookings</span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, phone, or booking no."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="sr-only">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="active">Pending and confirmed</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
              <option value="all">All statuses</option>
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All types</option>
              <option value="studio">Studio</option>
              <option value="service">Service</option>
              <option value="consultation">Consultation</option>
              <option value="editing">Editing</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-500">Loading upcoming bookings</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-gray-300 mb-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3a.75.75 0 011.5 0v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 9A.75.75 0 006 8.25h12a.75.75 0 010 1.5H6A.75.75 0 005.25 9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-2xl text-gray-600 font-medium">No upcoming bookings</p>
            <p className="text-gray-400 mt-2">Try another date range or clear the search</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([date, items]) => (
            <div key={date}>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {dayLabel(date === "unscheduled" ? "" : date, today)}
                </h3>
                <p className="text-sm text-gray-500">
                  {date === "unscheduled" ? "" : weekdayLine(date)}
                  {date !== "unscheduled" ? " · " : ""}
                  {items.length} booking{items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="space-y-3">
                {items.map((booking) => {
                  const packageName =
                    booking.packageId?.name || booking.type || "Booking";
                  const timeLabel =
                    booking.startTime && booking.endTime
                      ? `${booking.startTime} – ${booking.endTime}`
                      : booking.bookingMode === "queue"
                        ? "Queue"
                        : "Time not set";
                  return (
                    <article
                      key={booking._id}
                      className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-40 shrink-0 bg-blue-50 px-4 py-4 flex flex-col justify-center">
                          <p className="text-sm font-bold text-blue-800">{timeLabel}</p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                            {booking.type || "booking"}
                          </p>
                        </div>
                        <div className="flex-1 px-4 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-gray-900">
                                {booking.customer?.name || "Guest"}
                              </p>
                              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {booking.bookingNumber}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{packageName}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              {[booking.customer?.email, booking.customer?.phone]
                                .filter(Boolean)
                                .join(" · ") || "No contact details"}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {String(booking.status || "").replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                PAYMENT_COLORS[booking.paymentStatus] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {booking.paymentStatus || "unpaid"}
                            </span>
                            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                              {money(booking.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
