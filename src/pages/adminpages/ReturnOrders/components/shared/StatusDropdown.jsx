import PropTypes from 'prop-types';
import { statusLabels, statusColors } from './StatusConfig';

const StatusDropdown = ({ 
    order, 
    isEditing, 
    selectedStatus, 
    onStatusChange, 
    onSave, 
    onCancel, 
    onEdit 
}) => {
    if (isEditing) {
        return (
            <div className="flex flex-row gap-5 items-center">
                <select
                    name="status"
                    value={selectedStatus ?? order.status}
                    onChange={(event) => onStatusChange(order._id, event)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                    {Object.keys(statusLabels).map((statusKey) => (
                        <option key={statusKey} value={statusKey}>
                            {statusLabels[statusKey]}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => onSave(order._id)}
                    className="text-white bg-blue-600 hover:bg-blue-700 p-1 rounded-md flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                </button>

                <button
                    onClick={onCancel}
                    className="text-white bg-red-600 hover:bg-red-700 p-1 rounded-md flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-2 text-xs font-medium ring-1 ring-inset cursor-pointer text-white ${
                statusColors[order.status] || "bg-gray-500"
            }`}
            onClick={onEdit}
        >
            {statusLabels[order.status] ?? order.status}
        </span>
    );
};

StatusDropdown.propTypes = {
    order: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
    }).isRequired,
    isEditing: PropTypes.bool,
    selectedStatus: PropTypes.string,
    onStatusChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default StatusDropdown;