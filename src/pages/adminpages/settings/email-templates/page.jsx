"use client";

import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getNewsletterEmailTemplates,
  saveNewsletterEmailTemplates,
} from "./service/emailTemplatesService";

function FieldEditor({ fieldKey, label, value, onChange }) {
  const isLong =
    fieldKey === "subject" ||
    fieldKey === "bodyParagraph1" ||
    fieldKey.startsWith("bodyLine") ||
    fieldKey === "sectionHeading" ||
    fieldKey === "headerSubtitle" ||
    fieldKey === "headerTitle" ||
    fieldKey === "urgencyLine";
  return (
    <div className="mb-4">
      <label
        htmlFor={`etf-${fieldKey}`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {isLong ? (
        <textarea
          id={`etf-${fieldKey}`}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      ) : (
        <input
          id={`etf-${fieldKey}`}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      )}
    </div>
  );
}

export default function EmailTemplatesSettings() {
  const [selectedPage, setSelectedPage] = useState("email-template-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [welcomeLabels, setWelcomeLabels] = useState({});
  const [hotLabels, setHotLabels] = useState({});
  const [welcome, setWelcome] = useState({});
  const [hotUk, setHotUk] = useState({});

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState({ show: false, message: "", type: "success" });

  const welcomeKeys = useMemo(() => Object.keys(welcomeLabels), [welcomeLabels]);
  const hotKeys = useMemo(() => Object.keys(hotLabels), [hotLabels]);

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getNewsletterEmailTemplates();
      if (data?.definitions?.welcome?.fieldLabels) {
        setWelcomeLabels(data.definitions.welcome.fieldLabels);
      }
      if (data?.definitions?.hotUkDeals?.fieldLabels) {
        setHotLabels(data.definitions.hotUkDeals.fieldLabels);
      }
      if (data?.templates?.welcome) {
        setWelcome({ ...data.templates.welcome });
      }
      if (data?.templates?.hotUkDeals) {
        setHotUk({ ...data.templates.hotUkDeals });
      }
    } catch (e) {
      console.error(e);
      setNotice({
        show: true,
        message: e?.message || "Could not load email templates",
        type: "error",
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const patchWelcome = (key, val) => {
    setWelcome((prev) => ({ ...prev, [key]: val }));
  };

  const patchHot = (key, val) => {
    setHotUk((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(40);
    try {
      await saveNewsletterEmailTemplates({ welcome, hotUkDeals: hotUk });
      await loadData();
      setNotice({
        show: true,
        message: "Email templates saved.",
        type: "success",
      });
      setTimeout(() => setNotice((n) => ({ ...n, show: false })), 3500);
    } catch (err) {
      setNotice({
        show: true,
        message: err?.message || "Save failed",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Email templates - Admin</title>
      </Helmet>
      <LoadingBar
        color="#16a34a"
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
          <div className="px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Email templates</h1>
              <p className="mt-2 text-gray-600 text-sm">
                Newsletter emails only: edit wording here. Design and HTML structure stay
                in the backend.
              </p>
            </div>

            {notice.show && (
              <div
                className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                  notice.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {notice.message}
              </div>
            )}

            {loading ? (
              <div className="bg-white shadow rounded-lg px-6 py-12 text-center text-gray-500 text-sm">
                Loading…
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow rounded-lg overflow-hidden px-6 py-6"
              >
                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab("welcome")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "welcome"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Welcome (5% off)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("hotUk")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "hotUk"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Hot UK Deals
                  </button>
                </div>

                {activeTab === "welcome" && (
                  <div>
                    {welcomeKeys.map((key) => (
                      <FieldEditor
                        key={key}
                        fieldKey={key}
                        label={welcomeLabels[key] || key}
                        value={welcome[key] ?? ""}
                        onChange={patchWelcome}
                      />
                    ))}
                  </div>
                )}

                {activeTab === "hotUk" && (
                  <div>
                    {hotKeys.map((key) => (
                      <FieldEditor
                        key={key}
                        fieldKey={key}
                        label={hotLabels[key] || key}
                        value={hotUk[key] ?? ""}
                        onChange={patchHot}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
