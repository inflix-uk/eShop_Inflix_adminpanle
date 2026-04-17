import { useState } from 'react';
import { toast } from 'react-toastify';
import {
    updateUserProfile,
    updateUserPassword,
    validatePasswordMatch,
    validatePasswordStrength
} from '../services/profileService';

/**
 * useProfile Custom Hook
 * Manages all profile page state and logic
 *
 * @param {Object} user - Current user object from auth context
 * @returns {Object} Profile state and handlers
 */
export const useProfile = (user) => {
    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        firstName: user?.firstname || '',
        lastName: user?.lastname || '',
        companyName: user?.companyname || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        address: user?.address?.address || '',
        apartment: user?.address?.apartment || '',
        city: user?.address?.city || '',
        country: user?.address?.country || '',
        state: user?.address?.state || '',
        county: user?.address?.county || '',
        postalCode: user?.address?.postalCode || '',
    });

    const [dateofBirth, setDateOfBirth] = useState(user?.dateofbirth || '');

    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Save original form data for cancel functionality
    const [originalFormData] = useState(formData);

    /**
     * Toggle edit mode
     */
    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
        // If canceling edit, reset to original values
        if (isEditMode) {
            setFormData(originalFormData);
        }
    };

    /**
     * Handle form input changes
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /**
     * Handle date of birth change
     */
    const handleDateChange = (e) => {
        setDateOfBirth(e.target.value);
    };

    /**
     * Handle password field changes
     */
    const handlePasswordChange = (field) => (e) => {
        const value = e.target.value;
        switch (field) {
            case 'old':
                setOldPassword(value);
                break;
            case 'new':
                setNewPassword(value);
                break;
            case 'confirm':
                setConfirmPassword(value);
                break;
            default:
                break;
        }
    };

    /**
     * Open/Close reset password modal
     */
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        // Reset password fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    /**
     * Save updated user profile
     */
    const saveProfile = async () => {
        try {
            const response = await updateUserProfile(user._id, {
                ...formData,
                dateofBirth
            });

            if (response.success) {
                toast.success(response.message);
                setIsEditMode(false);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Error updating profile');
        }
    };

    /**
     * Reset user password
     */
    const resetPassword = async () => {
        // Validate password match
        const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
        if (!matchValidation.isValid) {
            toast.error(matchValidation.message);
            return;
        }

        // Validate password strength
        const strengthValidation = validatePasswordStrength(newPassword);
        if (!strengthValidation.isValid) {
            toast.error(strengthValidation.message);
            return;
        }

        try {
            const response = await updateUserPassword(user._id, oldPassword, newPassword);

            if (response.success) {
                toast.success(response.message);
                closeModal();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Error updating password');
        }
    };

    return {
        // State
        isEditMode,
        isModalOpen,
        formData,
        dateofBirth,
        oldPassword,
        newPassword,
        confirmPassword,

        // Handlers
        toggleEditMode,
        handleInputChange,
        handleDateChange,
        handlePasswordChange,
        openModal,
        closeModal,
        saveProfile,
        resetPassword,
    };
};
