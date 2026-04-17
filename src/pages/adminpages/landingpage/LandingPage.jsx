/**
 * Landing Page
 * First page shown after successful login
 * Displays sidebar with permissions and user info on the right
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../../context/Auth';
import Side from '../nav/Side';
import Top from '../nav/Top';
import { FaUser, FaEnvelope, FaUserShield, FaKey } from 'react-icons/fa';

const LandingPage = () => {
    const auth = useAuth();
    const [selectedPage, setSelectedPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <>
            <Helmet>
                <title>Welcome - Admin</title>
            </Helmet>

            <Side
                selectedPage={selectedPage}
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
                toggleSidebar={toggleSidebar}
            />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                    selectedPage={selectedPage}
                    setSelectedPage={setSelectedPage}
                />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Welcome Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {auth.user?.firstname}! 👋
                            </h1>
                            <p className="mt-2 text-gray-600">
                                You're logged in to the Admin Panel
                            </p>
                        </div>

                        {/* User Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Your Profile Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <FaUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                                            <p className="text-base text-gray-900">
                                                {auth.user?.firstname} {auth.user?.lastname}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                            <p className="text-base text-gray-900">{auth.user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <FaUserShield className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">User Type & Role</p>
                                            <p className="text-base text-gray-900">
                                                {auth.user?.userType && (
                                                    <span className="font-semibold text-blue-700">
                                                        {auth.user.userType}
                                                    </span>
                                                )}
                                                {auth.user?.userType && auth.user?.role && (
                                                    <span className="mx-2 text-gray-400">•</span>
                                                )}
                                                {auth.user?.role && (
                                                    <span className="capitalize text-gray-700">
                                                        {auth.user.role}
                                                    </span>
                                                )}
                                                {!auth.user?.userType && !auth.user?.role && 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Summary */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Your Permissions
                                    </h3>
                                    <div className="space-y-3">
                                        {auth.user?.permissions?.zextons && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    🛒 Access:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(auth.user.permissions.zextons)
                                                        .filter(([_, value]) => value === true)
                                                        .map(([key]) => (
                                                            <span
                                                                key={key}
                                                                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                                                            >
                                                                {key.replace(/_/g, ' ')}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {!auth.user?.permissions && (
                                            <p className="text-sm text-gray-500 italic">
                                                No specific permissions assigned
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Getting Started
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Use the sidebar on the left to navigate to different sections based on your permissions.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => window.location.href = '/admin/profile'}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    View Profile
                                </button>
                                {auth.user?.permissions?.zextons?.view_dashboard && (
                                    <button
                                        onClick={() => window.location.href = '/admin/dashboard'}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Go to Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default LandingPage;
