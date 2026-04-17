"use client";

import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  ChevronDown,
  ChevronUp,
  Facebook,
  Github,
  Globe,
  GripVertical,
  Instagram,
  Linkedin,
  Mail,
  Plus,
  Share2,
  Trash2,
  Twitter,
  Youtube,
} from "lucide-react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  fetchAnnouncementBanner,
  saveAnnouncementBanner,
} from "./service/announcementBannerApi";

function newBarId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `bar-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyItem(order) {
  return {
    id: newBarId(),
    enabled: true,
    order,
    message: "",
    linkUrl: "",
    linkLabel: "",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    dismissible: true,
    ctaFirst: false,
  };
}

const SOCIAL_OPTIONS = [
  { value: "facebook", label: "Facebook", Icon: Facebook },
  { value: "instagram", label: "Instagram", Icon: Instagram },
  { value: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { value: "youtube", label: "YouTube", Icon: Youtube },
  { value: "twitter", label: "X / Twitter", Icon: Twitter },
  { value: "github", label: "GitHub", Icon: Github },
  { value: "tiktok", label: "TikTok (share icon)", Icon: Share2 },
  { value: "mail", label: "Email", Icon: Mail },
  { value: "globe", label: "Globe / website", Icon: Globe },
  { value: "custom", label: "Custom (Lucide name)", Icon: Globe },
];

function emptySocial(order) {
  return {
    id: newBarId(),
    order,
    kind: "facebook",
    url: "",
    customIcon: "link",
  };
}

export default function AnnouncementBannerSettings() {
  const [selectedPage, setSelectedPage] = useState("announcement-banner-settings");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [masterEnabled, setMasterEnabled] = useState(true);
  const [items, setItems] = useState(() => [emptyItem(0)]);
  const [socialLinks, setSocialLinks] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAnnouncementBanner();
    if (data) {
      setMasterEnabled(data.masterEnabled !== false);
      const list = Array.isArray(data.items) ? data.items : [];
      if (list.length === 0) {
        setItems([emptyItem(0)]);
      } else {
        setItems(
          list.map((it, idx) => ({
            id: it.id || newBarId(),
            enabled: it.enabled !== false,
            order: idx,
            message: it.message || "",
            linkUrl: it.linkUrl || "",
            linkLabel: it.linkLabel || "",
            backgroundColor: it.backgroundColor || "#0f172a",
            textColor: it.textColor || "#ffffff",
            dismissible: it.dismissible !== false,
            ctaFirst: it.ctaFirst === true,
          }))
        );
      }
      const social = Array.isArray(data.socialLinks) ? data.socialLinks : [];
      setSocialLinks(
        social.length
          ? social.map((s, idx) => ({
              id: s.id || newBarId(),
              order: idx,
              kind: s.kind || "globe",
              url: s.url || "",
              customIcon: s.customIcon || "link",
            }))
          : []
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateItem = (index, partial) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...partial } : it))
    );
  };

  const moveItem = (index, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((it, i) => ({ ...it, order: i }));
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyItem(prev.length)]);
  };

  const removeItem = (index) => {
    setItems((prev) => {
      if (prev.length <= 1) return [emptyItem(0)];
      const next = prev.filter((_, i) => i !== index);
      return next.map((it, i) => ({ ...it, order: i }));
    });
  };

  const updateSocial = (index, partial) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...partial } : s))
    );
  };

  const moveSocial = (index, dir) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const addSocial = () => {
    setSocialLinks((prev) => [...prev, emptySocial(prev.length)]);
  };

  const removeSocial = (index) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async () => {
    const payloadItems = items.map((it, idx) => ({
      id: it.id,
      enabled: it.enabled,
      order: idx,
      message: it.message,
      linkUrl: it.linkUrl,
      linkLabel: it.linkLabel,
      backgroundColor: it.backgroundColor,
      textColor: it.textColor,
      dismissible: it.dismissible,
      ctaFirst: it.ctaFirst,
    }));

    const payloadSocial = socialLinks.map((s, idx) => ({
      id: s.id,
      order: idx,
      kind: s.kind,
      url: s.url,
      customIcon: s.kind === "custom" ? s.customIcon : "",
    }));

    setSaving(true);
    try {
      const result = await saveAnnouncementBanner({
        masterEnabled,
        items: payloadItems,
        socialLinks: payloadSocial,
      });
      if (result && Array.isArray(result.items)) {
        setMasterEnabled(result.masterEnabled !== false);
        setItems(
          result.items.length
            ? result.items.map((it, idx) => ({
                id: it.id,
                enabled: it.enabled !== false,
                order: idx,
                message: it.message || "",
                linkUrl: it.linkUrl || "",
                linkLabel: it.linkLabel || "",
                backgroundColor: it.backgroundColor || "#0f172a",
                textColor: it.textColor || "#ffffff",
                dismissible: it.dismissible !== false,
                ctaFirst: it.ctaFirst === true,
              }))
            : [emptyItem(0)]
        );
        const rs = Array.isArray(result.socialLinks) ? result.socialLinks : [];
        setSocialLinks(
          rs.map((s, idx) => ({
            id: s.id,
            order: idx,
            kind: s.kind || "globe",
            url: s.url || "",
            customIcon: s.customIcon || "link",
          }))
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Announcement banners - Admin</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-6 sm:py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Announcement banners
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Add one or more bars for the top of the public site. With <strong>more than one</strong>{" "}
                active bar, the storefront shows them in a <strong>slider</strong> (auto-advances every
                few seconds). Reorder with the arrows. Use <strong>CTA position</strong> to put the link
                before or after the message. <strong>Social icons</strong> use Lucide on the storefront and
                stay fixed on the <strong>left</strong> of the announcement strip.
              </p>
            </header>

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Loading…
              </div>
            ) : (
              <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      Master: show announcement area
                    </span>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Off hides all bars on the website (even if bars are configured below).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={masterEnabled}
                    onChange={(e) => setMasterEnabled(e.target.checked)}
                  />
                </label>

                <div className="border-b border-gray-100 pb-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-gray-800">
                      Social icons (left side)
                    </h2>
                    <button
                      type="button"
                      onClick={addSocial}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                    >
                      <Plus size={16} />
                      Add icon
                    </button>
                  </div>
                  <p className="mb-3 text-xs text-gray-500">
                    URLs must be full <code className="rounded bg-gray-100 px-1">https://…</code> or{" "}
                    <code className="rounded bg-gray-100 px-1">mailto:</code>. Order top to bottom = left
                    to right on the site.
                  </p>
                  {socialLinks.length === 0 ? (
                    <p className="text-sm text-gray-500">No social icons — optional.</p>
                  ) : (
                    <div className="space-y-3">
                      {socialLinks.map((s, index) => {
                        const opt = SOCIAL_OPTIONS.find((o) => o.value === s.kind) || SOCIAL_OPTIONS[0];
                        const PreviewIcon = opt.Icon;
                        return (
                          <div
                            key={s.id}
                            className="rounded-lg border border-gray-200 bg-gray-50/80 p-3"
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-sm text-gray-800">
                                <PreviewIcon className="h-4 w-4 text-primary" aria-hidden />
                                Icon {index + 1}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  title="Move up"
                                  disabled={index === 0}
                                  onClick={() => moveSocial(index, -1)}
                                  className="rounded p-1 text-gray-600 hover:bg-white disabled:opacity-30"
                                >
                                  <ChevronUp size={18} />
                                </button>
                                <button
                                  type="button"
                                  title="Move down"
                                  disabled={index === socialLinks.length - 1}
                                  onClick={() => moveSocial(index, 1)}
                                  className="rounded p-1 text-gray-600 hover:bg-white disabled:opacity-30"
                                >
                                  <ChevronDown size={18} />
                                </button>
                                <button
                                  type="button"
                                  title="Remove"
                                  onClick={() => removeSocial(index)}
                                  className="rounded p-1 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Platform / icon
                                </label>
                                <select
                                  value={s.kind}
                                  onChange={(e) => updateSocial(index, { kind: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                >
                                  {SOCIAL_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  URL
                                </label>
                                <input
                                  type="text"
                                  value={s.url}
                                  onChange={(e) => updateSocial(index, { url: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                  placeholder="https://… or mailto:hi@example.com"
                                />
                              </div>
                            </div>
                            {s.kind === "custom" ? (
                              <div className="mt-2">
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  Lucide icon name
                                </label>
                                <input
                                  type="text"
                                  value={s.customIcon}
                                  onChange={(e) =>
                                    updateSocial(index, { customIcon: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                                  placeholder="e.g. message-circle, send, phone"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  See{" "}
                                  <a
                                    href="https://lucide.dev/icons/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                  >
                                    lucide.dev/icons
                                  </a>
                                </p>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-gray-800">Bars ({items.length})</h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <Plus size={16} />
                    Add bar
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((it, index) => (
                    <div
                      key={it.id}
                      className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 shadow-sm"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <GripVertical className="h-4 w-4 text-gray-400" aria-hidden />
                          Bar {index + 1}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            title="Move up"
                            disabled={index === 0}
                            onClick={() => moveItem(index, -1)}
                            className="rounded p-1 text-gray-600 hover:bg-white disabled:opacity-30"
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            type="button"
                            title="Move down"
                            disabled={index === items.length - 1}
                            onClick={() => moveItem(index, 1)}
                            className="rounded p-1 text-gray-600 hover:bg-white disabled:opacity-30"
                          >
                            <ChevronDown size={18} />
                          </button>
                          <button
                            type="button"
                            title="Remove bar"
                            onClick={() => removeItem(index)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <label className="mb-3 flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                          checked={it.enabled}
                          onChange={(e) => updateItem(index, { enabled: e.target.checked })}
                        />
                        <span className="text-xs text-gray-700">Include this bar on the site (needs message)</span>
                      </label>

                      <div className="mb-3">
                        <label className="mb-1 block text-xs font-medium text-gray-600">Message</label>
                        <textarea
                          value={it.message}
                          onChange={(e) => updateItem(index, { message: e.target.value })}
                          rows={2}
                          maxLength={2000}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Short announcement text…"
                        />
                      </div>

                      <div className="mb-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Link URL</label>
                          <input
                            type="text"
                            value={it.linkUrl}
                            onChange={(e) => updateItem(index, { linkUrl: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="/sale or https://…"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Link label</label>
                          <input
                            type="text"
                            value={it.linkLabel}
                            onChange={(e) => updateItem(index, { linkLabel: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Shop now"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          CTA / button position
                        </label>
                        <select
                          value={it.ctaFirst ? "first" : "after"}
                          onChange={(e) =>
                            updateItem(index, { ctaFirst: e.target.value === "first" })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:max-w-xs"
                        >
                          <option value="after">Message first, then link</option>
                          <option value="first">Link first, then message</option>
                        </select>
                      </div>

                      <div className="mb-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Background</label>
                          <input
                            type="text"
                            value={it.backgroundColor}
                            onChange={(e) => updateItem(index, { backgroundColor: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Text colour</label>
                          <input
                            type="text"
                            value={it.textColor}
                            onChange={(e) => updateItem(index, { textColor: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <label className="mb-3 flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                          checked={it.dismissible}
                          onChange={(e) => updateItem(index, { dismissible: e.target.checked })}
                        />
                        <span className="text-xs text-gray-700">
                          Dismissible (visitor can close; all bars must be dismissible for the X to show)
                        </span>
                      </label>

                      <div
                        className="rounded-lg px-3 py-2 text-sm"
                        style={{
                          backgroundColor: it.backgroundColor || "#0f172a",
                          color: it.textColor || "#fff",
                        }}
                      >
                        <div
                          className={`flex flex-wrap items-center justify-center gap-2 text-center ${
                            it.ctaFirst ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <span>{it.message || "Preview message"}</span>
                          {it.linkUrl && it.linkLabel ? (
                            <span className="font-semibold underline">{it.linkLabel}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
                >
                  {saving ? "Saving…" : "Save all bars"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
