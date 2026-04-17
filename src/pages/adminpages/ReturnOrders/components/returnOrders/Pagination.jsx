import PropTypes from 'prop-types';

const Pagination = ({
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    return (
        <div className="flex flex-row justify-between px-4 py-2">
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
                    <label htmlFor="itemsPerPage" className="mr-2 font-semibold hidden sm:flex">
                        Rows per page:
                    </label>
                    <select
                        id="itemsPerPage"
                        className="border border-gray-300 rounded-lg px-2 py-1"
                        value={itemsPerPage}
                        onChange={onItemsPerPageChange}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
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