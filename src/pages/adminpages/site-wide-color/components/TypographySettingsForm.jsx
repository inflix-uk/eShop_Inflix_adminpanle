import PropTypes from "prop-types";
import { ALLOWED_FONTS, ALLOWED_STYLES, ALLOWED_WEIGHTS } from "../typographyDefaults";

function LevelRow({ tag, label, value, onChange }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-900">
        {label} <span className="font-mono text-gray-500">({tag})</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Font</label>
          <select
            value={value.font}
            onChange={(e) => onChange(tag, { font: e.target.value })}
            className="w-full rounded-md border border-gray-300 py-2 px-2 text-sm"
          >
            {ALLOWED_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
                {f === "Georgia" ? " (system)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
          <select
            value={String(value.weight)}
            onChange={(e) => onChange(tag, { weight: Number(e.target.value) })}
            className="w-full rounded-md border border-gray-300 py-2 px-2 text-sm"
          >
            {ALLOWED_WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
          <select
            value={value.style}
            onChange={(e) => onChange(tag, { style: e.target.value })}
            className="w-full rounded-md border border-gray-300 py-2 px-2 text-sm"
          >
            {ALLOWED_STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

LevelRow.propTypes = {
  tag: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.shape({
    font: PropTypes.string,
    weight: PropTypes.number,
    style: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function TypographySettingsForm({ typography, onChange, onSave, saving }) {
  const patchLevel = (tag, partial) => {
    onChange({
      ...typography,
      [tag]: { ...typography[tag], ...partial },
    });
  };

  const previewStyle = (level) => ({
    fontFamily:
      level.font === "Georgia"
        ? 'Georgia, "Times New Roman", serif'
        : `${level.font}, ui-sans-serif, system-ui, sans-serif`,
    fontWeight: level.weight,
    fontStyle: level.style,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <LevelRow tag="h1" label="Heading 1" value={typography.h1} onChange={patchLevel} />
        <LevelRow tag="h2" label="Heading 2" value={typography.h2} onChange={patchLevel} />
        <LevelRow tag="h3" label="Heading 3" value={typography.h3} onChange={patchLevel} />
        <LevelRow tag="p" label="Body" value={typography.p} onChange={patchLevel} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Live preview</p>
        <p className="text-xs text-gray-500 mb-3">
          Approximate preview (exact rendering uses next/font on the storefront).
        </p>
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 space-y-3">
          <h1 className="text-2xl" style={previewStyle(typography.h1)}>
            Sample H1 title
          </h1>
          <h2 className="text-xl" style={previewStyle(typography.h2)}>
            Sample H2 title
          </h2>
          <h3 className="text-lg" style={previewStyle(typography.h3)}>
            Sample H3 title
          </h3>
          <p className="text-base" style={previewStyle(typography.p)}>
            Sample paragraph text for body copy and product descriptions.
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {saving ? "Saving typography…" : "Save typography to website"}
        </button>
      </div>
    </div>
  );
}

TypographySettingsForm.propTypes = {
  typography: PropTypes.shape({
    h1: PropTypes.object,
    h2: PropTypes.object,
    h3: PropTypes.object,
    p: PropTypes.object,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

TypographySettingsForm.defaultProps = {
  saving: false,
};
