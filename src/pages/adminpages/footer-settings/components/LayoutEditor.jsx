import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const BASE_COLUMNS = [
  { key: "section1", label: "Logo & Social Media" },
  { key: "section2", label: "Useful Links" },
  { key: "section3", label: "Customer Care" },
  { key: "sectionNewsletter", label: "Newsletter" },
  { key: "sectionContact", label: "Contact" },
];

/** `fallback` is the colour the website uses when the field is left empty. */
const COLOR_FIELDS = [
  { key: "background", label: "Background", fallback: "#212121" },
  { key: "text", label: "Text & links", fallback: "#9ca3af" },
  { key: "heading", label: "Headings", fallback: "#ffffff" },
  { key: "linkHover", label: "Link hover", fallback: "#ffffff" },
  { key: "border", label: "Divider line", fallback: "#374151" },
];

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** <input type="color"> only accepts the 6-digit form. */
const toSixDigitHex = (value, fallback) => {
  const v = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return fallback;
};

function completeOrder(order) {
  const keys = BASE_COLUMNS.map((c) => c.key);
  const result = [];
  for (const key of [...(Array.isArray(order) ? order : []), ...keys]) {
    if (keys.includes(key) && !result.includes(key)) result.push(key);
  }
  return result;
}

const emptyColors = () =>
  Object.fromEntries(COLOR_FIELDS.map((f) => [f.key, ""]));

const LayoutEditor = ({ data, columnTitles = {}, onSave, isSaving }) => {
  const [columnOrder, setColumnOrder] = useState(completeOrder());
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [colors, setColors] = useState(emptyColors());

  useEffect(() => {
    if (data) {
      setColumnOrder(completeOrder(data.columnOrder));
      setHiddenColumns(Array.isArray(data.hiddenColumns) ? data.hiddenColumns : []);
      setColors({ ...emptyColors(), ...(data.colors || {}) });
    }
  }, [data]);

  const handleMove = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columnOrder.length) return;
    const next = [...columnOrder];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setColumnOrder(next);
  };

  const handleToggleVisible = (key, visible) => {
    setHiddenColumns((prev) =>
      visible ? prev.filter((k) => k !== key) : [...new Set([...prev, key])]
    );
  };

  const handleColorChange = (key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const invalidColor = COLOR_FIELDS.find(
    (f) => colors[f.key]?.trim() && !HEX_COLOR.test(colors[f.key].trim())
  );

  const handleSave = () => {
    const cleanColors = Object.fromEntries(
      COLOR_FIELDS.map((f) => [f.key, (colors[f.key] || "").trim()])
    );
    onSave({ columnOrder, hiddenColumns, colors: cleanColors });
  };

  const shown = (key) => colors[key]?.trim() && HEX_COLOR.test(colors[key].trim())
    ? colors[key].trim()
    : COLOR_FIELDS.find((f) => f.key === key).fallback;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Layout &amp; Colours</h2>
      <p className="text-gray-600 text-sm mb-8">
        Choose the order of the footer columns, hide the ones you do not need
        and set the footer colours.
      </p>

      {/* Column order */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Columns</h3>
        <p className="text-xs text-gray-500 mb-4">
          Top of this list = left side of the footer. A column also stays hidden
          while it has no content. Custom link columns follow the column they
          are placed after.
        </p>
        <ul className="space-y-2">
          {columnOrder.map((key, index) => {
            const column = BASE_COLUMNS.find((c) => c.key === key);
            const title = String(columnTitles[key] || "").trim();
            const visible = !hiddenColumns.includes(key);
            return (
              <li
                key={key}
                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
                  visible
                    ? "border-gray-300 bg-gray-50"
                    : "border-dashed border-gray-300 bg-white opacity-70"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {column.label}
                    </p>
                    {title && title !== column.label ? (
                      <p className="text-xs text-gray-500 truncate">
                        Shown on site as &ldquo;{title}&rdquo;
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => handleToggleVisible(key, e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm text-gray-700">Show</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-40"
                      title="Move up (left)"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === columnOrder.length - 1}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-40"
                      title="Move down (right)"
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Colours */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Colours</h3>
        <p className="text-xs text-gray-500 mb-4">
          Leave a colour on &ldquo;Default&rdquo; to keep the standard footer look.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COLOR_FIELDS.map((field) => {
            const value = colors[field.key] || "";
            const isInvalid = value.trim() && !HEX_COLOR.test(value.trim());
            return (
              <div key={field.key}>
                <label
                  htmlFor={`footer-color-${field.key}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`${field.label} colour picker`}
                    value={toSixDigitHex(value, field.fallback)}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded border border-gray-300 bg-white p-1"
                  />
                  <input
                    id={`footer-color-${field.key}`}
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    placeholder={`Default (${field.fallback})`}
                    className={`w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 ${
                      isInvalid
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-primary focus:ring-primary/30"
                    }`}
                  />
                  {value ? (
                    <button
                      type="button"
                      onClick={() => handleColorChange(field.key, "")}
                      className="shrink-0 text-xs text-gray-600 underline hover:text-gray-800"
                    >
                      Default
                    </button>
                  ) : null}
                </div>
                {isInvalid ? (
                  <p className="text-xs text-red-600 mt-1">
                    Use a hex colour such as #1a2b3c
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          className="mt-6 rounded-md p-5"
          style={{ backgroundColor: shown("background") }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-wide mb-1"
            style={{ color: shown("heading") }}
          >
            Heading
          </p>
          <p className="text-[13px]" style={{ color: shown("text") }}>
            Normal text and links
          </p>
          <p className="text-[13px]" style={{ color: shown("linkHover") }}>
            Link when hovered
          </p>
          <div
            className="mt-3 border-t pt-2 text-xs"
            style={{ borderColor: shown("border"), color: shown("text") }}
          >
            © Copyright line
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || Boolean(invalidColor)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save layout & colours"}
        </button>
      </div>
    </div>
  );
};

export default LayoutEditor;
