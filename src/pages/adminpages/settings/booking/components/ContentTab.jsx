import { useEffect, useState } from "react";
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

  return { hero, services, trust };
}

export default function ContentTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [updatedAt, setUpdatedAt] = useState(null);

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
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Trust section</h3>
        <p className="text-sm text-gray-500 mb-6">
          Three benefit blocks at the bottom (icons stay fixed).
        </p>

        <div className="space-y-4">
          {content.trust.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Block {index + 1}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => setTrust(index, "title", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => setTrust(index, "description", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          ))}
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
