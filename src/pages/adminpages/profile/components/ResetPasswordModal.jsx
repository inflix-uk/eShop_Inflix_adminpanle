import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/common/Modal';

/**
 * ResetPasswordModal Component
 * Modal for resetting user password with password visibility toggle
 */
export default function ResetPasswordModal({
    isOpen,
    onClose,
    oldPassword,
    newPassword,
    confirmPassword,
    onOldPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit
}) {
    // State for password visibility
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Eye icon SVG components
    const EyeIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    );

    const EyeSlashIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
        </svg>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reset Password">
            <div className="p-4 flex flex-col justify-between items-center w-full gap-2">
                {/* Old Password */}
                <div className="mb-4 w-full">
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                        Old Password
                    </label>
                    <div className="relative mt-1">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            id="oldPassword"
                            name="oldPassword"
                            className="block w-full px-3 py-1.5 pr-10 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            value={oldPassword}
                            onChange={onOldPasswordChange}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            tabIndex={-1}
                        >
                            {showOldPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="mb-4 w-full">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <div className="relative mt-1">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            className="block w-full px-3 py-1.5 pr-10 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            value={newPassword}
                            onChange={onNewPasswordChange}
                            required
                            minLength={8}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            tabIndex={-1}
                        >
                            {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long.</p>
                </div>

                {/* Confirm New Password */}
                <div className="mb-4 w-full">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <div className="relative mt-1">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            className="block w-full px-3 py-2 pr-10 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            value={confirmPassword}
                            onChange={onConfirmPasswordChange}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-between items-center gap-4 w-full">
                    <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={onSubmit}
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </Modal>
    );
}

ResetPasswordModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    oldPassword: PropTypes.string.isRequired,
    newPassword: PropTypes.string.isRequired,
    confirmPassword: PropTypes.string.isRequired,
    onOldPasswordChange: PropTypes.func.isRequired,
    onNewPasswordChange: PropTypes.func.isRequired,
    onConfirmPasswordChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};
