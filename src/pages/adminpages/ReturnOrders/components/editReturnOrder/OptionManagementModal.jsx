import { useState } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon, PencilIcon, TrashIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import {
  updateReturnOrderOption,
  deleteReturnOrderOption
} from '../../service';

/**
 * Option Management Modal Component
 * Allows editing and deleting dropdown options
 */
const OptionManagementModal = ({
  isOpen,
  onClose,
  title,
  options,
  onOptionsUpdate,
  type
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  if (!isOpen) return null;

  const handleEditStart = (option) => {
    setEditingId(option._id);
    setEditValue(option.label);
    setDeleteConfirmId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleEditSave = async (option) => {
    if (!editValue.trim()) {
      toast.error('Option name cannot be empty');
      return;
    }

    if (editValue.trim() === option.label) {
      handleEditCancel();
      return;
    }

    setIsLoading(true);
    const result = await updateReturnOrderOption(option._id, editValue.trim());

    if (result.success) {
      const updatedOptions = options.map(opt =>
        opt._id === option._id
          ? { ...opt, label: result.option.name, value: result.option.name.toLowerCase().replace(/\s+/g, '') }
          : opt
      );
      onOptionsUpdate(updatedOptions);
      toast.success('Option updated successfully');
      handleEditCancel();
    } else {
      toast.error(result.error || 'Failed to update option');
    }
    setIsLoading(false);
  };

  const handleDeleteClick = (optionId) => {
    setDeleteConfirmId(optionId);
    setEditingId(null);
  };

  const handleDeleteConfirm = async (option) => {
    setIsLoading(true);
    const result = await deleteReturnOrderOption(option._id);

    if (result.success) {
      const updatedOptions = options.filter(opt => opt._id !== option._id);
      onOptionsUpdate(updatedOptions);
      toast.success('Option deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete option');
    }
    setDeleteConfirmId(null);
    setIsLoading(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Manage {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {options.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No options available</p>
            ) : (
              <ul className="space-y-2">
                {options.map((option) => (
                  <li
                    key={option._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {editingId === option._id ? (
                      // Edit Mode
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(option);
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                        />
                        <button
                          onClick={() => handleEditSave(option)}
                          disabled={isLoading}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Save"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          disabled={isLoading}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                          title="Cancel"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : deleteConfirmId === option._id ? (
                      // Delete Confirmation Mode
                      <div className="flex items-center justify-between w-full">
                        <span className="text-red-600 text-sm">Delete "{option.label}"?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteConfirm(option)}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                          >
                            {isLoading ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <span className="text-gray-800 capitalize">{option.label}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditStart(option)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(option._id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OptionManagementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onOptionsUpdate: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export default OptionManagementModal;
