"use client";

import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getNewsletterEmailTemplates,
  saveNewsletterEmailTemplates,
  getOrderEmailTemplates,
  saveOrderEmailTemplates,
} from "./service/emailTemplatesService";

function isMultilineField(fieldKey) {
  return (
    fieldKey === "subject" ||
    fieldKey === "bodyParagraph1" ||
    fieldKey.startsWith("bodyLine") ||
    fieldKey === "sectionHeading" ||
    fieldKey === "headerSubtitle" ||
    fieldKey === "headerTitle" ||
    fieldKey === "urgencyLine" ||
    fieldKey === "emailSubject" ||
    fieldKey === "emailSubjectPattern" ||
    fieldKey === "htmlPageTitle" ||
    fieldKey.startsWith("hero") ||
    fieldKey === "heroSubtext" ||
    fieldKey.startsWith("help") ||
    fieldKey.includes("footer") ||
    fieldKey === "footerAddressLine" ||
    fieldKey === "footerLine1" ||
    fieldKey === "footerLine2"
  );
}

function FieldEditor({ fieldKey, label, value, onChange }) {
  const isLong = isMultilineField(fieldKey);
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

  const [orderConfLabels, setOrderConfLabels] = useState({});
  const [orderStatusCustLabels, setOrderStatusCustLabels] = useState({});
  const [orderStatusAdminLabels, setOrderStatusAdminLabels] = useState({});
  const [orderConfirmation, setOrderConfirmation] = useState({});
  const [orderStatusCustomer, setOrderStatusCustomer] = useState({});
  const [orderStatusAdmin, setOrderStatusAdmin] = useState({});

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState({ show: false, message: "", type: "success" });

  const welcomeKeys = useMemo(() => Object.keys(welcomeLabels), [welcomeLabels]);
  const hotKeys = useMemo(() => Object.keys(hotLabels), [hotLabels]);
  const orderConfKeys = useMemo(() => Object.keys(orderConfLabels), [orderConfLabels]);
  const orderStatusCustKeys = useMemo(
    () => Object.keys(orderStatusCustLabels),
    [orderStatusCustLabels]
  );
  const orderStatusAdminKeys = useMemo(
    () => Object.keys(orderStatusAdminLabels),
    [orderStatusAdminLabels]
  );

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    const errors = [];
    try {
      const [nlResult, orderResult] = await Promise.allSettled([
        getNewsletterEmailTemplates(),
        getOrderEmailTemplates(),
      ]);

      if (nlResult.status === "fulfilled" && nlResult.value) {
        const data = nlResult.value;
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
      } else {
        errors.push("Newsletter templates could not be loaded.");
      }

      if (orderResult.status === "fulfilled" && orderResult.value) {
        const o = orderResult.value;
        if (o?.definitions?.orderConfirmation?.fieldLabels) {
          setOrderConfLabels(o.definitions.orderConfirmation.fieldLabels);
        }
        if (o?.definitions?.orderStatusCustomer?.fieldLabels) {
          setOrderStatusCustLabels(o.definitions.orderStatusCustomer.fieldLabels);
        }
        if (o?.definitions?.orderStatusAdmin?.fieldLabels) {
          setOrderStatusAdminLabels(o.definitions.orderStatusAdmin.fieldLabels);
        }
        if (o?.templates?.orderConfirmation) {
          setOrderConfirmation({ ...o.templates.orderConfirmation });
        }
        if (o?.templates?.orderStatusCustomer) {
          setOrderStatusCustomer({ ...o.templates.orderStatusCustomer });
        }
        if (o?.templates?.orderStatusAdmin) {
          setOrderStatusAdmin({ ...o.templates.orderStatusAdmin });
        }
      } else {
        errors.push("Order email templates could not be loaded.");
      }

      if (errors.length) {
        setNotice({
          show: true,
          message: errors.join(" "),
          type: "error",
        });
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

  const patchOrderConf = (key, val) => {
    setOrderConfirmation((prev) => ({ ...prev, [key]: val }));
  };

  const patchOrderStatusCust = (key, val) => {
    setOrderStatusCustomer((prev) => ({ ...prev, [key]: val }));
  };

  const patchOrderStatusAdmin = (key, val) => {
    setOrderStatusAdmin((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(40);
    try {
      await saveNewsletterEmailTemplates({ welcome, hotUkDeals: hotUk });
      await saveOrderEmailTemplates({
        orderConfirmation,
        orderStatusCustomer,
        orderStatusAdmin,
      });
      await loadData();
      setNotice({
        show: true,
        message: "All email templates saved.",
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

  const tabBtn = (id, label) => (
    <button
      type="button"
      key={id}
      onClick={() => setActiveTab(id)}
      className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
        activeTab === id
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

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
                Edit static wording for newsletter and order emails. Layout, styles, and
                dynamic order data stay in the backend HTML templates.
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
                <div className="overflow-x-auto border-b border-gray-200 pb-4 mb-6 -mx-1 px-1">
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {tabBtn("welcome", "Newsletter · Welcome")}
                    {tabBtn("hotUk", "Newsletter · Hot UK")}
                    {tabBtn("orderConfirmation", "Order · Confirmation")}
                    {tabBtn("orderStatusCustomer", "Order · Status (customer)")}
                    {tabBtn("orderStatusAdmin", "Order · Status (admin)")}
                  </div>
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

                {activeTab === "orderConfirmation" && (
                  <div>
                    {orderConfKeys.length === 0 ? (
                      <p className="text-sm text-gray-500">No fields loaded.</p>
                    ) : (
                      orderConfKeys.map((key) => (
                        <FieldEditor
                          key={key}
                          fieldKey={key}
                          label={orderConfLabels[key] || key}
                          value={orderConfirmation[key] ?? ""}
                          onChange={patchOrderConf}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "orderStatusCustomer" && (
                  <div>
                    {orderStatusCustKeys.length === 0 ? (
                      <p className="text-sm text-gray-500">No fields loaded.</p>
                    ) : (
                      orderStatusCustKeys.map((key) => (
                        <FieldEditor
                          key={key}
                          fieldKey={key}
                          label={orderStatusCustLabels[key] || key}
                          value={orderStatusCustomer[key] ?? ""}
                          onChange={patchOrderStatusCust}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "orderStatusAdmin" && (
                  <div>
                    {orderStatusAdminKeys.length === 0 ? (
                      <p className="text-sm text-gray-500">No fields loaded.</p>
                    ) : (
                      orderStatusAdminKeys.map((key) => (
                        <FieldEditor
                          key={key}
                          fieldKey={key}
                          label={orderStatusAdminLabels[key] || key}
                          value={orderStatusAdmin[key] ?? ""}
                          onChange={patchOrderStatusAdmin}
                        />
                      ))
                    )}
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
