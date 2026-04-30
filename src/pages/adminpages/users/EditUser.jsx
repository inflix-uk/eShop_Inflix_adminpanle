/**
 * EditUser Page
 * Edit user details on a dedicated page
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Side from '../nav/Side';
import Top from '../nav/Top';
import { getUserById, updateUser, buildUserUpdatePayload, resetUserPassword, assignPricingGroupToUser } from './services/usersService';
import { getAllRoles } from '../roles/services/rolesService';
import { fetchPricingGroups } from '../pricing-groups/api/groupsApi';

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [selectedPage] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userData, setUserData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [pricingGroups, setPricingGroups] = useState([]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch user and roles on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Fetch roles first
            const rolesResult = await getAllRoles();
            if (!rolesResult.success) {
                toast.error(rolesResult.message);
                setIsLoading(false);
                return;
            }
            setRoles(rolesResult.data);

            try {
                const groups = await fetchPricingGroups(import.meta.env.VITE_BACKEND_URL);
                setPricingGroups(groups);
            } catch {
                setPricingGroups([]);
            }

            // Fetch user
            const userResult = await getUserById(userId);
            if (userResult.success) {
                const user = userResult.data;

                // If user has roleId, find the corresponding role name
                if (user.roleId && rolesResult.data.length > 0) {
                    const matchedRole = rolesResult.data.find(r => r._id === user.roleId);
                    if (matchedRole) {
                        user.userType = matchedRole.name;
                    }
                }

                setUserData(user);
            } else {
                toast.error(userResult.message);
                navigate('/admin/users');
                return;
            }

            setIsLoading(false);
        };

        fetchData();
    }, [userId, navigate]);

    const handleInputChange = (field, value) => {
        setUserData(prev => {
            if (field === 'role' && value !== 'admin') {
                // When role is not admin, clear userType
                return {
                    ...prev,
                    role: value,
                    userType: ''
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleAddressChange = (field, value) => {
        setUserData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        const payload = buildUserUpdatePayload(userData, roles);
        const result = await updateUser(userId, payload);

        if (result.success) {
            const assignResult = await assignPricingGroupToUser(
                userId,
                userData.pricingGroup || null
            );
            if (!assignResult.success) {
                toast.error(assignResult.message);
                setIsSaving(false);
                return;
            }
            toast.success(result.message);
            navigate('/admin/users');
        } else {
            toast.error(result.message);
        }

        setIsSaving(false);
    };

    const handleCancel = () => {
        navigate('/admin/users');
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in both password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsResettingPassword(true);

        const result = await resetUserPassword(userId, newPassword, confirmPassword);

        if (result.success) {
            toast.success(result.message);
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast.error(result.message);
        }

        setIsResettingPassword(false);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Edit User - Admin</title>
            </Helmet>

            <Side
                selectedPage={selectedPage}
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
            />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center mb-2">
                                <button
                                    onClick={handleCancel}
                                    className="mr-4 text-gray-600 hover:text-gray-900"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                        />
                                    </svg>
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                    Edit User Details
                                </h1>
                            </div>
                            <p className="text-sm text-gray-600">
                                Update user information and permissions
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Personal Information */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.firstname || ''}
                                                onChange={(e) => handleInputChange('firstname', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.lastname || ''}
                                                onChange={(e) => handleInputChange('lastname', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.email || ''}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.phoneNumber || ''}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.dateofbirth || ''}
                                                onChange={(e) => handleInputChange('dateofbirth', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.companyname || ''}
                                                onChange={(e) => handleInputChange('companyname', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Address Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.address || ''}
                                                onChange={(e) => handleAddressChange('address', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Apartment
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.apartment || ''}
                                                onChange={(e) => handleAddressChange('apartment', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.city || ''}
                                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.country || ''}
                                                onChange={(e) => handleAddressChange('country', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.postalCode || ''}
                                                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role & Permissions */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Role & Permissions
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.role || ''}
                                                onChange={(e) => handleInputChange('role', e.target.value)}
                                            >
                                                <option value="">Select Role</option>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                User Type
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                value={userData.userType || ''}
                                                onChange={(e) => handleInputChange('userType', e.target.value)}
                                                disabled={userData.role !== 'admin'}
                                            >
                                                <option value="">Select User Type</option>
                                                {roles.map((role) => (
                                                    <option key={role._id} value={role.name}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {userData.role !== 'admin' && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Select &rdquo;Admin&rdquo; role to enable User Type
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pricing Group
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.pricingGroup || ''}
                                                onChange={(e) => handleInputChange('pricingGroup', e.target.value)}
                                            >
                                                <option value="">No Group</option>
                                                {pricingGroups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Reset Section */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Reset Password
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                >
                                                    {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={handleResetPassword}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isResettingPassword || !newPassword || !confirmPassword}
                                            >
                                                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Password must be at least 6 characters long
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default EditUser;
