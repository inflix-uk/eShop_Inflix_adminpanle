import { useState, useEffect, useMemo } from "react";
import { sanitizeFooterHtml } from "../utils/footerHtmlSanitize";

const POSITIONS = [
  {
    value: "above_columns",
    label: "Above the footer columns",
    hint: "Your block is added on top of the standard columns.",
  },
  {
    value: "below_columns",
    label: "Below the footer columns",
    hint: "Your block is added under the standard columns.",
  },
  {
    value: "replace_columns",
    label: "Instead of the footer columns",
    hint: "Only your block is shown. The standard columns (logo, links, newsletter, contact) are hidden.",
  },
];

const EXAMPLE_HTML = `<div class="footer-contact">
  <div class="footer-contact__item">
    <strong>Call us</strong>
    <a href="tel:+441610000000">0161 000 0000</a>
  </div>
  <div class="footer-contact__item">
    <strong>Email</strong>
    <a href="mailto:sales@yourstore.com">sales@yourstore.com</a>
  </div>
  <div class="footer-contact__item">
    <strong>WhatsApp</strong>
    <a href="https://wa.me/447700900123" target="_blank">Chat with us</a>
  </div>
</div>`;

const EXAMPLE_CSS = `.footer-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  text-align: center;
}
.footer-contact__item strong {
  display: block;
  color: #ffffff;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.footer-contact__item a {
  color: #9ca3af;
  font-size: 14px;
  text-decoration: none;
}
.footer-contact__item a:hover {
  color: #ffffff;
}`;

const defaultForm = {
  isEnabled: false,
  position: "below_columns",
  html: "",
  css: "",
};

const TAB_CLASS = (active) =>
  `rounded-t-md px-4 py-2 text-sm font-medium border-b-2 ${
    active
      ? "border-primary text-primary bg-white"
      : "border-transparent text-gray-600 hover:text-gray-800"
  }`;

/** Keep typed CSS from closing the preview's <style> tag. */
const cssForStyleElement = (css) =>
  String(css ?? "").replace(/<\/style/gi, "<‌/style");

/**
 * Preview document: the HTML is already cleaned the way the website cleans it.
 * The iframe is sandboxed as well, so nothing typed here can run scripts or
 * reach the admin panel.
 */
function buildPreviewSrcDoc({ html, css, colors }) {
  const background = colors?.background || "#212121";
  const text = colors?.text || "#9ca3af";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
html, body { margin: 0; padding: 0; }
body {
  padding: 20px 24px;
  box-sizing: border-box;
  background: ${background};
  color: ${text};
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
</style>
<style>${cssForStyleElement(css)}</style>
</head>
<body><div data-footer-custom-html="">${String(html ?? "")}</div></body>
</html>`;
}

const CustomHtmlEditor = ({ data, colors, onSave, isSaving }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [codeTab, setCodeTab] = useState("html");
  const [previewWidth, setPreviewWidth] = useState("desktop");
  /** What the preview shows; trails the editors slightly so typing stays smooth. */
  const [previewCode, setPreviewCode] = useState({ html: "", css: "" });

  useEffect(() => {
    if (data) {
      setFormData({
        isEnabled: data.isEnabled === true,
        position: POSITIONS.some((p) => p.value === data.position)
          ? data.position
          : "below_columns",
        html: data.html ?? "",
        css: data.css ?? "",
      });
    }
  }, [data]);

  useEffect(() => {
    const id = setTimeout(
      () => setPreviewCode({ html: formData.html, css: formData.css }),
      300
    );
    return () => clearTimeout(id);
  }, [formData.html, formData.css]);

  const cleanPreview = useMemo(
    () => sanitizeFooterHtml(previewCode.html),
    [previewCode.html]
  );
  const srcDoc = useMemo(
    () =>
      buildPreviewSrcDoc({
        html: cleanPreview.html,
        css: [cleanPreview.css, previewCode.css].filter(Boolean).join("\n"),
        colors,
      }),
    [cleanPreview, previewCode.css, colors]
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInsertExample = () => {
    setFormData((prev) => ({ ...prev, html: EXAMPLE_HTML, css: EXAMPLE_CSS }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const position =
    POSITIONS.find((p) => p.value === formData.position) || POSITIONS[1];
  const isEmpty = !formData.html.trim() && !formData.css.trim();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Custom HTML/CSS</h2>
      <p className="text-gray-600 text-sm mb-6">
        Build your own footer block with HTML and CSS. The CSS only affects this
        block, so it cannot change the rest of the website. Scripts are removed
        for security.
      </p>

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) => handleChange("isEnabled", e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          <span className="text-gray-800 font-medium">
            Show custom HTML block in footer
          </span>
        </label>

        <div className="max-w-md">
          <label
            htmlFor="custom-html-position"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Where to show it
          </label>
          <select
            id="custom-html-position"
            value={formData.position}
            onChange={(e) => handleChange("position", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{position.hint}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Code */}
          <div className="min-w-0">
            <div className="flex items-end justify-between border-b border-gray-200">
              <div className="flex gap-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={codeTab === "html"}
                  onClick={() => setCodeTab("html")}
                  className={TAB_CLASS(codeTab === "html")}
                >
                  HTML
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={codeTab === "css"}
                  onClick={() => setCodeTab("css")}
                  className={TAB_CLASS(codeTab === "css")}
                >
                  CSS
                </button>
              </div>
              {isEmpty ? (
                <button
                  type="button"
                  onClick={handleInsertExample}
                  className="mb-1 text-xs font-medium text-primary hover:underline"
                >
                  Insert example
                </button>
              ) : null}
            </div>

            {codeTab === "html" ? (
              <textarea
                aria-label="Footer HTML"
                value={formData.html}
                onChange={(e) => handleChange("html", e.target.value)}
                spellCheck={false}
                rows={20}
                placeholder={'<div class="my-footer">\n  ...\n</div>'}
                className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs leading-5 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            ) : (
              <textarea
                aria-label="Footer CSS"
                value={formData.css}
                onChange={(e) => handleChange("css", e.target.value)}
                spellCheck={false}
                rows={20}
                placeholder={".my-footer {\n  display: flex;\n}"}
                className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs leading-5 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>

          {/* Live preview */}
          <div className="min-w-0">
            <div className="flex items-end justify-between border-b border-gray-200 pb-2">
              <span className="text-sm font-medium text-gray-700">
                Live preview
              </span>
              <div className="flex gap-1 text-xs">
                {[
                  ["desktop", "Desktop"],
                  ["mobile", "Mobile"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPreviewWidth(value)}
                    className={`rounded px-2.5 py-1 font-medium ${
                      previewWidth === value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 flex justify-center rounded-md border border-gray-300 bg-gray-100 p-2">
              <iframe
                title="Footer block preview"
                sandbox=""
                srcDoc={srcDoc}
                className="h-[420px] rounded bg-white"
                style={{
                  width: previewWidth === "mobile" ? 375 : "100%",
                  maxWidth: "100%",
                  border: 0,
                }}
              />
            </div>
            {cleanPreview.removed > 0 ? (
              <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {cleanPreview.removed} unsafe{" "}
                {cleanPreview.removed === 1 ? "item was" : "items were"} left out
                (scripts, on-click code or unsafe links). The website leaves
                them out too.
              </p>
            ) : null}
            <p className="text-xs text-gray-500 mt-2">
              Shows your block on the footer background colour. It updates as
              you type; nothing changes on the website until you save.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save custom HTML/CSS"}
        </button>
      </div>
    </div>
  );
};

export default CustomHtmlEditor;
