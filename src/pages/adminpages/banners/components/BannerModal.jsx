import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ImageUploader from "./ImageUploader";
import WarrantyList from "./WarrantyList";
import ColorSelector from "./ColorSelector";
import FontSizeSelector from "./FontSizeSelector";

const HERO_LARGE_WIDTH = 1440;
const HERO_LARGE_HEIGHT = 500;
const HERO_SMALL_WIDTH = 1200;
const HERO_SMALL_HEIGHT = 900;
const HERO_EXTRA_WIDTH = 600;
const HERO_EXTRA_HEIGHT = 600;

const BannerModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
  loading,
  asPage = false,
}) => {
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If type changes, clear content fields for simple type
    if (name === "type") {
      setFormData((prev) => {
        if (value === "simple") {
          // Clear full banner fields
          return {
            ...prev,
            type: value,
            content: undefined,
            extraImage: null,
            extraImagePreview: null,
          };
        } else {
          // Clear simple banner fields
          return {
            ...prev,
            type: value,
            buttonText: "",
            buttonLink: "",
          };
        }
      });
    } else if (name.startsWith("content.")) {
      // Handle nested content fields
      const fieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle color change
  const handleColorChange = (field, colorValue) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: colorValue,
      },
    }));
  };

  // Handle font size change
  const handleSizeChange = (field, sizeValue) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: sizeValue,
      },
    }));
  };

  // Handle image upload
  const handleImageChange = (field, file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
        [`${field}Preview`]: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: null,
        [`${field}Preview`]: null,
      }));
    }
  };

  // Handle warranty list change
  const handleWarrantyChange = (warrantyItems) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        warranty: warrantyItems,
      },
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = "Banner type is required";
    }

    if (!formData.imageLarge && !formData.imageLargePreview) {
      newErrors.imageLarge = "Large image is required";
    }

    if (!formData.imageSmall && !formData.imageSmallPreview) {
      newErrors.imageSmall = "Small image is required";
    }

    if (!formData.altText?.trim()) {
      newErrors.altText = "Alt text is required";
    }

    if (formData.type === "simple") {
      if (!formData.buttonText?.trim()) {
        newErrors.buttonText = "Button text is required";
      }
      if (!formData.buttonLink?.trim()) {
        newErrors.buttonLink = "Button link is required";
      }
    } else if (formData.type === "full") {
      if (!formData.content?.title?.trim()) {
        newErrors["content.title"] = "Title is required";
      }
      if (!formData.content?.subtitle?.trim()) {
        newErrors["content.subtitle"] = "Subtitle is required";
      }
      if (!formData.content?.buynow?.trim()) {
        newErrors["content.buynow"] = "Buy Now link is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(e);
    }
  };

  if (!isOpen && !asPage) return null;

  const formBody = (
    <form onSubmit={handleSubmit}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {isEdit ? "Edit Banner" : "Create New Banner"}
            </h3>

            <div className="space-y-4">
              {/* Banner Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Type *
                </label>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="simple"
                      checked={formData.type === "simple"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Simple (Image + Button)
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="full"
                      checked={formData.type === "full"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Full Featured
                    </span>
                  </label>
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label
                  htmlFor="altText"
                  className="block text-sm font-medium text-gray-700"
                >
                  Alt Text *
                </label>
                <input
                  type="text"
                  name="altText"
                  id="altText"
                  value={formData.altText || ""}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.altText ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter banner alt text"
                />
                {errors.altText && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.altText}
                  </p>
                )}
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader
                  label={`Large Image (Desktop ${HERO_LARGE_WIDTH}×${HERO_LARGE_HEIGHT})`}
                  helperText="Storefront desktop hero uses this exact size. Upload JPG/PNG/WEBP at 1440×500 for best fit."
                  value={formData.imageLargePreview || formData.imageLarge}
                  onChange={(file) => handleImageChange("imageLarge", file)}
                  error={errors.imageLarge}
                  required
                  dimensionCheck={{
                    width: HERO_LARGE_WIDTH,
                    height: HERO_LARGE_HEIGHT,
                  }}
                />
                <ImageUploader
                  label={`Small Image (Mobile ${HERO_SMALL_WIDTH}×${HERO_SMALL_HEIGHT})`}
                  helperText="Storefront mobile hero uses this exact size. Upload JPG/PNG/WEBP at 1200×900."
                  value={formData.imageSmallPreview || formData.imageSmall}
                  onChange={(file) => handleImageChange("imageSmall", file)}
                  error={errors.imageSmall}
                  required
                  dimensionCheck={{
                    width: HERO_SMALL_WIDTH,
                    height: HERO_SMALL_HEIGHT,
                  }}
                />
              </div>

              {/* Simple Banner Fields */}
              {formData.type === "simple" && (
                <>
                  <div>
                    <label
                      htmlFor="buttonText"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Button Text *
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      id="buttonText"
                      value={formData.buttonText || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                        errors.buttonText
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., BUY NOW, SHOP NOW"
                    />
                    {errors.buttonText && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.buttonText}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="buttonLink"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Button Link *
                    </label>
                    <input
                      type="url"
                      name="buttonLink"
                      id="buttonLink"
                      value={formData.buttonLink || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                        errors.buttonLink
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder=""
                    />
                    {errors.buttonLink && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.buttonLink}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Full Banner Fields */}
              {formData.type === "full" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        Text position on banner
                      </span>
                      <p className="text-xs text-gray-500 mb-3">
                        Where the text block sits horizontally over the image (desktop &amp; mobile).
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { value: "left", label: "Left" },
                          { value: "center", label: "Center" },
                          { value: "right", label: "Right" },
                        ].map(({ value, label }) => (
                          <label key={value} className="inline-flex items-center">
                            <input
                              type="radio"
                              name="content.textPosition"
                              value={value}
                              checked={
                                (formData.content?.textPosition || "right") ===
                                value
                              }
                              onChange={handleChange}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        Text alignment
                      </span>
                      <p className="text-xs text-gray-500 mb-3">
                        How lines align inside the text block (left, centered, or right).
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { value: "left", label: "Left" },
                          { value: "center", label: "Center" },
                          { value: "right", label: "Right" },
                        ].map(({ value, label }) => (
                          <label key={value} className="inline-flex items-center">
                            <input
                              type="radio"
                              name="content.textAlign"
                              value={value}
                              checked={
                                (formData.content?.textAlign || "left") === value
                              }
                              onChange={handleChange}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="content.title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title *
                    </label>
                    <input
                      type="text"
                      name="content.title"
                      id="content.title"
                      value={formData.content?.title || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                        errors["content.title"]
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., BRAND NEW"
                    />
                    {errors["content.title"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["content.title"]}
                      </p>
                    )}
                    <ColorSelector
                      label="Title Color"
                      value={formData.content?.titleColor}
                      onChange={(color) => handleColorChange("titleColor", color)}
                      defaultColor="#FFFFFF"
                    />
                    <FontSizeSelector
                      label="Title Font Size"
                      value={formData.content?.titleSize}
                      onChange={(size) => handleSizeChange("titleSize", size)}
                      defaultSize="24px"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content.subtitle"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Subtitle *
                    </label>
                    <input
                      type="text"
                      name="content.subtitle"
                      id="content.subtitle"
                      value={formData.content?.subtitle || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                        errors["content.subtitle"]
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., SAMSUNG GALAXY S25 ULTRA"
                    />
                    {errors["content.subtitle"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["content.subtitle"]}
                      </p>
                    )}
                    <ColorSelector
                      label="Subtitle Color"
                      value={formData.content?.subtitleColor}
                      onChange={(color) => handleColorChange("subtitleColor", color)}
                      defaultColor="#FFFFFF"
                    />
                    <FontSizeSelector
                      label="Subtitle Font Size"
                      value={formData.content?.subtitleSize}
                      onChange={(size) => handleSizeChange("subtitleSize", size)}
                      defaultSize="32px"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content.paragraph"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Paragraph
                    </label>
                    <input
                      type="text"
                      name="content.paragraph"
                      id="content.paragraph"
                      value={formData.content?.paragraph || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="e.g., £739.99"
                    />
                    <ColorSelector
                      label="Paragraph Color"
                      value={formData.content?.paragraphColor}
                      onChange={(color) => handleColorChange("paragraphColor", color)}
                      defaultColor="#FFFFFF"
                    />
                    <FontSizeSelector
                      label="Paragraph Font Size"
                      value={formData.content?.paragraphSize}
                      onChange={(size) => handleSizeChange("paragraphSize", size)}
                      defaultSize="18px"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content.price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Price
                    </label>
                    <input
                      type="text"
                      name="content.price"
                      id="content.price"
                      value={formData.content?.price || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Optional price field"
                    />
                    <ColorSelector
                      label="Price Color"
                      value={formData.content?.priceColor}
                      onChange={(color) => handleColorChange("priceColor", color)}
                      defaultColor="#FF0000"
                    />
                    <FontSizeSelector
                      label="Price Font Size"
                      value={formData.content?.priceSize}
                      onChange={(size) => handleSizeChange("priceSize", size)}
                      defaultSize="20px"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="content.buynow"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Buy Now Link *
                    </label>
                    <input
                      type="url"
                      name="content.buynow"
                      id="content.buynow"
                      value={formData.content?.buynow || ""}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                        errors["content.buynow"]
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder=""
                    />
                    {errors["content.buynow"] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors["content.buynow"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="content.sellnow"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sell Now Link
                    </label>
                    <input
                      type="url"
                      name="content.sellnow"
                      id="content.sellnow"
                      value={formData.content?.sellnow || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Optional sell now link"
                    />
                  </div>

                  <WarrantyList
                    value={formData.content?.warranty || []}
                    onChange={handleWarrantyChange}
                  />

                  <ImageUploader
                    label={`Extra Image (Product Overlay ${HERO_EXTRA_WIDTH}×${HERO_EXTRA_HEIGHT})`}
                    helperText="Optional overlay image shown on full banners. Recommended transparent PNG at 600×600 for best fit."
                    value={formData.extraImagePreview || formData.extraImage}
                    onChange={(file) => handleImageChange("extraImage", file)}
                    error={errors.extraImage}
                    dimensionCheck={{
                      width: HERO_EXTRA_WIDTH,
                      height: HERO_EXTRA_HEIGHT,
                    }}
                  />
                </>
              )}

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Active (Show on frontend)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving..."
            : isEdit
            ? "Update Banner"
            : "Create Banner"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  if (asPage) {
    return <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">{formBody}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
          {formBody}
        </div>
      </div>
    </div>
  );
};

BannerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  isEdit: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  asPage: PropTypes.bool,
};

export default BannerModal;
