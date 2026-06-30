import { useState, useEffect } from "react";

const defaultForm = {
  textBeforeCredit: "© {{year}} All Rights Reserved.",
  creditLabel: "",
  creditUrl: "",
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
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-mono shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                <span className="underline text-primary">
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
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save bottom bar"}
        </button>
      </div>
    </div>
  );
};

export default BottomBarEditor;
