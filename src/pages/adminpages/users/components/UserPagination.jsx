/**
 * UserPagination Component
 * Pagination controls for users table
 */

import PropTypes from 'prop-types';

const UserPagination = ({
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="px-4 py-2 border border-t-0 border-gray-200">
            <div className="flex flex-row justify-between w-full">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 bg-blue-600 rounded-lg text-white font-medium ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                >
                    Previous
                </button>

                <span className="hidden sm:flex items-center text-sm font-bold">
                    Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center">
                        <label htmlFor="itemsPerPage" className="mr-2 font-semibold hidden sm:flex">
                            Rows per Page:
                        </label>
                        <select
                            id="itemsPerPage"
                            className="border border-gray-300 rounded-lg px-2 py-1"
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 bg-blue-600 rounded-lg text-white font-medium ${
                            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

UserPagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onItemsPerPageChange: PropTypes.func.isRequired
};

export default UserPagination;
