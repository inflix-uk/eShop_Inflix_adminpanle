import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';

/**
 * UserSearchInput Component
 * Search input for filtering users
 */
const UserSearchInput = ({ value, onChange, placeholder = 'Search users...' }) => {
  return (
    <div className="p-2 sm:p-3 md:p-4 border-b border-gray-300">
      <div className="relative">
        <FiSearch className="absolute left-2 sm:left-3 top-2.5 sm:top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-full text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

UserSearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

export default UserSearchInput;
