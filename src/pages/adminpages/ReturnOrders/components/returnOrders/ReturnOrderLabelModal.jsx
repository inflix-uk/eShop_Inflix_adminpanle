import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { getAvailableLabels, assignLabelToReturnOrder } from '../../service/returnOrdersService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

// Helper to get the correct label URL from filePath
const getLabelUrl = (filePath) => {
  if (!filePath) return '#';
  // Extract relative path starting from /uploads/
  const uploadsIndex = filePath.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return `${BACKEND_URL}${filePath.substring(uploadsIndex)}`;
  }
  // If already a relative path or URL, use as is
  if (filePath.startsWith('http')) {
    return filePath;
  }
  // Ensure no double slashes
  const relativePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${BACKEND_URL}${relativePath}`;
};

const ReturnOrderLabelModal = ({ isOpen, onClose, onApply, orderId, existingLabel }) => {
  const [unusedLabels, setUnusedLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const fetchUnusedLabels = useCallback(async () => {
    if (!isOpen || existingLabel) return; // Don't fetch if label already exists

    setLoading(true);
    try {
      const result = await getAvailableLabels(100);
      if (result.success) {
        setUnusedLabels(result.labels);
      } else {
        toast.error(result.error || 'Failed to fetch unused labels');
      }
    } catch (error) {
      toast.error('Error fetching unused labels: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [isOpen, existingLabel]);

  useEffect(() => {
    if (isOpen && !existingLabel) {
      fetchUnusedLabels();
      setSelectedLabel(null); // Reset selection when modal opens
    }
  }, [fetchUnusedLabels, isOpen, existingLabel]);

  const handleApply = async () => {
    if (!selectedLabel) {
      toast.error('Please select a label');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignLabelToReturnOrder(orderId, selectedLabel._id);

      if (result.success) {
        toast.success(result.message || 'Label applied successfully');
        onApply(result.data);
        onClose();
      } else {
        toast.error(result.error || 'Failed to apply label');
      }
    } catch (error) {
      toast.error('Error applying label: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Apply Label to Return Order</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Show existing label if already applied */}
        {existingLabel ? (
          <div className="py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="font-semibold text-blue-800">Label Already Applied</span>
              </div>
              <a
                href={getLabelUrl(existingLabel.filePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{existingLabel.fileName}</p>
                  <p className="text-xs text-gray-500">
                    Applied on: {new Date(existingLabel.usedAt || existingLabel.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Show total unused labels if loaded */}
            {!loading && unusedLabels.length > 0 && (
              <div className="text-sm text-gray-700 mb-2">
                Total unused labels: <span className="font-semibold">{unusedLabels.length}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : unusedLabels.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                <p className="text-gray-500">No unused labels available</p>
                <p className="text-sm text-gray-400 mt-1">Please upload new labels first</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-black uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Select</th>
                      <th className="px-4 py-3">Filename</th>
                      <th className="px-4 py-3">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unusedLabels.map((label) => (
                      <tr
                        key={label._id}
                        className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedLabel?._id === label._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedLabel(label)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="label"
                            checked={selectedLabel?._id === label._id}
                            onChange={() => setSelectedLabel(label)}
                            className="w-4 h-4 text-primary cursor-pointer accent-blue-600"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{label.fileName}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(label.createdAt).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedLabel || loading || assigning}
                className={`px-4 py-2 bg-primary text-white rounded transition-colors flex items-center gap-2 ${
                  !selectedLabel || loading || assigning
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Applying...
                  </>
                ) : (
                  'Apply Label'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

ReturnOrderLabelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  orderId: PropTypes.string,
  existingLabel: PropTypes.shape({
    _id: PropTypes.string,
    fileName: PropTypes.string,
    filePath: PropTypes.string,
    usedAt: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};

export default ReturnOrderLabelModal;
