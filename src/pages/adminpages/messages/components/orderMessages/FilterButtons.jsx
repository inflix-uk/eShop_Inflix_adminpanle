import PropTypes from 'prop-types';

/**
 * FilterButtons Component
 * Displays filter buttons for All, Read, and Unread messages
 */
const FilterButtons = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'read', label: 'Read' },
    { value: 'unread', label: 'Unread' }
  ];

  return (
    <div className="p-2 sm:p-3 border-b border-gray-300 bg-gray-50">
      <div className="flex gap-1.5 sm:gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors
              ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

FilterButtons.propTypes = {
  activeFilter: PropTypes.oneOf(['all', 'read', 'unread']).isRequired,
  onFilterChange: PropTypes.func.isRequired
};

export default FilterButtons;
