"use client";

import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getSiteScriptsSettings,
  saveSiteScriptsSettings,
} from "./service/scriptsSettingsService";

const PLACEMENT_OPTIONS = [
  { value: "head", label: "Head" },
  { value: "bodyStart", label: "Body (top)" },
  { value: "bodyEnd", label: "Body (bottom)" },
];

function newCustomRow() {
  return {
    clientKey:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    _id: undefined,
    label: "",
    placement: "head",
    content: "",
  };
}

export default function ScriptsSettings() {
  const [selectedPage, setSelectedPage] = useState("scripts-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [semrushScript, setSemrushScript] = useState("");
  const [ahrefsScript, setAhrefsScript] = useState("");
  const [googleSearchConsoleScript, setGoogleSearchConsoleScript] =
    useState("");
  const [gtmContainerId, setGtmContainerId] = useState("");
  const [googleAdsConversionId, setGoogleAdsConversionId] = useState("");
  const [customScripts, setCustomScripts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const normalizeLoadedCustom = useCallback((rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map((row) => ({
      clientKey:
        row._id ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`),
      _id: row._id,
      label: row.label || "",
      placement: PLACEMENT_OPTIONS.some((p) => p.value === row.placement)
        ? row.placement
        : "head",
      content: row.content || "",
    }));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getSiteScriptsSettings();
      if (data) {
        setSemrushScript(data.semrushScript || "");
        setAhrefsScript(data.ahrefsScript || "");
        setGoogleSearchConsoleScript(data.googleSearchConsoleScript || "");
        setGtmContainerId(data.gtmContainerId || "");
        setGoogleAdsConversionId(data.googleAdsConversionId || "");
        setCustomScripts(normalizeLoadedCustom(data.customScripts));
        setUpdatedAt(data.updatedAt || null);
      }
    } catch (error) {
      console.error("Error loading site scripts:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const addCustomScript = (placement = "head") => {
    setCustomScripts((prev) => [...prev, { ...newCustomRow(), placement }]);
  };

  const removeCustomScript = (clientKey) => {
    setCustomScripts((prev) => prev.filter((r) => r.clientKey !== clientKey));
  };

  const updateCustomScript = (clientKey, patch) => {
    setCustomScripts((prev) =>
      prev.map((r) => (r.clientKey === clientKey ? { ...r, ...patch } : r))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);
    try {
      const payload = {
        semrushScript,
        ahrefsScript,
        googleSearchConsoleScript,
        gtmContainerId,
        googleAdsConversionId,
        customScripts: customScripts.map(({ _id, label, placement, content }) => {
          const item = {
            label,
            placement,
            content,
          };
          if (_id) item._id = _id;
          return item;
        }),
      };
      const saved = await saveSiteScriptsSettings(payload);
      if (saved) {
        setUpdatedAt(saved.updatedAt || null);
        await loadData();
      }
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const fieldClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm resize-y";

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-primary focus:border-primary";

  return (
    <>
      <Helmet>
        <title>Site scripts - Admin</title>
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
              <h1 className="text-3xl font-bold text-gray-900">Site scripts</h1>
              <p className="mt-2 text-gray-600">
                Configure Google Tag Manager and Google Ads containers separately,
                plus Semrush, Ahrefs, Search Console, and custom head/body blocks.
                GTM and Ads IDs load through the storefront consent-aware loaders —
                do not paste full GTM/Ads snippets into Custom scripts.
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
                  <p className="mt-4 text-gray-600">Loading…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="space-y-8">
                    <IdFieldSection
                      title="Google Tag Manager"
                      description="Paste your GTM container ID only (e.g. GTM-XXXXXXX). Loaded deferred after consent defaults on the storefront. Leave blank to keep the site default container."
                      id="gtmContainerId"
                      value={gtmContainerId}
                      onChange={setGtmContainerId}
                      placeholder="GTM-XXXXXXX"
                      inputClass={inputClass}
                      hint="Container ID from tagmanager.google.com — not the full &lt;script&gt; snippet."
                    />
                    <IdFieldSection
                      title="Google Ads tracking"
                      description="Separate from GTM. Paste your Google Ads conversion / tag ID (e.g. AW-XXXXXXXXX). Loaded with gtag.js after marketing consent. Leave blank to disable direct Ads tagging."
                      id="googleAdsConversionId"
                      value={googleAdsConversionId}
                      onChange={setGoogleAdsConversionId}
                      placeholder="AW-XXXXXXXXX"
                      inputClass={inputClass}
                      hint="From Google Ads → Goals / Tag setup. Use a separate container/ID from GTM."
                    />
                    <ScriptSection
                      title="Semrush"
                      description="Verification meta tags or scripts Semrush provides (injected in &lt;head&gt;)."
                      id="semrushScript"
                      value={semrushScript}
                      onChange={setSemrushScript}
                      fieldClass={fieldClass}
                    />
                    <ScriptSection
                      title="Ahrefs"
                      description="Optional extra Ahrefs HTML for &lt;head&gt; (in addition to hardcoded site defaults)."
                      id="ahrefsScript"
                      value={ahrefsScript}
                      onChange={setAhrefsScript}
                      fieldClass={fieldClass}
                    />
                    <ScriptSection
                      title="Google Search Console"
                      description="HTML meta or snippet from Search Console (injected in &lt;head&gt;). If it includes a google-site-verification meta tag, it is also used for Next.js metadata when present."
                      id="googleSearchConsoleScript"
                      value={googleSearchConsoleScript}
                      onChange={setGoogleSearchConsoleScript}
                      fieldClass={fieldClass}
                    />

                    <div className="border-b border-gray-200 pb-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            Custom scripts
                          </h2>
                          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                            Add as many as you need. Each has a label (for your
                            reference only), a placement, and HTML or script
                            content.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => addCustomScript("head")}
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          >
                            + Custom (head)
                          </button>
                          <button
                            type="button"
                            onClick={() => addCustomScript("bodyStart")}
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          >
                            + Custom (body top)
                          </button>
                          <button
                            type="button"
                            onClick={() => addCustomScript("bodyEnd")}
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          >
                            + Custom (body bottom)
                          </button>
                        </div>
                      </div>

                      {customScripts.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-6 py-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                          No custom scripts yet. Use the buttons above to add
                          one.
                        </p>
                      ) : (
                        <ul className="mt-6 space-y-4">
                          {customScripts.map((row, index) => (
                            <li
                              key={row.clientKey}
                              className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 shadow-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Custom #{index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeCustomScript(row.clientKey)
                                  }
                                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                  <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    htmlFor={`custom-label-${row.clientKey}`}
                                  >
                                    Label / name
                                  </label>
                                  <input
                                    id={`custom-label-${row.clientKey}`}
                                    type="text"
                                    value={row.label}
                                    onChange={(e) =>
                                      updateCustomScript(row.clientKey, {
                                        label: e.target.value,
                                      })
                                    }
                                    placeholder="e.g. LinkedIn insight tag"
                                    className={inputClass}
                                  />
                                </div>
                                <div className="sm:col-span-1">
                                  <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    htmlFor={`custom-placement-${row.clientKey}`}
                                  >
                                    Placement
                                  </label>
                                  <select
                                    id={`custom-placement-${row.clientKey}`}
                                    value={row.placement}
                                    onChange={(e) =>
                                      updateCustomScript(row.clientKey, {
                                        placement: e.target.value,
                                      })
                                    }
                                    className={inputClass}
                                  >
                                    {PLACEMENT_OPTIONS.map((opt) => (
                                      <option
                                        key={opt.value}
                                        value={opt.value}
                                      >
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    htmlFor={`custom-content-${row.clientKey}`}
                                  >
                                    HTML / scripts
                                  </label>
                                  <textarea
                                    id={`custom-content-${row.clientKey}`}
                                    rows={5}
                                    value={row.content}
                                    onChange={(e) =>
                                      updateCustomScript(row.clientKey, {
                                        content: e.target.value,
                                      })
                                    }
                                    placeholder="Paste snippet…"
                                    className={fieldClass}
                                  />
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

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
                            aria-hidden
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving…
                        </>
                      ) : (
                        "Save site scripts"
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

function IdFieldSection({
  title,
  description,
  id,
  value,
  onChange,
  placeholder,
  inputClass,
  hint,
}) {
  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Container / tracking ID
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} font-mono max-w-md`}
        autoComplete="off"
        spellCheck={false}
      />
      {hint ? (
        <p className="mt-2 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

function ScriptSection({
  title,
  description,
  id,
  value,
  onChange,
  fieldClass,
}) {
  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        HTML / scripts
      </label>
      <textarea
        id={id}
        name={id}
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste snippet from the tool…"
        className={fieldClass}
      />
    </div>
  );
}
