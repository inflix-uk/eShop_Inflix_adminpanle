import PropTypes from "prop-types";
import { useState } from "react";
import { FiCopy, FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";

const MediaCard = ({
  file,
  directoryName,
  imageUrl,
  uniqueFileId,
  editingFileId,
  editingTitleId,
  editingAltTextId,
  editedFileName,
  fileExtension,
  editedTitle,
  editedAltText,
  isUpdating,
  onStartEdit,
  onCancelEdit,
  onSaveFileName,
  onStartEditTitle,
  onCancelEditTitle,
  onSaveTitle,
  onStartEditAltText,
  onCancelEditAltText,
  onSaveAltText,
  onCopyUrl,
  onFileNameChange,
  onTitleChange,
  onAltTextChange,
  onDelete,
  getImagePathAfterUploads,
}) => {
  const [imageResolution, setImageResolution] = useState(null);

  // Helper function to get file extension
  const getFileExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) return "";
    return filename.substring(lastDotIndex);
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth && img.naturalHeight) {
      setImageResolution({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative group">
        <img
          src={imageUrl}
          alt={
            file.altText ||
            file.title ||
            file.name?.replace(/\.[^/.]+$/, "") ||
            ""
          }
          title={file.title || ""}
          className="object-contain w-full h-48"
          onLoad={handleImageLoad}
        />
        {/* Delete button overlay */}
        {onDelete && (
          <button
            onClick={() => onDelete(file, directoryName)}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Delete image"
            disabled={isUpdating}
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-4 space-y-2">
        {/* Filename Section with Edit Option */}
        <div className="flex items-center gap-2">
          {editingFileId === uniqueFileId ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedFileName}
                onChange={onFileNameChange}
                className="flex-1 text-sm font-medium px-2 py-1 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveFileName(file, directoryName);
                  } else if (e.key === "Escape") {
                    onCancelEdit();
                  }
                }}
              />
              <span className="text-sm font-medium text-gray-600 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md">
                {fileExtension}
              </span>
              <button
                onClick={() => onSaveFileName(file, directoryName)}
                disabled={isUpdating}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                title="Save"
              >
                <FiCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <p className="flex-1 text-sm font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap">
                {file.name}
              </p>
              {/* Filename edit icon - commented out as per requirement */}
              {/* <button
                onClick={() => onStartEdit(file, directoryName)}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit filename"
              >
                <FiEdit2 className="w-4 h-4" />
              </button> */}
            </>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            Size: {(file.size / 1024).toFixed(2)} KB
          </p>
          {imageResolution && (
            <p className="text-xs text-gray-500">
              Resolution: {imageResolution.width} × {imageResolution.height} px
            </p>
          )}
        </div>

        {/* Title (Meta Title) Section - 1st Field with Edit Option */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {editingTitleId === uniqueFileId ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={onTitleChange}
                  placeholder="Enter title (used for URL generation)..."
                  className="flex-1 text-sm px-2 py-1 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSaveTitle(file, directoryName);
                    } else if (e.key === "Escape") {
                      onCancelEditTitle();
                    }
                  }}
                />
                <span className="text-sm font-medium text-gray-600 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md">
                  {fileExtension}
                </span>
                <button
                  onClick={() => onSaveTitle(file, directoryName)}
                  disabled={isUpdating}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEditTitle}
                  disabled={isUpdating}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="Cancel"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Title (Meta) <span className="text-red-500">*</span>:
                  </label>
                  <p className="text-xs text-gray-600 break-words">
                    {file.title ? (
                      `${file.title}${getFileExtension(file.name)}`
                    ) : (
                      <span className="text-gray-400 italic">No title set</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onStartEditTitle(file, directoryName)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit title"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Alt Text Section - 2nd Field with Edit Option */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {editingAltTextId === uniqueFileId ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editedAltText}
                  onChange={onAltTextChange}
                  placeholder="Enter alt text..."
                  className="flex-1 text-sm px-2 py-1 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSaveAltText(file, directoryName);
                    } else if (e.key === "Escape") {
                      onCancelEditAltText();
                    }
                  }}
                />
                <button
                  onClick={() => onSaveAltText(file, directoryName)}
                  disabled={isUpdating}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Save"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEditAltText}
                  disabled={isUpdating}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="Cancel"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Alt Text:
                  </label>
                  <p className="text-xs text-gray-600 break-words">
                    {file.altText || (
                      <span className="text-gray-400 italic">
                        No alt text set
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => onStartEditAltText(file, directoryName)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit alt text"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* URL Display and Copy Section */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-700">URL:</label>
            <button
              onClick={() => onCopyUrl(imageUrl)}
              className="ml-auto p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Copy URL"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <p className="text-xs text-gray-600 break-all font-mono">
              {imageUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

MediaCard.propTypes = {
  file: PropTypes.object.isRequired,
  directoryName: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  uniqueFileId: PropTypes.string.isRequired,
  editingFileId: PropTypes.string,
  editingTitleId: PropTypes.string,
  editingAltTextId: PropTypes.string,
  editedFileName: PropTypes.string.isRequired,
  fileExtension: PropTypes.string.isRequired,
  editedTitle: PropTypes.string.isRequired,
  editedAltText: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveFileName: PropTypes.func.isRequired,
  onStartEditTitle: PropTypes.func.isRequired,
  onCancelEditTitle: PropTypes.func.isRequired,
  onSaveTitle: PropTypes.func.isRequired,
  onStartEditAltText: PropTypes.func.isRequired,
  onCancelEditAltText: PropTypes.func.isRequired,
  onSaveAltText: PropTypes.func.isRequired,
  onCopyUrl: PropTypes.func.isRequired,
  onFileNameChange: PropTypes.func.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onAltTextChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  getImagePathAfterUploads: PropTypes.func.isRequired,
};

export default MediaCard;
