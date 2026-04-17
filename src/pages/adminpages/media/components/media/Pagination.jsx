import PropTypes from 'prop-types';

const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  return (
    <div className="flex justify-between px-4 py-2 border border-gray-200 mt-5 rounded-lg">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="hidden sm:flex items-center text-sm font-bold">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center">
          <label
            htmlFor="itemsPerPage"
            className="mr-2 font-semibold hidden sm:flex"
          >
            Rows per page:
          </label>
          <select
            id="itemsPerPage"
            className="border border-gray-300 rounded-lg"
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
            <option value="96">96</option>
          </select>
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired
};

export default Pagination;

