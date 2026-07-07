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
};

export default function TagColorsForm({ tagColors, onChange, onSave, saving }) {
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
      <p className="text-xs text-gray-500">
        Applies site-wide to all <span className="font-mono">h1–h6</span>,{" "}
        <span className="font-mono">p</span>, <span className="font-mono">span</span>, and{" "}
        <span className="font-mono">label</span> tags — including pages that use Tailwind{" "}
        <span className="font-mono">text-gray-*</span>. No per-file code changes.
      </p>

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

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

TagColorsForm.defaultProps = {
  saving: false,
};
