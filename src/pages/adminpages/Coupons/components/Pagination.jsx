import React from "react";
import PropTypes from "prop-types";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  handlePageChange, 
  handleItemsPerPageChange 
}) => {
  return (
    <div className="px-4 py-2 border border-t-0 border-gray-200">
      <div className="flex flex-row justify-between w-full">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
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
            <label htmlFor="itemsPerPage" className="mr-2 font-semibold hidden sm:flex">Rows per Page:</label>
            <select
              id="itemsPerPage"
              className="border border-gray-300 rounded-lg"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handleItemsPerPageChange: PropTypes.func.isRequired
};

// Using React.createElement to ensure React is used
export default React.memo(Pagination);
