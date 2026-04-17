/**
 * Users Page
 * Main page for viewing and managing users
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Side from '../nav/Side';
import Top from '../nav/Top';
import {
    UserTable,
    UserSearchBar,
    UserPagination,
    UserExportButton
} from './components';
import { getAllUsers } from './services/usersService';
import { getAllRoles } from '../roles/services/rolesService';

const Users = () => {
    const [selectedPage] = useState('users');
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch users and roles on mount
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

            // Fetch users
            const usersResult = await getAllUsers();
            if (usersResult.success) {
                // Map roleId to userType for each user
                const usersWithRoleType = usersResult.data.map(user => {
                    if (user.roleId && rolesResult.data.length > 0) {
                        const matchedRole = rolesResult.data.find(r => r._id === user.roleId);
                        if (matchedRole) {
                            return { ...user, userType: matchedRole.name };
                        }
                    }
                    return user;
                });
                setAllUsers(usersWithRoleType);
            } else {
                toast.error(usersResult.message);
            }

            setIsLoading(false);
        };

        fetchData();
    }, []);

    // Filter users based on search query
    const filteredUsers = allUsers.filter((user) => {
        const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
            fullName.includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.phoneNumber.toLowerCase().includes(query)
        );
    });

    // Update total pages whenever filtered users or items per page changes
    useEffect(() => {
        setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
    }, [filteredUsers, itemsPerPage]);

    // Paginate the filtered users
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <>
            <Helmet>
                <title>Users - Admin</title>
            </Helmet>

            <Side
                selectedPage={selectedPage}
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
            />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="flex justify-start items-start mb-3">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Users
                            </h1>
                        </div>

                        {/* Content */}
                        <div className="relative shadow-lg rounded-lg border border-gray-200">
                            {/* Search and Actions Bar */}
                            <div className="flex flex-col sm:flex-row justify-between items-center w-full border-b border-gray-200 px-2 py-2">
                                <UserSearchBar
                                    searchQuery={searchQuery}
                                    onSearchChange={handleSearchChange}
                                />

                                <div className="p-4 w-full flex justify-end items-center gap-4">
                                    <p className="text-base font-bold flex">
                                        Total Users: {filteredUsers.length}
                                    </p>
                                    <UserExportButton users={filteredUsers} />
                                </div>
                            </div>

                            {/* Table */}
                            <UserTable users={paginatedUsers} isLoading={isLoading} />

                            {/* Pagination */}
                            <UserPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Users;
