import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    let pages = [];
    const MAX_VISIBLE_PAGES = 5; // Maximum number of page buttons to show
    
    if (totalPages <= MAX_VISIBLE_PAGES) {
      // If we have fewer pages than the max we want to show, just show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, MAX_VISIBLE_PAGES - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - MAX_VISIBLE_PAGES + 2);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
      <div className="inline-flex mt-2 xs:mt-0">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-l disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
            className={`text-sm font-semibold py-2 px-4 ${
              currentPage === page
                ? 'bg-primary text-white hover:bg-primary/90'
                : page === '...'
                ? 'bg-gray-200 text-gray-600 cursor-default'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-r disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired
};

export default Pagination;
