import PropTypes from "prop-types";
import { DEFAULT_BODY_BG } from "../bodyBackgroundDefaults";
import { hexForColorInput, normalizeHex } from "../colorUtils";

function adminDisplayBodyBg(stored) {
  const v = typeof stored === "string" ? stored.trim() : "";
  if (!v) return DEFAULT_BODY_BG;
  return normalizeHex(v) ?? DEFAULT_BODY_BG;
}

export default function BodyBackgroundColorForm({
  bodyBgColor,
  onChange,
  onSave,
  saving,
}) {
  const handleTextChange = (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) onChange(hex);
  };

  const handleReset = () => {
    onChange(DEFAULT_BODY_BG);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave();
  };

  const previewHex = hexForColorInput(bodyBgColor);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Body background color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={previewHex}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
            aria-label="Body background color"
          />
          <input
            type="text"
            value={bodyBgColor}
            onChange={handleTextChange}
            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            spellCheck={false}
            placeholder="#ffffff"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Applies to the page background across the public website.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
        <div
          className="rounded-lg border border-gray-200 p-6 min-h-[120px] flex items-center justify-center"
          style={{ backgroundColor: previewHex }}
        >
          <p className="text-sm text-gray-700 bg-white/80 px-3 py-1.5 rounded-md shadow-sm">
            Sample content on body background
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Reset to default
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save body background"}
        </button>
      </div>
    </form>
  );
}

export { adminDisplayBodyBg };

BodyBackgroundColorForm.propTypes = {
  bodyBgColor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

BodyBackgroundColorForm.defaultProps = {
  saving: false,
};
