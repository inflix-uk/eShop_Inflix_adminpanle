import PropTypes from "prop-types";
import {
  DEFAULT_BOOKING_MODULE_UI,
  adminDisplayBookingModuleUi,
} from "../bookingUiDefaults";
import { hexForColorInput, normalizeHex } from "../colorUtils";

const COLOR_FIELDS = [
  {
    key: "serviceCardBgColor",
    label: "Card background",
    hint: "Package card surface color.",
  },
  {
    key: "buttonBgColor",
    label: "Button / accent",
    hint: "Featured CTA, badge, price accent, and filter chips.",
  },
  {
    key: "buttonTextColor",
    label: "Button text",
    hint: "Text on featured buttons and badges.",
  },
  {
    key: "headingColor",
    label: "Heading",
    hint: "Card title and section heading.",
  },
  {
    key: "subheadingColor",
    label: "Subheading",
    hint: "Section subheading under Our Services.",
  },
  {
    key: "listTextColor",
    label: "List text",
    hint: "Feature list items on each card.",
  },
  {
    key: "descriptionColor",
    label: "Description",
    hint: "Muted text such as price notes and empty state.",
  },
];

function ColorField({ fieldKey, label, hint, value, onChange }) {
  const previewHex = hexForColorInput(value);

  const handleTextChange = (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) onChange(fieldKey, hex);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={previewHex}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          spellCheck={false}
        />
      </div>
      {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

ColorField.propTypes = {
  fieldKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function BookingUiCustomForm({ bookingUi, onChange, onSave, saving }) {
  const ui = adminDisplayBookingModuleUi(bookingUi);

  const handleFieldChange = (key, value) => {
    onChange({ ...ui, [key]: value });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_BOOKING_MODULE_UI });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave();
  };

  const previewVars = {
    "--psm-coal": ui.serviceCardBgColor,
    "--psm-green": ui.buttonBgColor,
    "--psm-btn-text": ui.buttonTextColor,
    "--psm-cream": ui.headingColor,
    "--psm-muted": ui.listTextColor,
    "--psm-subheading": ui.subheadingColor,
    "--psm-description": ui.descriptionColor,
    "--psm-line-soft": "rgba(255, 255, 255, 0.08)",
    "--psm-line": `${ui.buttonBgColor}59`,
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <p className="text-sm text-gray-600">
        Colors apply only to the booking packages section on{" "}
        <span className="font-mono text-xs">/booking</span> — independent from site-wide
        primary/secondary.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {COLOR_FIELDS.map((field) => (
          <ColorField
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            hint={field.hint}
            value={ui[field.key]}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Card preview</p>
        <p className="text-xs text-gray-500 mb-3">
          Live preview using booking module colors (not site-wide brand colors).
        </p>
        <div
          className="rounded-xl border border-dashed border-gray-300 p-4 sm:p-6"
          style={{ backgroundColor: "#050505" }}
        >
          <div style={previewVars} className="max-w-sm mx-auto">
            <p
              className="text-lg font-light mb-1"
              style={{
                color: "var(--psm-cream)",
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              Our Services
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--psm-subheading)" }}>
              Choose the perfect package for your session.
            </p>
            <article
              className="relative flex flex-col border p-6"
              style={{
                background: "var(--psm-coal)",
                borderColor: "var(--psm-line-soft)",
              }}
            >
              <span
                className="absolute -top-3 left-6 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
                style={{
                  background: "var(--psm-green)",
                  color: "var(--psm-btn-text)",
                }}
              >
                Most Popular
              </span>
              <h3
                className="text-xl font-light mt-2 mb-1"
                style={{
                  color: "var(--psm-cream)",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                Audio Session
              </h3>
              <p className="text-sm mb-4 font-mono tracking-wide" style={{ color: "var(--psm-green)" }}>
                £50.00 <span style={{ color: "var(--psm-description)", fontSize: 11 }}>+ VAT</span>
              </p>
              <ul className="space-y-2 text-sm mb-5" style={{ color: "var(--psm-muted)" }}>
                <li>Professional equipment</li>
                <li>Instant confirmation</li>
              </ul>
              <button
                type="button"
                className="w-full py-3 text-[11px] uppercase tracking-widest font-semibold font-mono"
                style={{
                  background: "var(--psm-green)",
                  color: "var(--psm-btn-text)",
                  border: "1px solid var(--psm-green)",
                }}
              >
                Book Now
              </button>
            </article>
          </div>
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
          {saving ? "Saving…" : "Save booking UI"}
        </button>
      </div>
    </form>
  );
}

BookingUiCustomForm.propTypes = {
  bookingUi: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

BookingUiCustomForm.defaultProps = {
  bookingUi: null,
  saving: false,
};
