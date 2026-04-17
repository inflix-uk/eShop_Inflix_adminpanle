import PropTypes from "prop-types";
import { useMemo } from "react";

/** Returns normalized #RRGGBB or null if invalid */
function normalizeHex(input) {
  if (input == null || typeof input !== "string") return null;
  let s = input.trim();
  if (s === "") return null;
  if (!s.startsWith("#")) s = `#${s}`;
  if (/^#([0-9A-Fa-f]{6})$/.test(s)) return s.toUpperCase();
  if (/^#([0-9A-Fa-f]{3})$/.test(s)) {
    const [, short] = s.match(/^#([0-9A-Fa-f]{3})$/);
    const r = short[0];
    const g = short[1];
    const b = short[2];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return null;
}

function pickerSafeHex(value, fallback) {
  const n = normalizeHex(value);
  if (n) return n;
  const f = normalizeHex(fallback);
  if (f) return f;
  return "#FFFFFF";
}

const ColorSelector = ({ label, value, onChange, defaultColor = "#FFFFFF" }) => {
  const selectedColor = value ?? defaultColor;
  const colorInputValue = useMemo(
    () => pickerSafeHex(selectedColor, defaultColor),
    [selectedColor, defaultColor]
  );

  const handleHexInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleHexInputBlur = (e) => {
    const normalized = normalizeHex(e.target.value);
    if (normalized) onChange(normalized);
  };

  const handleNativePickerChange = (e) => {
    onChange(e.target.value.toUpperCase());
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Picker</span>
          <input
            type="color"
            value={colorInputValue}
            onChange={handleNativePickerChange}
            className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
            aria-label={`${label} color picker`}
          />
        </div>
        <div className="flex flex-1 items-center gap-2 min-w-[200px]">
          <span className="text-xs text-gray-500 whitespace-nowrap">Hex</span>
          <input
            type="text"
            value={selectedColor}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            placeholder="#FFFFFF"
            spellCheck={false}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary"
            aria-label={`${label} hex value`}
          />
        </div>
        <div
          className="h-10 w-10 shrink-0 rounded-md border-2 border-gray-300 shadow-inner"
          style={{ backgroundColor: colorInputValue }}
          title="Current color preview"
        />
      </div>

      <p className="text-xs text-gray-500">
        Use the picker or type any hex color (e.g.{" "}
        <code className="bg-gray-100 px-1 rounded">#1a5f7a</code>).
      </p>
    </div>
  );
};

ColorSelector.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  defaultColor: PropTypes.string,
};

export default ColorSelector;
