/**
 * ManageRoles Page
 * CRUD operations for role management
 */

import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Helmet } from "react-helmet-async";
import { toast } from 'react-toastify';
import Side from "../nav/Side";
import Top from "../nav/Top";
import { RoleModal, RoleTable } from './components';
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole } from './services/rolesService';

const ManageRoles = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedPage] = useState("roles");
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState({ name: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all roles
    const fetchRoles = async () => {
        setIsLoading(true);
        const result = await getAllRoles();

        if (result.success) {
            setRoles(result.data);
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Sidebar handlers
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Modal handlers
    const openModal = async (role = { name: '', description: '' }) => {
        if (role._id) {
            const result = await getRoleById(role._id);

            if (result.success) {
                setCurrentRole(result.data);
            } else {
                toast.error(result.message);
                return;
            }
        } else {
            setCurrentRole({ name: '', description: '' });
        }

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentRole({ name: '', description: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentRole({ ...currentRole, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let result;
        if (currentRole._id) {
            // Update existing role
            result = await updateRole(currentRole._id, currentRole);
        } else {
            // Create new role
            result = await createRole(currentRole);
        }

        if (result.success) {
            toast.success(result.message);
            fetchRoles();
            closeModal();
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    };

    const handleDelete = async (roleId) => {
        if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        const result = await deleteRole(roleId);

        if (result.success) {
            toast.success(result.message);
            fetchRoles();
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Manage Roles - Admin</title>
            </Helmet>

            <Side selectedPage={selectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                    Manage Roles
                                </h1>
                                <p className="mt-2 text-sm text-gray-700">
                                    Create and manage user roles for your system
                                </p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaPlus className="mr-2" /> Create Role
                            </button>
                        </div>

                        {/* Roles Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <RoleTable
                                roles={roles}
                                onEdit={openModal}
                                onDelete={handleDelete}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Role Modal */}
            <RoleModal
                isOpen={isModalOpen}
                role={currentRole}
                onClose={closeModal}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </>
    );
};

export default ManageRoles;
