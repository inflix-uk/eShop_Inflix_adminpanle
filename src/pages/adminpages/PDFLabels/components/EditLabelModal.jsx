import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditLabelModal = ({ isOpen, onClose, onSubmit, label }) => {
  const [fileName, setFileName] = useState('');
  
  useEffect(() => {
    if (label) {
      setFileName(label.fileName);
    }
  }, [label]);
  
  const handleSubmit = () => {
    if (!fileName || fileName.trim() === '') {
      return;
    }
    
    onSubmit({
      ...label,
      fileName: fileName.trim()
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-50">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Edit PDF Label</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white font-medium rounded-md shadow-sm hover:bg-primary/90"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md shadow-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EditLabelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  label: PropTypes.shape({
    fileName: PropTypes.string,
    _id: PropTypes.string
  })
};

export default EditLabelModal;
