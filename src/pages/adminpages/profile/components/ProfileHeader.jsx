import React from 'react';
import PropTypes from 'prop-types';
import { UserIcon } from '@heroicons/react/24/solid';

/**
 * ProfileHeader Component
 * Displays user avatar and action buttons (Edit/Save/Cancel/Reset Password)
 */
export default function ProfileHeader({
    imageUrl,
    isEditMode,
    onEditClick,
    onSaveClick,
    onCancelClick,
    onResetPasswordClick
}) {
    return (
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-3 py-3 sm:px-4 flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200">
                {/* Avatar */}
                <div className="relative">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-2 ring-primary overflow-hidden bg-white">
                        <img 
                            className="h-full w-full object-cover" 
                            src={imageUrl} 
                            alt="User avatar" 
                        />
                    </div>
                    {isEditMode && (
                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-sm font-bold text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                        <UserIcon className="h-4 w-4 text-primary" />
                        Profile Settings
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {isEditMode ? 'Editing your profile' : 'View and manage your account'}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                    {isEditMode ? (
                        <>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                                onClick={onSaveClick}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
                                onClick={onCancelClick}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                            onClick={onEditClick}
                        >
                            Edit
                        </button>
                    )}
                    <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                        onClick={onResetPasswordClick}
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
    );
}

ProfileHeader.propTypes = {
    imageUrl: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    onEditClick: PropTypes.func.isRequired,
    onSaveClick: PropTypes.func.isRequired,
    onCancelClick: PropTypes.func.isRequired,
    onResetPasswordClick: PropTypes.func.isRequired,
};
