import { useEffect, useState } from "react";
import { Code2, X } from "lucide-react";

/**
 * Simple HTML/CSS editor for booking package-row widgets.
 */
export default function InlineWidgetModal({
  isOpen,
  onClose,
  onSave,
  afterPackageCount,
  initialWidget,
  saving = false,
}) {
  const [enabled, setEnabled] = useState(true);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [tab, setTab] = useState("html");

  useEffect(() => {
    if (!isOpen) return;
    setEnabled(initialWidget?.enabled !== false);
    setHtml(typeof initialWidget?.html === "string" ? initialWidget.html : "");
    setCss(typeof initialWidget?.css === "string" ? initialWidget.css : "");
    setTab("html");
  }, [isOpen, initialWidget]);

  if (!isOpen) return null;

  const rowNumber = Math.max(1, Math.ceil(Number(afterPackageCount || 3) / 3));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      enabled,
      afterPackageCount: Number(afterPackageCount) || 3,
      html,
      css,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <Code2 className="text-violet-600 shrink-0" size={22} />
              <div className="min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {initialWidget ? "Edit" : "Add"} HTML / CSS Widget
                </h3>
                <p className="text-sm text-gray-500">
                  After {afterPackageCount} packages (row {rowNumber} on /booking)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  HTML for markup only. Put styles in the CSS tab (scoped to this widget).
                </p>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      enabled ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => setEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      enabled ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="inline-flex rounded-lg bg-gray-100 p-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "html"}
                  onClick={() => setTab("html")}
                  className={`min-w-[5rem] rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors focus:outline-none ${
                    tab === "html"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "css"}
                  onClick={() => setTab("css")}
                  className={`min-w-[5rem] rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors focus:outline-none ${
                    tab === "css"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  CSS
                </button>
              </div>

              {tab === "html" ? (
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={14}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50 focus:ring-primary focus:border-primary"
                  placeholder={
                    'e.g. <section class="promo"><h2>Special offer</h2><p>Book this week</p></section>'
                  }
                />
              ) : (
                <textarea
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  rows={14}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50 focus:ring-primary focus:border-primary"
                  placeholder={
                    `.promo { padding: 2rem; background: #111; color: #fff; }\n.promo h2 { font-size: 1.5rem; }`
                  }
                />
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Widget"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
