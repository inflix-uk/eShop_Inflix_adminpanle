import Side from "../nav/Side";
import Top from "../nav/Top";
import { React, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import { Helmet } from "react-helmet-async";
const Subscribers = () => {
  const [selectedPage, setSelectedPage] = useState("subscribers");
  const [allSubscribers, setAllSubscribers] = useState([]); // Initialize as an empty array
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  const auth = useAuth();

  // Fetch Subscribers and sort by most recent
  const getSubscribers = () => {
    axios.get(`${auth.ip}get/newsletters`)
      .then((response) => {
        if (response.status === 200) {
          const sortedSubscribers = response.data.subscribers.sort((a, b) => {
            return new Date(b.subscribedAt) - new Date(a.subscribedAt); // Sort in descending order
          });
          setAllSubscribers(sortedSubscribers);
          console.log('Subscribers', sortedSubscribers);
          setTotalPages(Math.ceil(sortedSubscribers.length / itemsPerPage));
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch subscribers: " + error.message);
      });
  };

  useEffect(() => {
    getSubscribers();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter Subscribers based on search query
  const filteredSubscribers = allSubscribers.filter((user) => {
    const fullName = user.fullName ? user.fullName.toLowerCase() : ''; // handle null fullName
    const email = user.email ? user.email.toLowerCase() : '';
    const mode = user.mode ? user.mode.toLowerCase() : '';
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) ||
      email.includes(query) ||
      mode.includes(query)
    );
  });

  // Update the total pages whenever the number of items per page or filtered products changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredSubscribers.length / itemsPerPage));
  }, [filteredSubscribers, itemsPerPage]);

  // Paginate the filtered subscribers
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler for changing the page
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handler for changing the items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  return (
    <>
      <Helmet>
        <title>Subscribers</title>
      </Helmet>
      <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start items-start mb-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Newsletter Subscribers</h1>
            </div>
            <div className="relative shadow-lg rounded-lg border border-gray-200">
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
                      placeholder="Search for Subscribers"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
                    />
                  </div>
                </div>
                <div className="p-4 w-full flex justify-end items-center gap-4">
                  <p className="text-base font-bold flex">Total Subscribers: {filteredSubscribers.length}</p>
                  <CSVLink
                    data={filteredSubscribers}
                    filename={`subscribers_${new Date().toISOString().slice(0,10)}.csv`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    target="_blank"
                  >
                    Export to CSV
                  </CSVLink>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-black uppercase border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 max-w-60 font-bold">Full Name</th>
                      <th scope="col" className="px-6 py-4 max-w-60 font-bold">Email</th>
                      <th scope="col" className="px-6 py-4 max-w-60 font-bold">Mode</th>
                      <th scope="col" className="px-6 py-4 max-w-60 font-bold">Subscribe At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubscribers.length > 0 ? (
                      paginatedSubscribers.map((subscriber) => (
                        <tr className="bg-white border-b hover:bg-gray-300 cursor-pointer hover:text-gray-700" key={subscriber._id}>
                          <td className="px-6 py-4 max-w-60 flex gap-1">
                            {subscriber.fullName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 max-w-60">
                            {subscriber.email}
                          </td>
                          <td className="px-6 py-4 max-w-60">
                            {subscriber.mode}
                          </td>
                          <td className="px-6 py-4 max-w-60">
                            {formatDate(subscriber.subscribedAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center">
                          No Subscribers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border border-t-0 border-gray-200">
                <div className="flex flex-row justify-between w-full">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium"
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
                      className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium "
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Subscribers;
