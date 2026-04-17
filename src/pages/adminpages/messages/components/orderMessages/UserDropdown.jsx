import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';

/**
 * UserDropdown Component
 * Dropdown for selecting a user to message
 */
const UserDropdown = ({
  users,
  selectedUserId,
  selectedUser,
  isOpen,
  onToggle,
  searchTerm,
  onSearchChange,
  onSelectUser
}) => {
  const filteredUsers = users.filter(
    (user) =>
      user.id !== '66cdf5f6dec61c826428d298' &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayName = selectedUserId
    ? users.find((u) => u.id === selectedUserId)?.name ||
      selectedUser?.name ||
      'Select a user'
    : 'Select a user';

  return (
    <div className="relative w-64">
      {/* Dropdown Toggle */}
      <div
        className="border border-gray-300 rounded-lg p-3 flex items-center justify-between cursor-pointer bg-white shadow-sm hover:shadow-md transition"
        onClick={onToggle}
      >
        <span className="text-gray-700 font-medium">{displayName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={onSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            <div className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center transition"
                    onClick={() => onSelectUser(user.id)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No users available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserDropdown.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedUserId: PropTypes.string,
  selectedUser: PropTypes.shape({
    name: PropTypes.string
  }),
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired
};

export default UserDropdown;
