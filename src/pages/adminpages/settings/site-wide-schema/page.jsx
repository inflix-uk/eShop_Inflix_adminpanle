"use client";

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getSiteWideSchema,
  saveSiteWideSchema,
} from "./service/siteWideSchemaService";

function newSchemaRow() {
  return {
    clientKey:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    _id: undefined,
    label: "",
    schema: "",
  };
}

function tryParseJson(str) {
  try {
    JSON.parse(str);
    return null;
  } catch (e) {
    return e.message;
  }
}

export default function SiteWideSchemaSettings() {
  const [selectedPage, setSelectedPage] = useState("site-wide-schema-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getSiteWideSchema();
      if (data) {
        setSchemas(
          Array.isArray(data.schemas)
            ? data.schemas.map((row) => ({
                clientKey:
                  row._id ||
                  (typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `row-${Date.now()}-${Math.random().toString(36).slice(2)}`),
                _id: row._id,
                label: row.label || "",
                schema: row.schema || "",
              }))
            : []
        );
        setUpdatedAt(data.updatedAt || null);
      }
    } catch (error) {
      console.error("Error loading site-wide schema:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const addSchema = () => {
    setSchemas((prev) => [...prev, newSchemaRow()]);
  };

  const removeSchema = (clientKey) => {
    setSchemas((prev) => prev.filter((r) => r.clientKey !== clientKey));
  };

  const updateSchema = (clientKey, patch) => {
    setSchemas((prev) =>
      prev.map((r) => (r.clientKey === clientKey ? { ...r, ...patch } : r))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nonEmpty = schemas.filter((r) => r.schema.trim().length > 0);
    for (const row of nonEmpty) {
      const err = tryParseJson(row.schema.trim());
      if (err) {
        const name = row.label || "Untitled";
        alert(`Invalid JSON in "${name}":\n${err}\n\nPlease fix before saving.`);
        return;
      }
    }

    setIsSubmitting(true);
    setProgress(50);
    try {
      const payload = {
        schemas: schemas.map(({ _id, label, schema }) => {
          const item = { label, schema };
          if (_id) item._id = _id;
          return item;
        }),
      };
      const saved = await saveSiteWideSchema(payload);
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
        <title>Site-wide Schema - Admin</title>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Site-wide Schema
              </h1>
              <p className="mt-2 text-gray-600">
                Add JSON-LD structured data schemas that will be injected on
                every page of the website. Use this for Organization, WebSite,
                LocalBusiness, or any other global schema markup.
              </p>
              {updatedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Guidelines
              </h2>
              <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                <li>Each schema must be valid JSON-LD (validated before saving)</li>
                <li>
                  Common types: Organization, WebSite, LocalBusiness,
                  SearchAction, BreadcrumbList
                </li>
                <li>
                  These schemas appear in the &lt;head&gt; of every page as{" "}
                  <code className="bg-blue-100 px-1 rounded text-xs">
                    &lt;script type=&quot;application/ld+json&quot;&gt;
                  </code>
                </li>
                <li>
                  Use{" "}
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700 hover:text-blue-900"
                  >
                    Google Rich Results Test
                  </a>{" "}
                  to validate after deploying
                </li>
              </ul>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="mt-4 text-gray-600">Loading…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Schemas
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        Add one or more JSON-LD schema blocks. Each gets its own{" "}
                        <code className="bg-gray-100 px-1 rounded text-xs">
                          &lt;script&gt;
                        </code>{" "}
                        tag on every page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSchema}
                      className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 shrink-0"
                    >
                      + Add schema
                    </button>
                  </div>

                  {schemas.length === 0 ? (
                    <p className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
                      No schemas yet. Click &quot;+ Add schema&quot; to create
                      one.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {schemas.map((row, index) => {
                        const jsonErr =
                          row.schema.trim().length > 0
                            ? tryParseJson(row.schema.trim())
                            : null;
                        return (
                          <li
                            key={row.clientKey}
                            className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Schema #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeSchema(row.clientKey)}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                  htmlFor={`schema-label-${row.clientKey}`}
                                >
                                  Label (for your reference)
                                </label>
                                <input
                                  id={`schema-label-${row.clientKey}`}
                                  type="text"
                                  value={row.label}
                                  onChange={(e) =>
                                    updateSchema(row.clientKey, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="e.g. Organization, WebSite, LocalBusiness"
                                  className={inputClass}
                                />
                              </div>

                              <div>
                                <label
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                  htmlFor={`schema-json-${row.clientKey}`}
                                >
                                  JSON-LD
                                </label>
                                <textarea
                                  id={`schema-json-${row.clientKey}`}
                                  rows={8}
                                  value={row.schema}
                                  onChange={(e) =>
                                    updateSchema(row.clientKey, {
                                      schema: e.target.value,
                                    })
                                  }
                                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company",\n  "url": "https://example.com"\n}`}
                                  className={`${fieldClass} ${
                                    jsonErr
                                      ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                                      : ""
                                  }`}
                                />
                                {jsonErr && (
                                  <p className="mt-1 text-xs text-red-600">
                                    Invalid JSON: {jsonErr}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

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
                        "Save schemas"
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
