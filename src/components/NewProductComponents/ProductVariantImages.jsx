import PropTypes from "prop-types";

export default function ProductVariantImages({
  attributes,
  selectedAttr,
  setSelectedAttr,
  handleVariantImageChange,
  handleVariantImageDelete,
  variantImages,
}) {
  // Get the selected attribute's options
  const getSelectedAttributeOptions = () => {
    if (!selectedAttr) return [];
    const attr = attributes.find((a) => a.name === selectedAttr);
    return attr?.options || [];
  };

  // Get option name (handles both old and new format)
  const getOptionName = (option) => {
    return option.option || option.value || option.name || '';
  };

  // Render color swatch if attribute is color
  const renderOptionLabel = (option) => {
    const optionName = getOptionName(option);
    if (selectedAttr === "color" && option.colorCode) {
      return (
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full border border-gray-300 inline-block"
            style={{ backgroundColor: option.colorCode }}
          />
          <span className="font-medium">{optionName}</span>
        </div>
      );
    }
    return <span className="font-medium">{optionName}</span>;
  };

  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="py-4 px-4 space-y-3">
        <div className="flex flex-row items-center justify-between">
          <h1 className="font-bold">Variant Images</h1>
        </div>

        {attributes.length === 0 ? (
          <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="font-medium">No variants configured</p>
            <p className="mt-1 text-amber-500">
              Please go to "Pricing & Inventory" tab and save your variants first to enable variant images.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Attribute Selector */}
            <div className="flex flex-row items-center gap-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Select Attribute:
              </label>
              <select
                id="attributeName"
                name="attributeName"
                className="block w-full max-w-xs rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 capitalize"
                value={selectedAttr || ""}
                onChange={(e) => setSelectedAttr(e.target.value)}
              >
                <option value="" disabled>
                  Choose Attribute
                </option>
                {attributes.map((attr) => (
                  <option key={attr.name} value={attr.name} className="capitalize">
                    {attr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Attribute Info */}
            {selectedAttr && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                Upload images for each <span className="font-semibold capitalize">{selectedAttr}</span> option.
                These images will be automatically assigned to all variants with the matching {selectedAttr}.
              </div>
            )}

            {/* Image Upload for Each Option */}
            {selectedAttr && (
              <div className="space-y-4">
                {getSelectedAttributeOptions().map((option, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    {/* Option Header */}
                    <div className="flex items-center justify-between mb-3">
                      {renderOptionLabel(option)}
                      <span className="text-xs text-gray-400">
                        {variantImages[getOptionName(option)]?.length || 0} image(s)
                      </span>
                    </div>

                    {/* Image Upload Area */}
                    <div className="flex justify-center rounded-lg border border-dashed border-gray-300 p-4 hover:border-blue-400 transition-colors">
                      <div className="text-center w-full">
                        {/* Image Preview */}
                        {variantImages[getOptionName(option)]?.length > 0 ? (
                          <div className="flex flex-wrap gap-3 justify-center mb-3">
                            {variantImages[getOptionName(option)].map((image, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`${getOptionName(option)} - Image ${imgIndex + 1}`}
                                  className="h-16 w-16 object-cover rounded-md border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariantImageDelete(getOptionName(option), imgIndex)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <svg
                            className="mx-auto h-10 w-10 text-gray-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}

                        {/* Upload Button */}
                        <div className="mt-2 flex flex-row justify-center text-sm leading-6 text-gray-600">
                          <label
                            htmlFor={`variantImages-${getOptionName(option)}`}
                            className="relative cursor-pointer rounded-md bg-white px-3 py-1.5 font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 transition-colors"
                          >
                            <span>
                              {variantImages[getOptionName(option)]?.length > 0
                                ? "Add more images"
                                : "Upload images"}
                            </span>
                            <input
                              id={`variantImages-${getOptionName(option)}`}
                              name={`variantImages-${getOptionName(option)}`}
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={(e) =>
                                handleVariantImageChange(getOptionName(option), e.target.files)
                              }
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WebP supported
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Options Message */}
            {selectedAttr && getSelectedAttributeOptions().length === 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                No options found for {selectedAttr}. Please add options in the Pricing & Inventory tab.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ProductVariantImages.propTypes = {
  attributes: PropTypes.array.isRequired,
  selectedAttr: PropTypes.string,
  setSelectedAttr: PropTypes.func.isRequired,
  handleVariantImageChange: PropTypes.func.isRequired,
  handleVariantImageDelete: PropTypes.func.isRequired,
  variantImages: PropTypes.object.isRequired,
};
