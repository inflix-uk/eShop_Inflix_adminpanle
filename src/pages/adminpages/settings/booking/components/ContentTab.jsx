import { useEffect, useState } from "react";
import { Code2 } from "lucide-react";
import {
  getBookingPageContent,
  patchBookingPageContent,
} from "../service/bookingService";

const DEFAULT_CONTENT = {
  hero: {
    badgeText: "Online Booking Available",
    title: "Book Your Perfect Appointment",
    subtitle:
      "Choose from our range of premium services and book your preferred time slot. Quick, easy, and secure online booking.",
    statsEnabled: true,
    stat1Label: "Services",
    stat2Value: "24/7",
    stat2Label: "Online Booking",
    stat3Value: "100%",
    stat3Label: "Secure Payment",
    statsValueColor: "#111827",
    statsLabelColor: "#6b7280",
    statsBgColor: "",
  },
  services: {
    heading: "Our Services",
    subheading: "Select a service to begin booking",
  },
  trust: [
    {
      title: "Secure Booking",
      description: "Your data is protected with industry-leading encryption",
    },
    {
      title: "Instant Confirmation",
      description: "Receive immediate booking confirmation via email",
    },
    {
      title: "Flexible Payment",
      description: "Pay securely with card, Apple Pay, or Google Pay",
    },
  ],
  customWidget: {
    enabled: false,
    html: "",
    css: "",
  },
};

function mergeContent(incoming) {
  if (!incoming || typeof incoming !== "object") return DEFAULT_CONTENT;
  const heroSrc = incoming.hero && typeof incoming.hero === "object" ? incoming.hero : {};
  const servicesSrc =
    incoming.services && typeof incoming.services === "object" ? incoming.services : {};
  const trustSrc = Array.isArray(incoming.trust) ? incoming.trust : [];

  const hero = { ...DEFAULT_CONTENT.hero };
  for (const key of Object.keys(hero)) {
    if (typeof heroSrc[key] === "string" && heroSrc[key].length > 0) {
      hero[key] = heroSrc[key];
    }
  }
  if (typeof heroSrc.statsEnabled === "boolean") {
    hero.statsEnabled = heroSrc.statsEnabled;
  }

  const services = { ...DEFAULT_CONTENT.services };
  for (const key of Object.keys(services)) {
    if (typeof servicesSrc[key] === "string" && servicesSrc[key].length > 0) {
      services[key] = servicesSrc[key];
    }
  }

  const trust = DEFAULT_CONTENT.trust.map((defaults, index) => {
    const entry = trustSrc[index] && typeof trustSrc[index] === "object" ? trustSrc[index] : {};
    return {
      title: typeof entry.title === "string" && entry.title.length > 0 ? entry.title : defaults.title,
      description:
        typeof entry.description === "string" && entry.description.length > 0
          ? entry.description
          : defaults.description,
    };
  });

  const customWidgetSrc =
    incoming.customWidget && typeof incoming.customWidget === "object" ? incoming.customWidget : {};
  const customWidget = {
    enabled: typeof customWidgetSrc.enabled === "boolean" ? customWidgetSrc.enabled : DEFAULT_CONTENT.customWidget.enabled,
    html: typeof customWidgetSrc.html === "string" ? customWidgetSrc.html : DEFAULT_CONTENT.customWidget.html,
    css: typeof customWidgetSrc.css === "string" ? customWidgetSrc.css : DEFAULT_CONTENT.customWidget.css,
  };

  return { hero, services, trust, customWidget };
}

export default function ContentTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [htmlCssTab, setHtmlCssTab] = useState("html");

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    setProgress?.(30);
    const data = await getBookingPageContent();
    if (data?.content) {
      setContent(mergeContent(data.content));
    }
    if (data?.updatedAt) setUpdatedAt(data.updatedAt);
    setLoading(false);
    setProgress?.(100);
  };

  const setHero = (key, value) => {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const setServices = (key, value) => {
    setContent((prev) => ({
      ...prev,
      services: { ...prev.services, [key]: value },
    }));
  };

  const setTrust = (index, key, value) => {
    setContent((prev) => {
      const next = prev.trust.map((entry, i) =>
        i === index ? { ...entry, [key]: value } : entry
      );
      return { ...prev, trust: next };
    });
  };

  const setCustomWidget = (key, value) => {
    setContent((prev) => ({
      ...prev,
      customWidget: { ...prev.customWidget, [key]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProgress?.(50);
    const saved = await patchBookingPageContent(content);
    setSaving(false);
    setProgress?.(100);

    if (saved?.content) {
      setContent(mergeContent(saved.content));
      if (saved.updatedAt) setUpdatedAt(saved.updatedAt);
    }
  };

  const handleResetDefaults = () => {
    setContent({
      hero: { ...DEFAULT_CONTENT.hero },
      services: { ...DEFAULT_CONTENT.services },
      trust: DEFAULT_CONTENT.trust.map((b) => ({ ...b })),
      customWidget: { ...DEFAULT_CONTENT.customWidget },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {updatedAt ? (
        <p className="text-sm text-gray-500">
          Content last updated: {new Date(updatedAt).toLocaleString()}
        </p>
      ) : null}

      {/* HERO */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Hero section</h3>
        <p className="text-sm text-gray-500 mb-6">
          Top of{" "}
          <span className="font-mono text-xs">/booking</span> — badge, heading, subtitle,
          and 3 stats.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge text
            </label>
            <input
              type="text"
              value={content.hero.badgeText}
              onChange={(e) => setHero("badgeText", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="e.g. Online Booking Available"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero heading
            </label>
            <input
              type="text"
              value={content.hero.title}
              onChange={(e) => setHero("title", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="e.g. Book Your Perfect Appointment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <textarea
              rows={3}
              value={content.hero.subtitle}
              onChange={(e) => setHero("subtitle", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
              placeholder="Supporting text below the headline"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Stats (3 blocks)</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Show or hide the stats row on the booking page hero.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    content.hero.statsEnabled
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {content.hero.statsEnabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={content.hero.statsEnabled}
                  onClick={() =>
                    setHero("statsEnabled", !content.hero.statsEnabled)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    content.hero.statsEnabled ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.hero.statsEnabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${
                content.hero.statsEnabled
                  ? ""
                  : "opacity-50 pointer-events-none"
              }`}
            >
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Stat 1
                </p>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    disabled
                    value="Packages count +"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-400 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Auto — uses total booking packages
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={content.hero.stat1Label}
                    onChange={(e) => setHero("stat1Label", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Stat 2
                </p>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    value={content.hero.stat2Value}
                    onChange={(e) => setHero("stat2Value", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={content.hero.stat2Label}
                    onChange={(e) => setHero("stat2Label", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Stat 3
                </p>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    value={content.hero.stat3Value}
                    onChange={(e) => setHero("stat3Value", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={content.hero.stat3Label}
                    onChange={(e) => setHero("stat3Label", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Stats Colors */}
            <div className="mt-5 pt-5 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Stats Colors</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Value Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.hero.statsValueColor || "#111827"}
                      onChange={(e) => setHero("statsValueColor", e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                    />
                    <input
                      type="text"
                      value={content.hero.statsValueColor || ""}
                      onChange={(e) => setHero("statsValueColor", e.target.value)}
                      placeholder="#111827"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Label Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.hero.statsLabelColor || "#6b7280"}
                      onChange={(e) => setHero("statsLabelColor", e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                    />
                    <input
                      type="text"
                      value={content.hero.statsLabelColor || ""}
                      onChange={(e) => setHero("statsLabelColor", e.target.value)}
                      placeholder="#6b7280"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.hero.statsBgColor || "#ffffff"}
                      onChange={(e) => setHero("statsBgColor", e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                    />
                    <input
                      type="text"
                      value={content.hero.statsBgColor || ""}
                      onChange={(e) => setHero("statsBgColor", e.target.value)}
                      placeholder="transparent"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Leave empty for transparent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM HTML/CSS WIDGET */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Code2 className="text-violet-600" size={22} />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Custom HTML / CSS Widget</h3>
              <p className="text-sm text-gray-500">
                Add custom HTML and CSS below the packages section.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold ${
                content.customWidget?.enabled ? "text-green-600" : "text-gray-400"
              }`}
            >
              {content.customWidget?.enabled ? "Enabled" : "Disabled"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={content.customWidget?.enabled}
              onClick={() => setCustomWidget("enabled", !content.customWidget?.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                content.customWidget?.enabled ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  content.customWidget?.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div
          className={`space-y-4 transition-opacity ${
            content.customWidget?.enabled ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          <p className="text-xs text-gray-600">
            Use <strong>HTML</strong> for tags only (sections, divs, headings, etc.). Do not paste{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">&lt;!DOCTYPE&gt;</code>,{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">&lt;html&gt;</code>,{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">&lt;head&gt;</code>, or{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">&lt;body&gt;</code>. Put all rules in the{" "}
            <strong>CSS</strong> tab — CSS is scoped to this widget only.
          </p>

          {/* Tabs */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={htmlCssTab === "html"}
              onClick={() => setHtmlCssTab("html")}
              className={`min-w-[5rem] rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors focus:outline-none ${
                htmlCssTab === "html"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              HTML
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={htmlCssTab === "css"}
              onClick={() => setHtmlCssTab("css")}
              className={`min-w-[5rem] rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors focus:outline-none ${
                htmlCssTab === "css"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              CSS
            </button>
          </div>

          {/* Editor */}
          {htmlCssTab === "html" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HTML fragment</label>
              <textarea
                value={content.customWidget?.html || ""}
                onChange={(e) => setCustomWidget("html", e.target.value)}
                rows={14}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50 focus:ring-primary focus:border-primary"
                placeholder={'e.g. <section class="my-block"><h2>Hello</h2><p>Your content here</p></section>'}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CSS rules</label>
              <textarea
                value={content.customWidget?.css || ""}
                onChange={(e) => setCustomWidget("css", e.target.value)}
                rows={14}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50 focus:ring-primary focus:border-primary"
                placeholder={`.my-block { padding: 2rem; background: #f9fafb; }\n.my-block h2 { font-size: 1.5rem; color: #111827; }`}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Reset to defaults
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save content"}
        </button>
      </div>
    </form>
  );
}
