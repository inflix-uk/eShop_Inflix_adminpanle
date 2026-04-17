import { useState, useEffect } from "react";

const defaultForm = {
  textBeforeCredit:
    "ZEXTONS TECH STORE © {{year}} All Rights Reserved. Company Number: 10256988. Designed and Developed by ",
  creditLabel: "Inflix",
  creditUrl: "https://inflix.co.uk",
};

const BottomBarEditor = ({ data, onSave, isSaving }) => {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (data) {
      setFormData({
        textBeforeCredit: data.textBeforeCredit ?? defaultForm.textBeforeCredit,
        creditLabel: data.creditLabel ?? defaultForm.creditLabel,
        creditUrl: data.creditUrl ?? defaultForm.creditUrl,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const previewYear = new Date().getFullYear();
  const previewBefore = (formData.textBeforeCredit || "")
    .replace(/\{\{\s*year\s*\}\}/gi, String(previewYear))
    .replace(/\{year\}/gi, String(previewYear));

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Bottom bar</h2>
      <p className="text-gray-600 text-sm mb-8">
        Text shown below the footer columns (copyright line). Use{" "}
        <code className="bg-gray-100 px-1 rounded">{"{{year}}"}</code> where the
        current year should appear.
      </p>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="bottom-text-before"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Main text (before optional link)
          </label>
          <textarea
            id="bottom-text-before"
            rows={4}
            value={formData.textBeforeCredit}
            onChange={(e) => handleChange("textBeforeCredit", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="bottom-credit-label"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Credit link label
            </label>
            <input
              id="bottom-credit-label"
              type="text"
              value={formData.creditLabel}
              onChange={(e) => handleChange("creditLabel", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g. Inflix"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to hide the link (only the main text shows).
            </p>
          </div>
          <div>
            <label
              htmlFor="bottom-credit-url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Credit link URL
            </label>
            <input
              id="bottom-credit-url"
              type="url"
              value={formData.creditUrl}
              onChange={(e) => handleChange("creditUrl", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="https://"
            />
          </div>
        </div>

        <div className="rounded-md bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Preview
          </p>
          <p className="text-sm text-gray-700 text-center">
            {previewBefore}
            {formData.creditLabel?.trim() && formData.creditUrl?.trim() ? (
              <>
                {" "}
                <span className="underline text-purple-700">
                  {formData.creditLabel.trim()}
                </span>
              </>
            ) : formData.creditLabel?.trim() ? (
              <>
                {" "}
                <span className="underline">{formData.creditLabel.trim()}</span>
              </>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md"
        >
          {isSaving ? "Saving…" : "Save bottom bar"}
        </button>
      </div>
    </div>
  );
};

export default BottomBarEditor;
