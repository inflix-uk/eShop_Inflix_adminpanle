/**
 * RoleModal Component
 * Modal for creating and editing roles
 */

import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const RoleModal = ({
    isOpen,
    role,
    onClose,
    onChange,
    onSubmit,
    isLoading = false
}) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                {role._id ? 'Edit Role' : 'Create New Role'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Role Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={role.name || ''}
                                        onChange={onChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                                        placeholder="Enter role name"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={role.description || ''}
                                        onChange={onChange}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                                        placeholder="Enter role description"
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm
                                        ${isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isLoading ? 'Saving...' : (role._id ? 'Update Role' : 'Create Role')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

RoleModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    role: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
};

export default RoleModal;
