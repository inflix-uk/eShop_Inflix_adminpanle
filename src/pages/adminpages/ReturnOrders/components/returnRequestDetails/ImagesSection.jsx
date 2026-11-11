import PropTypes from 'prop-types';
import StableImage from './StableImage';

/**
 * Customer-uploaded images attached to a return request.
 * Clicking a thumbnail opens it full size (see ImageLightbox in the page).
 */
const ImagesSection = ({ images, getFileUrl, onImageClick }) => {
  return (
    <section className="mb-6 bg-white rounded-lg">
      <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
        Attached Images
      </h3>

      {!images || images.length === 0 ? (
        <p className="text-gray-700">No images attached.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <button
              type="button"
              key={file.filename || file.path || index}
              className="relative group text-left"
              onClick={() => onImageClick(index)}
              title="Click to view full size"
            >
              <StableImage
                src={getFileUrl(file)}
                alt={file.originalname || `Attachment ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-zoom-in border border-gray-200 group-hover:opacity-90 transition-opacity"
              />
              <span className="mt-1 block truncate text-xs text-gray-500">
                {file.originalname || `Attachment ${index + 1}`}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

ImagesSection.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      path: PropTypes.string,
      originalname: PropTypes.string,
    })
  ),
  getFileUrl: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
};

export default ImagesSection;
