import { useRef } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiUpload, FiFolder } from 'react-icons/fi';

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

function isImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  if (file.type === 'application/octet-stream') return true;
  const ext = (file.name.slice(file.name.lastIndexOf('.')) || '').toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'].includes(ext);
}

const ImageUploader = ({
  label,
  helperText = null,
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
  /** When provided, shows a Media Library button alongside local upload */
  onSelectFromLibrary = null,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    if (!isImageFile(file)) {
      alert('Please select an image file (JPG, PNG, WEBP, GIF)');
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

    try {
      await onChange(file);
    } catch (err) {
      console.error('Image upload handler failed:', err);
      alert('Could not process this image. Please try another file.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
    e.target.value = '';
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
      {helperText ? (
        <p className="mb-2 text-xs text-gray-500">{helperText}</p>
      ) : null}

      {value ? (
        <div className="relative">
          <div className="w-full max-h-28 overflow-hidden rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="max-h-28 w-auto object-contain"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={handleClick}
              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-md hover:bg-gray-100 transition-colors"
            >
              Change
            </button>
            {onSelectFromLibrary ? (
              <button
                type="button"
                onClick={onSelectFromLibrary}
                className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-md hover:bg-gray-100 transition-colors"
              >
                Library
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleRemove}
              className="bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Remove image"
            >
              <FiX size={16} className="text-gray-700" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : onSelectFromLibrary ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-primary'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Upload from PC or choose from Media Library
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileTypeHint || `PNG, JPG, WEBP up to ${maxSizeMB}MB`}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <FiUpload size={14} />
                Upload from PC
              </button>
              <button
                type="button"
                onClick={onSelectFromLibrary}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                <FiFolder size={14} />
                Media Library
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
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
  helperText: PropTypes.string,
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
  onSelectFromLibrary: PropTypes.func,
};

export default ImageUploader;
