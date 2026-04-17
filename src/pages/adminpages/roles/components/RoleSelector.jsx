/**
 * RoleSelector Component
 * Dropdown selector for choosing a role
 */

import PropTypes from 'prop-types';

const RoleSelector = ({
    roles,
    selectedRole = null,
    onChange,
    hasChanges = false
}) => {
    const handleChange = (e) => {
        const roleId = e.target.value;
        const role = roles.find(r => r._id === roleId);

        if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to switch roles?')) {
            return;
        }

        onChange(roleId, role?.name);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
            </label>
            <select
                value={selectedRole || ''}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                <option value="">Select a role</option>
                {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                        {role.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

RoleSelector.propTypes = {
    roles: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        })
    ).isRequired,
    selectedRole: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    hasChanges: PropTypes.bool
};

export default RoleSelector;
