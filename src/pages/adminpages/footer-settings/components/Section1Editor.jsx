import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaArrowUp, FaArrowDown } from "react-icons/fa";

const Section1Editor = ({ data, onSave, onUploadImage, backendUrl, isSaving }) => {
  const [formData, setFormData] = useState({
    logo: {
      image: "",
      link: "/",
    },
    description: "",
    socialMedia: [],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        logo: data.logo || { image: "", link: "/" },
        description: data.description ?? "",
        socialMedia: data.socialMedia || [],
      });
    }
  }, [data]);

  const handleLogoImageChange = async (e) => {
    const file = e.target.files[0];
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
        console.log("Upload result:", result); // Debug log
        console.log("Uploaded image path:", imagePath); // Debug log
        console.log("Full result data:", result.data); // Debug log
        setFormData((prev) => {
          const newData = {
            ...prev,
            logo: {
              ...prev.logo,
              image: imagePath,
            },
          };
          console.log("Updated formData:", newData); // Debug log
          return newData;
        });
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
    if (!file.type.startsWith("image/")) {
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

  const handleMoveSocialMedia = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.socialMedia.length) return;

    const newSocialMedia = [...formData.socialMedia];
    [newSocialMedia[index], newSocialMedia[newIndex]] = [
      newSocialMedia[newIndex],
      newSocialMedia[index],
    ];
    // Update order
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
            <div className="flex items-center gap-4">
              {formData.logo.image && (
                <img
                  key={formData.logo.image} // Force re-render when image changes
                  src={(() => {
                    const imagePath = formData.logo.image;
                    // If it's already a full URL, use it as-is
                    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                      return imagePath;
                    }
                    // Clean backend URL (remove trailing slash)
                    const cleanBackendUrl = backendUrl.replace(/\/$/, "");
                    // If path starts with /uploads/, use it directly
                    if (imagePath.startsWith("/uploads/")) {
                      return `${cleanBackendUrl}${imagePath}`;
                    }
                    // If path starts with /footer/, convert to /uploads/footer/
                    if (imagePath.startsWith("/footer/")) {
                      return `${cleanBackendUrl}/uploads${imagePath}`;
                    }
                    // If path starts with /, prepend /uploads
                    if (imagePath.startsWith("/")) {
                      return `${cleanBackendUrl}/uploads${imagePath}`;
                    }
                    // Otherwise, add /uploads/ prefix
                    return `${cleanBackendUrl}/uploads/${imagePath}`;
                  })()}
                  alt="Logo preview"
                  className="h-20 w-auto object-contain border border-gray-300 rounded"
                  onError={(e) => {
                    console.error("Image load error:", e.target.src);
                    console.error("Image path from state:", formData.logo.image);
                    console.error("Backend URL:", backendUrl);
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", formData.logo.image);
                  }}
                />
              )}
              <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoImageChange}
                  className="hidden"
                />
                {formData.logo.image ? "Change Logo" : "Upload Logo"}
              </label>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 resize-y min-h-[96px]"
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
            onClick={handleAddSocialMedia}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
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
                    onClick={() => handleMoveSocialMedia(index, "up")}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => handleMoveSocialMedia(index, "down")}
                    disabled={index === formData.socialMedia.length - 1}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Image
                  </label>
                  <div className="flex items-center gap-4">
                    {social.icon && (
                      <img
                        key={social.icon}
                        src={(() => {
                          const imagePath = social.icon;
                          if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                            return imagePath;
                          }
                          const cleanBackendUrl = backendUrl.replace(/\/$/, "");
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
                        })()}
                        alt={`${social.name} icon`}
                        className="h-10 w-10 object-contain border border-gray-300 rounded"
                        onError={(e) => {
                          console.error("Social icon load error:", e.target.src);
                        }}
                      />
                    )}
                    <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleSocialIconUpload(index, e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      {social.icon ? "Change Icon" : "Upload Icon"}
                    </label>
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
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md"
        >
          {isSaving ? "Saving..." : "Save Section 1"}
        </button>
      </div>
    </div>
  );
};

export default Section1Editor;
