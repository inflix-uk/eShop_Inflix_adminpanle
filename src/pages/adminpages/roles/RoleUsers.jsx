/**
 * RoleUsers Page
 * Display all users belonging to a specific role
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUsers, FaEdit, FaTimes } from 'react-icons/fa';
import Side from "../nav/Side";
import Top from "../nav/Top";
import { getUsersByRole, getAllRoles } from './services/rolesService';
import { updateUser, buildUserUpdatePayload } from '../users/services/usersService';

const RoleUsers = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedPage] = useState("roles");
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch users by role
    const fetchUsers = async () => {
        setIsLoading(true);
        const result = await getUsersByRole(roleId);

        if (result.success) {
            setUsers(result.data);
            setRole(result.role);
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsers();

            // Fetch all roles for the dropdown
            const rolesResult = await getAllRoles();
            if (rolesResult.success) {
                setRoles(rolesResult.data);
            }
        };

        fetchData();
        // eslint-disable-next-line
    }, [roleId]);

    // Sidebar handlers
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Modal handlers
    const openEditModal = (user) => {
        // Map roleId to role name for display
        if (user.roleId && roles.length > 0) {
            const matchedRole = roles.find(r => r._id === user.roleId);
            if (matchedRole) {
                user.userType = matchedRole.name;
            }
        }
        setSelectedUser({ ...user });
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleRoleChange = (field, value) => {
        setSelectedUser(prev => {
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

    const handleSaveRole = async () => {
        if (!selectedUser) return;

        setIsSaving(true);

        const payload = buildUserUpdatePayload(selectedUser, roles);
        const result = await updateUser(selectedUser._id, payload);

        if (result.success) {
            toast.success('User role updated successfully');
            closeEditModal();
            // Refresh the users list
            await fetchUsers();
        } else {
            toast.error(result.message);
        }

        setIsSaving(false);
    };

    return (
        <>
            <Helmet>
                <title>{role ? `${role.name} Users` : 'Role Users'} - Admin</title>
            </Helmet>

            <Side selectedPage={selectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/admin/roles')}
                                className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                            >
                                <FaArrowLeft className="mr-2" /> Back to Roles
                            </button>

                            {role && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                                {role.name}
                                            </h1>
                                            {role.description && (
                                                <p className="mt-2 text-sm text-gray-700">
                                                    {role.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                                            <FaUsers className="mr-2" />
                                            <span className="font-semibold">{users.length} Users</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">No users found with this role.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Email
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Phone Number
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstname} {user.lastname}
                                                        </div>
                                                        {user.companyname && (
                                                            <div className="text-sm text-gray-500">
                                                                {user.companyname}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {user.phoneNumber || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            user.isdeleted
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {user.isdeleted ? 'Deleted' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="Edit Role"
                                                        >
                                                            <FaEdit className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Role Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={closeEditModal}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Modal Header */}
                            <div className="bg-white px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Edit User Role
                                    </h3>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <FaTimes className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                    {selectedUser.firstname} {selectedUser.lastname}
                                </p>
                            </div>

                            {/* Modal Body */}
                            <div className="bg-white px-6 py-4">
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                                        Role & Permissions
                                    </h4>
                                    <div className="space-y-4">
                                        {/* Role Dropdown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={selectedUser.role || ''}
                                                onChange={(e) => handleRoleChange('role', e.target.value)}
                                            >
                                                <option value="">Select Role</option>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        {/* User Type Dropdown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                User Type
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                value={selectedUser.userType || ''}
                                                onChange={(e) => handleRoleChange('userType', e.target.value)}
                                                disabled={selectedUser.role !== 'admin'}
                                            >
                                                <option value="">Select User Type</option>
                                                {roles.map((role) => (
                                                    <option key={role._id} value={role.name}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedUser.role !== 'admin' && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Select &rdquo;Admin&rdquo; role to enable User Type
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveRole}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoleUsers;
