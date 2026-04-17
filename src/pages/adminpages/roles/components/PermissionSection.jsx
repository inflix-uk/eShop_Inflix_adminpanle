/**
 * PermissionSection Component
 * Displays a section of permissions
 */

import PropTypes from 'prop-types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PermissionGroup from './PermissionGroup';

const PermissionSection = ({
    title,
    permissionGroups,
    rolePermissions,
    selectedRole = null,
    onToggle,
    onGroupToggle,
    onSectionToggle,
    isRolesSection = false,
    isAdministrator = false
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onSectionToggle(true)}
                            disabled={!selectedRole || isRolesSection}
                            className={`text-xs px-3 py-1.5 rounded-md flex items-center transition-colors
                                ${!selectedRole || isRolesSection
                                    ? 'bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                        >
                            <FaCheck className="mr-1.5" size={12} /> Enable All
                        </button>
                        <button
                            onClick={() => onSectionToggle(false)}
                            disabled={!selectedRole || isRolesSection}
                            className={`text-xs px-3 py-1.5 rounded-md flex items-center transition-colors
                                ${!selectedRole || isRolesSection
                                    ? 'bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                        >
                            <FaTimes className="mr-1.5" size={12} /> Disable All
                        </button>
                    </div>
                </div>
            </div>

            {/* Permission Groups */}
            <div className="p-6 space-y-6">
                {permissionGroups.map((group) => (
                    <PermissionGroup
                        key={group.name}
                        group={group}
                        rolePermissions={rolePermissions}
                        selectedRole={selectedRole}
                        onToggle={onToggle}
                        onGroupToggle={onGroupToggle}
                        isRolesPermission={isRolesSection}
                        isAdministrator={isAdministrator}
                    />
                ))}
            </div>
        </div>
    );
};

PermissionSection.propTypes = {
    title: PropTypes.string.isRequired,
    permissionGroups: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            permissions: PropTypes.array.isRequired
        })
    ).isRequired,
    rolePermissions: PropTypes.object.isRequired,
    selectedRole: PropTypes.string,
    onToggle: PropTypes.func.isRequired,
    onGroupToggle: PropTypes.func.isRequired,
    onSectionToggle: PropTypes.func.isRequired,
    isRolesSection: PropTypes.bool,
    isAdministrator: PropTypes.bool
};

export default PermissionSection;
