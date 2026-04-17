import PropTypes from 'prop-types';

const SearchBar = ({ searchQuery, setSearchQuery, filteredCount }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center w-full border-b border-gray-200 px-2 py-2">
            <div className="p-0 sm:p-3 bg-white sm:rounded-lg sm:rounded-b-none w-full">
                <label htmlFor="table-search" className="sr-only">Search</label>
                <div className="relative mt-1 w-full">
                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="table-search"
                        className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full sm:w-80 bg-gray-50 focus:ring-primary focus:border-primary"
                        placeholder="Search for Return Orders"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-4 w-full flex justify-end">
                <p className="text-base font-bold flex">Total Return Orders: {filteredCount}</p>
            </div>
        </div>
    );
};

SearchBar.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    filteredCount: PropTypes.number.isRequired
};

export default SearchBar;