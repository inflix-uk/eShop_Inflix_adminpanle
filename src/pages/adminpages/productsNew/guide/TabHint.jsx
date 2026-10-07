import { useState } from "react";
import PropTypes from "prop-types";
import { TAB_GUIDE, FIELD_LEVELS, GUIDE_PATH } from "./productGuideContent";

const STORAGE_PREFIX = "eshop:productGuide:tabHint:";

function readOpenState(slug) {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + slug) === "open";
  } catch {
    return false;
  }
}

function writeOpenState(slug, isOpen) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, isOpen ? "open" : "closed");
  } catch {
    // Private mode or blocked storage — the box simply opens collapsed next time.
  }
}

function LevelBadge({ level, when }) {
  const meta = FIELD_LEVELS[level] || FIELD_LEVELS.optional;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
    >
      {meta.label}
      {when ? <span className="ml-1 normal-case tracking-normal font-medium">{when}</span> : null}
    </span>
  );
}

LevelBadge.propTypes = {
  level: PropTypes.oneOf(Object.keys(FIELD_LEVELS)).isRequired,
  when: PropTypes.string,
};

/**
 * Compact, collapsible "How to complete this tab" box for the product form.
 * Content comes from TAB_GUIDE so it can never disagree with the full guide.
 * Renders nothing for a slug that is not in the guide.
 */
export default function TabHint({ slug }) {
  const tab = TAB_GUIDE.find((entry) => entry.slug === slug);
  const [open, setOpen] = useState(() => readOpenState(slug));

  if (!tab) return null;

  const requiredCount = tab.fields.filter((f) => f.level === "required").length;
  const recommendedCount = tab.fields.filter((f) => f.level === "recommended").length;
  const guideHref = `${GUIDE_PATH}#${tab.slug}`;
  const panelId = `tab-hint-${tab.slug}`;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    writeOpenState(slug, next);
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 text-sm text-gray-800">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <svg
            className={`h-4 w-4 shrink-0 text-blue-700 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="min-w-0">
            <span className="font-semibold text-blue-800">How to complete this tab</span>
            <span className="hidden sm:inline text-gray-600"> — {tab.purpose}</span>
          </span>
        </button>
        <span className="flex shrink-0 items-center gap-2 text-xs text-gray-600">
          <span>
            <span className="font-semibold text-red-700">{requiredCount}</span> required ·{" "}
            <span className="font-semibold text-orange-700">{recommendedCount}</span> recommended
          </span>
          <a
            href={guideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline whitespace-nowrap"
          >
            Open full guide
          </a>
        </span>
      </div>

      {open && (
        <div id={panelId} className="border-t border-blue-200 px-3 py-3 space-y-3">
          <p className="text-gray-700 sm:hidden">{tab.purpose}</p>
          <ul className="space-y-2">
            {tab.fields.map((field) => (
              <li key={field.name} className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex items-center gap-2 sm:w-64 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1">
                  <span className="font-semibold text-gray-900">{field.name}</span>
                  <LevelBadge level={field.level} when={field.when} />
                </div>
                <p className="text-gray-700">{field.how}</p>
              </li>
            ))}
          </ul>
          {tab.tips?.length > 0 && (
            <div className="rounded-md bg-white/70 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tips</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                {tab.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

TabHint.propTypes = {
  /** Tab slug, e.g. "basic-information" — see TAB_GUIDE in productGuideContent.js. */
  slug: PropTypes.string.isRequired,
};
