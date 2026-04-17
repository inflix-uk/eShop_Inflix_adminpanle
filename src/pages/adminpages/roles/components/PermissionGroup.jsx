/**
 * PermissionGroup Component
 * Groups related permissions together with bulk enable/disable
 */

import PropTypes from 'prop-types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PermissionToggle from './PermissionToggle';

const PermissionGroup = ({
    group,
    rolePermissions,
    selectedRole = null,
    onToggle,
    onGroupToggle,
    isRolesPermission = false,
    isAdministrator = false
}) => {
    const handleSelectAll = () => {
        if (isRolesPermission) return;
        onGroupToggle(group.permissions, true);
    };

    const handleSelectNone = () => {
        if (isRolesPermission) return;
        onGroupToggle(group.permissions, false);
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Group Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-medium text-gray-700">{group.name}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={handleSelectAll}
                        disabled={!selectedRole || isRolesPermission}
                        className={`text-xs ${!selectedRole || isRolesPermission
                            ? 'bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            } px-2 py-1 rounded flex items-center transition-colors`}
                    >
                        <FaCheck className="mr-1" size={12} /> All
                    </button>
                    <button
                        onClick={handleSelectNone}
                        disabled={!selectedRole || isRolesPermission}
                        className={`text-xs ${!selectedRole || isRolesPermission
                            ? 'bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } px-2 py-1 rounded flex items-center transition-colors`}
                    >
                        <FaTimes className="mr-1" size={12} /> None
                    </button>
                </div>
            </div>

            {/* Permissions List */}
            <div className="divide-y divide-gray-200">
                {group.permissions.map((permission) => {
                    const isLocked = isRolesPermission;
                    const permissionValue = isRolesPermission
                        ? isAdministrator
                        : rolePermissions[permission.id] || false;

                    return (
                        <PermissionToggle
                            key={permission.id}
                            permission={permission}
                            isChecked={permissionValue}
                            isDisabled={!selectedRole || isLocked}
                            onChange={onToggle}
                        />
                    );
                })}
            </div>
        </div>
    );
};

PermissionGroup.propTypes = {
    group: PropTypes.shape({
        name: PropTypes.string.isRequired,
        permissions: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                description: PropTypes.string.isRequired
            })
        ).isRequired
    }).isRequired,
    rolePermissions: PropTypes.object.isRequired,
    selectedRole: PropTypes.string,
    onToggle: PropTypes.func.isRequired,
    onGroupToggle: PropTypes.func.isRequired,
    isRolesPermission: PropTypes.bool,
    isAdministrator: PropTypes.bool
};

export default PermissionGroup;
