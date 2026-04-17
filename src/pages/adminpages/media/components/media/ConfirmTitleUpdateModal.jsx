import PropTypes from 'prop-types';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmTitleUpdateModal = ({ isOpen, onClose, onConfirm, oldTitle, newTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Title Update
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Updating the title will change the image URL. This may affect any links or references to this image.
              </p>
              
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Current Title:</span>
                  <span className="text-xs text-gray-900 font-mono">{oldTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">New Title:</span>
                  <span className="text-xs text-gray-900 font-mono">{newTitle}</span>
                </div>
              </div>

              <p className="text-sm text-red-600 font-medium">
                Do you still want to change the title?
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Yes, Update Title
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmTitleUpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  oldTitle: PropTypes.string.isRequired,
  newTitle: PropTypes.string.isRequired
};

export default ConfirmTitleUpdateModal;

