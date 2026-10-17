import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaUpload,
  FaFolder,
} from "react-icons/fa";
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
  if (imagePath.startsWith("/")) {
    return `${cleanBackendUrl}/uploads${imagePath}`;
  }
  return `${cleanBackendUrl}/uploads/${imagePath}`;
}

/** The website already has an icon for these, so no upload is needed. */
const BUILT_IN_METHODS = [
  "Visa",
  "Mastercard",
  "American Express",
  "PayPal",
  "Klarna",
  "Apple Pay",
  "Google Pay",
];

const defaultForm = {
  isEnabled: false,
  heading: "We accept",
  description: "",
  logos: [],
};

const PaymentMethodsEditor = ({
  data,
  onSave,
  onUploadImage,
  backendUrl,
  isSaving,
}) => {
  const [formData, setFormData] = useState(defaultForm);
  /** null | number (logo index) */
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (data) {
      setFormData({
        isEnabled: data.isEnabled === true,
        heading: data.heading ?? "",
        description: data.description ?? "",
        logos: Array.isArray(data.logos)
          ? data.logos.map((logo) => ({
              name: logo?.name || "",
              image: logo?.image || "",
              isActive: logo?.isActive !== false,
            }))
          : [],
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      logos: prev.logos.map((logo, i) =>
        i === index ? { ...logo, [field]: value } : logo
      ),
    }));
  };

  const handleAddLogo = (name = "") => {
    setFormData((prev) => ({
      ...prev,
      logos: [...prev.logos, { name, image: "", isActive: true }],
    }));
  };

  const handleRemoveLogo = (index) => {
    setFormData((prev) => ({
      ...prev,
      logos: prev.logos.filter((_, i) => i !== index),
    }));
  };

  const handleMoveLogo = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.logos.length) return;
    const logos = [...formData.logos];
    [logos[index], logos[newIndex]] = [logos[newIndex], logos[index]];
    setFormData((prev) => ({ ...prev, logos }));
  };

  const handleLogoUpload = async (index, file) => {
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setUploadingIndex(index);
    try {
      toast.info("Uploading icon...");
      const result = await onUploadImage(file, "payment-logo", backendUrl);
      if (result.success) {
        handleLogoChange(index, "image", result.imagePath || result.data?.path || "");
        toast.success("Icon uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload icon");
      }
    } catch (error) {
      console.error("Error uploading payment icon:", error);
      toast.error("Failed to upload icon");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleMediaLibrarySelect = (url) => {
    if (typeof mediaPickerTarget === "number") {
      handleLogoChange(mediaPickerTarget, "image", url);
      toast.success("Icon selected from Media Library");
    }
    setMediaPickerTarget(null);
  };

  const handleSave = () => {
    const unnamed = formData.logos.some(
      (logo) => !logo.name.trim() && !logo.image
    );
    if (unnamed) {
      toast.error("Give each payment method a name or remove the empty row");
      return;
    }
    onSave({
      ...formData,
      logos: formData.logos.map((logo, index) => ({ ...logo, order: index })),
    });
  };

  const addedNames = new Set(
    formData.logos.map((logo) => logo.name.trim().toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Methods</h2>
      <p className="text-gray-600 text-sm mb-8">
        A row of payment icons shown under the footer columns, above the
        copyright line.
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
            Show payment methods in footer
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="payments-heading"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Heading
            </label>
            <input
              id="payments-heading"
              type="text"
              value={formData.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
              maxLength={200}
              placeholder="e.g. We accept"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label
              htmlFor="payments-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              id="payments-description"
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              maxLength={1000}
              placeholder="e.g. Secure checkout with all major cards"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Payment icons</h3>
            <button
              type="button"
              onClick={() => handleAddLogo()}
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <FaPlus /> Add Payment Method
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">
              Quick add (the website has a ready-made icon for these, no upload
              needed):
            </p>
            <div className="flex flex-wrap gap-2">
              {BUILT_IN_METHODS.map((name) => (
                <button
                  key={name}
                  type="button"
                  disabled={addedNames.has(name.toLowerCase())}
                  onClick={() => handleAddLogo(name)}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>

          {formData.logos.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              No payment methods yet. Use Quick add or Add Payment Method.
            </p>
          ) : null}

          <div className="space-y-4">
            {formData.logos.map((logo, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-700">
                    {logo.name.trim() || `Payment Method #${index + 1}`}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveLogo(index, "up")}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      title="Move up"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveLogo(index, "down")}
                      disabled={index === formData.logos.length - 1}
                      className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      title="Move down"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={logo.name}
                      onChange={(e) =>
                        handleLogoChange(index, "name", e.target.value)
                      }
                      maxLength={100}
                      placeholder="e.g. Visa"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <label className="mt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={logo.isActive}
                        onChange={(e) =>
                          handleLogoChange(index, "isActive", e.target.checked)
                        }
                        className="rounded border-gray-300 text-primary focus:ring-primary/30"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon Image
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload from PC or Media Library. Leave empty to use the
                      ready-made icon for well-known names.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {logo.image ? (
                        <img
                          key={logo.image}
                          src={resolveFooterImageUrl(logo.image, backendUrl)}
                          alt={`${logo.name} icon`}
                          className="h-10 w-16 object-contain border border-gray-300 rounded bg-white p-1"
                        />
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={(el) => {
                            fileInputRefs.current[index] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleLogoUpload(index, file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingIndex === index}
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FaUpload size={11} />
                          {uploadingIndex === index ? "Uploading…" : "Upload from PC"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget(index)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-secondary"
                        >
                          <FaFolder size={11} />
                          Media Library
                        </button>
                        {logo.image ? (
                          <button
                            type="button"
                            onClick={() => handleLogoChange(index, "image", "")}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || uploadingIndex !== null}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save payment methods"}
        </button>
      </div>

      <MediaLibraryPicker
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaLibrarySelect}
      />
    </div>
  );
};

export default PaymentMethodsEditor;
