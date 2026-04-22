import { useCallback } from "react";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
];

function emptyField(sortOrder) {
  return {
    name: `field_${Date.now()}`,
    label: "",
    type: "text",
    placeholder: "",
    required: false,
    minLength: null,
    maxLength: null,
    pattern: "",
    helpText: "",
    options: [],
    showWhenField: "",
    showWhenValue: "",
    sortOrder,
  };
}

function normalizeFieldForSave(f, index) {
  return {
    ...f,
    sortOrder: index,
    minLength: null,
    maxLength: null,
    pattern: "",
    showWhenField: "",
    showWhenValue: "",
  };
}

function buildPayload(initialData) {
  const fields = (initialData?.fields || []).map((f, i) =>
    normalizeFieldForSave({ ...f, sortOrder: f.sortOrder ?? i }, i)
  );
  return {
    isActive: initialData?.isActive !== false,
    title: initialData?.title || "",
    description: initialData?.description || "",
    submitButtonLabel: initialData?.submitButtonLabel || "Send",
    successMessage:
      initialData?.successMessage ||
      "Your message has been sent. We will get back to you soon.",
    fields,
  };
}

function FieldCard({ field, index, total, onChange, onRemove, onMove }) {
  const needsOptions = field.type === "select" || field.type === "radio";

  const addOption = () => {
    const next = [...(field.options || []), { label: "", value: "" }];
    onChange(index, { ...field, options: next });
  };

  const setOption = (oi, key, val) => {
    const next = [...(field.options || [])];
    next[oi] = { ...next[oi], [key]: val };
    onChange(index, { ...field, options: next });
  };

  const removeOption = (oi) => {
    const next = (field.options || []).filter((_, j) => j !== oi);
    onChange(index, { ...field, options: next });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <span className="text-sm font-semibold text-gray-800">Field {index + 1}</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Up
          </button>
          <button
            type="button"
            disabled={index >= total - 1}
            onClick={() => onMove(index, 1)}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Down
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-gray-600">Type</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
            value={field.type}
            onChange={(e) => onChange(index, { ...field, type: e.target.value })}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Field key (name)</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
            value={field.name}
            onChange={(e) => onChange(index, { ...field, name: e.target.value })}
            placeholder="e.g. phone"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">Label</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
            value={field.label}
            onChange={(e) => onChange(index, { ...field, label: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">Placeholder</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
            value={field.placeholder || ""}
            onChange={(e) => onChange(index, { ...field, placeholder: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">Help text</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
            value={field.helpText || ""}
            onChange={(e) => onChange(index, { ...field, helpText: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-800 sm:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(field.required)}
            onChange={(e) => onChange(index, { ...field, required: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary"
          />
          Required
        </label>
      </div>

      {needsOptions ? (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Options</span>
            <button
              type="button"
              onClick={addOption}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Add option
            </button>
          </div>
          <div className="space-y-2">
            {(field.options || []).map((opt, oi) => (
              <div key={oi} className="flex flex-wrap gap-2">
                <input
                  placeholder="Label"
                  className="min-w-[120px] flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  value={opt.label}
                  onChange={(e) => setOption(oi, "label", e.target.value)}
                />
                <input
                  placeholder="Value"
                  className="min-w-[120px] flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  value={opt.value}
                  onChange={(e) => setOption(oi, "value", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeOption(oi)}
                  className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Controlled editor: every edit calls `onSave` with the full payload (block JSON or optimistic global state).
 */
export default function ContactWidgetEditor({ initialData, onSave, loading, saving }) {
  const data = initialData || {};
  const fields = Array.isArray(data.fields) ? data.fields : [];

  const patch = useCallback(
    (partial) => {
      const nextFields =
        partial.fields !== undefined ? partial.fields : (Array.isArray(data.fields) ? data.fields : []);
      const merged = {
        ...data,
        ...partial,
        fields: nextFields,
      };
      const { widgetType: _wt, ...rest } = merged;
      onSave(buildPayload(rest));
    },
    [data, onSave]
  );

  const onFieldChange = useCallback(
    (index, next) => {
      const nextFields = fields.map((f, i) => (i === index ? next : f));
      patch({ fields: nextFields });
    },
    [fields, patch]
  );

  const onRemove = useCallback(
    (index) => {
      const nextFields = fields
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, sortOrder: i }));
      patch({ fields: nextFields });
    },
    [fields, patch]
  );

  const onMove = useCallback(
    (index, delta) => {
      const j = index + delta;
      if (j < 0 || j >= fields.length) return;
      const copy = [...fields];
      const t = copy[index];
      copy[index] = copy[j];
      copy[j] = t;
      patch({ fields: copy.map((f, i) => ({ ...f, sortOrder: i })) });
    },
    [fields, patch]
  );

  const addField = useCallback(() => {
    patch({ fields: [...fields, emptyField(fields.length)] });
  }, [fields, patch]);

  if (loading) {
    return <p className="text-gray-600">Loading widget…</p>;
  }

  return (
    <div className="space-y-6">
      {saving ? (
        <p className="text-xs text-gray-500">Saving…</p>
      ) : null}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mt-0 grid grid-cols-1 gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={data.isActive !== false}
              onChange={(e) => patch({ isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            Form active (shown on the site when enabled)
          </label>
          <div>
            <label className="text-xs font-medium text-gray-600">Title</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={data.title || ""}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={data.description || ""}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Submit button label</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={data.submitButtonLabel || "Send"}
              onChange={(e) => patch({ submitButtonLabel: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Success message</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={
                data.successMessage ||
                "Your message has been sent. We will get back to you soon."
              }
              onChange={(e) => patch({ successMessage: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={addField}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add field
          </button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-amber-800">No fields yet. Add at least one field.</p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <FieldCard
                key={`${field.name}-${index}`}
                field={field}
                index={index}
                total={fields.length}
                onChange={onFieldChange}
                onRemove={onRemove}
                onMove={onMove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
