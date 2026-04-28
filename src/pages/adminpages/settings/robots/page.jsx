"use client";

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getRobotsSettings,
  saveRobotsSettings,
} from "./service/robotsSettingsService";

export default function RobotsSettings() {
  const [selectedPage, setSelectedPage] = useState("robots-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getRobotsSettings();
      if (data) {
        setContent(data.content || "");
        setUpdatedAt(data.updatedAt || null);
      }
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(55);
    try {
      const saved = await saveRobotsSettings({ content });
      if (saved) {
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
        <title>Robots.txt - Admin</title>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Robots.txt</h1>
              <p className="mt-2 text-gray-600">
                Manage raw robots.txt content served on the storefront.
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
                  <label
                    htmlFor="robots-content"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    robots.txt content
                  </label>
                  <textarea
                    id="robots-content"
                    rows={18}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="User-agent: *&#10;Allow: /"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-y"
                  />

                  <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save robots.txt"}
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
