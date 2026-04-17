import PropTypes from 'prop-types';
import { FiFile, FiFileText } from 'react-icons/fi';

/**
 * FileAttachment Component
 * Displays file attachments in messages
 */
const FileAttachment = ({ files = [], onPreview }) => {
  if (!files || files.length === 0) return null;

  const isImageFile = (fileUrl) => /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(fileUrl);
  const isPdfFile = (fileUrl) => /\.pdf$/i.test(fileUrl);

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {files.map((fileUrl, idx) => {
        const fileName = fileUrl.split('/').pop() || 'file';

        if (isImageFile(fileUrl)) {
          return (
            <img
              key={idx}
              src={fileUrl || '/placeholder.svg'}
              alt={`Attachment ${idx + 1}`}
              className="w-20 h-20 object-cover cursor-pointer rounded hover:opacity-80 transition-opacity"
              onClick={() => onPreview(fileUrl)}
            />
          );
        }

        if (isPdfFile(fileUrl)) {
          return (
            <div
              key={idx}
              onClick={() => onPreview(fileUrl)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors border border-red-200"
              title={fileName}
            >
              <FiFileText className="text-red-600" size={18} />
              <span className="text-sm text-gray-700 max-w-[150px] truncate">
                {fileName}
              </span>
            </div>
          );
        }

        // Other file types - open in new tab
        return (
          <a
            key={idx}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            title={fileName}
          >
            <FiFile className="text-gray-600" size={18} />
            <span className="text-sm text-blue-600 underline max-w-[150px] truncate">
              {fileName}
            </span>
          </a>
        );
      })}
    </div>
  );
};

FileAttachment.propTypes = {
  files: PropTypes.arrayOf(PropTypes.string),
  onPreview: PropTypes.func.isRequired
};

export default FileAttachment;
