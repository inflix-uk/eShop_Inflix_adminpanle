import PropTypes from 'prop-types';
import { FiX, FiDownload } from 'react-icons/fi';

/**
 * FilePreviewModal Component
 * Modal for previewing image and PDF files
 */
const FilePreviewModal = ({ fileUrl, onClose }) => {
  if (!fileUrl) return null;

  // Check file type from URL
  const isImage = /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(fileUrl);
  const isPdf = /\.pdf$/i.test(fileUrl);
  const fileName = fileUrl.split('/').pop() || 'file';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-lg overflow-hidden ${
          isPdf ? 'w-[90vw] h-[90vh] max-w-5xl' : 'max-w-3xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header for PDF */}
        {isPdf && (
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 truncate max-w-md">
              {fileName}
            </h3>
            <div className="flex items-center gap-2">
              <a
                href={fileUrl}
                download
                className="text-gray-500 hover:text-gray-700 p-1"
                title="Download"
              >
                <FiDownload size={20} />
              </a>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close preview"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isImage ? (
          <>
            <img
              src={fileUrl || '/placeholder.svg'}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-white text-black rounded-full p-1 hover:bg-gray-200"
              aria-label="Close preview"
            >
              <FiX size={24} />
            </button>
          </>
        ) : isPdf ? (
          <iframe
            src={fileUrl}
            className="w-full h-[calc(90vh-60px)]"
            title="PDF Preview"
          />
        ) : (
          /* Fallback for other file types */
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">Cannot preview this file type</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Open in new tab
            </a>
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-white text-black rounded-full p-1 hover:bg-gray-200"
              aria-label="Close preview"
            >
              <FiX size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

FilePreviewModal.propTypes = {
  fileUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default FilePreviewModal;
