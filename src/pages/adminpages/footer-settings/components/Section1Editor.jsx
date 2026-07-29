import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaUpload, FaFolder } from "react-icons/fa";
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

const Section1Editor = ({ data, onSave, onUploadImage, backendUrl, isSaving }) => {
  const [formData, setFormData] = useState({
    logo: {
      image: "",
      altText: "",
      link: "/",
    },
    description: "",
    socialMedia: [],
  });
  /** null | 'logo' | number (social icon index) */
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const logoInputRef = useRef(null);
  const socialIconInputRefs = useRef({});

  useEffect(() => {
    if (data) {
      setFormData({
        logo: data.logo || { image: "", altText: "", link: "/" },
        description: data.description ?? "",
        socialMedia: data.socialMedia || [],
      });
    }
  }, [data]);

  const handleLogoImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      toast.info("Uploading logo...");
      const result = await onUploadImage(file, "logo", backendUrl);
      if (result.success) {
        const imagePath = result.imagePath || result.data?.path || result.data?.imagePath;
        setFormData((prev) => ({
          ...prev,
          logo: {
            ...prev.logo,
            image: imagePath,
          },
        }));
        toast.success("Logo uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    }
  };

  const handleLogoLinkChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        link: e.target.value,
      },
    }));
  };

  const handleLogoAltTextChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        altText: e.target.value,
      },
    }));
  };

  const handleDescriptionChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleAddSocialMedia = () => {
    const newSocial = {
      name: "",
      icon: "",
      link: "",
      isActive: true,
      order: formData.socialMedia.length,
    };
    setFormData((prev) => ({
      ...prev,
      socialMedia: [...prev.socialMedia, newSocial],
    }));
  };

  const handleRemoveSocialMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index),
    }));
  };

  const handleSocialMediaChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSocialIconUpload = async (index, file) => {
    if (!file?.type?.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      toast.info("Uploading icon...");
      const result = await onUploadImage(file, "social-icon", backendUrl);
      if (result.success) {
        handleSocialMediaChange(
          index,
          "icon",
          result.imagePath || result.data?.path
        );
        toast.success("Icon uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload icon");
      }
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast.error("Failed to upload icon");
    }
  };

  const handleMediaLibrarySelect = (url) => {
    if (mediaPickerTarget === "logo") {
      setFormData((prev) => ({
        ...prev,
        logo: {
          ...prev.logo,
          image: url,
        },
      }));
      toast.success("Logo selected from Media Library");
    } else if (typeof mediaPickerTarget === "number") {
      handleSocialMediaChange(mediaPickerTarget, "icon", url);
      toast.success("Icon selected from Media Library");
    }
    setMediaPickerTarget(null);
  };

  const handleMoveSocialMedia = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.socialMedia.length) return;

    const newSocialMedia = [...formData.socialMedia];
    [newSocialMedia[index], newSocialMedia[newIndex]] = [
      newSocialMedia[newIndex],
      newSocialMedia[index],
    ];
    newSocialMedia.forEach((item, i) => {
      item.order = i;
    });

    setFormData((prev) => ({
      ...prev,
      socialMedia: newSocialMedia,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Section 1: Logo & Social Media
      </h2>

      {/* Logo Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Logo</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Image
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Upload from PC or choose from Media Library.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {formData.logo.image && (
                <img
                  key={formData.logo.image}
                  src={resolveFooterImageUrl(formData.logo.image, backendUrl)}
                  alt="Logo preview"
                  className="h-20 w-auto object-contain border border-gray-300 rounded"
                  onError={(e) => {
                    console.error("Image load error:", e.target.src);
                  }}
                />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <FaUpload size={12} />
                  {formData.logo.image ? "Upload from PC" : "Upload from PC"}
                </button>
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget("logo")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary"
                >
                  <FaFolder size={12} />
                  Media Library
                </button>
                {formData.logo.image ? (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        logo: { ...prev.logo, image: "" },
                      }))
                    }
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Link
            </label>
            <input
              type="text"
              value={formData.logo.link}
              onChange={handleLogoLinkChange}
              placeholder="/"
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Alt Text
            </label>
            <input
              type="text"
              value={formData.logo.altText || ""}
              onChange={handleLogoAltTextChange}
              placeholder="Describe the logo for accessibility"
              maxLength={200}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(formData.logo.altText || "").length} / 200 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer description
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Shown under the logo on the public site footer.
            </p>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={4}
              maxLength={2000}
              placeholder="Short intro or tagline for your brand..."
              className="min-h-[96px] w-full resize-y rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.description.length} / 2000 characters
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Social Media</h3>
          <button
            type="button"
            onClick={handleAddSocialMedia}
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <FaPlus /> Add Social Media
          </button>
        </div>

        <div className="space-y-4">
          {formData.socialMedia.map((social, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-700">
                  Social Media #{index + 1}
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveSocialMedia(index, "up")}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSocialMedia(index, "down")}
                    disabled={index === formData.socialMedia.length - 1}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialMedia(index)}
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
                    value={social.name}
                    onChange={(e) =>
                      handleSocialMediaChange(index, "name", e.target.value)
                    }
                    placeholder="e.g., Twitter, Facebook"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={social.link}
                    onChange={(e) =>
                      handleSocialMediaChange(index, "link", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload from PC or Media Library.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {social.icon && (
                      <img
                        key={social.icon}
                        src={resolveFooterImageUrl(social.icon, backendUrl)}
                        alt={`${social.name} icon`}
                        className="h-10 w-10 object-contain border border-gray-300 rounded"
                        onError={(e) => {
                          console.error("Social icon load error:", e.target.src);
                        }}
                      />
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={(el) => {
                          socialIconInputRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) handleSocialIconUpload(index, file);
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => socialIconInputRefs.current[index]?.click()}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        <FaUpload size={11} />
                        Upload from PC
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget(index)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-secondary"
                      >
                        <FaFolder size={11} />
                        Media Library
                      </button>
                      {social.icon ? (
                        <button
                          type="button"
                          onClick={() => handleSocialMediaChange(index, "icon", "")}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={social.isActive}
                      onChange={(e) =>
                        handleSocialMediaChange(
                          index,
                          "isActive",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Section 1"}
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

export default Section1Editor;
