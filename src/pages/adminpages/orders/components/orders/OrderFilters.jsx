import PropTypes from "prop-types";

// Predefined status options
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const OrderFilters = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  totalOrders,
  currentPageCount,
  isLoading,
  onSearch,
  onClearFilters,
}) => {
  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== "" || filter !== "all";

  return (
    <div className="flex flex-wrap flex-col sm:flex-row justify-between items-center w-full border-b border-gray-200 px-2 py-2">
      {/* Left side - Search Input and Filter */}
      <div className="p-0 sm:p-3 bg-white sm:rounded-lg sm:rounded-b-none w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:items-center">
        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        {/* Search Input */}
        <div className="relative mt-1 w-full sm:w-auto">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            )}
          </div>
          <input
            type="text"
            id="table-search"
            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full sm:w-72 bg-gray-50 focus:ring-primary focus:border-primary"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="mt-2 sm:mt-0 w-full sm:w-48">
          <select
            className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={isLoading}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            disabled={isLoading}
            className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Right side - Order Count and Search Button */}
      <div className="p-3 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="font-medium">
            Showing: <span className="text-primary font-semibold">{currentPageCount}</span>
          </span>
          <span className="text-gray-400">|</span>
          <span className="font-bold">
            Total: <span className="text-primary">{totalOrders.toLocaleString()}</span>
          </span>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </>
          )}
        </button>
      </div>
    </div>
  );
};

OrderFilters.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
  totalOrders: PropTypes.number.isRequired,
  currentPageCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default OrderFilters;
