import { XMarkIcon, DocumentIcon, ArrowUpTrayIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import pdfLabelService from '../service/PdfLabelService';

const UploadSection = ({ 
  selectedFiles, 
  setSelectedFiles, 
  uploadProgress, 
  loading, 
  handleFileChange, 
  handleUpload 
}) => {
  // Use the formatting function from the service
  const formatFileSize = pdfLabelService.formatFileSize;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <DocumentIcon className="w-6 h-6 mr-2 text-primary" />
          Upload Labels
        </h2>
        {selectedFiles.length > 0 && (
          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <DocumentCheckIcon className="w-4 h-4 mr-1 text-gray-500" />
          Select PDF Labels (Multiple files allowed)
        </label>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors duration-300 group">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center text-center">
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors duration-300 mb-2" />
            <p className="text-sm text-gray-500 mb-1">Drag and drop PDF files here, or click to browse</p>
            <p className="text-xs text-gray-400">Only PDF files are accepted</p>
          </div>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <DocumentIcon className="w-4 h-4 mr-1 text-gray-500" />
            Selected Files
          </h3>
          <ul className="text-sm text-gray-600 max-h-48 overflow-y-auto border rounded-lg p-1 divide-y divide-gray-100">
            {selectedFiles.map((file, index) => (
              <li 
                key={index} 
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition-colors duration-200 rounded-md"
              >
                <div className="flex items-center space-x-2 truncate max-w-[80%]">
                  <DocumentIcon className="w-5 h-5 text-primary/70 flex-shrink-0" />
                  <div className="truncate">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors duration-200"
                  title="Remove file"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {uploadProgress > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-700">Uploading files...</p>
            <p className="text-sm font-medium text-primary">{uploadProgress}%</p>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            Please don&apos;t close this window while upload is in progress
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={loading || selectedFiles.length === 0}
          className={`
            px-5 py-2.5 bg-primary text-white font-medium rounded-lg 
            shadow-sm disabled:opacity-50 disabled:cursor-not-allowed 
            hover:bg-primary/90 transition-all duration-300 
            flex items-center space-x-2 transform hover:-translate-y-0.5
            ${loading ? 'animate-pulse' : ''}
          `}
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          <span>{loading ? 'Uploading...' : 'Upload Labels'}</span>
        </button>
      </div>
    </div>
  );
};

UploadSection.propTypes = {
  selectedFiles: PropTypes.array.isRequired,
  setSelectedFiles: PropTypes.func.isRequired,
  uploadProgress: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  handleUpload: PropTypes.func.isRequired
};

export default UploadSection;
