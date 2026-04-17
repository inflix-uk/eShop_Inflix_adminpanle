import React, { useEffect, useState, useMemo } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
};

const statusColors = {
    Pending: "bg-yellow-400", // Example color
    Accepted: "bg-blue-600", // Example color
    Rejected: "bg-red-600", // Example color
};
export default function ReturnRequest() {
    const auth = useAuth();
    const [progress, setProgress] = useState(0);
    const [errState, setErrState] = useState(false);
    const [selectedPage, setSelectedPage] = useState("return-requests");
    const [returnRequests, setReturnRequests] = useState([]);
    const [dataFetched, setDataFetched] = useState(false); // Track if data fetching is complete
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100); // Default to 10 items per page
    const [filter, setFilter] = useState("all"); // Default to showing all orders
    const location = useLocation();
    const filterStatusFromState = location.state?.filterStatus;

    useEffect(() => {
        // Check the URL for a status query parameter first.
        const queryParams = new URLSearchParams(location.search);
        const statusFromURL = queryParams.get('status');

        if (statusFromURL) {
            setFilter(statusFromURL.toLowerCase());
        } else if (filterStatusFromState) {
            // If no query parameter, use the navigation state if it exists.
            setFilter(filterStatusFromState.toLowerCase());
        } else {
            setFilter("all");
        }
    }, [location.search, filterStatusFromState]);
    const handleOpenModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };
    const getReturnRequests = async () => {
        setProgress(75);
        try {
            const response = await axios.get(`${BACKEND_URL}getallrequest/orders`);
            console.log("response", response);
            if (response.data.status === 200) {
                // Sort the return requests by createdAt in descending order (most recent first)
                const sortedRequests = response.data.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                setReturnRequests(sortedRequests);
                setTotalPages(Math.ceil(sortedRequests.length / itemsPerPage));
                setErrState(false);
            } else {
                setErrState(true);
            }
            setProgress(100);
            setDataFetched(true);
        } catch (error) {
            console.error("Error fetching initial orders:", error);
            setErrState(true);
            setProgress(100);
            setDataFetched(true);
        }
    };


    useEffect(() => {
        getReturnRequests();
    }, []);
    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);

        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Use 24-hour format
        };

        const formattedDate = date
            .toLocaleString("en-GB", options)
            .replace(",", "");
        return formattedDate;
    };
    // Filter products based on the search query
    const filteredReturnRequests = useMemo(() => {
        const searchLower = searchQuery.toLowerCase().trim();

        return returnRequests.filter((request) => {
            // 1. Check status filter first
            const passesStatusFilter =
                filter === "all" ||
                (request.status || "").toLowerCase() === filter.toLowerCase();

            // 2. Collect any fields you want to match against `searchQuery`
            const fieldsToSearch = [
                // user fields
                request.userId?.firstname,
                request.userId?.lastname,
                request.userId?.email,
                request.userId?.phoneNumber,
                request.userId?.address?.address,
                request.userId?.address?.city,
                request.userId?.address?.postalCode,
                // request-level fields
                request.requestOrderNumber,
                request.notes,
                request.status,
                // order-level fields
                request.orderId?.orderNumber,
                request.orderId?.status,
                request.orderId?.shippingDetails?.firstName,
                request.orderId?.shippingDetails?.lastName,
                request.orderId?.shippingDetails?.phoneNumber,
                request.orderId?.shippingDetails?.address,
                request.orderId?.shippingDetails?.postalCode,
                request.orderId?.shippingDetails?.city,
            ];

            // 3. Gather product names (or any array fields) if needed
            if (request.orderId?.cart?.length) {
                request.orderId.cart.forEach((item) => {
                    if (item?.productName) {
                        fieldsToSearch.push(item.productName);
                    }
                });
            }

            // 4. Check if the search term matches any of these fields
            const matchesSearch =
                // if no search query, we can assume a match or skip the check
                !searchLower ||
                fieldsToSearch.some((field) =>
                    field?.toString().toLowerCase().includes(searchLower)
                );

            // 5. Return true if both status filter and search match
            return passesStatusFilter && matchesSearch;
        });
    }, [returnRequests, searchQuery, filter]);

    // Update the total pages whenever the number of items per page or filtered products changes
    useEffect(() => {
        setCurrentPage(1); // Reset to the first page when filter changes
        setTotalPages(Math.ceil(filteredReturnRequests.length / itemsPerPage));
    }, [filteredReturnRequests, itemsPerPage, filter]); // Add `filter` as a dependency

    // Paginate the filtered products
    const paginatedReturnRequests = filteredReturnRequests.slice(
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
        const newItemsPerPage = parseInt(e.target.value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Correct place to reset to the first page
    };
    useEffect(() => {
        if (dataFetched) {
            if (errState) {
                toast.error("An error occurred while fetching the orders.");
            } else {
                console.log("Orders Retrieved successfully.");
            }
        }
    }, [dataFetched, errState]);
    const handleDelete = (id) => {
        setProgress(50);
        axios.delete(`${auth.ip}delete/request/${id}`).then((response) => {
            console.log("request Deleted", response);
            if (response.data.status === 200) {
                // toast.success(response.data.message);
                setErrState(false);
                setProgress(100);
                getReturnRequests();
            } else {
                toast.error(response.data.message);
                setErrState(true);
                setProgress(100);
            }
        });
    };
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const [editingStatus, setEditingStatus] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const handleStatusChange = (orderId, event) => {
        const newValue = event.target.value;
        setSelectedStatuses((prevState) => ({
            ...prevState,
            [orderId]: newValue,
        }));
    };
    const capitalizeStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };
    const handleSaveStatus = async (orderId) => {
        try {
            const updatedStatus = capitalizeStatus(selectedStatuses[orderId]);
            // Send the capitalized status in the API request
            const response = await axios.patch(
                `${auth.ip}updatestatus/requestorder/${orderId}`,
                { status: updatedStatus }
            );
            console.log("Order status updated:", response);

            if (response.status === 200) {
                // toast.success("Order status updated successfully.");
                // Update the orders state to reflect the new status
                setReturnRequests((prevRequests) =>
                    prevRequests.map((order) =>
                        order._id === orderId ? { ...order, status: updatedStatus } : order
                    )
                );
                // Turn off editing mode
                setEditingStatus((prevState) => ({
                    ...prevState,
                    [orderId]: false,
                }));
                getReturnRequests();
            } else {
                console.error("Failed to update order status:", response.data);
                toast.error("Failed to update order status.");
            }
        } catch (error) {
            console.error("An error occurred while updating order status:", error);
            toast.error("An error occurred while updating the order status.");
        }
    };

    const [stats, setStats] = useState({
        totalRequestOrders: 0,
        TotalPendingRequestOrders: 0,
        TotalAcceptedRequestOrders: 0,
        TotalRejectedRequestOrders: 0,
    });

    const displayStats = [
        { id: 1, name: "Total Returns Requests", value: stats.totalRequestOrders },
        {
            id: 2,
            name: "Pending Returns Requests",
            value: stats.TotalPendingRequestOrders,
        },
        {
            id: 3,
            name: "Accepted Returns Requests",
            value: stats.TotalAcceptedRequestOrders,
        },
        {
            id: 4,
            name: "Rejected Returns Requests",
            value: stats.TotalRejectedRequestOrders,
        },
    ];

    const icons = [
        // Total returns icon
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-blue-500"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
            />
        </svg>,
        // Pending icon
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-blue-500"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>,
        // Accepted icon
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-blue-500"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
        </svg>,
        // Rejected icon
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-blue-500"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>,
    ];
    useEffect(() => {
        axios
            .get(`${auth.ip}get/stats3`)
            .then((response) => {
                console.log(response.data.stats);
                setStats(response.data.stats);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [auth.ip]);

    return (
        <>
            <Helmet>
                <title>Return Requests</title>
            </Helmet>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <Side
                selectedPage={selectedPage}
                setSelectedPage={setSelectedPage}
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
            />
            <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 my-5">
                            {displayStats.map((stat, index) => (
                                <div
                                    key={stat.id}
                                    className={`shadow hover:shadow-2xl py-6 px-7 duration-500 cursor-pointer ${filter === "all" ||
                                        stat.name === "Total Returns Requests" ||
                                        filter === stat.name.toLowerCase().replace(/\s+/g, "")
                                        ? "bg-white"
                                        : "bg-white"
                                        }`}
                                    onClick={() => {
                                        if (stat.name === "Total Returns Requests")
                                            setFilter("all");
                                        if (stat.name === "Pending Returns Requests")
                                            setFilter("pending");
                                        if (stat.name === "Accepted Returns Requests")
                                            setFilter("accepted");
                                        if (stat.name === "Rejected Returns Requests")
                                            setFilter("rejected");
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="inline-flex items-center justify-center p-3 bg-gray-200 rounded-full">
                                            {icons[index]}
                                        </div>
                                        <p className="flex items-center text-lg text-blue-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="size-6 ms-1"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end mt-5">
                                        <div className="flex justify-between items-center w-full">
                                            <p className="text-xl font-semibold lg:ps-4">
                                                {stat.value}
                                            </p>
                                            <p className="text-sm text-gray-500">{stat.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="mt-8">
                                <div className="">
                                    <div className="flex justify-between items-center mb-3">
                                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                            Return Requests
                                        </h1>
                                    </div>
                                    <div className="relative shadow-lg rounded-lg border border-gray-200">
                                        <div className="flex flex-col sm:flex-row justify-between items-center w-full border-b border-gray-200 px-2 py-2">
                                            <div className="p-0 sm:p-3 bg-white sm:rounded-lg sm:rounded-b-none w-full">
                                                <label htmlFor="table-search" className="sr-only">
                                                    Search
                                                </label>
                                                <div className="relative mt-1 w-full">
                                                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
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
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="table-search"
                                                        className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full sm:w-80 bg-gray-50 focus:ring-primary focus:border-primary"
                                                        placeholder="Search for Return Requests"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4 w-full flex justify-end">
                                                <p className="text-base font-bold flex">
                                                    Total Return Requests: {filteredReturnRequests.length}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                <thead className="text-xs text-black font-uppercase border-b border-gray-200 text-center">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            RIM
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Order No
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Date Requested
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Customer Details
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Items
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Order Date
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Reason
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Additional Details
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Status
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white text-center">
                                                    {paginatedReturnRequests.map((request) => {
                                                        const formattedDate = formatDate(request.createdAt);
                                                        const orderDate = formatDate(
                                                            request.orderId.createdAt
                                                        );
                                                        return (
                                                            <React.Fragment key={request._id}>
                                                                <tr className="border-b border-gray-200">
                                                                    <td className="px-6 py-3 max-w-60">
                                                                        <div className="flex items-center">
                                                                            <Link
                                                                                to={`/admin/edit-return-request/${request._id}`}
                                                                                className="text-black hover:underline"
                                                                            >
                                                                                {request.requestOrderNumber}
                                                                            </Link>
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap text-sm px-6 py-3 max-w-60">
                                                                        {request.orderId.orderNumber}
                                                                    </td>
                                                                    <td className="whitespace-nowrap text-sm px-6 py-3 max-w-60">
                                                                        {formattedDate}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium text-gray-900">
                                                                                {request.userId.firstname}{" "}
                                                                                {request.userId.lastname}
                                                                            </span>
                                                                            <span className="text-gray-500">
                                                                                {request.userId.email}
                                                                            </span>
                                                                            <span className="text-gray-500">
                                                                                {request.userId.phoneNumber}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500 ">
                                                                        <div className="flex items-center justify-center">
                                                                            <svg
                                                                                className="text-blue-600 cursor-pointer size-6"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                strokeWidth="1.5"
                                                                                stroke="currentColor"
                                                                                onClick={() =>
                                                                                    handleOpenModal(request._id)
                                                                                }
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                                                />
                                                                            </svg>
                                                                        </div>
                                                                        {isModalOpen &&
                                                                            selectedOrderId === request._id && (
                                                                                <div
                                                                                    id="default-modal"
                                                                                    tabIndex="-1"
                                                                                    aria-hidden="true"
                                                                                    className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto"
                                                                                >
                                                                                    <div className="relative p-4 w-full max-w-4xl max-h-full">
                                                                                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
                                                                                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                                                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                                                    Products Details
                                                                                                </h3>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                                                                                                    onClick={handleCloseModal}
                                                                                                >
                                                                                                    <svg
                                                                                                        className="w-3 h-3"
                                                                                                        aria-hidden="true"
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        fill="none"
                                                                                                        viewBox="0 0 14 14"
                                                                                                    >
                                                                                                        <path
                                                                                                            stroke="currentColor"
                                                                                                            strokeLinecap="round"
                                                                                                            strokeLinejoin="round"
                                                                                                            strokeWidth="2"
                                                                                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                                                                                        />
                                                                                                    </svg>
                                                                                                    <span className="sr-only">
                                                                                                        Close modal
                                                                                                    </span>
                                                                                                </button>
                                                                                            </div>
                                                                                            <div className="p-6">
                                                                                                <table className="table-auto w-full">
                                                                                                    <thead>
                                                                                                        <tr className="border-b border-gray-300">
                                                                                                            <th className="px-4 py-2 text-left">
                                                                                                                Product Name
                                                                                                            </th>
                                                                                                            <th className="px-4 py-2 text-left">
                                                                                                                Variant Details
                                                                                                            </th>
                                                                                                            <th className="px-4 py-2 text-left">
                                                                                                                Price
                                                                                                            </th>
                                                                                                            <th className="px-4 py-2 text-left">
                                                                                                                Quantity
                                                                                                            </th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {selectedOrderId &&
                                                                                                            returnRequests
                                                                                                                .find(
                                                                                                                    (request) =>
                                                                                                                        request._id ===
                                                                                                                        selectedOrderId
                                                                                                                )
                                                                                                                ?.orderId.cart.map(
                                                                                                                    (item, index) => (
                                                                                                                        <tr
                                                                                                                            key={index}
                                                                                                                            className="border-b border-gray-300"
                                                                                                                        >
                                                                                                                            <td className="px-4 py-2 text-left">
                                                                                                                                <div className="font-medium text-gray-900 flex items-center">
                                                                                                                                    <img
                                                                                                                                        src={`${BACKEND_URL}${item?.metaImage?.path}`}
                                                                                                                                        alt={
                                                                                                                                            item.productName
                                                                                                                                        }
                                                                                                                                        className="w-16 h-16 object-cover"
                                                                                                                                    />
                                                                                                                                    <td className="px-4 py-2">
                                                                                                                                        <div className="font-medium text-gray-900">
                                                                                                                                            {
                                                                                                                                                item.productName
                                                                                                                                            }
                                                                                                                                        </div>
                                                                                                                                    </td>
                                                                                                                                </div>
                                                                                                                            </td>
                                                                                                                            <td className="px-4 py-2 text-left">
                                                                                                                                <div className="text-sm text-gray-500">
                                                                                                                                    <strong>
                                                                                                                                        Condition:
                                                                                                                                    </strong>{" "}
                                                                                                                                    {
                                                                                                                                        item.name.split(
                                                                                                                                            "-"
                                                                                                                                        )[0]
                                                                                                                                    }
                                                                                                                                </div>
                                                                                                                                <div className="text-sm text-gray-500">
                                                                                                                                    <strong>
                                                                                                                                        Color:
                                                                                                                                    </strong>{" "}
                                                                                                                                    {
                                                                                                                                        item.name.split(
                                                                                                                                            "-"
                                                                                                                                        )[1]
                                                                                                                                    }
                                                                                                                                </div>
                                                                                                                                <div className="text-sm text-gray-500">
                                                                                                                                    <strong>
                                                                                                                                        Storage:
                                                                                                                                    </strong>{" "}
                                                                                                                                    {
                                                                                                                                        item.name.split(
                                                                                                                                            "-"
                                                                                                                                        )[2]
                                                                                                                                    }
                                                                                                                                </div>
                                                                                                                            </td>
                                                                                                                            <td className="px-4 py-2 text-left">
                                                                                                                                {item.salePrice}
                                                                                                                            </td>
                                                                                                                            <td className="px-4 py-2 text-left">
                                                                                                                                {item.qty}
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    )
                                                                                                                )}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </div>
                                                                                            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                                                                                    onClick={handleCloseModal}
                                                                                                >
                                                                                                    Close
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                        <span>{orderDate}</span>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                        <span>{request.reason}</span>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                        <span>{request.notes}</span>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                        {editingStatus[request._id] ? (
                                                                            <div className="flex flex-col gap-5 items-center ">
                                                                                <select
                                                                                    name="status"
                                                                                    value={
                                                                                        selectedStatuses[request._id] ??
                                                                                        request.status
                                                                                    }
                                                                                    onChange={(event) =>
                                                                                        handleStatusChange(
                                                                                            request._id,
                                                                                            event
                                                                                        )
                                                                                    }
                                                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                                                >
                                                                                    {[
                                                                                        "pending",
                                                                                        "accepted",
                                                                                        "rejected",
                                                                                    ].map((status) => (
                                                                                        <option key={status} value={status}>
                                                                                            {statusLabels[status] ?? status}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                                <div className="flex flex-row gap-2 items-center">
                                                                                    {/* Save Icon */}
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleSaveStatus(request._id)
                                                                                        }
                                                                                        className="text-white bg-blue-600 hover:bg-blue-700 p-1 rounded-md flex items-center justify-center"
                                                                                    >
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="currentColor"
                                                                                            className="size-6"
                                                                                        >
                                                                                            <path
                                                                                                fillRule="evenodd"
                                                                                                d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                                                                                                clipRule="evenodd"
                                                                                            />
                                                                                        </svg>
                                                                                    </button>

                                                                                    {/* Cancel Icon */}
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            setEditingStatus((prev) => ({
                                                                                                ...prev,
                                                                                                [request._id]: false,
                                                                                            }))
                                                                                        }
                                                                                        className="text-white bg-red-600 hover:bg-red-700 p-1 rounded-md flex items-center justify-center"
                                                                                    >
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="currentColor"
                                                                                            className="size-6"
                                                                                        >
                                                                                            <path
                                                                                                fillRule="evenodd"
                                                                                                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                                                                                                clipRule="evenodd"
                                                                                            />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span
                                                                                className={`inline-flex items-center rounded-md px-2 py-2 text-xs font-medium ring-1 ring-inset cursor-pointer text-white ${statusColors[request.status] ||
                                                                                    "bg-gray-500"
                                                                                    }`}
                                                                                onClick={() => {
                                                                                    // Turn on editing mode for this row
                                                                                    setEditingStatus((prev) => ({
                                                                                        ...prev,
                                                                                        [request._id]: true,
                                                                                    }));
                                                                                    // Make sure to set the current status as the "selected status"
                                                                                    setSelectedStatuses((prev) => ({
                                                                                        ...prev,
                                                                                        [request._id]: request.status,
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                {statusLabels[request.status] ??
                                                                                    request.status}
                                                                            </span>
                                                                        )}
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                        <div className="flex gap-2 items-center">
                                                                            <Link
                                                                                to={`/admin/edit-return-request/${request._id}`}
                                                                                className="text-primary hover:text-blue-900"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth="1.5"
                                                                                    stroke="currentColor"
                                                                                    className="size-6"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M19.5 7.125L16.862 4.487M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                                                    />
                                                                                </svg>
                                                                            </Link>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDelete(request._id)
                                                                                }
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    fill="none"
                                                                                    viewBox="0 0 24 24"
                                                                                    strokeWidth="1.5"
                                                                                    stroke="currentColor"
                                                                                    className="size-6 text-red-600"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                    />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            {errState && (
                                                <p className="text-red-500 mt-4">
                                                    Failed to load orders. Please try again.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-row justify-between px-4 py-2 ">
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
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
