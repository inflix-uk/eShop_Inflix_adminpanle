/**
 * Profile Service
 * Handles all API calls related to user profile and password management
 */

import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Update user profile information
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Response object
 */
export const updateUserProfile = async (userId, profileData) => {
    try {
        const response = await axios.patch(`${BACKEND_URL}update/user/${userId}`, {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phoneNumber: profileData.phone,
            companyname: profileData.companyName,
            dateofbirth: profileData.dateofBirth,
            address: {
                address: profileData.address,
                apartment: profileData.apartment,
                country: profileData.country,
                city: profileData.city,
                county: profileData.county,
                postalCode: profileData.postalCode,
            }
        });

        return {
            success: response.data.status === 201,
            message: response.data.message,
            data: response.data
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error updating profile',
            data: null
        };
    }
};

/**
 * Update user password (for logged-in users)
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response object
 */
export const updateUserPassword = async (userId, oldPassword, newPassword) => {
    try {
        const response = await axios.patch(`${BACKEND_URL}changepassword/${userId}`, {
            oldPassword,
            newPassword,
        });

        return {
            success: response.data.status === 201,
            message: response.data.message,
            data: response.data
        };
    } catch (error) {
        console.error('Error updating password:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Error updating password',
            data: null
        };
    }
};

/**
 * Send password reset email (Forgot Password flow)
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response object
 */
export const sendPasswordResetEmail = async (email) => {
    try {
        const response = await axios.post(`${BACKEND_URL}forgotpassword`, {
            email: email,
        });

        return {
            success: response.data.status === 201,
            message: response.data.message,
            data: response.data
        };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send reset email',
            data: null
        };
    }
};

/**
 * Reset password using token from email (Forgot Password flow)
 * @param {string} token - Password reset token from URL
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response object
 */
export const resetPasswordWithToken = async (token, newPassword) => {
    try {
        const response = await axios.post(`${BACKEND_URL}resetpassword`, {
            token: token,
            newPassword: newPassword,
        });

        return {
            success: response.data.status === 201,
            message: response.data.message,
            data: response.data
        };
    } catch (error) {
        console.error('Error resetting password:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to reset password',
            data: null
        };
    }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return {
            isValid: false,
            message: 'Email is required'
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            message: 'Please enter a valid email address'
        };
    }

    return {
        isValid: true,
        message: ''
    };
};

/**
 * Validate password match
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm password
 * @returns {Object} Validation result
 */
export const validatePasswordMatch = (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
        return {
            isValid: false,
            message: 'New password and confirm password do not match.'
        };
    }
    return {
        isValid: true,
        message: ''
    };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePasswordStrength = (password) => {
    if (!password || password.length === 0) {
        return {
            isValid: false,
            message: 'Password is required'
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long.'
        };
    }

    // Optional: Add more complex validation
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /[0-9]/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        isValid: true,
        message: ''
    };
};

/**
 * Validate required fields for profile update
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} Validation result
 */
export const validateProfileData = (profileData) => {
    const { firstName, lastName, email, phone } = profileData;

    if (!firstName || firstName.trim() === '') {
        return {
            isValid: false,
            message: 'First name is required'
        };
    }

    if (!lastName || lastName.trim() === '') {
        return {
            isValid: false,
            message: 'Last name is required'
        };
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }

    if (phone && phone.trim() !== '') {
        // Basic phone validation (adjust based on your requirements)
        const phoneRegex = /^[\d\s\-+()]+$/;
        if (!phoneRegex.test(phone)) {
            return {
                isValid: false,
                message: 'Please enter a valid phone number'
            };
        }
    }

    return {
        isValid: true,
        message: ''
    };
};
