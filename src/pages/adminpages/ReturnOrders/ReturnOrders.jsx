import { useEffect, useState, useMemo, useCallback } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

// Import service
import returnOrdersService from './service/returnOrdersService';

// Import components
import { getStatusKeyByLabel } from './components/shared/StatusConfig';
import { StatsCard, SearchBar, ProductModal, OrdersTable, Pagination, ReturnOrderMessageModal, ReturnOrderLabelModal } from './components/returnOrders';
import { ReturnRequestsSection } from './components/returnRequests';
export default function ReturnOrders() {
    const [progress, setProgress] = useState(0);
    const [errState, setErrState] = useState(false);
    const [selectedPage, setSelectedPage] = useState("return-orders");
    const [ordersReturn, setOrdersReturn] = useState([]);
    const [dataFetched, setDataFetched] = useState(false); // Track if data fetching is complete
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedOrderForMessage, setSelectedOrderForMessage] = useState(null);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [selectedOrderIdForLabel, setSelectedOrderIdForLabel] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
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
    const getReturnOrders = useCallback(async () => {
        setProgress(50);
        try {
            // First pass: Get initial orders (last 7 days)
            const initialResult = await returnOrdersService.getReturnOrders('initial');

            if (initialResult.success && initialResult.status === 201) {
                // Process initial orders
                const initialNormalizedOrders = initialResult.returnOrders.map(order => {
                    const key = getStatusKeyByLabel(order.status);
                    return { ...order, status: key || order.status };
                }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                // Set initial orders with just the first batch
                setOrdersReturn(initialNormalizedOrders);
                setProgress(75);

                // Check if we have valid cached remaining orders
                if (returnOrdersService.isCacheValid()) {
                    console.log('Using cached remaining return orders');
                    const cachedRemainingOrders = returnOrdersService.getRemainingOrdersFromCache();
                    const allOrders = [...initialNormalizedOrders, ...cachedRemainingOrders];
                    setOrdersReturn(allOrders);
                    setTotalPages(Math.ceil(allOrders.length / itemsPerPage));
                    setProgress(100);
                    setDataFetched(true);
                } else {
                    // Fetch remaining orders after delay if no valid cache
                    console.log('Fetching remaining return orders from API');
                    setTimeout(async () => {
                        try {
                            const remainingResult = await returnOrdersService.getReturnOrders('remaining');

                            if (remainingResult.success && remainingResult.status === 201) {
                                // Process remaining orders
                                const remainingNormalizedOrders = remainingResult.returnOrders.map(order => {
                                    const key = getStatusKeyByLabel(order.status);
                                    return { ...order, status: key || order.status };
                                }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                                // Save to cache for future use
                                returnOrdersService.saveRemainingOrdersToCache(remainingNormalizedOrders);

                                // Combine initial and remaining orders
                                const allOrders = [...initialNormalizedOrders, ...remainingNormalizedOrders];
                                setOrdersReturn(allOrders);
                                setTotalPages(Math.ceil(allOrders.length / itemsPerPage));
                            }
                        } catch (olderError) {
                            console.error('Error fetching remaining return orders:', olderError);
                        } finally {
                            setProgress(100);
                            setDataFetched(true);
                        }
                    }, 1000); // 1 second delay before fetching remaining orders
                }

                setErrState(false);
            } else {
                setErrState(true);
                setProgress(100);
                setDataFetched(true);
            }
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            setErrState(true);
            setProgress(100);
            setDataFetched(true);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        getReturnOrders();
    }, [getReturnOrders]);

    const handleOpenModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };

    const handleOpenMessageModal = (order) => {
        setSelectedOrderForMessage(order);
        setIsMessageModalOpen(true);
    };

    const handleCloseMessageModal = () => {
        setIsMessageModalOpen(false);
        setSelectedOrderForMessage(null);
    };

    // Label Modal Handlers
    const handleOpenLabelModal = (orderId) => {
        setSelectedOrderIdForLabel(orderId);
        setIsLabelModalOpen(true);
    };

    const handleCloseLabelModal = () => {
        setIsLabelModalOpen(false);
        setSelectedOrderIdForLabel(null);
    };

    const handleLabelApplied = (labelData) => {
        // Update the order in state with the new label
        setOrdersReturn((prevOrders) =>
            prevOrders.map((order) =>
                order._id === selectedOrderIdForLabel
                    ? { ...order, label: labelData.data }
                    : order
            )
        );
        // Also update cache if applicable
        if (returnOrdersService.isCacheValid()) {
            const cachedRemainingOrders = returnOrdersService.getRemainingOrdersFromCache();
            const updatedCachedOrders = cachedRemainingOrders.map((order) =>
                order._id === selectedOrderIdForLabel
                    ? { ...order, label: labelData.data }
                    : order
            );
            if (cachedRemainingOrders.some(order => order._id === selectedOrderIdForLabel)) {
                returnOrdersService.saveRemainingOrdersToCache(updatedCachedOrders);
            }
        }
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);

        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };

        const formattedDate = date.toLocaleString('en-GB', options).replace(',', '');
        return formattedDate;
    };
    // Filter products based on the search query
    const filteredReturnOrders = useMemo(() => {
        return ordersReturn.filter((order) => {
            const searchLower = searchQuery.toLowerCase();
            // Matching order fields against search query
            const customerNameMatch = order?.customerName?.toLowerCase().includes(searchLower);
            const phoneNumberMatch = order?.phoneNumber?.includes(searchLower);
            const emailMatch = order?.email?.toLowerCase().includes(searchLower);
            const addressMatch = order?.address?.toLowerCase().includes(searchLower);
            const cityMatch = order?.city?.toLowerCase().includes(searchLower);
            const postalCodeMatch = order?.postalCode?.includes(searchLower);
            const RMAmatch = order.rma.toLowerCase().includes(searchLower);
            const orderNumberMatch = order?.orderNumber?.toLowerCase().includes(searchLower);
            const originalTrackingNumberMatch = order?.originalTrackingNumber?.toLowerCase().includes(searchLower);
            const returnTrackingNumberMatch = order?.returnTrackingNumber?.toLowerCase().includes(searchLower);
            const originalSerialNumberMatch = order?.originalSerialNumber?.toLowerCase().includes(searchLower);
            const replacementSerialNumberMatch = order?.replacementSerialNumber?.toLowerCase().includes(searchLower);
            const reasonMatch = order?.reason?.toLowerCase().includes(searchLower);
            const statusMatch = order?.status?.toLowerCase().includes(searchLower);
            const platformMatch = order?.platform?.toLowerCase().includes(searchLower);
            const notesMatch = order?.notes?.toLowerCase().includes(searchLower);
            const accountMatch = order?.account?.toLowerCase().includes(searchLower);
            // Matching product names
            const productNamesMatch = order?.productNames?.some((productName) =>
                productName.toLowerCase().includes(searchLower)
            );
            // Matching order status if a filter is applied
            const filterMatch = filter === "all" || order.status.toLowerCase() === filter;
            // Combine all matches
            return (
                filterMatch &&
                (customerNameMatch ||
                    phoneNumberMatch ||
                    emailMatch ||
                    addressMatch ||
                    cityMatch ||
                    postalCodeMatch ||
                    orderNumberMatch ||
                    RMAmatch ||
                    originalTrackingNumberMatch ||
                    returnTrackingNumberMatch ||
                    originalSerialNumberMatch ||
                    replacementSerialNumberMatch ||
                    reasonMatch ||
                    platformMatch ||
                    notesMatch ||
                    accountMatch ||
                    statusMatch ||
                    productNamesMatch)
            );
        });
    }, [ordersReturn, searchQuery, filter]);

    // Update the total pages whenever the number of items per page or filtered products changes
    useEffect(() => {
        setCurrentPage(1); // Reset to the first page when filter changes
        setTotalPages(Math.ceil(filteredReturnOrders.length / itemsPerPage));
    }, [filteredReturnOrders, itemsPerPage, filter]); // Add `filter` as a dependency

    // Paginate the filtered products
    const paginatedReturnOrders = filteredReturnOrders.slice(
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
    const handleDelete = async (id) => {
        setProgress(50);
        const result = await returnOrdersService.deleteReturnOrder(id);

        if (result.success && result.status === 201) {
            toast.success(result.message);
            setErrState(false);
            setProgress(100);
            getReturnOrders();
        } else {
            toast.error(result.error || 'Failed to delete return order');
            setErrState(true);
            setProgress(100);
        }
    };
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Return Requests State
    const [returnRequests, setReturnRequests] = useState([]);
    const [returnRequestsExpanded, setReturnRequestsExpanded] = useState(true);
    const [returnRequestsStats, setReturnRequestsStats] = useState({
        totalRequestOrders: 0,
        TotalPendingRequestOrders: 0,
        TotalAcceptedRequestOrders: 0,
        TotalRejectedRequestOrders: 0,
    });

    // Fetch Return Requests
    const getReturnRequests = useCallback(async () => {
        try {
            const result = await returnOrdersService.getReturnRequests();
            if (result.success && result.status === 200) {
                const sortedRequests = result.returnRequests.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setReturnRequests(sortedRequests);
            }
        } catch (error) {
            console.error("Error fetching return requests:", error);
        }
    }, []);

    // Delete Return Request Handler
    const handleDeleteRequest = async (requestId) => {
        setProgress(50);
        try {
            const result = await returnOrdersService.deleteReturnRequest(requestId);
            if (result.success) {
                toast.success(result.message || 'Return request deleted successfully');
                // Remove from local state
                setReturnRequests(prev => prev.filter(r => r._id !== requestId));
                // Refresh stats
                const statsResult = await returnOrdersService.getReturnRequestStats();
                if (statsResult.success) {
                    setReturnRequestsStats(statsResult.stats);
                }
            } else {
                toast.error(result.error || 'Failed to delete return request');
            }
        } catch (error) {
            console.error('Error deleting return request:', error);
            toast.error('An error occurred while deleting the return request');
        } finally {
            setProgress(100);
        }
    };

    // Status Change Handler for Return Requests (Accept/Reject)
    const handleRequestStatusChange = async (requestId, newStatus) => {
        setProgress(50);
        try {
            const result = await returnOrdersService.updateReturnRequestStatus(requestId, newStatus);
            if (result.success && result.status === 200) {
                toast.success(`Return request ${newStatus.toLowerCase()} successfully`);
                // Update local state
                setReturnRequests(prev =>
                    prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r)
                );
                // Refresh stats
                const statsResult = await returnOrdersService.getReturnRequestStats();
                if (statsResult.success) {
                    setReturnRequestsStats(statsResult.stats);
                }
            } else {
                toast.error(result.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating return request status:', error);
            toast.error('An error occurred while updating the status');
        } finally {
            setProgress(100);
        }
    };

    // Fetch Return Requests Stats
    useEffect(() => {
        const fetchReturnRequestStats = async () => {
            const result = await returnOrdersService.getReturnRequestStats();
            if (result.success) {
                setReturnRequestsStats(result.stats);
            }
        };
        fetchReturnRequestStats();
    }, []);

    useEffect(() => {
        getReturnRequests();
    }, [getReturnRequests]);


    const [editingStatus, setEditingStatus] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const handleStatusChange = (orderId, event) => {
        const newValue = event.target.value;
        setSelectedStatuses((prevState) => ({
            ...prevState,
            [orderId]: newValue,
        }));
    };
    const handleSaveStatus = async (orderId) => {
        try {
            const updatedStatus = selectedStatuses[orderId];
            const result = await returnOrdersService.updateReturnOrderStatus(orderId, updatedStatus);

            if (result.success && result.status === 200) {
                toast.success("Order status updated successfully.");
                // Update the orders state to reflect the new status
                setOrdersReturn((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId
                            ? { ...order, status: updatedStatus }
                            : order
                    )
                );

                // Update cached remaining orders in localStorage if they exist
                if (returnOrdersService.isCacheValid()) {
                    const cachedRemainingOrders = returnOrdersService.getRemainingOrdersFromCache();
                    const updatedCachedOrders = cachedRemainingOrders.map((order) =>
                        order._id === orderId
                            ? { ...order, status: updatedStatus }
                            : order
                    );
                    // Only save if the order was found in cached data
                    if (cachedRemainingOrders.some(order => order._id === orderId)) {
                        returnOrdersService.saveRemainingOrdersToCache(updatedCachedOrders);
                        console.log('Updated cached remaining orders with new status');
                    }
                }

                // Turn off editing mode
                setEditingStatus((prevState) => ({
                    ...prevState,
                    [orderId]: false,
                }));
            } else {
                console.error('Failed to update order status:', result.error);
                toast.error(result.error || "Failed to update order status.");
            }
        } catch (error) {
            console.error('An error occurred while updating order status:', error);
            toast.error("An error occurred while updating the order status.");
        }
    };
    const [stats, setStats] = useState({
        TotalreturnOrders: 0,
        TotalPendingreturnOrders: 0,
        TotalRefundedreturnOrders: 0,
        TotalSentreturnOrders: 0,
        TotalWaitingForCustomerreturnOrders: 0,
        TotalWaitingForDeliveryreturnOrders: 0,
    });

    const displayStats = [
        { id: 1, name: "Total Returns", value: stats.TotalreturnOrders },
        { id: 2, name: "Pending Returns", value: stats.TotalPendingreturnOrders },
        { id: 3, name: "Refunded", value: stats.TotalRefundedreturnOrders },
        { id: 4, name: "Return Sent", value: stats.TotalSentreturnOrders },
        { id: 5, name: "Waiting For Customer", value: stats.TotalWaitingForCustomerreturnOrders },
        { id: 6, name: "Waiting For Delivery", value: stats.TotalWaitingForDeliveryreturnOrders }
    ];

    useEffect(() => {
        const fetchStats = async () => {
            const result = await returnOrdersService.getReturnOrderStats();
            if (result.success) {
                console.log(result.stats);
                setStats(result.stats);
            } else {
                console.log(result.error);
            }
        };
        fetchStats();
    }, []);
    return (
        <>
            <Helmet>
                <title>Return Orders</title>
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
                        {/* Return Requests Section */}
                        <ReturnRequestsSection
                            returnRequests={returnRequests}
                            returnRequestsStats={returnRequestsStats}
                            returnRequestsExpanded={returnRequestsExpanded}
                            setReturnRequestsExpanded={setReturnRequestsExpanded}
                            formatDate={formatDate}
                            onDeleteRequest={handleDeleteRequest}
                            onStatusChange={handleRequestStatusChange}
                        />

                        {/* Return Orders Stats */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-6 my-5">
                            {displayStats.map((stat) => (
                                <StatsCard
                                    key={stat.id}
                                    stat={stat}
                                    filter={filter}
                                    setFilter={setFilter}
                                />
                            ))}
                        </div>



                        <div>
                            <div className="mt-8">
                                <div className="">
                                    <div className="flex justify-between items-center mb-3">
                                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Return Orders</h1>
                                        <Link to="/admin/add-return-orders" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">Add Return Order</Link>

                                    </div>
                                    <div className="relative shadow-lg rounded-lg border border-gray-200">
                                        <SearchBar 
                                            searchQuery={searchQuery}
                                            setSearchQuery={setSearchQuery}
                                            filteredCount={filteredReturnOrders.length}
                                        />
                                        <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
                                            <OrdersTable
                                                orders={paginatedReturnOrders}
                                                editingStatus={editingStatus}
                                                selectedStatuses={selectedStatuses}
                                                onStatusChange={handleStatusChange}
                                                onSaveStatus={handleSaveStatus}
                                                onEdit={(orderId) => {
                                                    setEditingStatus((prev) => ({ ...prev, [orderId]: true }));
                                                    setSelectedStatuses((prev) => ({ ...prev, [orderId]: ordersReturn.find(o => o._id === orderId)?.status }));
                                                }}
                                                onCancel={(orderId) => {
                                                    setEditingStatus((prev) => ({
                                                        ...prev,
                                                        [orderId]: false,
                                                    }));
                                                }}
                                                onOpenModal={handleOpenModal}
                                                onDelete={handleDelete}
                                                onOpenMessageModal={handleOpenMessageModal}
                                                onOpenLabelModal={handleOpenLabelModal}
                                                formatDate={formatDate}
                                            />
                                            {errState && <p className="text-red-500 mt-4">Failed to load orders. Please try again.</p>}
                                        </div>


                                        <ProductModal
                                            isOpen={isModalOpen}
                                            onClose={handleCloseModal}
                                            order={ordersReturn.find(o => o._id === selectedOrderId)}
                                        />
                                        <ReturnOrderMessageModal
                                            isOpen={isMessageModalOpen}
                                            onClose={handleCloseMessageModal}
                                            returnOrder={selectedOrderForMessage}
                                        />
                                        <ReturnOrderLabelModal
                                            isOpen={isLabelModalOpen}
                                            onClose={handleCloseLabelModal}
                                            onApply={handleLabelApplied}
                                            orderId={selectedOrderIdForLabel}
                                            existingLabel={ordersReturn.find(o => o._id === selectedOrderIdForLabel)?.label}
                                        />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={handlePageChange}
                                            onItemsPerPageChange={handleItemsPerPageChange}
                                        />
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
