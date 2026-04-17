import PropTypes from 'prop-types';
import {
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/solid';

/**
 * Additional Details Section Component
 * Displays and allows editing of reason, notes, and save button
 */
const AdditionalDetailsSection = ({
  formData,
  isEditMode,
  isSaving,
  onInputChange,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-3 border border-gray-200">
      <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
        <ClipboardDocumentListIcon className="h-4 w-4 text-primary" />
        Additional Details
      </h2>
      <div className="space-y-3">
        {/* Reason Field */}
        <div
          className={isEditMode ? "w-full" : "w-full flex items-center justify-between"}
        >
          <label className="text-xs font-medium text-gray-900 mb-1.5 flex items-center gap-2">
            <ExclamationCircleIcon className="h-3.5 w-3.5 text-primary" />
            Reason
          </label>
          {isEditMode ? (
            <textarea
              rows="3"
              id="reason"
              name="reason"
              className="block w-full text-xs rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              value={formData.reason}
              onChange={onInputChange}
            />
          ) : (
            <p className="text-xs text-gray-700">{formData.reason}</p>
          )}
        </div>

        {/* Notes Field */}
        <div
          className={isEditMode ? "w-full" : "w-full flex items-center justify-between"}
        >
          <label className="text-xs font-medium text-gray-900 mb-1.5 flex items-center gap-2">
            <PencilSquareIcon className="h-3.5 w-3.5 text-primary" />
            Notes
          </label>
          {isEditMode ? (
            <textarea
              rows="3"
              name="notes"
              id="notes"
              className="block w-full text-xs rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              value={formData.notes}
              onChange={onInputChange}
            />
          ) : (
            <p className="text-xs text-gray-700">{formData.notes}</p>
          )}
        </div>
      </div>

      {/* Save Button */}
      {isEditMode && (
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-3 py-1.5 text-xs rounded-md shadow flex items-center gap-1.5 ${
              isSaving
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <ArrowUpTrayIcon className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

AdditionalDetailsSection.propTypes = {
  formData: PropTypes.shape({
    reason: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired,
  isEditMode: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default AdditionalDetailsSection;
