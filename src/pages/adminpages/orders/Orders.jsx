import { useEffect, useState, useCallback, useRef } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import OrdersTab from "./OrdersTabs";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import ReturnItemModal from "./components/orders/ReturnItemModal";
import { useLocation } from "react-router-dom";
import { CSVLink } from "react-csv";
import ordersService from "./service/ordersService";

// Import new components
import OrderStats from "./components/orders/OrderStats";
import OrderFilters from "./components/orders/OrderFilters";
import OrderTableHeader from "./components/orders/OrderTableHeader";
import OrderRow from "./components/orders/OrderRow";
import OrderCard from "./components/orders/OrderCard";
import OrderModal from "./components/orders/OrderModal";
import Pagination from "./components/orders/Pagination";
import ShippingUpdateModal from "./components/orders/ShippingUpdateModal";
import OrderChatModal from "./components/orders/OrderChatModal";
import { TableSkeleton } from "../shared/Skeletons";

export default function Orders() {
  const [progress, setProgress] = useState(0);
  const [errState, setErrState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("orders");
  const [selectedTab, setSelectedTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedReturnOrderId, setSelectedReturnOrderId] = useState(null);
  const [selectedOrderData, setSelectedOrderData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [filter, setFilter] = useState("all");
  const location = useLocation();
  const filterStatusFromState = location.state?.filterStatus;

  // Unified status/shipping modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatusOrderId, setSelectedStatusOrderId] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);

  // Message modal states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedMessageOrder, setSelectedMessageOrder] = useState(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // View mode state (table or card)
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // Selection state for export
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState([]);
  const csvLinkRef = useRef(null);

  // Bulk actions state
  const [isBulkShipping, setIsBulkShipping] = useState(false);

  // Unread message counts for orders
  const [unreadCounts, setUnreadCounts] = useState({});

  // Stats state
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    shippedOrders: 0,
  });

  // Track active search/filter for API calls
  const [activeSearch, setActiveSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Initialize filter from URL or state
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusFromURL = queryParams.get("status");

    if (statusFromURL) {
      const statusValue = statusFromURL.toLowerCase();
      setFilter(statusValue);
      setActiveFilter(statusValue);
    } else if (filterStatusFromState) {
      const statusValue = filterStatusFromState.toLowerCase();
      setFilter(statusValue);
      setActiveFilter(statusValue);
    } else {
      setFilter("all");
      setActiveFilter("all");
    }
  }, [location.search, filterStatusFromState]);

  // Fetch unread message counts for current orders
  // NOTE: This must be defined BEFORE getOrders since getOrders depends on it
  const fetchUnreadCounts = useCallback(async (ordersList) => {
    if (!ordersList || ordersList.length === 0) {
      setUnreadCounts({});
      return;
    }

    try {
      const orderIds = ordersList.map(order => order._id);
      const response = await ordersService.getUnreadCountsForOrders(orderIds);
      if (response.success) {
        setUnreadCounts(response.unreadCounts);
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  }, []);

  // Fetch orders with server-side pagination
  const getOrders = useCallback(async () => {
    setIsLoading(true);
    setProgress(30);

    try {
      const response = await ordersService.getOrders(currentPage, itemsPerPage, activeFilter, activeSearch);

      if (response.success && response.data.status === 201) {
        const fetchedOrders = response.data.orders || [];
        setOrders(fetchedOrders);
        setSelectedOrders([]); // Clear selection when orders change
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalOrders(response.data.pagination?.totalOrders || 0);
        setErrState(false);
        setProgress(100);

        // Fetch unread counts for the loaded orders
        fetchUnreadCounts(fetchedOrders);
      } else {
        setErrState(true);
        setProgress(100);
      }

      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setErrState(true);
      setProgress(100);
      setDataFetched(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, activeFilter, activeSearch, fetchUnreadCounts]);

  // Fetch stats using dedicated fast endpoint
  const getStats = async () => {
    try {
      const response = await ordersService.getOrderStats();
      // Always set stats (service returns default values on error)
      setStats(response.stats);
    } catch (error) {
      console.error("Error fetching order stats:", error);
      // Set default values on exception
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        shippedOrders: 0,
      });
    }
  };

  // Handle filter change from stat cards - immediately apply filter
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setActiveFilter(newFilter);
    setCurrentPage(1);
  };

  // Handle search button click
  const handleSearch = () => {
    setActiveSearch(searchQuery);
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Handle clear filters button click
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilter("all");
    setActiveSearch("");
    setActiveFilter("all");
    setCurrentPage(1);
  };

  // Fetch orders when pagination or active filters change
  useEffect(() => {
    getOrders();
  }, [getOrders]);

  // Fetch stats on mount
  useEffect(() => {
    getStats();
  }, []);

  // Utility functions
  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("en-GB", options).replace(",", "");
  };

  const calculateDiscountedPrice = (totalSalePrice, coupon) => {
    let total = parseFloat(totalSalePrice);
    if (isNaN(total)) total = 0;

    if (coupon) {
      if (coupon.discount_type === "flat") {
        total = total - coupon.discount;
      } else if (coupon.discount_type === "percentage") {
        const discountAmount = (total * coupon.discount) / 100;
        total =
          total -
          (coupon.upto
            ? Math.min(discountAmount, coupon.upto)
            : discountAmount);
      }
    }

    return total > 0 ? total.toFixed(2) : "0.00";
  };

  // Event handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleOpenReturnModal = (orderId, order) => {
    setIsReturnModalOpen(true);
    setSelectedReturnOrderId(orderId);
    setSelectedOrderData(order);
  };

  const handleOpenStatusModal = async (orderId) => {
    setSelectedStatusOrderId(orderId);
    setIsStatusModalOpen(true);
    setIsLoadingOrderDetails(true);

    try {
      const response = await ordersService.getOrderByAdmin(orderId);
      if (response.success && response.order) {
        setSelectedOrderDetails(response.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedStatusOrderId(null);
    setSelectedOrderDetails(null);
  };

  // Use the same modal for Ship button
  const handleOpenShipModal = async (orderId) => {
    setSelectedStatusOrderId(orderId);
    setIsStatusModalOpen(true);
    setIsLoadingOrderDetails(true);

    try {
      const response = await ordersService.getOrderByAdmin(orderId);
      if (response.success && response.order) {
        setSelectedOrderDetails(response.order);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  const handleOpenMessageModal = (order) => {
    setSelectedMessageOrder(order);
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setSelectedMessageOrder(null);
  };

  // Unified handler for status and shipping updates
  const handleStatusUpdate = async (updateData) => {
    setIsStatusUpdating(true);
    try {
      // Use shipping endpoint if shipping details are included, otherwise use status endpoint
      const response = updateData.shippingDetails
        ? await ordersService.updateOrderShipping(selectedStatusOrderId, updateData)
        : await ordersService.updateOrderStatus(selectedStatusOrderId, updateData);

      if (response.success && response.status === 200) {
        toast.success("Order updated successfully!");

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedStatusOrderId
              ? {
                  ...order,
                  status: updateData.status,
                  ...(updateData.shippingDetails && {
                    shippingDetails: {
                      ...order.shippingDetails,
                      ...updateData.shippingDetails,
                    },
                  }),
                }
              : order
          )
        );

        // Refresh stats after update
        getStats();
        handleCloseStatusModal();
      } else {
        toast.error(response.error || "Failed to update order.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("An error occurred while updating the order.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    setProgress(50);
    try {
      const response = await ordersService.deleteOrder(id);
      if (response.success && response.status === 201) {
        toast.success(response.message);
        setErrState(false);
        setProgress(100);
        getOrders();
      } else {
        toast.error(response.error || "Failed to delete order");
        setErrState(true);
        setProgress(100);
      }
    } catch (error) {
      toast.error("Error deleting order");
      setErrState(true);
      setProgress(100);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Selection handlers for checkbox export
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order._id));
    }
  };

  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const hasOrders = orders.length > 0;

  // Helper function to format product names with variant details
  const formatProductNames = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return "N/A";
    return cartItems.map(item => {
      // Clean variant name - remove hex color codes like (#000000)
      const cleanVariant = item.variant?.replace(/\s*\(#[0-9a-fA-F]+\)/g, '') || '';
      return `${item.productName} (${cleanVariant}) x${item.qty}`;
    }).join(" | ");
  };

  // Export using dedicated API for full product details
  const handleExport = async () => {
    setIsExporting(true);
    toast.info("Preparing export data...");

    try {
      const response = await ordersService.getOrdersForExport(activeFilter, activeSearch);

      if (response.success) {
        // Filter by selected orders if any are selected
        const ordersToExport = selectedOrders.length > 0
          ? response.orders.filter((order) => selectedOrders.includes(order._id))
          : response.orders;

        const csvData = ordersToExport.map((order) => {
          const coupon = Array.isArray(order.coupon) ? order.coupon[0] : order.coupon;

          return {
            OrderNumber: order.orderNumber,
            FirstName: order.shippingDetails?.firstName || "N/A",
            LastName: order.shippingDetails?.lastName || "N/A",
            Email: order.contactDetails?.email || "N/A",
            PhoneNumber: order.shippingDetails?.phoneNumber || "N/A",
            OrderDate: new Date(order.createdAt).toLocaleDateString(),
            OrderTime: new Date(order.createdAt).toLocaleTimeString(),
            Note: order.shippingDetails?.notes || "No notes available",
            Address: order.shippingDetails?.address || "N/A",
            Apartment: order.shippingDetails?.apartment || "N/A",
            City: order.shippingDetails?.city || "N/A",
            County: order.shippingDetails?.county || "N/A",
            PostalCode: order.shippingDetails?.postalCode || "N/A",
            Country: order.shippingDetails?.country || "N/A",
            TrackingNumber: order.shippingDetails?.trackingNumber || "N/A",
            ProductNames: formatProductNames(order.cartItems),
            Items: order.cartItemsCount || 0,
            CouponCode: coupon?.code || "No Coupon",
            OrderValue: calculateDiscountedPrice(
              order.cartTotal || order.totalOrderValue || 0,
              coupon
            ),
            Status: order.status,
          };
        });

        setExportData(csvData);
        toast.success(`Export ready: ${csvData.length} order${csvData.length !== 1 ? "s" : ""}`);

        // Trigger CSV download after state update
        setTimeout(() => {
          csvLinkRef.current?.link.click();
        }, 100);
      } else {
        toast.error(response.error || "Failed to fetch export data");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle bulk mark as shipped
  const handleBulkMarkAsShipped = async () => {
    if (selectedOrders.length === 0) {
      toast.warning("Please select orders to mark as shipped");
      return;
    }

    setIsBulkShipping(true);
    toast.info(`Marking ${selectedOrders.length} order(s) as shipped...`);

    try {
      const response = await ordersService.bulkUpdateOrders(selectedOrders, {
        status: "Shipped"
      });

      if (response.success) {
        toast.success(`${selectedOrders.length} order(s) marked as shipped successfully!`);

        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            selectedOrders.includes(order._id)
              ? { ...order, status: "Shipped" }
              : order
          )
        );

        // Clear selection
        setSelectedOrders([]);

        // Refresh stats
        getStats();
      } else {
        toast.error(response.error || "Failed to mark orders as shipped");
      }
    } catch (error) {
      console.error("Error bulk marking as shipped:", error);
      toast.error("An error occurred while marking orders as shipped");
    } finally {
      setIsBulkShipping(false);
    }
  };

  // Toast notifications
  useEffect(() => {
    if (dataFetched) {
      if (errState) {
        toast.error("An error occurred while fetching the orders.");
      } else {
        toast.success("Orders retrieved successfully.");
      }
    }
  }, [dataFetched, errState]);

  return (
    <>
      <Helmet>
        <title>All Orders</title>
      </Helmet>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            <OrderStats
              stats={stats}
              filter={filter}
              setFilter={handleFilterChange}
            />

            <OrdersTab
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />

            <div>
              <div className="mt-8">
                <div className="flex justify-between items-center mb-3">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    All Orders
                  </h1>
                  <div className="flex items-center gap-3">
                    {/* View Toggle Buttons */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          viewMode === "table"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Table View"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode("card")}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          viewMode === "card"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        title="Card View"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {selectedOrders.length > 0
                            ? `Export (${selectedOrders.length})`
                            : "Export CSV"}
                        </>
                      )}
                    </button>
                    {/* Mark as Shipped Button - Only show when orders are selected */}
                    {selectedOrders.length > 0 && (
                      <button
                        onClick={handleBulkMarkAsShipped}
                        disabled={isBulkShipping}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isBulkShipping ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Shipping...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Mark as Shipped ({selectedOrders.length})
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {/* Hidden CSVLink for programmatic download */}
                  <CSVLink
                    ref={csvLinkRef}
                    data={exportData}
                    filename={`orders-${activeFilter !== 'all' ? activeFilter + '-' : ''}${new Date().toISOString().split('T')[0]}.csv`}
                    className="hidden"
                  />
                </div>

                <div className="relative shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                  <OrderFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filter={filter}
                    setFilter={setFilter}
                    totalOrders={totalOrders}
                    currentPageCount={orders.length}
                    isLoading={isLoading}
                    onSearch={handleSearch}
                    onClearFilters={handleClearFilters}
                  />

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white z-10 p-4 overflow-hidden">
                      <TableSkeleton rows={8} columns={7} />
                    </div>
                  )}

                  {/* Card View */}
                  {viewMode === "card" && (
                    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                      {orders.length === 0 && !isLoading ? (
                        <div className="text-center py-12 text-gray-500">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-lg font-medium">No orders found</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {orders.map((order) => (
                            <OrderCard
                              key={order._id}
                              order={order}
                              formatDate={formatDate}
                              calculateDiscountedPrice={calculateDiscountedPrice}
                              handleOpenModal={handleOpenModal}
                              handleDelete={handleDelete}
                              handleOpenReturnModal={handleOpenReturnModal}
                              handleOpenStatusModal={handleOpenStatusModal}
                              handleOpenShipModal={handleOpenShipModal}
                              handleOpenMessageModal={handleOpenMessageModal}
                              unreadCount={unreadCounts[order._id] || 0}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <OrderTableHeader
                          isAllSelected={isAllSelected}
                          onSelectAll={handleSelectAll}
                          hasOrders={hasOrders}
                        />
                        <tbody className="bg-white text-center">
                          {orders.length === 0 && !isLoading ? (
                            <tr>
                              <td colSpan="8" className="py-8 text-center text-gray-500">
                                No orders found
                              </td>
                            </tr>
                          ) : (
                            orders.map((order) => (
                              <OrderRow
                                key={order._id}
                                order={order}
                                formatDate={formatDate}
                                calculateDiscountedPrice={calculateDiscountedPrice}
                                handleOpenModal={handleOpenModal}
                                handleDelete={handleDelete}
                                handleOpenReturnModal={handleOpenReturnModal}
                                handleOpenStatusModal={handleOpenStatusModal}
                                handleOpenShipModal={handleOpenShipModal}
                                handleOpenMessageModal={handleOpenMessageModal}
                                isSelected={selectedOrders.includes(order._id)}
                                onSelectOrder={handleSelectOrder}
                                unreadCount={unreadCounts[order._id] || 0}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalOrders={totalOrders}
                    handlePageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    handleItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>

                <OrderModal
                  isModalOpen={isModalOpen}
                  handleCloseModal={handleCloseModal}
                  selectedOrderId={selectedOrderId}
                  orders={orders}
                />

                {isReturnModalOpen &&
                  selectedReturnOrderId &&
                  selectedOrderData && (
                    <ReturnItemModal
                      isReturnModalOpen={isReturnModalOpen}
                      setIsReturnModalOpen={setIsReturnModalOpen}
                      selectedOrderData={selectedOrderData}
                    />
                  )}

                {/* Unified Status/Shipping Modal */}
                {isStatusModalOpen && selectedStatusOrderId && (() => {
                  const selectedOrder = orders.find(
                    (order) => order._id === selectedStatusOrderId
                  );
                  const coupon = Array.isArray(selectedOrder?.coupon)
                    ? selectedOrder.coupon[0]
                    : selectedOrder?.coupon;

                  return (
                    <ShippingUpdateModal
                      isOpen={isStatusModalOpen}
                      onClose={handleCloseStatusModal}
                      onSubmit={handleStatusUpdate}
                      currentStatus={selectedOrder?.status || ""}
                      currentProvider={selectedOrder?.shippingDetails?.provider || ""}
                      currentTrackingNumber={selectedOrder?.shippingDetails?.trackingNumber || ""}
                      currentNotes={selectedOrder?.shippingDetails?.notes || ""}
                      orderTotal={
                        selectedOrder
                          ? parseFloat(
                              calculateDiscountedPrice(
                                selectedOrder.cartTotal || selectedOrder.totalOrderValue || 0,
                                coupon
                              )
                            )
                          : 0
                      }
                      isLoading={isStatusUpdating}
                      orderDetails={selectedOrderDetails}
                      isLoadingOrderDetails={isLoadingOrderDetails}
                    />
                  );
                })()}

                <OrderChatModal
                  isOpen={isMessageModalOpen}
                  onClose={handleCloseMessageModal}
                  order={selectedMessageOrder}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
