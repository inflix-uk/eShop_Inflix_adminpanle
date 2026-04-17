import { useRef } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';

async function verifyImageDimensions(file, width, height) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (w !== width || h !== height) {
        alert(
          `Image must be exactly ${width}×${height} pixels (this file is ${w}×${h})`
        );
        resolve(false);
        return;
      }
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert(
        'Could not read this image in the browser. For ICO, upload anyway — the server will validate 512×512.'
      );
      resolve(false);
    };
    img.src = url;
  });
}

const ImageUploader = ({
  label,
  value,
  onChange,
  error,
  required = false,
  accept = 'image/*',
  maxSizeMB = 5,
  dimensionCheck = null,
  /** e.g. ['.ico'] — skip client-side dimension check; server may still validate */
  dimensionCheckSkipExtensions = [],
  fileTypeHint = null,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/octet-stream') {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    if (dimensionCheck?.width && dimensionCheck?.height) {
      const ext = (file.name.slice(file.name.lastIndexOf('.')) || '').toLowerCase();
      const skip = dimensionCheckSkipExtensions.some(
        (s) => s.toLowerCase() === ext
      );
      if (!skip) {
        const ok = await verifyImageDimensions(
          file,
          dimensionCheck.width,
          dimensionCheck.height
        );
        if (!ok) {
          return;
        }
      }
    }

    onChange(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value ? (
        <div className="relative">
          <div className="w-full max-h-28 overflow-hidden rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="max-h-28 w-auto object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Remove image"
          >
            <FiX size={16} className="text-gray-700" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileTypeHint || `PNG, JPG, WEBP up to ${maxSizeMB}MB`}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

ImageUploader.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(File)]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  accept: PropTypes.string,
  maxSizeMB: PropTypes.number,
  dimensionCheck: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  dimensionCheckSkipExtensions: PropTypes.arrayOf(PropTypes.string),
  fileTypeHint: PropTypes.string,
};

export default ImageUploader;
