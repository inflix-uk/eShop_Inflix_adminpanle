/**
 * UserTable Component
 * Displays users in a table format with edit actions
 */

import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const UserTable = ({ users, isLoading = false }) => {
    const navigate = useNavigate();

    const handleEditUser = (userId) => {
        navigate(`/admin/users/edit/${userId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-black uppercase border-b border-gray-200">
                    <tr>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            User Name
                        </th>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            Contact No
                        </th>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            Role
                        </th>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            Role Type
                        </th>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            Registered Date
                        </th>
                        <th scope="col" className="px-6 py-4 max-w-60 font-bold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr
                                className="bg-white border-b hover:bg-gray-300 cursor-pointer hover:text-gray-700"
                                key={user._id}
                            >
                                <td className="px-6 py-4 max-w-60 flex gap-1">
                                    {user.firstname} {user.lastname}
                                </td>
                                <td className="px-6 py-4 max-w-60">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 max-w-60">
                                    {user.phoneNumber}
                                </td>
                                <td className="px-6 py-4 max-w-60">
                                    {user.role}
                                </td>
                                <td className="px-6 py-4 max-w-60">
                                    {user.userType || '-'}
                                </td>
                                <td className="px-6 py-4 max-w-60">
                                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 max-w-60">
                                    <button
                                        onClick={() => handleEditUser(user._id)}
                                        className="text-primary hover:text-blue-900"
                                        title="Edit User"
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
                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                            />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-4 text-center">
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

UserTable.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            firstname: PropTypes.string,
            lastname: PropTypes.string,
            email: PropTypes.string.isRequired,
            phoneNumber: PropTypes.string,
            role: PropTypes.string,
            userType: PropTypes.string,
            createdAt: PropTypes.string
        })
    ).isRequired,
    isLoading: PropTypes.bool
};

export default UserTable;
