/**
 * RoleTable Component
 * Displays roles in a table with action buttons
 */

import PropTypes from 'prop-types';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton } from '../../shared/Skeletons';

const RoleTable = ({
    roles,
    onEdit,
    onDelete,
    isLoading = false
}) => {
    const navigate = useNavigate();
    if (isLoading) {
        return (
            <div className="p-4">
                <TableSkeleton rows={8} columns={4} />
            </div>
        );
    }

    if (roles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No roles found. Create your first role to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Role Name
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Description
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Users
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                        <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {role.name}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">
                                    {role.description || 'No description'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                    onClick={() => navigate(`/admin/roles/${role._id}/users`)}
                                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium"
                                    title="View users with this role"
                                >
                                    <FaUsers className="mr-1.5" size={14} />
                                    {role.userCount || 0}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => onEdit(role)}
                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                                        title="Edit role"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(role._id)}
                                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                                        title="Delete role"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

RoleTable.propTypes = {
    roles: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            userCount: PropTypes.number
        })
    ).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
};

export default RoleTable;
