import React, { useEffect, useMemo, useState } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import OrdersTab from "./OrdersTabs";
import { useAuth } from "../../../context/Auth";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
export default function DeletedOrders() {
    const auth = useAuth();
    const [progress, setProgress] = useState(0);
    const [errState, setErrState] = useState(false);
    const [selectedPage, setSelectedPage] = useState("orders");
    const [selectedTab, setSelectedTab] = useState("delete-orders");
    const [orders, setOrders] = useState([]);
    const [dataFetched, setDataFetched] = useState(false); // Track if data fetching is complete
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
    const [filter, setFilter] = useState("all"); // Default to showing all orders
    const getDeletedOrders = async () => {
        setProgress(75);
        try {
            const response = await axios.get(`${auth.ip}get/deleted/order`);
            if (response.data.status === 201) {
                console.log('jsdhjds', response);
                setOrders(response.data.orders);
                setTotalPages(Math.ceil(response.data.orders.length / itemsPerPage));
                setErrState(false);
            } else {
                setErrState(true);
            }
            setProgress(100);
            setDataFetched(true); // Mark data fetching as complete
        } catch (error) {
            setErrState(true);
            setProgress(100);
            setDataFetched(true); // Mark data fetching as complete
        }
    };

    useEffect(() => {
        getDeletedOrders();
    }, []);
    // Filter products based on the search query
   const filteredOrders = useMemo(() => {
      return orders.filter(order => {
        const orderNumberMatch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const userEmailMatch = order.contactDetails?.email.toLowerCase().includes(searchQuery.toLowerCase());
        const userNameMatch = (
          `${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const trackingNumberMatch = order.shippingDetails?.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const orderValueMatch = order.cart
          .reduce((acc, item) => acc + item.salePrice * item.qty, 0)
          .toFixed(2)
          .includes(searchQuery);
        const itemsMatch = order.cart.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
        const statusMatch = order.status.toLowerCase().includes(searchQuery.toLowerCase());
  
        // Check if there is a coupon and filter based on the coupon code
        const couponCode = order.coupon && order.coupon.length > 0 ? order.coupon[0].code : null;
        const couponMatch = couponCode ? couponCode.toLowerCase().includes(searchQuery.toLowerCase()) : false;
  
        // Additional matches from shippingDetails
        const addressMatch = order.shippingDetails?.address?.toLowerCase().includes(searchQuery.toLowerCase());
        const postalCodeMatch = order.shippingDetails?.postalCode?.toLowerCase().includes(searchQuery.toLowerCase());
        const countyMatch = order.shippingDetails?.county?.toLowerCase().includes(searchQuery.toLowerCase());
        const cityMatch = order.shippingDetails?.city?.toLowerCase().includes(searchQuery.toLowerCase());
        const notesMatch = order.shippingDetails?.notes?.toLowerCase().includes(searchQuery.toLowerCase());
  
        // Apply the selected filter
        const filterMatch = filter === "all" || order.status.toLowerCase() === filter;
  
        return (
          filterMatch &&
          (orderNumberMatch ||
            userEmailMatch ||
            userNameMatch ||
            trackingNumberMatch ||
            orderValueMatch ||
            itemsMatch ||
            statusMatch ||
            couponMatch ||
            addressMatch ||
            postalCodeMatch ||
            countyMatch ||
            cityMatch ||
            notesMatch)
        );
      });
    }, [orders, searchQuery, filter]);
    // Update the total pages whenever the number of items per page or filtered products changes
    useEffect(() => {
        setCurrentPage(1); // Reset to the first page when filter changes
        setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
    }, [filteredOrders, itemsPerPage, filter]); // Add `filter` as a dependency

    // Paginate the filtered products
    const paginatedOrders = filteredOrders.slice(
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

    useEffect(() => {
        if (dataFetched) {
            if (errState) {
                toast.error("An error occurred while fetching the orders.");
            } else {
                toast.success("Orders Retrieved successfully.");
            }
        }
    }, [dataFetched, errState]);

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);

        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // Use 24-hour format
        };

        const formattedDate = date.toLocaleString('en-GB', options).replace(',', '');
        return formattedDate;
    };

    const handleOpenModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editingStatus, setEditingStatus] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});

    const handleStatusChange = (orderId, event) => {
        setSelectedStatuses((prevState) => ({
            ...prevState,
            [orderId]: event.target.value,
        }));
    };

    const calculateDiscountedPrice = (totalSalePrice, coupon) => {
        let total = parseFloat(totalSalePrice);
        if (isNaN(total)) {
            total = 0;
        }

        if (coupon) {
            if (coupon.discount_type === "flat") {
                total = total - coupon.discount;
            } else if (coupon.discount_type === "percentage") {
                const discountAmount = (total * coupon.discount) / 100;
                total = total - (coupon.upto ? Math.min(discountAmount, coupon.upto) : discountAmount);
            }
        }

        // Ensure the total is not negative and return formatted value
        return total > 0 ? total.toFixed(2) : "0.00";
    };


    const handleSaveStatus = async (orderId) => {
        try {
            const response = await axios.patch(`${auth.ip}update/order/${orderId}`, { status: selectedStatuses[orderId] });
            if (response.status === 200) {
                toast.success("Order status updated successfully.");

                // Update the orders state to reflect the new status
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, status: selectedStatuses[orderId] } : order
                    )
                );

                setEditingStatus((prevState) => ({
                    ...prevState,
                    [orderId]: false,
                }));
            } else {
                console.error('Failed to update order status:', response.data);
                toast.error("Failed to update order status.");
            }
        } catch (error) {
            console.error('An error occurred while updating order status:', error);
            toast.error("An error occurred while updating the order status.");
        }
    };
    const handleDelete = (id) => {
        setProgress(50);
        axios.delete(`${auth.ip}restore/delete/order/${id}`).then((response) => {
            console.log('Order Deleted', response);
            if (response.data.status === 201) {
                toast.success(response.data.message);
                setErrState(false);
                setProgress(100);
                // Refresh the list of deleted orders after successful deletion
                getDeletedOrders();
            } else {
                toast.error(response.data.message);
                setErrState(true);
                setProgress(100);
            }
        });
    };

    const handlePermanentDelete = (id) => {
        setProgress(50);
        axios.delete(`${auth.ip}permanent/delete/order/${id}`).then((response) => {
            if (response.data.status === 201) {
                toast.success(response.data.message);
                setErrState(false);
                setProgress(100);

                // Update the orders state to remove the deleted order
                setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
            } else {
                toast.error(response.data.message);
                setErrState(true);
                setProgress(100);
            }
        }).catch((error) => {
            console.error("Error deleting order:", error);
            toast.error("An error occurred while deleting the order.");
            setErrState(true);
            setProgress(100);
        });
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
                <title>Deleted Orders</title>
            </Helmet>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <OrdersTab
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                        />
                        <div>
                            <div className="mt-8">
                                <div className="">
                                    <div className="flex justify-start items-start mb-3">
                                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Deleted Orders</h1>
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
                                                        placeholder="Search for Orders"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4 w-full flex justify-end">
                                                <p className="text-base font-bold flex">Total Orders: {filteredOrders.length}</p>
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
                                                            Order No
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Customer Name
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Items
                                                        </th>
                                                        <th scope="col" className="px-6 py-5 max-w-60 font-semibold">
                                                            Copon Code
                                                        </th>
                                                        <th scope="col" className="px-6 py-5 max-w-60 font-semibold">
                                                            Payment Details
                                                        </th>

                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Order Value
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-5 max-w-60 font-semibold"
                                                        >
                                                            Order Status
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
                                                    {paginatedOrders.map((order) => {
                                                        const formattedDate = formatDate(order.createdAt);
                                                        return (
                                                            <tr key={order._id} className="border-b border-gray-200">
                                                                <td className="px-6 py-3 max-w-60">{order.orderNumber}</td>
                                                                <td className="whitespace-nowrap text-sm px-6 py-3 max-w-60">
                                                                    <div className="flex flex-col justify-center items-center">
                                                                        <div className="font-medium text-gray-900">
                                                                            {order.shippingDetails.firstName} {order.shippingDetails.lastName}
                                                                        </div>
                                                                        <div className="mt-1 text-gray-500">
                                                                            {order?.contactDetails?.email}
                                                                        </div>
                                                                    </div>
                                                                    {formattedDate}
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500  h-full">
                                                                    <div className="flex justify-center items-center gap-3">
                                                                        <div className="mt-1 text-gray-500">
                                                                            Quantity: {order.cart.reduce((acc, item) => acc + item.qty, 0)}
                                                                        </div>
                                                                        <svg
                                                                            className="text-blue-600 cursor-pointer size-6"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth="1.5"
                                                                            stroke="currentColor"
                                                                            onClick={() => handleOpenModal(order._id)}
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
                                                                        {isModalOpen && selectedOrderId === order._id && (
                                                                            <div
                                                                                id="default-modal"
                                                                                tabIndex="-1"
                                                                                aria-hidden="true"
                                                                                className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto"
                                                                            >
                                                                                <div className="relative p-4 w-full max-w-4xl max-h-full">
                                                                                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
                                                                                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                                                                                            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
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
                                                                                                <span className="sr-only">Close modal</span>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="p-6">
                                                                                            <table className="table-auto w-full">
                                                                                                <thead>
                                                                                                    <tr className="border-b border-gray-300">
                                                                                                        <th className="px-4 py-2 text-left">Product</th>
                                                                                                        <th className="px-4 py-2 text-center">Quantity</th>
                                                                                                        <th className="px-4 py-2 text-right">Total</th>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {selectedOrderId &&
                                                                                                        orders
                                                                                                            .find((order) => order._id === selectedOrderId)
                                                                                                            ?.cart.map((item, index) => (
                                                                                                                <tr key={index} className="border-b border-gray-300">
                                                                                                                    <td className="px-4 py-2">
                                                                                                                        <div className="font-medium text-gray-900">
                                                                                                                            {item.productName} - {item.name}
                                                                                                                        </div>
                                                                                                                        <div className="text-sm text-gray-500">
                                                                                                                            <strong>Color:</strong> {item.name.split('-')[1]}
                                                                                                                        </div>
                                                                                                                        <div className="text-sm text-gray-500">
                                                                                                                            <strong>Storage:</strong> {item.name.split('-')[2]}
                                                                                                                        </div>
                                                                                                                    </td>
                                                                                                                    <td className="px-4 py-2 text-center">{item.qty}</td>
                                                                                                                    <td className="px-4 py-2 text-right">
                                                                                                                        £{item.salePrice.toFixed(2)}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            ))}
                                                                                                    <tr>
                                                                                                        <td
                                                                                                            className="px-4 py-2 font-semibold text-right"
                                                                                                            colSpan="2"
                                                                                                        >
                                                                                                            Total Amount:
                                                                                                        </td>
                                                                                                        <td className="px-4 py-2 text-right font-semibold">
                                                                                                            £
                                                                                                            {orders
                                                                                                                .find((order) => order._id === selectedOrderId)
                                                                                                                ?.cart.reduce(
                                                                                                                    (acc, item) => acc + item.salePrice * item.qty,
                                                                                                                    0
                                                                                                                )
                                                                                                                .toFixed(2)}
                                                                                                        </td>
                                                                                                    </tr>
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
                                                                    </div>

                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.coupon && order.coupon.length > 0
                                                                            ? "bg-yellow-50 text-yellow-800 ring-yellow-200" // Yellow background for orders with a coupon
                                                                            : "bg-blue-50 text-primary ring-primary/20"     // Default green background for orders without a coupon
                                                                            }`}
                                                                    >
                                                                        {order.coupon && order.coupon.length > 0 ? (
                                                                            <span className=""> {order.coupon[0].code}</span> // Display coupon code
                                                                        ) : (
                                                                            <span className="">No Coupon</span>
                                                                        )}
                                                                    </span>
                                                                </td>


                                                                <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                    {order.paymentDetails?.cardDetails?.brand || 'N/A'} <br></br>
                                                                    {order.paymentDetails?.cardDetails?.country || ''}
                                                                </td>
                                                                <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.coupon && order.coupon.length > 0
                                                                            ? "bg-yellow-50 text-yellow-800 ring-yellow-200" // Yellow background for orders with a coupon
                                                                            : "bg-blue-50 text-primary ring-primary/20"     // Default green background for orders without a coupon
                                                                            }`}
                                                                    >
                                                                        {/* Calculate the total price */}
                                                                        £{
                                                                            calculateDiscountedPrice(
                                                                                order.cart.reduce((acc, item) => acc + item.salePrice * item.qty, 0),
                                                                                order.coupon?.[0] // Access the first coupon in the array if it exists
                                                                            )
                                                                        }

                                                                    </span>
                                                                </td>


                                                                <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                                                    {editingStatus[order._id] ? (

                                                                        <div className="flex flex-row gap-5 items-center">
                                                                            <select
                                                                                name="status"
                                                                                value={selectedStatuses[order._id] || order.status}
                                                                                onChange={(event) => handleStatusChange(order._id, event)}
                                                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                                            >

                                                                                <option value="Pending">Pending</option>
                                                                                <option value="Shipped">Shipped</option>
                                                                                <option value="Approved">Approved</option>
                                                                                <option value="Delivered">Delivered</option>
                                                                                <option value="Deleted">Deleted</option>
                                                                                <option value="Cancelled">Cancelled</option>
                                                                                <option value="Refunded">Refunded</option>
                                                                                <option value="Failed">Failed</option>
                                                                            </select>

                                                                            {/* Save Icon */}
                                                                            <button
                                                                                onClick={() => handleSaveStatus(order._id)}
                                                                                className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-md flex items-center justify-center"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </button>

                                                                            {/* Cancel Icon */}
                                                                            <button
                                                                                onClick={() =>
                                                                                    setEditingStatus((prevState) => ({
                                                                                        ...prevState,
                                                                                        [order._id]: false,
                                                                                    }))
                                                                                }
                                                                                className="text-white bg-red-600 hover:bg-red-700 p-1 rounded-md flex items-center justify-center"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                                                </svg>

                                                                            </button>
                                                                        </div>

                                                                    ) : (
                                                                        <span
                                                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer ${order.status === "Pending"
                                                                                ? "bg-yellow-50 text-yellow-800 ring-yellow-200"
                                                                                : order.status === "Shipped"
                                                                                    ? "bg-blue-50 text-blue-800 ring-blue-200"
                                                                                    : order.status === "Approved"
                                                                                        ? "bg-blue-50 text-blue-800 ring-blue-200"
                                                                                        : order.status === "Delivered"
                                                                                            ? "bg-indigo-50 text-indigo-800 ring-indigo-200"
                                                                                            : order.status === "Failed"
                                                                                                ? "bg-red-50 text-red-600 ring-red-200"
                                                                                            : order.status === "Deleted"
                                                                                                ? "bg-red-50 text-red-900 ring-red-200"
                                                                                                : "bg-gray-50 text-gray-800 ring-gray-200"
                                                                                }`}
                                                                            onClick={() => {
                                                                                setEditingStatus((prevState) => ({
                                                                                    ...prevState,
                                                                                    [order._id]: true,
                                                                                }));
                                                                                setSelectedStatuses((prevState) => ({
                                                                                    ...prevState,
                                                                                    [order._id]: order.status,
                                                                                }));
                                                                            }}
                                                                        >
                                                                            {order.status}
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                <td className="relative whitespace-nowrap px-6 py-3 text-center text-sm font-medium">
                                                                    <div className="flex justify-center items-center ">
                                                                        


                                                                        <button onClick={() => handlePermanentDelete(order._id)}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-red-700" >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                            </svg>
                                                                        </button>

                                                                        <button onClick={() => handleDelete(order._id)}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-blue-600">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                                            </svg>

                                                                        </button>

                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
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
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
