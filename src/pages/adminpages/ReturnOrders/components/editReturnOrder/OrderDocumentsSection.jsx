import PropTypes from 'prop-types';
import { DocumentIcon } from '@heroicons/react/24/solid';

/**
 * Order Documents Section Component
 * Displays and allows uploading of order documents (PDFs)
 */
const OrderDocumentsSection = ({
  orderDocuments,
  uploadedFiles,
  isEditMode,
  baseUrl,
  onFileUpload,
  onRemoveFile,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-3 border border-gray-200">
      <label className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2">
        <DocumentIcon className="h-4 w-4 text-primary" />
        Order Documents
      </label>
      <ul className="mt-2 space-y-1.5">
        {/* Existing Documents */}
        {orderDocuments.map((file, index) => (
          <li key={`existing-file-${index}`} className="flex items-center justify-between">
            <a
              href={`${baseUrl}${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {file.filename}
            </a>
            {isEditMode && (
              <button
                type="button"
                onClick={() => onRemoveFile(index, false)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </li>
        ))}

        {/* Newly Uploaded Files */}
        {uploadedFiles.map((file, index) => (
          <li key={`new-file-${index}`} className="flex items-center justify-between">
            <a
              href={URL.createObjectURL(file)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {file.name}
            </a>
            <button
              type="button"
              onClick={() => onRemoveFile(index, true)}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {isEditMode && (
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={onFileUpload}
          className="mt-2 block w-full text-xs text-gray-900 border rounded-md py-1"
        />
      )}
    </div>
  );
};

OrderDocumentsSection.propTypes = {
  orderDocuments: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      filename: PropTypes.string,
    })
  ).isRequired,
  uploadedFiles: PropTypes.array.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  baseUrl: PropTypes.string.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

export default OrderDocumentsSection;
