import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BodyBackgroundColorForm, { adminDisplayBodyBg } from "./components/BodyBackgroundColorForm";
import TagColorsForm from "./components/TagColorsForm";
import BookingUiCustomForm from "./components/BookingUiCustomForm";
import TypographySettingsForm from "./components/TypographySettingsForm";
import { DEFAULT_TYPOGRAPHY, ALLOWED_FONTS, ALLOWED_WEIGHTS } from "./typographyDefaults";
import { adminDisplayBookingModuleUi } from "./bookingUiDefaults";
import { adminDisplayTagColors } from "./tagColorsDefaults";
import { getSiteTheme, saveSiteTheme, saveTypographyTheme, saveBodyBackgroundTheme, saveBookingUiTheme, saveTagColorsTheme } from "./service/siteThemeService";

/** Matches storefront / API when no CMS hex is set — no green fallbacks. */
const DEFAULT_PRIMARY = "transparent";
const DEFAULT_SECONDARY = "transparent";

/** Native `<input type="color">` only accepts #rrggbb; use neutral when value is transparent. */
const COLOR_PICKER_FALLBACK = "#9ca3af";

function normalizeTypography(raw) {
  const base = DEFAULT_TYPOGRAPHY;
  if (!raw || typeof raw !== "object") {
    return {
      h1: { ...base.h1 },
      h2: { ...base.h2 },
      h3: { ...base.h3 },
      p: { ...base.p },
    };
  }
  const pick = (key) => {
    const r = raw[key] || {};
    const rf = typeof r.font === "string" ? r.font.trim() : "";
    const font =
      ALLOWED_FONTS.find((f) => f.toLowerCase() === rf.toLowerCase()) ?? base[key].font;
    return {
      font,
      weight: ALLOWED_WEIGHTS.includes(Number(r.weight)) ? Number(r.weight) : base[key].weight,
      style: r.style === "italic" ? "italic" : "normal",
    };
  };
  return {
    h1: pick("h1"),
    h2: pick("h2"),
    h3: pick("h3"),
    p: pick("p"),
  };
}

const normalizeHex = (value) => {
  const v = (value || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
};

const hexForColorInput = (value) => normalizeHex(value) ?? COLOR_PICKER_FALLBACK;

export default function SiteWideColor() {
  const [selectedPage] = useState("site-wide-color");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMainHover, setPreviewMainHover] = useState(false);
  const [typography, setTypography] = useState(() => normalizeTypography(null));
  const [typographySaving, setTypographySaving] = useState(false);
  const [bodyBgColor, setBodyBgColor] = useState(() => adminDisplayBodyBg(""));
  const [bodyBgSaving, setBodyBgSaving] = useState(false);
  const [tagColors, setTagColors] = useState(() => adminDisplayTagColors(null));
  const [tagColorsEnabled, setTagColorsEnabled] = useState(true);
  const [tagColorsSaving, setTagColorsSaving] = useState(false);
  const [bookingModuleUi, setBookingModuleUi] = useState(() =>
    adminDisplayBookingModuleUi(null)
  );
  const [bookingUiSaving, setBookingUiSaving] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setProgress(30);
      const data = await getSiteTheme();
      if (!cancelled && data) {
        const p = (data.primaryColor || "").trim();
        const s = (data.secondaryColor || "").trim();
        setPrimaryColor(
          !p || p.toLowerCase() === "transparent" ? DEFAULT_PRIMARY : p
        );
        setSecondaryColor(
          !s || s.toLowerCase() === "transparent" ? DEFAULT_SECONDARY : s
        );
        setTypography(normalizeTypography(data.typography));
        setBodyBgColor(adminDisplayBodyBg(data.bodyBgColor));
        setTagColors(adminDisplayTagColors(data.tagColors));
        setTagColorsEnabled(
          typeof data.tagColorsEnabled === "boolean" ? data.tagColorsEnabled : true
        );
        setBookingModuleUi(adminDisplayBookingModuleUi(data.uiCustom?.booking));
      }
      if (!cancelled) {
        setLoading(false);
        setProgress(100);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrimaryText = (e) => {
    const raw = e.target.value.trim();
    if (raw.toLowerCase() === "transparent") {
      setPrimaryColor("transparent");
      return;
    }
    const hex = normalizeHex(e.target.value);
    if (hex) setPrimaryColor(hex);
  };

  const handleSecondaryText = (e) => {
    const raw = e.target.value.trim();
    if (raw.toLowerCase() === "transparent") {
      setSecondaryColor("transparent");
      return;
    }
    const hex = normalizeHex(e.target.value);
    if (hex) setSecondaryColor(hex);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);
    const ok = await saveSiteTheme(primaryColor, secondaryColor);
    setIsSubmitting(false);
    setProgress(100);
    if (!ok) setProgress(0);
  };

  const resetDefaults = () => {
    setPrimaryColor(DEFAULT_PRIMARY);
    setSecondaryColor(DEFAULT_SECONDARY);
  };

  const handleSaveTypography = async () => {
    setTypographySaving(true);
    const ok = await saveTypographyTheme(typography);
    setTypographySaving(false);
    if (!ok) return;
    const fresh = await getSiteTheme();
    if (fresh?.typography) setTypography(normalizeTypography(fresh.typography));
  };

  const handleSaveBodyBackground = async () => {
    setBodyBgSaving(true);
    const ok = await saveBodyBackgroundTheme(bodyBgColor);
    setBodyBgSaving(false);
    if (!ok) return;
    const fresh = await getSiteTheme();
    if (fresh) setBodyBgColor(adminDisplayBodyBg(fresh.bodyBgColor));
  };

  const handleSaveTagColors = async () => {
    setTagColorsSaving(true);
    const ok = await saveTagColorsTheme(tagColors, tagColorsEnabled);
    setTagColorsSaving(false);
    if (!ok) return;
    const fresh = await getSiteTheme();
    if (fresh) {
      setTagColors(adminDisplayTagColors(fresh.tagColors));
      setTagColorsEnabled(
        typeof fresh.tagColorsEnabled === "boolean" ? fresh.tagColorsEnabled : true
      );
    }
  };

  const handleSaveBookingUi = async () => {
    setBookingUiSaving(true);
    const ok = await saveBookingUiTheme(bookingModuleUi);
    setBookingUiSaving(false);
    if (!ok) return;
    const fresh = await getSiteTheme();
    if (fresh) {
      setBookingModuleUi(adminDisplayBookingModuleUi(fresh.uiCustom?.booking));
    }
  };

  return (
    <>
      <Helmet>
        <title>Site-wide color - Admin</title>
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
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Site-wide color</h1>
              <p className="mt-2 text-gray-600">
                Sets the main and accent colors on the public website.
              </p>
            </div>

            <div className="mb-10 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Body background</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Choose a custom background color for the overall website body.
                </p>
              </div>
              <div className="px-6 py-6">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading…</p>
                  </div>
                ) : (
                  <BodyBackgroundColorForm
                    bodyBgColor={bodyBgColor}
                    onChange={setBodyBgColor}
                    onSave={handleSaveBodyBackground}
                    saving={bodyBgSaving}
                  />
                )}
              </div>
            </div>

            <div className="mb-10 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">HTML tag colors</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Optional global colors for h1–h6, p, span, and label. Turn off when
                  homepage sections and widgets use their own color pickers (dark/light themes).
                </p>
              </div>
              <div className="px-6 py-6">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading…</p>
                  </div>
                ) : (
                  <TagColorsForm
                    tagColors={tagColors}
                    tagColorsEnabled={tagColorsEnabled}
                    onChange={setTagColors}
                    onEnabledChange={setTagColorsEnabled}
                    onSave={handleSaveTagColors}
                    saving={tagColorsSaving}
                  />
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Colors</h2>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading…</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="px-6 py-6 space-y-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary (brand)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={hexForColorInput(primaryColor)}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                          aria-label="Primary color"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={handlePrimaryText}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary (hovers / accents)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={hexForColorInput(secondaryColor)}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                          aria-label="Secondary color"
                        />
                        <input
                          type="text"
                          value={secondaryColor}
                          onChange={handleSecondaryText}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Preview</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Type <span className="font-mono">transparent</span> in the text fields for no
                      site tint. The square swatch uses gray when the value is transparent (browser
                      limitation).
                    </p>
                    <div
                      className="rounded-lg border border-gray-200 p-6 space-y-4"
                      style={{
                        background: `linear-gradient(135deg, ${hexForColorInput(primaryColor)}22 0%, ${hexForColorInput(secondaryColor)}18 100%)`,
                      }}
                    >
                      <div className="flex flex-wrap gap-3 items-center">
                        <span
                          className="inline-flex px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: `color-mix(in srgb, ${hexForColorInput(primaryColor)} 15%, white)`,
                            color: hexForColorInput(secondaryColor),
                          }}
                        >
                          Example tag
                        </span>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm transition-colors duration-150"
                          style={{
                            backgroundColor: previewMainHover
                              ? hexForColorInput(secondaryColor)
                              : hexForColorInput(primaryColor),
                          }}
                          onMouseEnter={() => setPreviewMainHover(true)}
                          onMouseLeave={() => setPreviewMainHover(false)}
                        >
                          Primary → hover (secondary)
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm"
                          style={{ backgroundColor: hexForColorInput(secondaryColor) }}
                        >
                          Secondary button
                        </button>
                      </div>
                      <p className="text-sm" style={{ color: hexForColorInput(secondaryColor) }}>
                        Example supporting text.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetDefaults}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Reset form to defaults
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving…" : "Save to website"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-10 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">UI custom — Booking module</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Customize booking page UI. Controls the background of &quot;Our Services&quot; cards on{" "}
                  <span className="font-mono text-xs">/booking</span>.
                </p>
              </div>
              <div className="px-6 py-6">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading…</p>
                  </div>
                ) : (
                  <BookingUiCustomForm
                    bookingUi={bookingModuleUi}
                    onChange={setBookingModuleUi}
                    onSave={handleSaveBookingUi}
                    saving={bookingUiSaving}
                  />
                )}
              </div>
            </div>

            <div className="mt-10 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Typography</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Controls global heading and body fonts on the public Next.js site (SSR, no free-text
                  fonts).
                </p>
              </div>
              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading…</p>
                </div>
              ) : (
                <div className="px-6 py-6">
                  <TypographySettingsForm
                    typography={typography}
                    onChange={setTypography}
                    onSave={handleSaveTypography}
                    saving={typographySaving}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
