"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getNewsletterEmailTemplates,
  saveNewsletterEmailTemplates,
  getOrderEmailTemplates,
  saveOrderEmailTemplates,
  getEmailBrandingPreview,
} from "./service/emailTemplatesService";
import { openEmailPreviewInNewTab } from "./emailTemplatesPreview";
import { getSiteTheme } from "../../site-wide-color/service/siteThemeService";

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
    fieldKey === "footerLine2" ||
    fieldKey === "footerLine3" ||
    fieldKey === "introParagraph" ||
    fieldKey === "beforeTrackButton" ||
    fieldKey === "closingThanksLine"
  );
}

const SECTION_META = {
  welcome: {
    label: "Welcome email",
    hint: "Newsletter welcome flow",
  },
  hotUk: {
    label: "Hot UK deals",
    hint: "Copy for the Hot UK deals newsletter.",
  },
  orderConfirmation: {
    label: "Order confirmation",
    hint: "Text blocks in the customer order confirmation email (layout stays in the backend).",
  },
  orderStatusCustomer: {
    label: "Order status — customer",
    hint: "Customer-facing shipping and status update email.",
  },
  orderStatusAdmin: {
    label: "Order status — admin",
    hint: "Internal / admin version of the status email.",
  },
  orderShippedCustomer: {
    label: "Order shipped — customer",
    hint: "Sent when an order is marked Shipped. Layout is fixed; you edit headings, labels, and footer lines.",
  },
};

/** Tab ids must match `activeTab` / SECTION_META keys */
const EMAIL_TABS = [
  { id: "welcome", label: "Welcome", group: "Newsletter" },
  { id: "hotUk", label: "Hot UK", group: "Newsletter" },
  { id: "orderConfirmation", label: "Confirmation", group: "Orders" },
  { id: "orderStatusCustomer", label: "Status · customer", group: "Orders" },
  { id: "orderStatusAdmin", label: "Status · admin", group: "Orders" },
  { id: "orderShippedCustomer", label: "Shipped", group: "Orders" },
];

/** Order confirmation HTML — fixed slots (lowercase in template) */
const LAYOUT_TOKENS_ORDER_CONFIRM = [
  { token: "{{ordernumber}}", label: "Order number (layout)" },
  { token: "{{cartItems}}", label: "Cart rows HTML" },
  { token: "{{subtotal}}", label: "Subtotal line" },
  { token: "{{completetotal}}", label: "Grand total" },
];

/** Matches backend `orderConfermation/index.html` {{OC_*}} keys */
const OC_TOKEN_ROWS = [
  { key: "htmlPageTitle", label: "HTML <title>" },
  { key: "heroLineBefore", label: "Hero — before highlight" },
  { key: "heroLineHighlight", label: "Hero — highlight" },
  { key: "heroSubtext", label: "Hero paragraph" },
  { key: "sectionOrderDetails", label: "Section: order details" },
  { key: "sectionItemsOrdered", label: "Section: items" },
  { key: "helpHeading", label: "Help box heading" },
  { key: "helpBeforeEmail", label: "Help — before email" },
  { key: "supportEmail", label: "Support email" },
  { key: "helpAfterEmail", label: "Help — after email" },
  { key: "linkTermsText", label: "Link: Terms" },
  { key: "linkPrivacyText", label: "Link: Privacy" },
  { key: "footerAddressLine", label: "Footer address" },
  { key: "unsubscribeLead", label: "Unsubscribe lead" },
  { key: "unsubscribeLinkText", label: "Unsubscribe link" },
];

/** Order status HTML — {{ST_*}} matches Status tab field keys (not subject pattern) */
const ST_BODY_TOKEN_KEYS = [
  "headerTitle",
  "labelOrderPrefix",
  "labelStatus",
  "labelShippingOption",
  "labelNote",
  "sectionCustomerDetails",
  "labelName",
  "labelEmail",
  "labelPhone",
  "labelAddress",
  "sectionOrderSummary",
  "labelStorage",
  "labelCondition",
  "labelQuantity",
  "labelPrice",
  "labelImei",
  "labelTotalOrderValue",
  "footerLine1",
  "footerLine2",
];

/** Shipped email — {{SH_*}} in server HTML template */
const SH_BODY_TOKEN_KEYS = [
  "htmlPageTitle",
  "headerTitle",
  "greetingPrefix",
  "introParagraph",
  "labelOrderNumber",
  "labelProducts",
  "labelCarrier",
  "labelTracking",
  "beforeTrackButton",
  "trackButtonText",
  "closingThanksLine",
  "footerLine1",
  "footerLine2",
  "footerLine3",
];

const SH_BODY_LABELS = {
  htmlPageTitle: "HTML document title",
  headerTitle: "Green header — main heading",
  greetingPrefix: "Greeting before first name (e.g. Hi)",
  introParagraph: "Paragraph after greeting",
  labelOrderNumber: "Label before order number",
  labelProducts: "Label above product list",
  labelCarrier: "Label before carrier",
  labelTracking: "Label before tracking number",
  beforeTrackButton: "Line above tracking button",
  trackButtonText: "Tracking button text",
  closingThanksLine: "Closing line after button",
  footerLine1: "Footer line 1",
  footerLine2: "Footer line 2",
  footerLine3: "Footer line 3 (optional)",
};

const SHIPPED_DATA_TOKENS = [
  { token: "{{customerFirstName}}", label: "Customer first name" },
  { token: "{{orderNumber}}", label: "Order number" },
  { token: "{{carrier}}", label: "Carrier / provider" },
  { token: "{{trackingNumber}}", label: "Tracking number" },
  { token: "{{trackingUrl}}", label: "Tracking link URL (button href)" },
  { token: "{{productListHtml}}", label: "Product list (HTML, server-built)" },
];

const ST_BODY_LABELS = {
  headerTitle: "Main heading",
  labelOrderPrefix: "Before order #",
  labelStatus: "Status label",
  labelShippingOption: "Shipping label",
  labelNote: "Note label",
  sectionCustomerDetails: "Customer section title",
  labelName: "Name label",
  labelEmail: "Email label",
  labelPhone: "Phone label",
  labelAddress: "Address label",
  sectionOrderSummary: "Summary section title",
  labelStorage: "Storage label",
  labelCondition: "Condition label",
  labelQuantity: "Qty label",
  labelPrice: "Price label",
  labelImei: "IMEI label",
  labelTotalOrderValue: "Total label",
  footerLine1: "Footer line 1",
  footerLine2: "Footer line 2",
};

/** Filled by server in status email HTML (not editable labels) */
const STATUS_DATA_TOKENS = [
  { token: "{{statusColor}}", label: "Badge color" },
  { token: "{{shippingOption}}", label: "Shipping method" },
  { token: "{{note}}", label: "Note body" },
  { token: "{{user.firstname}}", label: "First name" },
  { token: "{{user.lastname}}", label: "Last name" },
  { token: "{{user.email}}", label: "Email" },
  { token: "{{user.phoneNumber}}", label: "Phone" },
  { token: "{{order.totalOrderValue}}", label: "Order total" },
];

function CopyTokenRow({ token, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="flex items-start justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-gray-600">{label}</p>
        <code className="mt-0.5 block break-all font-mono text-[11px] leading-snug text-gray-900">
          {token}
        </code>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
          copied
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white"
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function AsideSection({ title, children }) {
  return (
    <section className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </section>
  );
}

function MergeTagsReferenceAside() {
  return (
    <aside
      className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm lg:min-h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden xl:sticky xl:top-24"
      aria-label="Merge tags reference"
    >
      <div className="border-b border-gray-100 bg-slate-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Merge tags</h2>
        <p className="mt-0.5 text-[11px] text-gray-500">Copy into fields where noted.</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
        <AsideSection title="Newsletter">
          <p className="text-[11px] text-gray-500">No placeholders — plain text only.</p>
        </AsideSection>

        <AsideSection title="Order status · subject">
          <p className="mb-1 text-[10px] text-gray-400">Use in “Email subject pattern” only.</p>
          <CopyTokenRow token="{{orderNumber}}" label="Order number" />
          <CopyTokenRow token="{{status}}" label="Status" />
        </AsideSection>

        <AsideSection title="Order confirmation · layout">
          <p className="mb-1 text-[10px] text-gray-400">Server HTML — not form fields.</p>
          {LAYOUT_TOKENS_ORDER_CONFIRM.map((row) => (
            <CopyTokenRow key={row.token} token={row.token} label={row.label} />
          ))}
        </AsideSection>

        <AsideSection title="Order confirmation · labels">
          <p className="mb-1 text-[10px] text-gray-400">
            In HTML body — same keys as Confirmation tab (not the email subject line).
          </p>
          {OC_TOKEN_ROWS.map((row) => (
            <CopyTokenRow
              key={row.key}
              token={`{{OC_${row.key}}}`}
              label={row.label}
            />
          ))}
        </AsideSection>

        <AsideSection title="Order status · labels">
          <p className="mb-1 text-[10px] text-gray-400">Matches Status tab body fields.</p>
          {ST_BODY_TOKEN_KEYS.map((key) => (
            <CopyTokenRow
              key={key}
              token={`{{ST_${key}}}`}
              label={ST_BODY_LABELS[key] || key}
            />
          ))}
        </AsideSection>

        <AsideSection title="Order status · data">
          <p className="mb-1 text-[10px] text-gray-400">Filled by server in HTML.</p>
          {STATUS_DATA_TOKENS.map((row) => (
            <CopyTokenRow key={row.token} token={row.token} label={row.label} />
          ))}
        </AsideSection>

        <AsideSection title="Order shipped · subject">
          <p className="mb-1 text-[10px] text-gray-400">Use in “Email subject” on the Shipped tab.</p>
          <CopyTokenRow token="{{orderNumber}}" label="Order number" />
        </AsideSection>

        <AsideSection title="Order shipped · labels">
          <p className="mb-1 text-[10px] text-gray-400">Matches Shipped tab fields.</p>
          {SH_BODY_TOKEN_KEYS.map((key) => (
            <CopyTokenRow
              key={key}
              token={`{{SH_${key}}}`}
              label={SH_BODY_LABELS[key] || key}
            />
          ))}
        </AsideSection>

        <AsideSection title="Order shipped · data">
          <p className="mb-1 text-[10px] text-gray-400">Filled by server (do not put in CMS text fields).</p>
          {SHIPPED_DATA_TOKENS.map((row) => (
            <CopyTokenRow key={row.token} token={row.token} label={row.label} />
          ))}
        </AsideSection>
      </div>
    </aside>
  );
}

function FieldEditor({ fieldKey, label, value, onChange }) {
  const isLong = isMultilineField(fieldKey);
  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="border-b border-gray-100 py-4 last:border-0 last:pb-0">
      <label
        htmlFor={`etf-${fieldKey}`}
        className="mb-1.5 block text-sm font-medium text-gray-800"
      >
        {label}
      </label>
      {isLong ? (
        <textarea
          id={`etf-${fieldKey}`}
          rows={5}
          className={`${inputClass} resize-y min-h-[5rem]`}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      ) : (
        <input
          id={`etf-${fieldKey}`}
          type="text"
          className={inputClass}
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
  const [orderShippedCustLabels, setOrderShippedCustLabels] = useState({});
  const [orderConfirmation, setOrderConfirmation] = useState({});
  const [orderStatusCustomer, setOrderStatusCustomer] = useState({});
  const [orderStatusAdmin, setOrderStatusAdmin] = useState({});
  const [orderShippedCustomer, setOrderShippedCustomer] = useState({});
  const [orderNumberPrefix, setOrderNumberPrefix] = useState("Z");
  /** Primary / secondary / typography — fallback when live email branding API is unavailable. */
  const [siteTheme, setSiteTheme] = useState(null);
  /** Logo + exact tints from backend `getEmailBranding()` (matches sent mail). */
  const [emailBranding, setEmailBranding] = useState(null);

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
  const orderShippedCustKeys = useMemo(
    () => Object.keys(orderShippedCustLabels),
    [orderShippedCustLabels]
  );

  const previewOrderExample = `${orderNumberPrefix || "Z"}${new Date().getFullYear()}0001`;

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    const errors = [];
    try {
      const [templateSettled, themeData, brandingData] = await Promise.all([
        Promise.allSettled([
          getNewsletterEmailTemplates(),
          getOrderEmailTemplates(),
        ]),
        getSiteTheme(),
        getEmailBrandingPreview().catch(() => null),
      ]);
      setSiteTheme(themeData);
      setEmailBranding(brandingData);
      const [nlResult, orderResult] = templateSettled;

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
        if (o?.definitions?.orderShippedCustomer?.fieldLabels) {
          setOrderShippedCustLabels(o.definitions.orderShippedCustomer.fieldLabels);
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
        if (o?.templates?.orderShippedCustomer) {
          setOrderShippedCustomer({ ...o.templates.orderShippedCustomer });
        }
        if (o?.orderNumberPrefix != null && o.orderNumberPrefix !== "") {
          setOrderNumberPrefix(String(o.orderNumberPrefix));
        } else {
          setOrderNumberPrefix("Z");
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

  const patchOrderShippedCustomer = (key, val) => {
    setOrderShippedCustomer((prev) => ({ ...prev, [key]: val }));
  };

  const handleOpenPreview = () => {
    openEmailPreviewInNewTab(activeTab, {
      welcome,
      hotUk,
      orderConfirmation,
      orderStatusCustomer,
      orderStatusAdmin,
      orderShippedCustomer,
      previewOrderExample,
      siteTheme,
      emailBranding,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(40);
    try {
      await saveNewsletterEmailTemplates({ welcome, hotUkDeals: hotUk });
      await saveOrderEmailTemplates({
        orderNumberPrefix,
        orderConfirmation,
        orderStatusCustomer,
        orderStatusAdmin,
        orderShippedCustomer,
      });
      await loadData();
      setNotice({
        show: true,
        message: "Saved.",
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

  const renderFields = (keys, labels, values, onPatch) => {
    if (keys.length === 0) {
      return (
        <p className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No fields for this section.
        </p>
      );
    }
    return (
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white px-4 sm:px-5">
        {keys.map((key) => (
          <FieldEditor
            key={key}
            fieldKey={key}
            label={labels[key] || key}
            value={values[key] ?? ""}
            onChange={onPatch}
          />
        ))}
      </div>
    );
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

      <div className={`min-h-screen bg-gray-50/80 lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">
            <header className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Email templates
              </h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Edit wording only. Email layout and order data still come from the server.
              </p>
            </header>

            {notice.show && (
              <div
                className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                  notice.type === "success"
                    ? "border-green-200 bg-green-50 text-green-900"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <span>{notice.message}</span>
                <button
                  type="button"
                  onClick={() => setNotice((n) => ({ ...n, show: false }))}
                  className="shrink-0 rounded-md p-1 text-current opacity-70 hover:opacity-100"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">
                Loading…
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] 2xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
              <form
                onSubmit={handleSubmit}
                className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 min-w-0"
              >
                {/* Order number — one compact row */}
                <section aria-labelledby="order-prefix-heading">
                  <h2
                    id="order-prefix-heading"
                    className="text-xs font-semibold uppercase tracking-wide text-gray-400"
                  >
                    New order numbers
                  </h2>
                  <div className="mt-3 flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600">
                        Prefix for <strong>new</strong> orders only. Example:{" "}
                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-gray-800 ring-1 ring-gray-200">
                          {previewOrderExample}
                        </code>
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Letters and numbers, up to 4 characters. Old orders are not renamed.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <label htmlFor="orderNumberPrefix" className="sr-only">
                        Order number prefix
                      </label>
                      <input
                        id="orderNumberPrefix"
                        type="text"
                        maxLength={4}
                        autoComplete="off"
                        title="Order number prefix"
                        className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center font-mono text-sm font-semibold uppercase tracking-wider text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={orderNumberPrefix}
                        onChange={(e) => {
                          const v = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 4);
                          setOrderNumberPrefix(v);
                        }}
                        placeholder="Z"
                      />
                    </div>
                  </div>
                </section>

                {/* Tabs + fields */}
                <section aria-labelledby="section-heading">
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2
                      id="section-heading"
                      className="text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                      Email copy
                    </h2>
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      disabled={loading}
                      aria-label="Open email preview for the selected tab in a new tab"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Preview current tab
                    </button>
                  </div>
                  <div
                    role="tablist"
                    aria-label="Template sections"
                    className="mt-3 flex flex-wrap gap-1.5 rounded-xl border border-gray-200 bg-gray-50/90 p-1.5"
                  >
                      {EMAIL_TABS.map((t, i) => {
                        const prevGroup = i > 0 ? EMAIL_TABS[i - 1].group : null;
                        const showDivider = prevGroup && prevGroup !== t.group;
                        return (
                          <Fragment key={t.id}>
                            {showDivider && (
                              <span
                                className="mx-0.5 hidden h-9 w-px shrink-0 self-center bg-gray-200 sm:block"
                                aria-hidden
                              />
                            )}
                            <button
                              type="button"
                              role="tab"
                              aria-selected={activeTab === t.id}
                              id={`email-tab-${t.id}`}
                              onClick={() => setActiveTab(t.id)}
                              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition sm:min-w-[7.5rem] sm:text-center ${
                                activeTab === t.id
                                  ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/40"
                                  : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                              }`}
                            >
                              <span
                                className={`block text-[10px] font-normal uppercase tracking-wide ${
                                  activeTab === t.id ? "text-blue-100" : "text-gray-400"
                                }`}
                              >
                                {t.group}
                              </span>
                              <span
                                className={`block truncate ${
                                  activeTab === t.id ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {t.label}
                              </span>
                            </button>
                          </Fragment>
                        );
                      })}
                  </div>
                  <p
                    id={`email-tabpanel-${activeTab}-hint`}
                    className="mb-5 mt-4 text-sm text-gray-500"
                  >
                    {SECTION_META[activeTab]?.hint}
                  </p>

                  <div
                    role="tabpanel"
                    aria-labelledby={`email-tab-${activeTab}`}
                    aria-describedby={`email-tabpanel-${activeTab}-hint`}
                  >
                    {activeTab === "welcome" &&
                      renderFields(welcomeKeys, welcomeLabels, welcome, patchWelcome)}
                    {activeTab === "hotUk" && renderFields(hotKeys, hotLabels, hotUk, patchHot)}
                    {activeTab === "orderConfirmation" &&
                      renderFields(orderConfKeys, orderConfLabels, orderConfirmation, patchOrderConf)}
                    {activeTab === "orderStatusCustomer" &&
                      renderFields(
                        orderStatusCustKeys,
                        orderStatusCustLabels,
                        orderStatusCustomer,
                        patchOrderStatusCust
                      )}
                    {activeTab === "orderStatusAdmin" &&
                      renderFields(
                        orderStatusAdminKeys,
                        orderStatusAdminLabels,
                        orderStatusAdmin,
                        patchOrderStatusAdmin
                      )}
                    {activeTab === "orderShippedCustomer" &&
                      renderFields(
                        orderShippedCustKeys,
                        orderShippedCustLabels,
                        orderShippedCustomer,
                        patchOrderShippedCustomer
                      )}
                  </div>
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                  <p className="text-center text-xs text-gray-400 sm:mr-auto sm:text-left">
                    One save updates newsletters, order copy, and the order prefix.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isSubmitting ? "Saving…" : "Save all changes"}
                  </button>
                </div>
              </form>
              <MergeTagsReferenceAside />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
