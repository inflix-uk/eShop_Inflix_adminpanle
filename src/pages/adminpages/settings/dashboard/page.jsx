import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getDashboardSettings,
  saveDashboardSettings,
} from "./service/dashboardSettingsService";

const OPTIONS = [
  {
    id: "orders",
    title: "Orders",
    subtitle: "Top Selling Products",
    description:
      "Keep the current dashboard block: best-selling products, variants sold, and total sales.",
  },
  {
    id: "bookings",
    title: "Upcoming Bookings",
    subtitle: "Studio schedule",
    description:
      "Replace that block with upcoming bookings, grouped by day, with filters for date, status, and type.",
  },
];

export default function DashboardSettings() {
  const [selectedPage, setSelectedPage] = useState("dashboard-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [widget, setWidget] = useState("orders");
  const [savedWidget, setSavedWidget] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setProgress(30);
      try {
        const data = await getDashboardSettings();
        if (data?.widget) {
          setWidget(data.widget);
          setSavedWidget(data.widget);
          setUpdatedAt(data.updatedAt || null);
        }
      } finally {
        setLoading(false);
        setProgress(100);
      }
    };
    void load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(55);
    try {
      const saved = await saveDashboardSettings({ widget });
      if (saved) {
        setSavedWidget(saved.widget);
        setUpdatedAt(saved.updatedAt || null);
      }
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Settings - Admin</title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

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
          setSelectedPage={setSelectedPage}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Settings</h1>
              <p className="mt-2 text-gray-600">
                Choose what appears under the summary cards on the admin dashboard.
                Only one option is shown at a time.
              </p>
              {updatedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700 mb-4">
                      Dashboard section
                    </legend>
                    <div className="space-y-3">
                      {OPTIONS.map((option) => {
                        const selected = widget === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${
                              selected
                                ? "border-primary bg-blue-50 ring-2 ring-primary"
                                : "border-gray-200 bg-white hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="dashboard-widget"
                              value={option.id}
                              checked={selected}
                              onChange={() => setWidget(option.id)}
                              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-semibold text-gray-900">
                                  {option.title}
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wide text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                  {option.subtitle}
                                </span>
                                {savedWidget === option.id && (
                                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                    Currently showing
                                  </span>
                                )}
                              </span>
                              <span className="block mt-1 text-sm text-gray-600">
                                {option.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || widget === savedWidget}
                      className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save dashboard"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
