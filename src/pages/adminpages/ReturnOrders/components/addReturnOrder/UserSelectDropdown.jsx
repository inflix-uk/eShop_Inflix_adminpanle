import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * UserSelectDropdown Component
 * A searchable dropdown that allows selecting an existing user or entering a new name
 * When a user is selected, their email is auto-filled and userId is captured
 */
const UserSelectDropdown = ({
  users = [],
  isLoading = false,
  selectedUser,
  onSelectUser,
  onManualInput,
  placeholder = "Search or enter customer name..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(user => {
        const fullName = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phoneNumber || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search) || phone.includes(search);
      });
      setFilteredUsers(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredUsers(users.slice(0, 10));
    }
  }, [searchTerm, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);

    // If user is typing manually (not selecting from dropdown)
    if (selectedUser) {
      // Clear the selected user since they're now typing something different
      onManualInput(value);
    } else {
      onManualInput(value);
    }
  };

  // Handle user selection from dropdown
  const handleSelectUser = (user) => {
    const fullName = user.name || '';
    setSearchTerm(fullName);
    setIsOpen(false);
    onSelectUser(user);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Display value in input
  const displayValue = selectedUser
    ? (selectedUser.name || '')
    : searchTerm;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm pr-10"
        />
        {/* Dropdown indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          ) : (
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {/* Selected user indicator */}
        {selectedUser && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <span className="text-blue-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Loading users...
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                Select existing customer or type new name
              </div>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.phoneNumber && (
                      <span className="text-xs text-gray-400">{user.phoneNumber}</span>
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : searchTerm ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">
                No existing users found for &quot;{searchTerm}&quot;
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This will be saved as a new customer name
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Start typing to search users...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

UserSelectDropdown.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
      phoneNumber: PropTypes.string
    })
  ),
  isLoading: PropTypes.bool,
  selectedUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  onSelectUser: PropTypes.func.isRequired,
  onManualInput: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

export default UserSelectDropdown;
