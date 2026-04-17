/**
 * Users Service
 * Handles all API calls related to user management
 */

import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Fetch all users from the API
 * @returns {Promise<Object>} Response containing users array
 */
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}get/all/users`);

        if (response.status === 200) {
            // Sort users by creation date in descending order (latest first)
            const sortedUsers = response.data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            return {
                success: true,
                data: sortedUsers,
                message: 'Users fetched successfully'
            };
        }

        return {
            success: false,
            data: [],
            message: response.data.message || 'Failed to fetch users'
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || error.message || 'Failed to fetch users'
        };
    }
};

/**
 * Fetch a single user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response containing user data
 */
export const getUserById = async (userId) => {
    try {
        const response = await axios.get(`${BACKEND_URL}get/user/${userId}`);

        if (response.status === 200 && response.data.user) {
            const user = response.data.user;

            // Format dateofbirth if it exists
            if (user.dateofbirth) {
                user.dateofbirth = new Date(user.dateofbirth).toISOString().split('T')[0];
            }

            return {
                success: true,
                data: user,
                message: 'User fetched successfully'
            };
        }

        return {
            success: false,
            data: null,
            message: 'Failed to load user details'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Error fetching user details'
        };
    }
};

/**
 * Update user details
 * @param {string} userId - User ID
 * @param {Object} userDetails - Updated user data
 * @returns {Promise<Object>} Response
 */
export const updateUser = async (userId, userDetails) => {
    try {
        const response = await axios.patch(`${BACKEND_URL}update/user/${userId}`, userDetails);

        if (response.status === 200) {
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'User details updated successfully'
            };
        }

        return {
            success: false,
            data: null,
            message: 'Failed to update user details'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Error updating user details'
        };
    }
};

/**
 * Build update payload for user
 * Determines the correct role ID based on role and userType selection
 * Only allows userType when role is "admin", otherwise sets roleId to null
 * @param {Object} userData - User data with role/userType
 * @param {Array} roles - Available roles
 * @returns {Object} Payload ready for API
 */
export const buildUserUpdatePayload = (userData, roles) => {
    let selectedRoleId = null;

    // Only process userType if role is "admin"
    if (userData.role === 'admin' && userData.userType) {
        // If role is admin and User Type is selected, use the userType role ID
        const selectedUserTypeObject = roles.find((role) => role.name === userData.userType);
        selectedRoleId = selectedUserTypeObject?._id || null;
    } else if (userData.role && userData.role !== 'admin') {
        // If role is set but not admin (e.g., "user"), find its role ID
        const selectedRoleObject = roles.find((role) => role.name === userData.role);
        selectedRoleId = selectedRoleObject?._id || null;
    }

    // Prepare the payload with the role ID and other user details
    return {
        ...userData,
        roleId: selectedRoleId
    };
};

/**
 * Reset user password (Admin side)
 * @param {string} userId - User ID
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm password
 * @returns {Promise<Object>} Response
 */
export const resetUserPassword = async (userId, newPassword, confirmPassword) => {
    try {
        const response = await axios.patch(`${BACKEND_URL}admin/reset-password/${userId}`, {
            newPassword,
            confirmPassword
        });

        if (response.status === 200) {
            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Password reset successfully'
            };
        }

        return {
            success: false,
            data: null,
            message: 'Failed to reset password'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.error || error.message || 'Error resetting password'
        };
    }
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    buildUserUpdatePayload,
    resetUserPassword
};
