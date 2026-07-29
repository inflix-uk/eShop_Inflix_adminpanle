import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaUpload, FaFolder } from "react-icons/fa";
import MediaLibraryPicker from "../../media/components/media/MediaLibraryPicker";

function resolveFooterImageUrl(imagePath, backendUrl) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanBackendUrl = (backendUrl || "").replace(/\/$/, "");
  if (imagePath.startsWith("/uploads/")) {
    return `${cleanBackendUrl}${imagePath}`;
  }
  if (imagePath.startsWith("/footer/")) {
    return `${cleanBackendUrl}/uploads${imagePath}`;
  }
  if (imagePath.startsWith("/")) {
    return `${cleanBackendUrl}/uploads${imagePath}`;
  }
  return `${cleanBackendUrl}/uploads/${imagePath}`;
}

const defaultForm = {
  isEnabled: true,
  heading: "Stay in the loop",
  description: "",
  placeholder: "Enter your email",
  buttonLabel: "Subscribe",
  imageUrl: "",
};

const NewsletterSectionEditor = ({
  data,
  onSave,
  onUploadImage,
  backendUrl,
  isSaving,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (!onUploadImage) {
      toast.error("Image upload is not available");
      return;
    }

    setIsUploading(true);
    try {
      toast.info("Uploading side image...");
      const result = await onUploadImage(file, "newsletter", backendUrl);
      if (result.success) {
        const imagePath =
          result.imagePath || result.data?.path || result.data?.imagePath || "";
        handleChange("imageUrl", imagePath);
        toast.success("Side image uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading newsletter image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaLibrarySelect = (url) => {
    handleChange("imageUrl", url);
    setIsMediaPickerOpen(false);
    toast.success("Side image selected from Media Library");
  };

  const handleSave = () => {
    onSave(formData);
  };

  const previewUrl = formData.imageUrl
    ? resolveFooterImageUrl(formData.imageUrl, backendUrl)
    : "";

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
              Side image <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Upload from PC, choose from Media Library, or paste a URL.
            </p>

            {previewUrl ? (
              <div className="mb-3">
                <img
                  src={previewUrl}
                  alt="Newsletter side preview"
                  className="h-24 w-auto max-w-full object-contain border border-gray-300 rounded bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                <FaUpload size={11} />
                {isUploading ? "Uploading…" : "Upload from PC"}
              </button>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-secondary"
              >
                <FaFolder size={11} />
                Media Library
              </button>
              {formData.imageUrl ? (
                <button
                  type="button"
                  onClick={() => handleChange("imageUrl", "")}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              ) : null}
            </div>

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
          disabled={isSaving || isUploading}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save section"}
        </button>
      </div>

      <MediaLibraryPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaLibrarySelect}
      />
    </div>
  );
};

export default NewsletterSectionEditor;
