import { useId, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { formatDurationLabel } from "../utils/durationDisplay";

/**
 * Storefront preview of the /booking packages grid ("Simple, honest rates." section).
 * Mirrors BookingPackageCard + BookingPageClient so admins see card copy, the
 * highlight badge and row widgets exactly where customers will.
 */

const TYPE_LABELS = {
  service: "Service",
  consultation: "Consultation",
  studio: "Studio Session",
  editing: "Editing",
};

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", cols: 3, width: null, Icon: Monitor },
  { id: "tablet", label: "Tablet", cols: 2, width: 820, Icon: Tablet },
  { id: "mobile", label: "Mobile", cols: 1, width: 420, Icon: Smartphone },
];

/** Public storefront origin — same env aliases the admin nav uses. */
function storefrontBookingUrl() {
  const fromEnv =
    import.meta.env.VITE_FRONTEND_URL ||
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    import.meta.env.VITE_STOREFRONT_URL ||
    "";
  const fallback = import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://www.aromadesire.com";
  return `${String(fromEnv || fallback).replace(/\/$/, "")}/booking`;
}

function capitalizeWords(value) {
  if (!value) return value;
  return String(value)
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, "").trim();
}

function formatPrice(price) {
  return `£${(Number(price) || 0).toFixed(2)}`;
}

function isFixedPrice(pkg) {
  return (pkg?.pricingMode || "hourly") === "fixed";
}

/** Same derivation as the storefront card: unit suffix + note pulled out of the description. */
function priceMeta(pkg) {
  const desc = String(pkg?.description || "").trim();

  let note = "";
  if (/includes?\s+engineer/i.test(desc)) {
    note = "Includes Engineer";
  } else if (desc.includes("·")) {
    const part = desc
      .split("·")
      .map((s) => s.trim())
      .find((s) => s.length > 0);
    if (part && !part.startsWith("£")) note = stripHtml(part);
  }

  if (isFixedPrice(pkg)) return { unit: "", note };

  const durationLabel = formatDurationLabel(
    pkg?.durationMinutes,
    pkg?.durationDisplayUnit
  );
  return { unit: durationLabel && durationLabel !== "—" ? ` / ${durationLabel}` : "", note };
}

function cardSubtitle(pkg, studioMicCapacity) {
  const custom = pkg?.subtitle?.trim();
  if (custom) return custom;
  const includedMics = Math.max(0, Number(pkg?.includedMics) || 0);
  if (includedMics <= 0) return "";
  const micWord = includedMics === 1 ? "mic" : "mics";
  const capacity = Math.max(0, Number(studioMicCapacity) || 0);
  return capacity > 0
    ? `${includedMics} ${micWord} included, up to ${capacity}`
    : `${includedMics} ${micWord} included`;
}

/** Strip scripts / external resources — same guard the storefront widget applies. */
function sanitizeWidgetHtml(html) {
  let s = String(html ?? "").trim();
  if (!s) return "";

  const bodyMatch = s.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    s = bodyMatch[1].trim();
  } else if (/<!DOCTYPE|<html[\s>]/i.test(s)) {
    s = s
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<\/?html[^>]*>/gi, "")
      .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, "")
      .replace(/<\/?body[^>]*>/gi, "");
  }

  return s
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/<title\b[^<]*(?:(?!<\/title>)<[^<]*)*<\/title>/gi, "")
    .trim();
}

/** Keep `</style` inside admin CSS from closing the surrounding style tag. */
function sanitizeWidgetCss(css) {
  return String(css ?? "").replace(/<\/style/gi, "<‌/style");
}

const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace';
const SERIF = 'Georgia, "Times New Roman", serif';

/** Port of booking-package-cards.css, prefixed so it cannot leak into the admin UI. */
const PREVIEW_CSS = `
.bkpv {
  --psm-green: #c2fc12;
  --psm-cream: #f5f0e8;
  --psm-muted: #9ca3af;
  --psm-coal: #0c0c0c;
  --psm-btn-text: #050505;
  --psm-line-soft: rgba(255, 255, 255, 0.08);
  --psm-line: rgba(194, 252, 18, 0.35);
  background: #050505;
}
.bkpv-heading { font-family: ${SERIF}; font-weight: 300; color: var(--psm-cream); font-size: 28px; line-height: 1.2; margin: 0; letter-spacing: -0.01em; }
.bkpv-subheading { color: var(--psm-muted); font-size: 14px; margin: 8px 0 0; }
.bkpv-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.bkpv-filter { padding: 10px 20px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }
.bkpv-filter--active { background: var(--psm-green); color: var(--psm-btn-text); }
.bkpv-filter--idle { border: 1px solid rgba(255, 255, 255, 0.15); color: var(--psm-muted); }
.bkpv-grid { display: grid; grid-template-columns: 1fr; gap: 16px; width: 100%; }
.bkpv-grid[data-cols="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.bkpv-grid[data-cols="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
.bkpv-widget { grid-column: 1 / -1; width: 100%; min-width: 0; color: var(--psm-cream); }
.bkpv-card { position: relative; background: var(--psm-coal); border: 1px solid var(--psm-line-soft); padding: 28px; display: flex; flex-direction: column; min-height: 100%; width: 100%; min-width: 0; }
.bkpv-card--featured { border-color: var(--psm-line); }
.bkpv-card__badge { position: absolute; top: -13px; left: 24px; font-family: ${MONO}; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; background: var(--psm-green); color: var(--psm-btn-text); padding: 6px 14px; border-radius: 999px; font-weight: 600; z-index: 2; }
.bkpv-card__name { font-family: ${SERIF}; font-weight: 300; font-size: 24px; line-height: 1.2; color: var(--psm-cream); margin: 10px 0 6px; }
.bkpv-card__price { font-family: ${MONO}; font-size: 15px; letter-spacing: 0.1em; color: var(--psm-green); margin: 0 0 8px; line-height: 1.5; }
.bkpv-card__price-amount { font-weight: 500; }
.bkpv-card__price-unit, .bkpv-card__price-note { color: var(--psm-muted); font-size: 11px; letter-spacing: 0.18em; }
.bkpv-card__mics { margin: 0 0 10px; font-size: 12px; line-height: 1.4; color: var(--psm-muted); }
.bkpv-card__description { color: var(--psm-muted); font-size: 13px; line-height: 1.5; margin: 0 0 18px; }
.bkpv-card__features { list-style: none; padding: 0; margin: 0; flex: 1; }
.bkpv-card__features li { color: var(--psm-muted); font-size: 14.5px; padding: 9px 0 9px 22px; border-top: 1px solid var(--psm-line-soft); position: relative; line-height: 1.45; }
.bkpv-card__features li::before { content: ""; position: absolute; left: 0; top: 16px; width: 8px; height: 8px; border: 1px solid var(--psm-green); transform: rotate(45deg); background: transparent; }
.bkpv-card__bundle { margin-top: 16px; padding: 14px 16px; background: rgba(194, 252, 18, 0.06); border: 1px solid rgba(194, 252, 18, 0.2); }
.bkpv-card__bundle-title { display: block; font-family: ${MONO}; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--psm-green); margin-bottom: 8px; font-weight: 600; }
.bkpv-card__bundle-text { color: var(--psm-cream); font-size: 14px; line-height: 1.5; margin: 0; }
.bkpv-card__cta-row { display: flex; gap: 8px; margin-top: 26px; width: 100%; }
.bkpv-card__cta { display: flex; align-items: center; justify-content: center; flex: 1; text-align: center; font-family: ${MONO}; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; white-space: nowrap; padding: 14px 8px; border: 1px solid var(--psm-line-soft); color: var(--psm-cream); }
.bkpv-card__cta--secondary { flex: 0 0 auto; }
.bkpv-card__cta--featured { background: var(--psm-green); border-color: var(--psm-green); color: var(--psm-btn-text); font-weight: 600; }
`;

/** Renders admin HTML/CSS with the same @scope isolation the storefront uses. */
function PreviewWidget({ html, css, token }) {
  const cleanHtml = sanitizeWidgetHtml(html);
  const rawCss = String(css ?? "");
  const hasHtml = cleanHtml.length > 0;
  const hasCss = rawCss.trim().length > 0;

  if (!hasHtml && !hasCss) return null;

  return (
    <div className="bkpv-widget" data-bkpv-widget={token}>
      {hasCss ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `@scope ([data-bkpv-widget="${token}"]) {\n${sanitizeWidgetCss(rawCss)}\n}`,
          }}
        />
      ) : null}
      {hasHtml ? <div dangerouslySetInnerHTML={{ __html: cleanHtml }} /> : null}
    </div>
  );
}

function PreviewCard({ pkg, studioMicCapacity }) {
  const features = Array.isArray(pkg.features)
    ? pkg.features.filter((item) => String(item).trim().length > 0)
    : [];
  const { unit, note } = priceMeta(pkg);
  const highlighted = Boolean(pkg.highlightBadgeEnabled);
  const subtitleLine = cardSubtitle(pkg, studioMicCapacity);
  const description = stripHtml(pkg.description);

  return (
    <article className={`bkpv-card ${highlighted ? "bkpv-card--featured" : ""}`}>
      {highlighted ? (
        <span className="bkpv-card__badge">
          {pkg.highlightBadgeText?.trim() || "Most Popular"}
        </span>
      ) : null}

      <h3 className="bkpv-card__name">{capitalizeWords(pkg.name)}</h3>

      <p className="bkpv-card__price">
        <span className="bkpv-card__price-amount">{formatPrice(pkg.price)}</span>
        {unit ? <span className="bkpv-card__price-unit">{unit}</span> : null}
        {note ? <span className="bkpv-card__price-note"> · {note}</span> : null}
      </p>

      {subtitleLine ? <p className="bkpv-card__mics">{subtitleLine}</p> : null}
      {description ? <p className="bkpv-card__description">{description}</p> : null}

      {features.length > 0 ? (
        <ul className="bkpv-card__features">
          {features.map((feature, index) => (
            <li key={`${pkg._id}-f-${index}`}>{feature}</li>
          ))}
        </ul>
      ) : null}

      {pkg.bundleBenefits?.trim() ? (
        <div className="bkpv-card__bundle">
          <span className="bkpv-card__bundle-title">Bundle Benefits</span>
          <p className="bkpv-card__bundle-text">{pkg.bundleBenefits.trim()}</p>
        </div>
      ) : null}

      <div className="bkpv-card__cta-row" style={{ marginTop: "auto", paddingTop: 26 }}>
        <span className="bkpv-card__cta bkpv-card__cta--secondary">View Detail</span>
        <span className="bkpv-card__cta bkpv-card__cta--featured">Book Now</span>
      </div>
    </article>
  );
}

export default function PackagesPreview({
  packages = [],
  inlineWidgets = [],
  services = null,
  studioMicCapacity = 5,
  loading = false,
}) {
  const [open, setOpen] = useState(true);
  const [viewport, setViewport] = useState("desktop");
  const scopeId = useId().replace(/[^a-zA-Z0-9]/g, "") || "bkpv";

  const activePackages = useMemo(
    () => packages.filter((pkg) => pkg?.isActive !== false),
    [packages]
  );
  const hiddenCount = packages.length - activePackages.length;

  /** Storefront only shows filter chips when there are 3+ entries ("all" + 2 types). */
  const typeChips = useMemo(() => {
    const types = Array.from(new Set(activePackages.map((pkg) => pkg.type)));
    return types.length > 1 ? ["all", ...types] : [];
  }, [activePackages]);

  const widgetsByCount = useMemo(() => {
    const map = new Map();
    for (const widget of inlineWidgets || []) {
      if (!widget?.enabled) continue;
      if (!String(widget.html || "").trim()) continue;
      const count = Math.floor(Number(widget.afterPackageCount));
      if (!Number.isFinite(count) || count < 1) continue;
      map.set(count, [...(map.get(count) || []), widget]);
    }
    return map;
  }, [inlineWidgets]);

  const active = VIEWPORTS.find((v) => v.id === viewport) || VIEWPORTS[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: PREVIEW_CSS }} />

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-900"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Booking page preview
          <span className="font-normal text-gray-500">
            — how these cards look on /booking
          </span>
        </button>

        <div className="flex items-center gap-2">
          {open ? (
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
              {VIEWPORTS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewport(id)}
                  title={label}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewport === id
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          ) : null}
          <a
            href={storefrontBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-white"
          >
            <ExternalLink size={14} />
            Open live page
          </a>
        </div>
      </div>

      {open ? (
        <>
          <div className="bkpv px-5 py-8 overflow-x-auto">
            <div
              className="mx-auto"
              style={{ maxWidth: active.width ? `${active.width}px` : "100%" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
                <div>
                  <h2 className="bkpv-heading">
                    {services?.heading?.trim() || "Our Services"}
                  </h2>
                  {services?.subheading?.trim() ? (
                    <p className="bkpv-subheading">{services.subheading}</p>
                  ) : null}
                </div>

                {typeChips.length > 2 && active.cols > 1 ? (
                  <div className="bkpv-filters">
                    {typeChips.map((type) => (
                      <span
                        key={type}
                        className={`bkpv-filter ${
                          type === "all" ? "bkpv-filter--active" : "bkpv-filter--idle"
                        }`}
                      >
                        {type === "all"
                          ? "All Services"
                          : TYPE_LABELS[type] || type}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c2fc12]" />
                </div>
              ) : activePackages.length === 0 ? (
                <p className="py-16 text-center text-sm text-gray-400">
                  No active packages to show. Customers would see an empty
                  &quot;No Services Available&quot; state.
                </p>
              ) : (
                <div className="bkpv-grid" data-cols={active.cols}>
                  {activePackages.flatMap((pkg, index) => {
                    const nodes = [
                      <PreviewCard
                        key={pkg._id}
                        pkg={pkg}
                        studioMicCapacity={studioMicCapacity}
                      />,
                    ];
                    (widgetsByCount.get(index + 1) || []).forEach((widget, wIndex) => {
                      nodes.push(
                        <PreviewWidget
                          key={`w-${index + 1}-${wIndex}`}
                          html={widget.html}
                          css={widget.css}
                          token={`${scopeId}-${index + 1}-${wIndex}`}
                        />
                      );
                    });
                    return nodes;
                  })}
                </div>
              )}
            </div>
          </div>

          <p className="px-4 py-2.5 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
            Approximate preview — fonts and spacing follow the live theme, but the
            real page renders at full browser width.
            {hiddenCount > 0
              ? ` ${hiddenCount} inactive package${hiddenCount === 1 ? "" : "s"} hidden, as on the storefront.`
              : ""}
          </p>
        </>
      ) : null}
    </div>
  );
}
