import PropTypes from 'prop-types';

const Pagination = ({
  currentPage,
  totalPages,
  totalOrders = 0,
  handlePageChange,
  itemsPerPage,
  handleItemsPerPageChange
}) => {
  // Calculate range for display
  const startItem = totalOrders === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalOrders);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 gap-3">
      {/* Page info - mobile */}
      <div className="flex sm:hidden text-sm text-gray-600">
        {startItem}-{endItem} of {totalOrders.toLocaleString()}
      </div>

      {/* Left side - Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Previous
      </button>

      {/* Center - Page info */}
      <div className="hidden sm:flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          Showing <span className="font-semibold">{startItem}</span> - <span className="font-semibold">{endItem}</span> of{' '}
          <span className="font-semibold text-primary">{totalOrders.toLocaleString()}</span> orders
        </span>
        <span className="text-gray-400">|</span>
        <span className="font-bold text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Right side - Items per page & Next button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <label htmlFor="itemsPerPage" className="mr-2 font-medium text-sm text-gray-600 hidden sm:block">
            Per page:
          </label>
          <select
            id="itemsPerPage"
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-primary focus:border-primary"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalOrders: PropTypes.number,
  handlePageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired
};

export default Pagination;
