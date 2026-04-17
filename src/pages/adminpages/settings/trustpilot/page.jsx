"use client";

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getTrustpilotData,
  saveTrustpilotData,
} from "./service/trustpilotService";

export default function TrustpilotSettings() {
  const [selectedPage, setSelectedPage] = useState("trustpilot-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Trustpilot scripts for different locations
  const [productPageTopScript, setProductPageTopScript] = useState("");
  const [productPageScript, setProductPageScript] = useState("");
  const [homePageScript, setHomePageScript] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getTrustpilotData();
      if (data) {
        setProductPageTopScript(data.productPageTopScript || "");
        setProductPageScript(data.productPageScript || "");
        setHomePageScript(data.homePageScript || "");
        setUpdatedAt(data.updatedAt || null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);

    try {
      const trustpilotData = {
        productPageTopScript,
        productPageScript,
        homePageScript,
      };

      await saveTrustpilotData(trustpilotData);
      await loadData();
      setNotification({
        show: true,
        message: "Trustpilot settings saved successfully!",
        type: "success"
      });
      setTimeout(() => setNotification({ ...notification, show: false }), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setNotification({
        show: true,
        message: "Failed to save Trustpilot settings",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Trustpilot Settings - Admin</title>
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
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Trustpilot Settings
              </h1>
              <p className="mt-2 text-gray-600">
                Manage Trustpilot widget scripts for different page locations
              </p>
              {updatedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Notification */}
            {notification.show && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  notification.type === "success"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {notification.message}
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="space-y-8">
                    {/* Product Page Top Section */}
                    <div className="border-b border-gray-200 pb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Product Page (Top)
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        This script will appear after the product name on top of product pages
                      </p>
                      <div>
                        <label
                          htmlFor="productPageTopScript"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Trustpilot Script
                        </label>
                        <textarea
                          id="productPageTopScript"
                          name="productPageTopScript"
                          rows={8}
                          value={productPageTopScript}
                          onChange={(e) => setProductPageTopScript(e.target.value)}
                          placeholder="Paste your Trustpilot widget script here..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-y"
                        />
                      </div>
                    </div>

                    {/* Product Page Section */}
                    <div className="border-b border-gray-200 pb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Product Page (Bottom)
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        This script will appear before "Recently Viewed Products" section on product pages
                      </p>
                      <div>
                        <label
                          htmlFor="productPageScript"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Trustpilot Script
                        </label>
                        <textarea
                          id="productPageScript"
                          name="productPageScript"
                          rows={8}
                          value={productPageScript}
                          onChange={(e) => setProductPageScript(e.target.value)}
                          placeholder="Paste your Trustpilot widget script here..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-y"
                        />
                      </div>
                    </div>

                    {/* Home Page Section */}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Home Page
                      </h2>
                      <p className="text-sm text-gray-500 mb-4">
                        This script will appear after "Subscribe To Newsletter" section on the homepage
                      </p>
                      <div>
                        <label
                          htmlFor="homePageScript"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Trustpilot Script
                        </label>
                        <textarea
                          id="homePageScript"
                          name="homePageScript"
                          rows={8}
                          value={homePageScript}
                          onChange={(e) => setHomePageScript(e.target.value)}
                          placeholder="Paste your Trustpilot widget script here..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Trustpilot Settings"
                      )}
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
