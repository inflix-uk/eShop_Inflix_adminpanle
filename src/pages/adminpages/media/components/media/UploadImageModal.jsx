import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { FiX, FiUpload, FiImage, FiFilm } from 'react-icons/fi';
import {
  VIDEO_FOLDER_SUGGESTIONS,
  buildVideoUploadDirectory,
  getDirectoryDisplayName,
  isVideoFileName,
  sanitizeMediaSubfolder,
} from '../../utils/mediaUtils';

const UploadImageModal = ({
  isOpen,
  onClose,
  directoryName,
  onUpload,
  isUploading,
  mediaType = 'images',
  existingVideoFolders = [],
}) => {
  const isVideoMode = mediaType === 'videos';
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [altText, setAltText] = useState('');
  const [previews, setPreviews] = useState([]);
  const [videoFolder, setVideoFolder] = useState('general');
  const [customFolder, setCustomFolder] = useState('');
  const fileInputRef = useRef(null);

  const folderOptions = Array.from(
    new Set([
      ...VIDEO_FOLDER_SUGGESTIONS,
      ...existingVideoFolders.map((d) => getDirectoryDisplayName(d)),
    ])
  ).filter(Boolean);

  useEffect(() => {
    if (!isOpen) return;
    if (isVideoMode) {
      const fromTab = getDirectoryDisplayName(directoryName || '');
      setVideoFolder(
        fromTab && fromTab !== 'videos' ? fromTab : folderOptions[0] || 'general'
      );
      setCustomFolder('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isVideoMode, directoryName]);

  const sanitizeFileName = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return fileName.replace(/\s+/g, '-');
    }
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    return nameWithoutExt.replace(/\s+/g, '-') + extension;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    const accepted = files.filter((file) => {
      if (isVideoMode) {
        return (
          file.type.startsWith('video/') || isVideoFileName(file.name)
        );
      }
      return file.type.startsWith('image/');
    });

    if (accepted.length === 0) {
      alert(
        isVideoMode
          ? 'Please select video files only (mp4, webm, ogv, mov)'
          : 'Please select image files only'
      );
      return;
    }

    const sanitizedFiles = accepted.map((file) => {
      const sanitizedName = sanitizeFileName(file.name);
      return new File([file], sanitizedName, {
        type: file.type,
        lastModified: file.lastModified,
      });
    });

    setSelectedFiles(sanitizedFiles);

    const newPreviews = sanitizedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isVideo:
        file.type.startsWith('video/') || isVideoFileName(file.name),
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index].preview);

    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resolveUploadDirectory = () => {
    if (!isVideoMode) return directoryName;
    const context =
      videoFolder === '__custom__'
        ? sanitizeMediaSubfolder(customFolder)
        : sanitizeMediaSubfolder(videoFolder);
    if (!context) {
      return null;
    }
    return buildVideoUploadDirectory(context);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert(
        isVideoMode
          ? 'Please select at least one video'
          : 'Please select at least one image'
      );
      return;
    }

    const directory = resolveUploadDirectory();
    if (!directory) {
      alert('Please enter a valid folder name for this video');
      return;
    }

    const altTextToSend = altText.trim() || '';
    onUpload(selectedFiles, altTextToSend, directory);
  };

  const handleClose = () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
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
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FiUpload className="w-5 h-5" />
                {isVideoMode
                  ? 'Upload Videos'
                  : `Upload Images to ${directoryName}`}
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

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  {isVideoMode ? (
                    <>
                      <strong>Note:</strong> Videos are stored under{' '}
                      <code className="text-xs">videos/&#123;folder&#125;/</code>
                      . Choosing or creating a folder (e.g. homepage, blog)
                      creates that tab in Media → Videos — same pattern as
                      banners / logo for images.
                    </>
                  ) : (
                    <>
                      <strong>Note:</strong> The image filename becomes the
                      title. Spaces in filenames are replaced with hyphens.
                    </>
                  )}
                </p>
              </div>

              {isVideoMode && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Video folder <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={videoFolder}
                    onChange={(e) => setVideoFolder(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                    disabled={isUploading}
                  >
                    {folderOptions.map((folder) => (
                      <option key={folder} value={folder}>
                        videos/{folder}
                      </option>
                    ))}
                    <option value="__custom__">Create new folder…</option>
                  </select>
                  {videoFolder === '__custom__' && (
                    <input
                      type="text"
                      value={customFolder}
                      onChange={(e) => setCustomFolder(e.target.value)}
                      placeholder="e.g. promotions, landing"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                      disabled={isUploading}
                    />
                  )}
                  <p className="text-xs text-gray-500">
                    Path:{' '}
                    <code className="text-xs">
                      {resolveUploadDirectory() || 'videos/…'}
                    </code>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isVideoMode ? 'Description / Alt (Optional)' : 'Alt Text (Optional)'}
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder={
                    isVideoMode
                      ? 'Enter description for videos...'
                      : 'Enter alt text for images...'
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isVideoMode ? 'Select Videos' : 'Select Images'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    {isVideoMode ? (
                      <FiFilm className="mx-auto h-12 w-12 text-gray-400" />
                    ) : (
                      <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    )}
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
                          accept={isVideoMode ? 'video/*' : 'image/*'}
                          multiple
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {isVideoMode
                        ? 'MP4, WebM, OGV, MOV up to 80MB each'
                        : 'PNG, JPG, GIF, WebP up to 10MB each'}
                    </p>
                  </div>
                </div>
              </div>

              {previews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected ({previews.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {preview.isVideo ? (
                          <video
                            src={preview.preview}
                            className="w-full h-24 object-cover rounded-md border border-gray-200 bg-black"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={preview.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-gray-200"
                          />
                        )}
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

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading
                ? 'Uploading...'
                : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
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
  directoryName: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
  mediaType: PropTypes.oneOf(['images', 'videos']),
  existingVideoFolders: PropTypes.arrayOf(PropTypes.string),
};

UploadImageModal.defaultProps = {
  directoryName: '',
  mediaType: 'images',
  existingVideoFolders: [],
};

export default UploadImageModal;
