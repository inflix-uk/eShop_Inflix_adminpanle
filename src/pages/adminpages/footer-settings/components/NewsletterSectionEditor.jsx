import { useState, useEffect } from "react";

const defaultForm = {
  isEnabled: true,
  heading: "Stay in the loop",
  description: "",
  placeholder: "Enter your email",
  buttonLabel: "Subscribe",
  imageUrl: "",
};

const NewsletterSectionEditor = ({ data, onSave, isSaving }) => {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (data) {
      setFormData({
        isEnabled: data.isEnabled !== false,
        heading: data.heading ?? defaultForm.heading,
        description: data.description ?? "",
        placeholder: data.placeholder ?? defaultForm.placeholder,
        buttonLabel: data.buttonLabel ?? defaultForm.buttonLabel,
        imageUrl: data.imageUrl ?? "",
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Newsletter</h2>
      <p className="text-gray-600 text-sm mb-8">
        Content order on the site: heading, then short description, then the signup
        form.
      </p>

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) => handleChange("isEnabled", e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          <span className="text-gray-800 font-medium">Show newsletter block in footer</span>
        </label>

        {/* 1 — Heading (top) */}
        <div>
          <label
            htmlFor="newsletter-heading"
            className="block text-xl font-semibold text-gray-900 mb-2"
          >
            Heading
          </label>
          <input
            id="newsletter-heading"
            type="text"
            value={formData.heading}
            onChange={(e) => handleChange("heading", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Stay in the loop"
          />
        </div>

        {/* 2 — Smaller description */}
        <div>
          <label
            htmlFor="newsletter-description"
            className="block text-sm font-medium text-gray-500 mb-2"
          >
            Description <span className="font-normal">(smaller text under the heading)</span>
          </label>
          <textarea
            id="newsletter-description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Short line about what subscribers get…"
          />
        </div>

        {/* 3 — Newsletter form fields (last) */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Newsletter form</h3>

          <div>
            <label
              htmlFor="newsletter-placeholder"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email placeholder
            </label>
            <input
              id="newsletter-placeholder"
              type="text"
              value={formData.placeholder}
              onChange={(e) => handleChange("placeholder", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label
              htmlFor="newsletter-button"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Button label
            </label>
            <input
              id="newsletter-button"
              type="text"
              value={formData.buttonLabel}
              onChange={(e) => handleChange("buttonLabel", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label
              htmlFor="newsletter-image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Side image URL <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="newsletter-image"
              type="text"
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="/uploads/... or https://..."
            />
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
          {isSaving ? "Saving…" : "Save section"}
        </button>
      </div>
    </div>
  );
};

export default NewsletterSectionEditor;
