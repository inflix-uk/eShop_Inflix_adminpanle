import PropTypes from "prop-types";
import { useState } from "react";
import { toast } from "react-toastify";
import ProductApi from "../../pages/adminpages/productsNew/api/productApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const productApi = new ProductApi();

export default function ProductVariantImages({
  product,
  setProduct,
  handleVariantImageDelete,
  selectedAttr,
  setSelectedAttr,
  getImagesForOption,
  variantNames,
  handleVariantImageChange,
}) {
  const [deletingKey, setDeletingKey] = useState(null);

  // Delete variant image via API
  const handleDeleteVariantImage = async (optionSlug, imgIndex) => {
    // Get the image being deleted to check if it's saved or unsaved
    const images = getImagesForOption(optionSlug);
    const imageToDelete = images?.[imgIndex];

    // Check if this is an unsaved image (File/Blob) or a saved image (has url/path)
    const isUnsavedImage = imageToDelete instanceof File ||
                           imageToDelete instanceof Blob ||
                           (!imageToDelete?.url && !imageToDelete?.path);

    // If product not saved OR image is unsaved, just update local state
    if (!product?._id || isUnsavedImage) {
      handleVariantImageDelete(optionSlug, imgIndex);
      toast.success('Image removed');
      return;
    }

    const key = `${optionSlug}-${imgIndex}`;
    setDeletingKey(key);

    try {
      const response = await productApi.deleteVariantImage(product._id, optionSlug, imgIndex);
      if (response.data.status === 200) {
        // Update product state with the response data from API
        const updatedProduct = response.data.product;
        if (updatedProduct) {
          setProduct(prev => ({
            ...prev,
            varImgGroup: updatedProduct.varImgGroup || [],
            variantValues: updatedProduct.variantValues || []
          }));
        }
        toast.success('Variant image deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete variant image');
      }
    } catch (error) {
      console.error('Error deleting variant image:', error);
      toast.error('Failed to delete variant image');
    } finally {
      setDeletingKey(null);
    }
  };
  const getSelectedAttributeOptions = () => {
    if (!selectedAttr) return [];
    const attr = variantNames?.find((a) => a.name === selectedAttr);
    return attr?.options?.filter((option) => option != null) || [];
  };

  const getOptionName = (option) => option.value || option.option || option.name || '';

  // Check if current attribute has any images uploaded
  const hasImagesInCurrentAttribute = () => {
    if (!selectedAttr) return false;
    const options = getSelectedAttributeOptions();
    return options.some((option) => {
      const images = getImagesForOption(option.slug);
      return images && images.length > 0;
    });
  };

  const isDropdownDisabled = hasImagesInCurrentAttribute();

  const getImageSrc = (image) => {
    if (image.url) return image.url;
    if (image.path) return `${BACKEND_URL}${image.path}`;
    if (image instanceof File || image instanceof Blob) return URL.createObjectURL(image);
    if (typeof image === "string") return image;
    return "";
  };

  return (
    <div className="ring-1 ring-gray-200 rounded-lg bg-white h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Variant Images</h2>
          {variantNames?.length > 0 && (
            <div className="relative">
              <select
                className={`text-xs border-0 rounded px-2 py-1 focus:ring-1 focus:ring-primary capitalize ${
                  isDropdownDisabled
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100"
                }`}
                value={selectedAttr || ""}
                onChange={(e) => setSelectedAttr(e.target.value)}
                disabled={isDropdownDisabled}
              >
                <option value="" disabled>Select</option>
                {variantNames.filter((attr) => attr?.name).map((attr) => (
                  <option key={attr.name} value={attr.name}>{attr.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {isDropdownDisabled && (
          <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Remove all images to switch attribute
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {(!variantNames || variantNames.length === 0) ? (
          <p className="text-xs text-gray-400 text-center py-4">No variants configured</p>
        ) : !selectedAttr ? (
          <p className="text-xs text-gray-400 text-center py-4">Select an attribute above</p>
        ) : (
          <div className="space-y-2">
            {getSelectedAttributeOptions().map((option, index) => (
              <div key={option._id || option.slug || index} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {/* Option Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {/* Show color swatch whenever option has colorCode (not just for "color" attribute) */}
                    {option.colorCode && (
                      <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: option.colorCode }} />
                    )}
                    <span className="text-xs font-medium text-gray-700 capitalize">{getOptionName(option)}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {getImagesForOption(option.slug)?.length || 0} images
                  </span>
                </div>

                {/* Images Grid */}
                <div className="flex flex-wrap gap-2 items-center">
                  {getImagesForOption(option.slug)?.length > 0 ? (
                    <>
                      {getImagesForOption(option.slug).map((image, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={getImageSrc(image)}
                            alt=""
                            className="h-16 w-16 object-cover rounded-md border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteVariantImage(option.slug, imgIndex)}
                            disabled={deletingKey === `${option.slug}-${imgIndex}`}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow disabled:opacity-50"
                          >{deletingKey === `${option.slug}-${imgIndex}` ? (
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                          ) : '×'}</button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span className="text-[10px] text-gray-400">No images uploaded</span>
                  )}

                  {/* Upload Button */}
                  <label className="h-16 w-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[9px] text-gray-400 mt-0.5">Add</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleVariantImageChange(option.slug, e.target.files)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ProductVariantImages.propTypes = {
  product: PropTypes.object,
  setProduct: PropTypes.func,
  handleVariantImageDelete: PropTypes.func.isRequired,
  selectedAttr: PropTypes.string,
  setSelectedAttr: PropTypes.func.isRequired,
  getImagesForOption: PropTypes.func.isRequired,
  variantNames: PropTypes.array.isRequired,
  handleVariantImageChange: PropTypes.func.isRequired,
};
