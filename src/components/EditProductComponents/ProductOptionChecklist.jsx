import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

// Preset icons (same set as the Product Central product-options page)
import Adapter from "../../assets/Adapter";
import PowerCable from "../../assets/PowerCable";
import ProtectionBundle from "../../assets/ProtectionBundle";
import Tree from "../../assets/Tree";
import hdmiCable from "../../assets/hdmi-cable.png";
import powerCableNew from "../../assets/Pawer-cable.png";
import onexcontrollerImg from "../../assets/onexcontroller.png";
import twoxcontrollerImg from "../../assets/twoxcontroller.png";
import SimImg from "../../assets/sim.png";
import ScreenProtectorImg from "../../assets/screenprotector.png";
import BackCoverImg from "../../assets/backcover.png";

// Map preset icon IDs to their components/images
const ICON_MAP = {
  powerAdapter: { type: "component", component: Adapter, name: "Power Adapter" },
  chargingCable: { type: "component", component: PowerCable, name: "Charging Cable" },
  protectionBundle: { type: "component", component: ProtectionBundle, name: "Protection Bundle" },
  treePlanted: { type: "component", component: Tree, name: "Tree Planted" },
  hdmiCable: { type: "image", src: hdmiCable, name: "HDMI Cable" },
  powerCableNew: { type: "image", src: powerCableNew, name: "Power Cable" },
  onexController: { type: "image", src: onexcontrollerImg, name: "1x Controller" },
  twoxController: { type: "image", src: twoxcontrollerImg, name: "2x Controller" },
  freeSim: { type: "image", src: SimImg, name: "Free Sim" },
  screenProtector: { type: "image", src: ScreenProtectorImg, name: "Screen Protector" },
  backCover: { type: "image", src: BackCoverImg, name: "Back Cover" },
};

// Flaticon CSS for custom <i class="fi ..."> icons (align with the product-options page)
const FLATICON_STYLESHEETS = [
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css",
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css",
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css",
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-straight/css/uicons-regular-straight.css",
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-straight/css/uicons-bold-straight.css",
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-straight/css/uicons-solid-straight.css",
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-brands/css/uicons-brands.css",
];

function ensureFlaticonStyles() {
  FLATICON_STYLESHEETS.forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

/* ------------------------------------------------------------------ */
/* Icon helpers                                                        */
/* ------------------------------------------------------------------ */

/** Match preset keys when DB has snake_case / kebab-case (e.g. back_cover, back-cover). */
function normalizePresetIconKey(id) {
  if (!id || typeof id !== "string") return id;
  const t = id.trim();
  if (!t) return t;
  return t.replace(/[-_]([a-z0-9])/gi, (_, c) => c.toUpperCase());
}

function decodeIconHtmlIfNeeded(str) {
  if (!str || typeof str !== "string") return str;
  const t = str.trim();
  if (t.includes("&lt;") && !t.includes("<")) {
    try {
      const ta = document.createElement("textarea");
      ta.innerHTML = t;
      return ta.value.trim();
    } catch {
      return t;
    }
  }
  return t;
}

function looksLikeIconHtml(str) {
  if (!str || typeof str !== "string") return false;
  return decodeIconHtmlIfNeeded(str).includes("<");
}

function looksLikeImageUrl(str) {
  if (!str || typeof str !== "string") return false;
  const t = str.trim();
  return /^https?:\/\//i.test(t) || /^\/uploads\//i.test(t) || /^data:image\//i.test(t);
}

function getVariantValueImageSrc(image, apiBase) {
  if (!image) return null;
  if (image.url) return image.url;
  if (image.path && apiBase) {
    const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const p = image.path.startsWith("/") ? image.path : `/${image.path}`;
    return `${base}${p}`;
  }
  return null;
}

function resolveIconMapEntry(iconId) {
  if (!iconId || typeof iconId !== "string") return null;
  const raw = iconId.trim();
  const camelized = normalizePresetIconKey(raw);
  const lcFirst = camelized ? camelized.charAt(0).toLowerCase() + camelized.slice(1) : camelized;
  return ICON_MAP[raw] || ICON_MAP[camelized] || ICON_MAP[lcFirst] || null;
}

/** Renders a product-option icon: preset id, custom HTML (Flaticon / inline SVG), image URL, or uploaded image. */
export function OptionIcon({ iconId, image, apiBase, className = "h-6 w-6" }) {
  const rawIcon = typeof iconId === "string" ? iconId.trim() : iconId;
  const hasIcon = rawIcon !== undefined && rawIcon !== null && String(rawIcon).length > 0;

  // Custom HTML icons (Flaticon, inline SVG) - including HTML-encoded saves
  if (hasIcon && typeof rawIcon === "string" && looksLikeIconHtml(rawIcon)) {
    return (
      <span
        className={`${className} flex items-center justify-center [&>i]:text-base [&>svg]:w-full [&>svg]:h-full`}
        dangerouslySetInnerHTML={{ __html: decodeIconHtmlIfNeeded(rawIcon) }}
      />
    );
  }

  // Icon stored as a direct image URL (custom upload / absolute URL)
  if (hasIcon && typeof rawIcon === "string" && looksLikeImageUrl(rawIcon)) {
    return <img src={rawIcon} alt="" className={`${className} object-contain`} />;
  }

  const iconData = hasIcon ? resolveIconMapEntry(rawIcon) : null;
  if (iconData) {
    if (iconData.type === "component") {
      const IconComponent = iconData.component;
      return <IconComponent className={className} />;
    }
    return <img src={iconData.src} alt={iconData.name} className={`${className} object-contain`} />;
  }

  const imgFromValue = getVariantValueImageSrc(image, apiBase);
  if (imgFromValue) {
    return <img src={imgFromValue} alt="" className={`${className} object-contain`} />;
  }

  // Placeholder when nothing usable is configured
  return (
    <span className={`${className} flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded`}>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </span>
  );
}

OptionIcon.propTypes = {
  iconId: PropTypes.string,
  image: PropTypes.shape({
    url: PropTypes.string,
    path: PropTypes.string,
  }),
  apiBase: PropTypes.string,
  className: PropTypes.string,
};

/* ------------------------------------------------------------------ */
/* Saved-value resolution                                              */
/* ------------------------------------------------------------------ */

/** Tolerant slug comparison: case-insensitive, "-" and "_" treated the same. */
function slugKey(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[-_]+/g, "-");
}

/** Name comparison: case-insensitive, trimmed. */
function nameKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

/** Drop options without a slug and de-duplicate by slug (first wins). */
function uniqueOptions(options) {
  const seen = new Set();
  const out = [];
  for (const option of options || []) {
    if (!option || typeof option.slug !== "string" || !option.slug) continue;
    if (seen.has(option.slug)) continue;
    seen.add(option.slug);
    out.push(option);
  }
  return out;
}

/**
 * Resolve the values saved on the product against the available options.
 *
 * - `selected`     options that a saved value resolved to, in saved order (de-duplicated)
 * - `unrecognised` saved values that match nothing (kept as they were saved)
 * - `canonical`    the saved array rewritten with option slugs for everything that
 *                  resolved, unrecognised values left in place, duplicates/empties removed
 */
function resolveSavedValues(options, savedValues) {
  const bySlug = new Map();
  const byTolerantSlug = new Map();
  const byName = new Map();
  options.forEach((option) => {
    if (!bySlug.has(option.slug)) bySlug.set(option.slug, option);
    const tolerant = slugKey(option.slug);
    if (tolerant && !byTolerantSlug.has(tolerant)) byTolerantSlug.set(tolerant, option);
    const name = nameKey(option.name);
    if (name && !byName.has(name)) byName.set(name, option);
  });

  const selected = [];
  const unrecognised = [];
  const canonical = [];
  const seen = new Set();

  (Array.isArray(savedValues) ? savedValues : []).forEach((raw) => {
    if (raw === null || raw === undefined) return;
    const text = String(raw);
    if (!text.trim()) return;

    const option =
      bySlug.get(text) || byTolerantSlug.get(slugKey(text)) || byName.get(nameKey(text)) || null;
    const key = option ? `option:${option.slug}` : `raw:${text}`;
    if (seen.has(key)) return;
    seen.add(key);

    if (option) {
      selected.push(option);
      canonical.push(option.slug);
    } else {
      unrecognised.push(raw);
      canonical.push(raw);
    }
  });

  return { selected, unrecognised, canonical };
}

/* ------------------------------------------------------------------ */
/* Checklist UI                                                        */
/* ------------------------------------------------------------------ */

const SEARCH_THRESHOLD = 8;
const DEFAULT_MANAGE_HREF = "/admin/product-options";

export default function ProductOptionChecklist({
  title,
  legacyLabel,
  description,
  options,
  value,
  onChange,
  max,
  ordered = false,
  isLoading = false,
  error = null,
  emptyText = "No options have been set up yet.",
  searchPlaceholder = "Search options...",
  manageHref = DEFAULT_MANAGE_HREF,
  apiBase,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    ensureFlaticonStyles();
  }, []);

  const availableOptions = useMemo(() => uniqueOptions(options), [options]);
  const { selected, unrecognised, canonical } = useMemo(
    () => resolveSavedValues(availableOptions, value),
    [availableOptions, value]
  );
  const selectedSlugs = useMemo(() => new Set(selected.map((o) => o.slug)), [selected]);

  const hasMax = Number.isFinite(max) && max > 0;
  const atMax = hasMax && selected.length >= max;
  const overBy = hasMax ? Math.max(0, selected.length - max) : 0;

  const showSearch = availableOptions.length > SEARCH_THRESHOLD;
  const query = searchTerm.trim().toLowerCase();
  const visibleOptions =
    showSearch && query
      ? availableOptions.filter((option) => String(option.name || option.slug).toLowerCase().includes(query))
      : availableOptions;

  const countLabel = hasMax
    ? `${selected.length} of ${max}`
    : selected.length === 0
      ? "None selected"
      : `${selected.length} selected`;
  const countClass =
    atMax
      ? "bg-orange-100 text-orange-700"
      : selected.length > 0
        ? "bg-primary/10 text-primary"
        : "bg-gray-100 text-gray-500";

  const maxNote = !hasMax
    ? null
    : overBy > 0
      ? `Too many ticked: only ${max} can be shown. Untick ${overBy} to get back to ${max}.`
      : atMax
        ? `Maximum ${max} - untick one to choose another`
        : null;

  // --- write-back helpers (always emit canonical slugs for resolved values) ---
  const toggleOption = (option) => {
    if (selectedSlugs.has(option.slug)) {
      onChange(canonical.filter((v) => v !== option.slug));
      return;
    }
    if (atMax) return;
    onChange([...canonical, option.slug]);
  };

  const moveSelected = (slug, direction) => {
    const order = selected.map((o) => o.slug);
    const from = order.indexOf(slug);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= order.length) return;
    const a = canonical.indexOf(order[from]);
    const b = canonical.indexOf(order[to]);
    const next = [...canonical];
    [next[a], next[b]] = [next[b], next[a]];
    onChange(next);
  };

  const removeUnrecognised = (raw) => {
    onChange(canonical.filter((v) => v !== raw));
  };

  const manageLink = (
    <a
      href={manageHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      Manage options
      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );

  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="py-3 px-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-gray-900">
              {title}
              {legacyLabel && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">({legacyLabel})</span>
              )}
            </h2>
            {description && <p className="mt-0.5 text-xs leading-snug text-gray-500">{description}</p>}
          </div>
          {!isLoading && !error && (
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${countClass}`}>
              {countLabel}
            </span>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <div className="py-3 text-center text-xs text-red-500">{error}</div>
        ) : (
          <div className="mt-3 space-y-3">
            {availableOptions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-xs text-gray-500">
                <p>{emptyText}</p>
                <p className="mt-1">{manageLink}</p>
              </div>
            ) : (
              <>
                {showSearch && (
                  <div className="relative">
                    <MagnifyingGlassIcon
                      className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                      className="w-full rounded-md border-0 py-1.5 pl-7 pr-2 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                    />
                  </div>
                )}

                {maxNote && (
                  <p className="text-xs font-medium text-orange-700" role="status">
                    {maxNote}
                  </p>
                )}

                {/* Tick list */}
                <div
                  role="group"
                  aria-label={title}
                  className="max-h-64 overflow-y-auto p-0.5 scrollbar-thin"
                >
                  {visibleOptions.length === 0 ? (
                    <p className="py-3 text-center text-xs text-gray-500">
                      {`No options match "${searchTerm.trim()}".`}
                    </p>
                  ) : (
                    <div className="grid gap-1.5 grid-cols-[repeat(auto-fill,minmax(min(11rem,100%),1fr))]">
                      {visibleOptions.map((option) => {
                        const checked = selectedSlugs.has(option.slug);
                        const disabled = !checked && atMax;
                        const name = option.name || option.slug;
                        return (
                          <label
                            key={option.slug}
                            title={disabled ? maxNote : name}
                            className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
                              checked
                                ? "cursor-pointer border-primary bg-primary/5"
                                : disabled
                                  ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                                  : "cursor-pointer border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleOption(option)}
                              className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                            />
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${
                                checked ? "bg-white" : "bg-gray-100"
                              }`}
                            >
                              <OptionIcon iconId={option.icon} image={option.image} apiBase={apiBase} className="h-4 w-4" />
                            </span>
                            <span
                              className={`min-w-0 flex-1 break-words text-xs font-medium leading-snug ${
                                checked ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Ordered summary (what customers will see, in order) */}
            {ordered && selected.length > 0 && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs font-semibold text-gray-700">Shown to customers in this order</p>
                {selected.length > 1 && (
                  <p className="text-xs text-gray-500">Use the arrows to move one up or down.</p>
                )}
                <ol className="mt-1.5 space-y-1">
                  {selected.map((option, index) => (
                    <li key={option.slug} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-gray-800" title={option.name || option.slug}>
                        {option.name || option.slug}
                      </span>
                      {selected.length > 1 && (
                        <span className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveSelected(option.slug, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${option.name || option.slug} up`}
                            className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSelected(option.slug, 1)}
                            disabled={index === selected.length - 1}
                            aria-label={`Move ${option.name || option.slug} down`}
                            className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Saved values that match nothing (e.g. from imported products) */}
            {unrecognised.length > 0 && (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-yellow-800">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {`Not recognised (${unrecognised.length})`}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-yellow-800">
                  {"These saved values don't match any option in the list, so on the product page they show without an icon or not at all. Remove them, or tick the right option instead."}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {unrecognised.map((raw) => (
                    <li
                      key={String(raw)}
                      className="flex items-center gap-1.5 rounded-md border border-yellow-300 bg-white py-0.5 pl-2 pr-1 text-xs"
                    >
                      <span className="break-all font-medium text-gray-800">{String(raw)}</span>
                      <button
                        type="button"
                        onClick={() => removeUnrecognised(raw)}
                        className="rounded px-1.5 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {availableOptions.length > 0 && (
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-gray-500">
                <span>Missing an option?</span>
                {manageLink}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ProductOptionChecklist.propTypes = {
  title: PropTypes.string.isRequired,
  legacyLabel: PropTypes.string,
  description: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      slug: PropTypes.string,
      icon: PropTypes.string,
      image: PropTypes.shape({ url: PropTypes.string, path: PropTypes.string }),
      isActive: PropTypes.bool,
    })
  ),
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  ordered: PropTypes.bool,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  emptyText: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  manageHref: PropTypes.string,
  apiBase: PropTypes.string,
};
