import PropTypes from 'prop-types';
import { PhotoIcon } from '@heroicons/react/24/solid';

/**
 * Order Images Section Component
 * Displays and allows uploading of order images
 */
const OrderImagesSection = ({
  orderImages,
  uploadedImages,
  isEditMode,
  baseUrl,
  onImageUpload,
  onRemoveImage,
  onImageClick,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-3 border border-gray-200">
      <label className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2">
        <PhotoIcon className="h-4 w-4 text-primary" />
        Order Images
      </label>
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Existing Images */}
        {orderImages.map((image, index) => (
          <div
            key={`existing-${index}`}
            className="relative w-20 h-20 cursor-pointer"
            onClick={() => onImageClick(image.path)}
          >
            <img
              src={`${baseUrl}${image.path}`}
              alt="Uploaded Image"
              className="w-full h-full object-cover rounded-md"
            />
            {isEditMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index, false);
                }}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                &times;
              </button>
            )}
          </div>
        ))}

        {/* Newly Uploaded Images */}
        {uploadedImages.map((image, index) => (
          <div
            key={`new-${index}`}
            className="relative w-20 h-20 cursor-pointer"
            onClick={() => onImageClick(URL.createObjectURL(image))}
          >
            <img
              src={URL.createObjectURL(image)}
              alt="New Upload"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(index, true);
              }}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {isEditMode && (
        <div className="mt-2">
          <input
            type="file"
            accept=".jpeg, .jpg, .png, .webp"
            multiple
            onChange={onImageUpload}
            className="block w-full text-xs text-gray-900 border rounded-md py-1"
          />
        </div>
      )}
    </div>
  );
};

OrderImagesSection.propTypes = {
  orderImages: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
    })
  ).isRequired,
  uploadedImages: PropTypes.array.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  baseUrl: PropTypes.string.isRequired,
  onImageUpload: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
};

export default OrderImagesSection;
