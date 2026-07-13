import PropTypes from "prop-types";
import { DEFAULT_TAG_COLORS, TAG_COLOR_KEYS } from "../tagColorsDefaults";
import { hexForColorInput, normalizeHex } from "../colorUtils";

const LABELS = {
  h1: "Heading 1 (h1)",
  h2: "Heading 2 (h2)",
  h3: "Heading 3 (h3)",
  h4: "Heading 4 (h4)",
  h5: "Heading 5 (h5)",
  h6: "Heading 6 (h6)",
  p: "Paragraph (p)",
  span: "Span (span)",
  label: "Form label (label)",
  bookingCalendarDate: "Booking Calendar Dates",
  bookingSelectedDateBg: "Booking Selected Date Background",
  bookingSelectedSlotBg: "Booking Selected Slot Background",
};

export default function TagColorsForm({
  tagColors,
  tagColorsEnabled,
  onChange,
  onEnabledChange,
  onSave,
  saving,
}) {
  const handleColorChange = (key, value) => {
    onChange({ ...tagColors, [key]: value });
  };

  const handleTextChange = (key, e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) onChange({ ...tagColors, [key]: hex });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_TAG_COLORS });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={tagColorsEnabled !== false}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">
              Enable site-wide HTML tag colors
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-600">
              When off, global h1–h6 / p / span / label colors are not applied on the
              storefront. Use this when sections use their own color pickers (banners,
              homepage blocks, dark/light themes).
            </span>
          </span>
        </label>
      </div>

      <p className="text-xs text-gray-500">
        {tagColorsEnabled !== false
          ? "Applies site-wide to all h1–h6, p, span, and label tags on blog/product pages and generic content."
          : "Disabled — storefront sections will use their own dynamic admin colors (Tailwind / per-widget pickers)."}
      </p>

      <fieldset
        disabled={tagColorsEnabled === false}
        className={`space-y-6 border-0 p-0 m-0 ${
          tagColorsEnabled === false ? "opacity-50 pointer-events-none" : ""
        }`}
      >
      <div className="grid gap-5 sm:grid-cols-2">
        {TAG_COLOR_KEYS.map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {LABELS[key]}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hexForColorInput(tagColors[key])}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                aria-label={LABELS[key]}
              />
              <input
                type="text"
                value={tagColors[key]}
                onChange={(e) => handleTextChange(key, e)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                spellCheck={false}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
        <div className="rounded-lg border border-gray-200 p-6 space-y-3 bg-white">
          <h1 className="text-3xl font-bold text-gray-900" style={{ color: tagColors.h1 }}>
            Sample heading 1
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900" style={{ color: tagColors.h2 }}>
            Sample heading 2
          </h2>
          <h3 className="text-xl font-medium text-gray-800" style={{ color: tagColors.h3 }}>
            Sample heading 3
          </h3>
          <p className="text-base text-gray-700" style={{ color: tagColors.p }}>
            Sample paragraph with{" "}
            <span className="text-gray-600" style={{ color: tagColors.span }}>
              inline span text
            </span>{" "}
            — storefront body copy preview.
          </p>
          <label
            htmlFor="tag-colors-preview-field"
            className="block text-sm font-medium text-gray-700"
            style={{ color: tagColors.label }}
          >
            Sample form label
          </label>
          <input
            id="tag-colors-preview-field"
            type="text"
            readOnly
            value="Sample input field"
            className="mt-1 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </div>
      </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          disabled={tagColorsEnabled === false}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          Reset to defaults
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save tag colors"}
        </button>
      </div>
    </form>
  );
}

TagColorsForm.propTypes = {
  tagColors: PropTypes.object.isRequired,
  tagColorsEnabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onEnabledChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

TagColorsForm.defaultProps = {
  tagColorsEnabled: true,
  saving: false,
};
