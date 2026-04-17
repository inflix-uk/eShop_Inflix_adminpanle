import PropTypes from 'prop-types';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

/**
 * Status Badge Component
 * Displays and allows editing of return request status
 */
const StatusBadge = ({
  requestId,
  currentStatus,
  isEditing,
  selectedStatus,
  statusLabels,
  statusColors,
  onEdit,
  onCancel,
  onSave,
  onChange
}) => {
  const statusOptions = ['pending', 'accepted', 'rejected'];

  return (
    <div className="flex items-center">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <select
            name="status"
            value={selectedStatus ?? currentStatus.toLowerCase()}
            onChange={(e) => onChange(requestId, e)}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSave(requestId)}
            className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
            aria-label="Save Status"
          >
            <FaSave />
          </button>
          <button
            onClick={() => onCancel(requestId)}
            className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-md"
            aria-label="Cancel Edit"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-primary border border-gray-300 ${
            statusColors[currentStatus.toLowerCase()] || "bg-white"
          } cursor-pointer`}
          onClick={() => onEdit(requestId, currentStatus.toLowerCase())}
        >
          {statusLabels[currentStatus.toLowerCase()] || currentStatus}
          <FaEdit className="ml-2 text-primary" />
        </span>
      )}
    </div>
  );
};

StatusBadge.propTypes = {
  requestId: PropTypes.string.isRequired,
  currentStatus: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  selectedStatus: PropTypes.string,
  statusLabels: PropTypes.object.isRequired,
  statusColors: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StatusBadge;
