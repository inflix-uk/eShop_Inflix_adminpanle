import PropTypes from 'prop-types';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Images Section Component
 * Displays attached images with modal preview functionality
 */
const ImagesSection = ({
  images,
  getImageUrl,
  isModalOpen,
  currentImageIndex,
  onImageClick,
  onCloseModal,
  onPrevImage,
  onNextImage,
}) => {
  if (!images || images.length === 0) {
    return (
      <section className="mb-6 bg-white rounded-lg">
        <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
          Attached Images
        </h3>
        <p className="text-gray-700">No images attached.</p>
      </section>
    );
  }

  return (
    <section className="mb-6 bg-white rounded-lg">
      <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
        Attached Images
      </h3>

      {/* Image Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((file, index) => (
          <div key={index} className="relative group">
            <img
              src={getImageUrl(file.path)}
              alt={file.originalname}
              className="w-full h-32 object-cover rounded-lg cursor-pointer border border-gray-200 hover:opacity-80 transition-opacity"
              onClick={() => onImageClick(index)}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/fallback.jpg';
              }}
            />
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 rounded-lg transition-opacity pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Modal for Image Preview */}
      {isModalOpen && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={onCloseModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative bg-transparent rounded-lg overflow-hidden max-w-4xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              onClick={onCloseModal}
              aria-label="Close"
            >
              <FaTimes size={36} className='bg-primary rounded-lg p-2' />
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white hover:text-gray-300 focus:outline-none"
                onClick={onPrevImage}
                aria-label="Previous Image"
              >
                <FaChevronLeft size={30} className='bg-primary rounded-lg p-2' />
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white hover:text-gray-300 focus:outline-none"
                onClick={onNextImage}
                aria-label="Next Image"
              >
                <FaChevronRight size={30} className='bg-primary rounded-lg p-2' />
              </button>
            )}

            {/* Image */}
            <img
              src={getImageUrl(images[currentImageIndex].path)}
              alt={images[currentImageIndex].originalname}
              className="w-full max-h-screen object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
};

ImagesSection.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      originalname: PropTypes.string,
    })
  ),
  getImageUrl: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  currentImageIndex: PropTypes.number.isRequired,
  onImageClick: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onPrevImage: PropTypes.func.isRequired,
  onNextImage: PropTypes.func.isRequired,
};

export default ImagesSection;
