import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ordersService from '../../service/ordersService';

const OrderLabelModal = ({ isOpen, onClose, onApply, orderId }) => {
  const [unusedLabels, setUnusedLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUnusedLabels = useCallback(async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const result = await ordersService.getAvailableLabels(100);
      if (result.success) {
        setUnusedLabels(result.labels || []);
      } else {
        toast.error(result.error || 'Failed to fetch unused labels');
      }
    } catch (error) {
      toast.error('Error fetching unused labels: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchUnusedLabels();
  }, [fetchUnusedLabels]);

  const handleApply = async () => {
    if (!selectedLabel) {
      toast.error('Please select a label');
      return;
    }

    try {
      const result = await ordersService.assignLabelToOrder(orderId, selectedLabel._id);

      if (result.success) {
        toast.success(result.message || 'Label applied successfully');
        onApply(selectedLabel);
        onClose();
      } else {
        toast.error(result.error || 'Failed to apply label');
      }
    } catch (error) {
      toast.error('Error applying label: ' + error.message);
    }
  };

  if (!isOpen || !orderId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Apply Label to Order</h2>
        {/* Show total unused labels if loaded */}
        {!loading && unusedLabels.length > 0 && (
          <div className="text-sm text-gray-700 mb-2">Total unused labels: {unusedLabels.length}</div>
        )}

        {loading ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : unusedLabels.length === 0 ? (
          <p className="text-center text-gray-500 my-4">No unused labels available</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-black uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Select</th>
                  <th className="px-4 py-2">Filename</th>
                  <th className="px-4 py-2">Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {unusedLabels.map((label) => (
                  <tr
                    key={label._id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${selectedLabel?._id === label._id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedLabel(label)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="radio"
                        name="label"
                        checked={selectedLabel?._id === label._id}
                        onChange={() => setSelectedLabel(label)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2">{label.fileName}</td>
                    <td className="px-4 py-2">{new Date(label.createdAt).toLocaleDateString()}</td>
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
            disabled={!selectedLabel || loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded transition-colors ${
              !selectedLabel || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

OrderLabelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  orderId: PropTypes.string
};

export default OrderLabelModal;
