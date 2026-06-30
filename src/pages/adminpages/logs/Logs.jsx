import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { fetchAuditLogs, fetchSlowestRoutes } from "./service/auditLogsService";

const LEVEL_OPTIONS = ["", "info", "warn", "error", "critical"];

function levelBadgeClass(level) {
  switch (level) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "error":
      return "bg-orange-100 text-orange-800";
    case "warn":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function Logs() {
  const [selectedPage] = useState("logs");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [slowest, setSlowest] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [route, setRoute] = useState("");
  const [filters, setFilters] = useState({ level: "", category: "", route: "" });

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, slowRes] = await Promise.all([
        fetchAuditLogs({
          page,
          limit: 50,
          ...(filters.level ? { level: filters.level } : {}),
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.route ? { route: filters.route } : {}),
        }),
        fetchSlowestRoutes({ hours: 24, limit: 10, sort: "avg" }),
      ]);
      setLogs(logsRes.data || []);
      setTotal(logsRes.total || 0);
      setTotalPages(logsRes.totalPages || 1);
      setSlowest(slowRes.data || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      toast.error(error.message || "Failed to load logs");
      setLogs([]);
      setSlowest([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = (e) => {
    e.preventDefault();
    setFilters({ level, category, route });
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Logs | Admin</title>
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

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Audit logs</h1>
              <p className="mt-2 text-gray-600">
                Request, error, and performance events from the backend.
              </p>
            </div>

            <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Slowest routes (24h)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Method</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Route</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Hits</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Avg ms</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Max ms</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {slowest.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {loading ? "Loading…" : "No route data yet."}
                        </td>
                      </tr>
                    ) : (
                      slowest.map((row) => (
                        <tr key={`${row.method}-${row.route}`}>
                          <td className="px-4 py-3 font-mono text-xs">{row.method || "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs break-all">{row.route}</td>
                          <td className="px-4 py-3 text-right">{row.count}</td>
                          <td className="px-4 py-3 text-right">{row.avgMs}</td>
                          <td className="px-4 py-3 text-right">{row.maxMs}</td>
                          <td className="px-4 py-3 text-right">{row.errors}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent events</h2>
                  <p className="text-sm text-gray-500">{total} total entries</p>
                </div>
                <form onSubmit={applyFilters} className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="rounded-md border border-gray-300 py-2 px-2 text-sm"
                    >
                      <option value="">All</option>
                      {LEVEL_OPTIONS.filter(Boolean).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="request"
                      className="rounded-md border border-gray-300 py-2 px-2 text-sm w-32"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Route</label>
                    <input
                      type="text"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      placeholder="/api/..."
                      className="rounded-md border border-gray-300 py-2 px-2 text-sm w-40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-secondary"
                  >
                    Filter
                  </button>
                </form>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Time</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Level</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Route</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">ms</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          Loading…
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No logs found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((row) => (
                        <tr key={row._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${levelBadgeClass(row.level)}`}
                            >
                              {row.level || "info"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{row.category || "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[12rem] truncate">
                            {row.action || "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[14rem] truncate">
                            {row.route || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">{row.statusCode ?? "—"}</td>
                          <td className="px-4 py-3 text-right">{row.durationMs ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-700 max-w-[18rem] truncate" title={row.message}>
                            {row.message || row.error?.message || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
