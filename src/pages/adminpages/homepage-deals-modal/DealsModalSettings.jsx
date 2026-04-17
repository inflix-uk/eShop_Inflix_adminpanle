"use client";

import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import { getDealsModalAdmin, saveDealsModal } from "./service/dealsModalApi";

/** ISO / API string → value for datetime-local input */
function toDatetimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function DealsModalSettings() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("deals-modal-settings");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);

  const [form, setForm] = useState({
    enabled: true,
    openDelayMs: 10000,
    countdownEndsAt: "",
    discountCode: "",
    collapsedBannerText: "",
    badgeText: "",
    headline: "",
    descriptionPrimary: "",
    descriptionSecondary: "",
    countdownLabel: "",
    emailPlaceholder: "",
    submitButtonText: "",
    successSubscribeMessage: "",
    discountViewSuccessBadge: "",
    discountViewHeadline: "",
    discountViewDescription: "",
    discountViewLabel: "",
    discountViewThankYou: "",
    rightPanelImageAlt: "",
    bannerImageUrl: "",
  });

  const load = useCallback(async () => {
    if (!auth?.ip) return;
    setLoading(true);
    try {
      const res = await getDealsModalAdmin(auth.ip);
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to load");
        return;
      }
      const d = res.data;
      setForm({
        enabled: d.enabled !== false,
        openDelayMs: d.openDelayMs ?? 10000,
        countdownEndsAt: toDatetimeLocalValue(d.countdownEndsAt),
        discountCode: d.discountCode || "",
        collapsedBannerText: d.collapsedBannerText || "",
        badgeText: d.badgeText || "",
        headline: d.headline || "",
        descriptionPrimary: d.descriptionPrimary || "",
        descriptionSecondary: d.descriptionSecondary || "",
        countdownLabel: d.countdownLabel || "",
        emailPlaceholder: d.emailPlaceholder || "",
        submitButtonText: d.submitButtonText || "",
        successSubscribeMessage: d.successSubscribeMessage || "",
        discountViewSuccessBadge: d.discountViewSuccessBadge || "",
        discountViewHeadline: d.discountViewHeadline || "",
        discountViewDescription: d.discountViewDescription || "",
        discountViewLabel: d.discountViewLabel || "",
        discountViewThankYou: d.discountViewThankYou || "",
        rightPanelImageAlt: d.rightPanelImageAlt || "",
        bannerImageUrl: d.bannerImageUrl || "",
      });
      setBannerFile(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load deals modal settings");
    } finally {
      setLoading(false);
    }
  }, [auth?.ip]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!auth?.ip) return;
    setSaving(true);
    try {
      const payload = {
        enabled: form.enabled,
        openDelayMs: Number(form.openDelayMs) || 10000,
        ...(form.countdownEndsAt
          ? {
              countdownEndsAt: new Date(
                form.countdownEndsAt
              ).toISOString(),
            }
          : {}),
        discountCode: form.discountCode,
        collapsedBannerText: form.collapsedBannerText,
        badgeText: form.badgeText,
        headline: form.headline,
        descriptionPrimary: form.descriptionPrimary,
        descriptionSecondary: form.descriptionSecondary,
        countdownLabel: form.countdownLabel,
        emailPlaceholder: form.emailPlaceholder,
        submitButtonText: form.submitButtonText,
        successSubscribeMessage: form.successSubscribeMessage,
        discountViewSuccessBadge: form.discountViewSuccessBadge,
        discountViewHeadline: form.discountViewHeadline,
        discountViewDescription: form.discountViewDescription,
        discountViewLabel: form.discountViewLabel,
        discountViewThankYou: form.discountViewThankYou,
        rightPanelImageAlt: form.rightPanelImageAlt,
        bannerImageUrl: form.bannerImageUrl,
      };
      const res = await saveDealsModal(auth.ip, payload, bannerFile);
      if (res.success) {
        toast.success(res.message || "Saved");
        await load();
      } else {
        toast.error(res.message || "Save failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <Helmet>
        <title>Hot UK Deals popup | Admin</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
        <main className="py-5">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Hot UK Deals popup
            </h1>
            <p className="text-gray-600 text-sm mb-8">
              Edit the storefront Hot UK Deals popup and bottom-left launcher:
              timing, countdown, copy, discount code, and right-hand image. If
              the API is
              offline, the site keeps safe default text and images.
            </p>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
              </div>
            ) : (
              <div className="space-y-8 bg-white rounded-lg shadow p-6">
                <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="deals-enabled"
                      type="checkbox"
                      checked={form.enabled}
                      onChange={(e) => setField("enabled", e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-purple-600"
                    />
                    <span>
                      <span className="font-medium text-gray-800 block">
                        Allow automatic popup
                      </span>
                      <span className="text-sm text-gray-600 block mt-0.5">
                        When enabled, first-time visitors see the full popup
                        after the delay below. When disabled, only the timed
                        popup is off; the bottom-left launcher can still open
                        the offer.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="deals-open-delay"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Automatic popup delay
                    </label>
                    <input
                      id="deals-open-delay"
                      type="number"
                      min={0}
                      max={120000}
                      value={form.openDelayMs}
                      onChange={(e) =>
                        setField("openDelayMs", Number(e.target.value))
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Milliseconds (0–120,000) before the full popup opens on a
                      first visit (10,000 = 10 seconds).
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="deals-countdown-ends"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Deal countdown ends
                    </label>
                    <input
                      id="deals-countdown-ends"
                      type="datetime-local"
                      value={form.countdownEndsAt}
                      onChange={(e) =>
                        setField("countdownEndsAt", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Date and time the storefront timer counts down to (shown
                      in each visitor&apos;s local timezone). Leave empty on save
                      to keep the current value unchanged.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="deals-discount-code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Discount code (shown after signup)
                  </label>
                  <input
                    id="deals-discount-code"
                    type="text"
                    value={form.discountCode}
                    onChange={(e) => setField("discountCode", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="e.g. HOTDEALS"
                  />
                </div>

                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">
                    Bottom-left launcher
                  </legend>
                  <p className="text-xs text-gray-500 -mt-1 mb-2">
                    Text on the fixed button that reopens the popup (desktop &
                    mobile).
                  </p>
                  <div>
                    <label
                      htmlFor="deals-launcher-text"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Launcher label
                    </label>
                    <input
                      id="deals-launcher-text"
                      type="text"
                      value={form.collapsedBannerText}
                      onChange={(e) =>
                        setField("collapsedBannerText", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="e.g. HOT UK DEALS"
                    />
                  </div>
                </fieldset>

                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">
                    Popup — email signup step
                  </legend>
                  <div>
                    <label
                      htmlFor="deals-badge"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Badge / pill (top)
                    </label>
                    <input
                      id="deals-badge"
                      type="text"
                      value={form.badgeText}
                      onChange={(e) => setField("badgeText", e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Short highlight line"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-headline"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Headline
                    </label>
                    <input
                      id="deals-headline"
                      type="text"
                      value={form.headline}
                      onChange={(e) => setField("headline", e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-desc-primary"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Main description
                    </label>
                    <textarea
                      id="deals-desc-primary"
                      value={form.descriptionPrimary}
                      onChange={(e) =>
                        setField("descriptionPrimary", e.target.value)
                      }
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-desc-secondary"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Supporting line
                    </label>
                    <textarea
                      id="deals-desc-secondary"
                      value={form.descriptionSecondary}
                      onChange={(e) =>
                        setField("descriptionSecondary", e.target.value)
                      }
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-countdown-label"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Countdown caption
                    </label>
                    <input
                      id="deals-countdown-label"
                      type="text"
                      value={form.countdownLabel}
                      onChange={(e) => setField("countdownLabel", e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="e.g. Sale ends in:"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-email-placeholder"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email field placeholder
                    </label>
                    <input
                      id="deals-email-placeholder"
                      type="text"
                      value={form.emailPlaceholder}
                      onChange={(e) =>
                        setField("emailPlaceholder", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="e.g. Enter your email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-submit-text"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Submit button text
                    </label>
                    <input
                      id="deals-submit-text"
                      type="text"
                      value={form.submitButtonText}
                      onChange={(e) =>
                        setField("submitButtonText", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-success-msg"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message after successful signup (before code view)
                    </label>
                    <input
                      id="deals-success-msg"
                      type="text"
                      value={form.successSubscribeMessage}
                      onChange={(e) =>
                        setField("successSubscribeMessage", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </fieldset>

                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">
                    Popup — discount code step
                  </legend>
                  <p className="text-xs text-gray-500 -mt-1 mb-2">
                    Shown after the visitor submits their email.
                  </p>
                  <div>
                    <label
                      htmlFor="deals-dv-badge"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Success badge
                    </label>
                    <input
                      id="deals-dv-badge"
                      type="text"
                      value={form.discountViewSuccessBadge}
                      onChange={(e) =>
                        setField("discountViewSuccessBadge", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-dv-headline"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Headline
                    </label>
                    <input
                      id="deals-dv-headline"
                      type="text"
                      value={form.discountViewHeadline}
                      onChange={(e) =>
                        setField("discountViewHeadline", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-dv-desc"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Instructions / description
                    </label>
                    <textarea
                      id="deals-dv-desc"
                      value={form.discountViewDescription}
                      onChange={(e) =>
                        setField("discountViewDescription", e.target.value)
                      }
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-dv-code-label"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Label above the code
                    </label>
                    <input
                      id="deals-dv-code-label"
                      type="text"
                      value={form.discountViewLabel}
                      onChange={(e) =>
                        setField("discountViewLabel", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="e.g. Use discount code:"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="deals-dv-thanks"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Thank-you line
                    </label>
                    <textarea
                      id="deals-dv-thanks"
                      value={form.discountViewThankYou}
                      onChange={(e) =>
                        setField("discountViewThankYou", e.target.value)
                      }
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </fieldset>

                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <legend className="text-sm font-semibold text-gray-900 px-2">
                    Right-hand image (desktop)
                  </legend>
                  <div>
                    <label
                      htmlFor="deals-image-alt"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Image description (alt text)
                    </label>
                    <input
                      id="deals-image-alt"
                      type="text"
                      value={form.rightPanelImageAlt}
                      onChange={(e) =>
                        setField("rightPanelImageAlt", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Describe the image for screen readers"
                    />
                  </div>
                  {form.bannerImageUrl && !bannerFile && (
                    <p className="text-xs text-gray-600 break-all">
                      <span className="font-medium text-gray-700">
                        Current image URL:{" "}
                      </span>
                      {form.bannerImageUrl}
                    </p>
                  )}
                  <div>
                    <label
                      htmlFor="deals-banner-file"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Upload new banner
                    </label>
                    <input
                      id="deals-banner-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBannerFile(e.target.files?.[0] || null)
                      }
                      className="text-sm w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, or WebP. Max 8 MB. Replaces the image on save.
                    </p>
                  </div>
                </fieldset>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
