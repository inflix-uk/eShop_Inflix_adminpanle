import PropTypes from "prop-types";
import { DEFAULT_BOOKING_SERVICE_CARD_BG } from "../bookingUiDefaults";
import { hexForColorInput, normalizeHex } from "../colorUtils";

export default function BookingUiCustomForm({
  serviceCardBgColor,
  onChange,
  onSave,
  saving,
  primaryColor,
  secondaryColor,
}) {
  const handleTextChange = (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) onChange(hex);
  };

  const handleReset = () => {
    onChange(DEFAULT_BOOKING_SERVICE_CARD_BG);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave();
  };

  const previewHex = hexForColorInput(serviceCardBgColor);
  const brandPrimary = hexForColorInput(primaryColor || "#25af60");
  const brandSecondary = hexForColorInput(secondaryColor || "#0e231c");

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Our Services card background
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={previewHex}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
            aria-label="Booking service card background color"
          />
          <input
            type="text"
            value={serviceCardBgColor}
            onChange={handleTextChange}
            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            spellCheck={false}
            placeholder="#ffffff"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Applies to service cards on the public booking page (`/booking`).
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Card preview</p>
        <p className="text-xs text-gray-500 mb-3">
          Live preview of one &quot;Our Services&quot; card with your selected background.
        </p>
        <div
          className="rounded-xl border border-dashed border-gray-300 p-4 sm:p-6"
          style={{ backgroundColor: "var(--body-bg-preview, #f3f4f6)" }}
        >
          <article
            className="flex flex-col rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 max-w-sm mx-auto"
            style={{ backgroundColor: previewHex }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 leading-tight">Audio Session</h3>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 shrink-0 pt-0.5">
                60m
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Perfect for studio bookings with instant confirmation.
            </p>
            <div className="border-t border-gray-200 pt-6 mb-6">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">£50.00</span>
            </div>
            <ul className="space-y-3.5 flex-1 mb-6">
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs">
                  ✓
                </span>
                Professional equipment
              </li>
            </ul>
            <button
              type="button"
              className="flex w-full items-center justify-center text-white py-3.5 px-6 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: brandPrimary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = brandSecondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = brandPrimary;
              }}
            >
              Book Now
            </button>
          </article>
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
          {saving ? "Saving…" : "Save booking UI"}
        </button>
      </div>
    </form>
  );
}

BookingUiCustomForm.propTypes = {
  serviceCardBgColor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
};

BookingUiCustomForm.defaultProps = {
  saving: false,
  primaryColor: "#25af60",
  secondaryColor: "#0e231c",
};
