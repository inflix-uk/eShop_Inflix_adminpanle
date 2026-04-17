import PropTypes from 'prop-types';

/**
 * Image Preview Modal Component
 * Displays a full-screen preview of an image
 */
const ImagePreviewModal = ({ previewImage, baseUrl, onClose }) => {
  if (!previewImage) return null;

  // Determine if image is a URL or needs base URL prepended
  const imageSrc = previewImage.startsWith('http') || previewImage.startsWith('blob:')
    ? previewImage
    : `${baseUrl}${previewImage}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={imageSrc}
        alt="Preview"
        className="max-w-full max-h-full rounded-md"
      />
    </div>
  );
};

ImagePreviewModal.propTypes = {
  previewImage: PropTypes.string,
  baseUrl: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImagePreviewModal;
