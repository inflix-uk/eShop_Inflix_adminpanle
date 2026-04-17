/**
 * PermissionToggle Component
 * Reusable toggle switch for individual permissions
 */

import PropTypes from 'prop-types';

const PermissionToggle = ({
    permission,
    isChecked,
    isDisabled = false,
    onChange
}) => {
    return (
        <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
            <div>
                <h4 className="font-medium text-gray-800">{permission.name}</h4>
                <p className="text-sm text-gray-500">{permission.description}</p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                    type="checkbox"
                    id={`toggle-${permission.id}`}
                    checked={isChecked}
                    onChange={() => onChange(permission.id)}
                    disabled={isDisabled}
                    className="sr-only"
                />
                <label
                    htmlFor={`toggle-${permission.id}`}
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isChecked ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                    <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform
                            ${isChecked ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                </label>
            </div>
        </div>
    );
};

PermissionToggle.propTypes = {
    permission: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired
    }).isRequired,
    isChecked: PropTypes.bool.isRequired,
    isDisabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

export default PermissionToggle;
