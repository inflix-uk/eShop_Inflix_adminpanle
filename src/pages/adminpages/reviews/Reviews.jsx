import { React, useEffect, useState } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../../context/Auth";
import { Helmet } from "react-helmet-async";
const calculateReviewStats = (reviews) => {
    const totalReviews = reviews.length;
    const approvedReviews = reviews.filter(review => review.status === 'Approved').length;
    const pendingReviews = reviews.filter(review => review.status === 'Pending').length;

    return { totalReviews, approvedReviews, pendingReviews };
};

const Reviews = () => {
    const [selectedPage, setSelectedPage] = useState("reviews");
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
    const auth = useAuth();
    const navigate = useNavigate();
    const getProducts = () => {
        axios.get(`${auth.ip}all/products/and/reviews/details`)
            .then((response) => {
                if (response.data.status === 201) {
                    console.log('Response', response.data.products)
                    setProducts(response.data.products);
                    setTotalPages(Math.ceil(response.data.products.length / itemsPerPage));
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                toast.error("An error occurred while fetching products.");
            });
    };

    useEffect(() => {
        getProducts();
    }, []);

    // Filter products based on the search query
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Update the total pages whenever the number of items per page or filtered products changes
    useEffect(() => {
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    }, [filteredProducts, itemsPerPage]);

    // Paginate the filtered products
    const paginatedProducts = filteredProducts.slice(
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
                <title>Reviews</title>
            </Helmet>
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-start items-start mb-3">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Reviews</h1>
                        </div>
                        <div className="relative shadow-lg rounded-lg border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center w-full border-b border-gray-200 px-2 py-2">
                                <div className="p-0 sm:p-3 bg-white  sm:rounded-lg sm:rounded-b-none w-full">
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
                                            placeholder="Search for Products"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
                                        />
                                    </div>
                                </div>
                                <div className="p-4 w-full flex justify-end">
                                    <p className=" text-base font-bold">Total Products: {filteredProducts.length}</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-black uppercase border-b border-gray-200">
                                        <tr>
                                          
                                            <th scope="col" className="px-6 py-5 max-w-60 font-bold">Product Name</th>
                                            <th scope="col" className="px-6 py-5 max-w-60 font-bold">Total</th>
                                            <th scope="col" className="px-6 py-5 max-w-60 font-bold">Approve</th>
                                            <th scope="col" className="px-6 py-5 max-w-60 font-bold">Pending</th>
                                            <th scope="col" className="px-6 py-5 max-w-60 font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.length > 0 ? (
                                            paginatedProducts.map((product) => {
                                                const { totalReviews, approvedReviews, pendingReviews } = calculateReviewStats(product.reviewDetails);
                                                const productNameSlug = product.producturl;
                                                const handleProductClick = () => {
                                                    navigate(`/products/${productNameSlug}`);
                                                };
                                                return (
                                                    <tr key={product._id} className="border-b border-gray-200">
                                                        <td scope="row" className="px-6 py-3 max-w-60">
                                                            {product.name ? product.name : ""}
                                                        </td>
                                                        <td className="px-6 py-3 max-w-60">
                                                            {totalReviews} Reviews
                                                        </td>
                                                        <td className="px-6 py-3 max-w-60">
                                                            {approvedReviews} Approved
                                                        </td>
                                                        <td className="px-6 py-3 max-w-60">
                                                            {pendingReviews} Pending
                                                        </td>
                                                        <td className="px-6 py-3 max-w-60">
                                                            <Link to={`/admin/reviewdetail/${product._id}`} className="px-3 py-2 text-xs font-medium text-center text-white bg-primary rounded-lg focus:ring-4 focus:outline-none focus:ring-transparent">
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center">
                                                    No products found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between px-4 py-2 border border-t-0 border-gray-200">
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
                                        <label htmlFor="itemsPerPage" className="mr-2 font-semibold hidden sm:flex">Rows per page:</label>
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
                </main>
            </div>
        </>
    );
};

export default Reviews;
