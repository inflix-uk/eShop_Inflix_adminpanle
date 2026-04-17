import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';

const UploadImageModal = ({ isOpen, onClose, directoryName, onUpload, isUploading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [altText, setAltText] = useState(''); // Alt text - 2nd field
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Helper function to sanitize filename (replace spaces with hyphens)
  const sanitizeFileName = (fileName) => {
    // Get filename without extension
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return fileName.replace(/\s+/g, '-');
    }
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    // Replace spaces with hyphens in filename (not extension)
    return nameWithoutExt.replace(/\s+/g, '-') + extension;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }
    
    // Sanitize filenames (replace spaces with hyphens)
    const sanitizedFiles = imageFiles.map(file => {
      const sanitizedName = sanitizeFileName(file.name);
      // Create new File object with sanitized name
      return new File([file], sanitizedName, { type: file.type, lastModified: file.lastModified });
    });
    
    setSelectedFiles(sanitizedFiles);
    
    // Create previews
    const newPreviews = sanitizedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(previews[index].preview);
    
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }
    
    // Title will be generated from filename (already sanitized)
    // Only send altText if it's not empty
    const altTextToSend = altText.trim() || '';
    console.log('Uploading with altText:', altTextToSend); // Debug log
    onUpload(selectedFiles, altTextToSend);
  };

  const handleClose = () => {
    // Clean up preview URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.preview));
    setSelectedFiles([]);
    setPreviews([]);
    setAltText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FiUpload className="w-5 h-5" />
                Upload Images to {directoryName}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                disabled={isUploading}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="space-y-4">
              {/* Info about Title */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The image filename (e.g., "ali.jpg" or "zeeshan.png") will automatically become the title (filename without extension). Spaces in filenames will be replaced with hyphens. The URL will be generated based on this title.
                </p>
              </div>

              {/* Alt Text - 2nd Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text (Optional)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Enter alt text for images..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                  disabled={isUploading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This alt text will be applied to all selected images
                </p>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
              </div>

              {/* File Previews */}
              {previews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Images ({previews.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isUploading}
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {preview.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </button>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

UploadImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  directoryName: PropTypes.string.isRequired,
  onUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired
};

export default UploadImageModal;

