import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Helmet } from "react-helmet-async";
import ordersService from "./service/ordersService";
import {
  OrderHeader,
  OrderInfo,
  CustomerDetails,
  AddressDetails,
  RefundDetails,
  OrderTotals,
  OrderTotalsCard,
  AddProductModal,
  OrderItemsCard,
  OrderLabelModal,
} from "./components/orderDetails";
import ShippingUpdateModal from "./components/orders/ShippingUpdateModal";
import ReturnItemModal from "./components/orders/ReturnItemModal";
import OrderChatModal from "./components/orders/OrderChatModal";
import { getOrderLineItemImageUrl } from "./utils/orderItemImageUrl";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OrderDetails = () => {
  const [selectedPage, setSelectedPage] = useState("orders");
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState(null);
  const [updatedOrderDetails, setUpdatedOrderDetails] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [orderLabel, setOrderLabel] = useState(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isShippingUpdating, setIsShippingUpdating] = useState(false);

  // Return modal states
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Chat modal states
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getOrder = useCallback(async () => {
    setProgress(50);
    try {
      const response = await ordersService.getOrderByAdmin(id);
      if (response.success && response.status === 201) {
        setOrderDetail(response.order);
        console.log("Orders", response.order);
        setUpdatedOrderDetails(response.order);
      } else {
        toast.error(response.error || "Failed to fetch order details.");
      }
      setProgress(100);
      setDataFetched(true);
    } catch (error) {
      toast.error("An error occurred while fetching the order details.");
      setProgress(100);
      setDataFetched(true);
    }
  }, [id]);

  const getCoupons = useCallback(async () => {
    setProgress(50);
    try {
      const response = await ordersService.getCoupons();
      if (response.success && response.status === 201) {
        setCoupons(response.coupons);
        setProgress(100);
      } else {
        console.log(response.error || "Failed to load coupons");
        setProgress(100);
      }
    } catch (error) {
      console.log("An error occurred while loading coupons");
      setProgress(100);
    }
  }, []);

  useEffect(() => {
    getOrder();
    getCoupons();
  }, [getOrder, getCoupons]);

  // Fetch label after order details are loaded
  useEffect(() => {
    const fetchLabel = async () => {
      if (!orderDetail) return;

      try {
        // Get label directly for the order
        const response = await ordersService.getLabelOfOrder(id);
        if (response.success && response.label) {
          setOrderLabel(response.label);
        }
      } catch (error) {
        console.log("Error fetching label:", error);
      }
    };

    fetchLabel();
  }, [orderDetail, id]);

  useEffect(() => {
    if (dataFetched) {
      toast.success("Order details retrieved successfully.");
    }
  }, [dataFetched]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrderDetails({ ...updatedOrderDetails, [name]: value });
  };

  const handleShippingDetailsChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrderDetails({
      ...updatedOrderDetails,
      shippingDetails: {
        ...updatedOrderDetails.shippingDetails,
        [name]: value,
      },
    });
  };

  const handleContactDetailsChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrderDetails({
      ...updatedOrderDetails,
      contactDetails: { ...updatedOrderDetails.contactDetails, [name]: value },
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Recalculate total based on updated cart
      const cartTotal = updatedOrderDetails.cart.reduce(
        (acc, item) => acc + item.salePrice * item.qty,
        0
      );

      // Determine the coupon to send
      let couponToSend;
      if (updatedOrderDetails.appliedCoupon) {
        // New coupon was applied
        couponToSend = [updatedOrderDetails.appliedCoupon];
      } else if (
        Object.prototype.hasOwnProperty.call(updatedOrderDetails, "coupon") &&
        (updatedOrderDetails.coupon === "" ||
          (Array.isArray(updatedOrderDetails.coupon) &&
            updatedOrderDetails.coupon.length === 0))
      ) {
        // Coupon was explicitly removed
        couponToSend = [];
      } else {
        // No change to coupon, use original
        couponToSend = orderDetail.coupon;
      }

      const updatedOrderData = {
        ...updatedOrderDetails,
        cart: updatedOrderDetails.cart,
        coupon: couponToSend,
        totalOrderValue: updatedOrderDetails.discountedTotal || cartTotal,
      };

      const response = await ordersService.updateOrder(id, updatedOrderData);

      if (response.success && response.status === 200) {
        console.log("Updated data response:", response.data);
        setOrderDetail(response.order || updatedOrderDetails);
        setIsEditing(false);
        toast.success("Order details updated successfully.");
      } else {
        console.error("Failed to update order details:", response.error);
        toast.error(response.error || "Failed to update order details.");
      }
    } catch (error) {
      console.error("An error occurred while updating order details:", error);
      toast.error("An error occurred while updating the order details.");
    }
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
        total =
          total -
          (coupon.upto
            ? Math.min(discountAmount, coupon.upto)
            : discountAmount);
      }
    }

    return total > 0 ? total.toFixed(2) : "0.00";
  };

  const recalculateCouponDiscount = (cart, appliedCoupon) => {
    if (!appliedCoupon) return null;

    const cartTotal = cart.reduce(
      (acc, item) => acc + item.salePrice * item.qty,
      0
    );
    const discounted = calculateDiscountedPrice(cartTotal, appliedCoupon);
    return discounted;
  };

  const handleApplyCoupon = (enteredCoupon) => {
    const appliedCoupon = coupons.find(
      (coupon) => coupon.code.toLowerCase() === enteredCoupon.toLowerCase()
    );

    if (appliedCoupon) {
      const totalSalePrice = (
        updatedOrderDetails?.cart || orderDetail.cart
      ).reduce((acc, item) => acc + item.salePrice * item.qty, 0);
      const newTotal = calculateDiscountedPrice(totalSalePrice, appliedCoupon);
      console.log("New Total After Discount: £", newTotal);
      setUpdatedOrderDetails({
        ...updatedOrderDetails,
        discountedTotal: newTotal,
        appliedCoupon: appliedCoupon,
      });

      toast.success("Coupon applied successfully!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleAddProduct = (product) => {
    console.log("Adding product:", product);

    const currentCart = updatedOrderDetails.cart || [];
    const newCart = [...currentCart, product];

    console.log("Updated cart:", newCart);

    // Recalculate discount if coupon is applied
    const newDiscountedTotal = updatedOrderDetails.appliedCoupon
      ? recalculateCouponDiscount(newCart, updatedOrderDetails.appliedCoupon)
      : null;

    setUpdatedOrderDetails({
      ...updatedOrderDetails,
      cart: newCart,
      discountedTotal: newDiscountedTotal,
    });

    toast.success(`${product.productName || product.name} added to order`);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity < 1 || isNaN(quantity)) return;

    const updatedCart = [...updatedOrderDetails.cart];
    updatedCart[index] = {
      ...updatedCart[index],
      qty: quantity,
    };

    // Recalculate discount if coupon is applied
    const newDiscountedTotal = updatedOrderDetails.appliedCoupon
      ? recalculateCouponDiscount(
          updatedCart,
          updatedOrderDetails.appliedCoupon
        )
      : null;

    setUpdatedOrderDetails({
      ...updatedOrderDetails,
      cart: updatedCart,
      discountedTotal: newDiscountedTotal,
    });
  };

  const handlePriceChange = (index, newPrice) => {
    const price = parseFloat(newPrice);
    if (price < 0 || isNaN(price)) return;

    const updatedCart = [...updatedOrderDetails.cart];
    updatedCart[index] = {
      ...updatedCart[index],
      salePrice: price,
    };

    // Recalculate discount if coupon is applied
    const newDiscountedTotal = updatedOrderDetails.appliedCoupon
      ? recalculateCouponDiscount(
          updatedCart,
          updatedOrderDetails.appliedCoupon
        )
      : null;

    setUpdatedOrderDetails({
      ...updatedOrderDetails,
      cart: updatedCart,
      discountedTotal: newDiscountedTotal,
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedCart = updatedOrderDetails.cart.filter((_, i) => i !== index);

    // Recalculate discount if coupon is applied
    const newDiscountedTotal = updatedOrderDetails.appliedCoupon
      ? recalculateCouponDiscount(
          updatedCart,
          updatedOrderDetails.appliedCoupon
        )
      : null;

    setUpdatedOrderDetails({
      ...updatedOrderDetails,
      cart: updatedCart,
      discountedTotal: newDiscountedTotal,
    });

    toast.success("Product removed from order");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLabelClick = () => {
    setIsLabelModalOpen(true);
  };

  const handleLabelApply = (labelData) => {
    setOrderLabel(labelData);
    setIsLabelModalOpen(false);
  };

  const handleShippingUpdateClick = () => {
    setIsShippingModalOpen(true);
  };

  const handleShippingUpdateClose = () => {
    setIsShippingModalOpen(false);
  };

  const handleShippingUpdate = async (updateData) => {
    setIsShippingUpdating(true);
    try {
      const response = await ordersService.updateOrderShipping(id, updateData);

      if (response.success && response.status === 200) {
        toast.success("Shipping details updated successfully.");

        // Update local state with new values
        setOrderDetail((prev) => ({
          ...prev,
          status: updateData.status,
          shippingDetails: {
            ...prev.shippingDetails,
            ...updateData.shippingDetails,
          },
          ...(updateData.refund && { refund: updateData.refund }),
        }));

        setUpdatedOrderDetails((prev) => ({
          ...prev,
          status: updateData.status,
          shippingDetails: {
            ...prev.shippingDetails,
            ...updateData.shippingDetails,
          },
          ...(updateData.refund && { refund: updateData.refund }),
        }));

        setIsShippingModalOpen(false);
      } else {
        toast.error(response.error || "Failed to update shipping details.");
      }
    } catch (error) {
      console.error("Error updating shipping details:", error);
      toast.error("An error occurred while updating shipping details.");
    } finally {
      setIsShippingUpdating(false);
    }
  };

  // Calculate order total for refund validation
  const calculateOrderTotal = () => {
    if (!orderDetail) return 0;
    const cartTotal =
      orderDetail.cart?.reduce(
        (acc, item) => acc + item.salePrice * item.qty,
        0
      ) || 0;
    const coupon = Array.isArray(orderDetail.coupon)
      ? orderDetail.coupon[0]
      : orderDetail.coupon;
    return parseFloat(calculateDiscountedPrice(cartTotal, coupon));
  };

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ordersService.getUnreadCountsForOrders([id]);
      if (response.success && response.unreadCounts) {
        setUnreadCount(response.unreadCounts[id] || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [id]);

  // Fetch unread count when order loads
  useEffect(() => {
    if (orderDetail) {
      fetchUnreadCount();
    }
  }, [orderDetail, fetchUnreadCount]);

  // Handle delete order
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }
    setProgress(50);
    try {
      const response = await ordersService.deleteOrder(id);
      if (response.success && response.status === 201) {
        toast.success(response.message || "Order deleted successfully");
        setProgress(100);
        navigate("/admin/orders");
      } else {
        toast.error(response.error || "Failed to delete order");
        setProgress(100);
      }
    } catch (error) {
      toast.error("Error deleting order");
      setProgress(100);
    }
  };

  // Handle open return modal
  const handleOpenReturnModal = () => {
    setIsReturnModalOpen(true);
  };

  // Handle open message modal
  const handleOpenMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  // Handle close message modal
  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    // Refresh unread count after closing
    fetchUnreadCount();
  };

  return (
    <>
      <Helmet>
        <title>Order Details</title>
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
        <main className="py-5 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
          {orderDetail ? (
            <div className="px-4 sm:px-6 lg:px-8">
              <div className=" mt-5 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm">
                <OrderHeader
                  orderNumber={orderDetail.orderNumber}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onCancel={() => {
                    setIsEditing(false);
                    setUpdatedOrderDetails(orderDetail);
                  }}
                  onSave={handleSaveChanges}
                  onAddProduct={() => setIsAddProductModalOpen(true)}
                  onShip={handleShippingUpdateClick}
                  onReturn={handleOpenReturnModal}
                  onMessage={handleOpenMessageModal}
                  onDelete={handleDelete}
                  unreadCount={unreadCount}
                />

                {/* Order Timeline - Full Width Horizontal */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700">Order Timeline</h3>
                  </div>

                  <div className="relative flex items-start justify-between">
                    {/* Connecting Line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                    <div
                      className="absolute top-5 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
                      style={{
                        width: orderDetail.returnOrderId
                          ? '100%'
                          : orderDetail.returnRequestInitiated
                            ? '50%'
                            : '0%'
                      }}
                    ></div>

                    {/* Step 1: Order Created */}
                    <div className="relative z-10 flex flex-col items-center flex-1">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold text-gray-900">Order Created</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(orderDetail.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(orderDetail.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Return Request */}
                    <div className="relative z-10 flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all ${
                        orderDetail.returnRequestInitiated
                          ? 'bg-yellow-500'
                          : 'bg-gray-200'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${orderDetail.returnRequestInitiated ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center">
                        {orderDetail.returnRequestInitiated ? (
                          <>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900">Return Request</p>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {orderDetail.returnRequestInitiatedAt ? formatDate(orderDetail.returnRequestInitiatedAt) : '-'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {orderDetail.returnRequestInitiatedAt ? formatTime(orderDetail.returnRequestInitiatedAt) : ''}
                            </p>
                            {orderDetail.returnRequestId && (
                              <a
                                href={`/admin/edit-return-request/${orderDetail.returnRequestId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-[10px] font-medium transition-colors"
                              >
                                View Request
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-400">Return Request</p>
                            <p className="text-xs text-gray-400 mt-0.5">Not initiated</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Return Order */}
                    <div className="relative z-10 flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all ${
                        orderDetail.returnOrderId
                          ? 'bg-blue-500'
                          : orderDetail.returnRequestInitiated
                            ? 'bg-gray-200 animate-pulse'
                            : 'bg-gray-200'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${orderDetail.returnOrderId ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center">
                        {orderDetail.returnOrderId ? (
                          <>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900">Return Order</p>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                Converted
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {orderDetail.returnOrderConvertedAt ? formatDate(orderDetail.returnOrderConvertedAt) : '-'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {orderDetail.returnOrderConvertedAt ? formatTime(orderDetail.returnOrderConvertedAt) : ''}
                            </p>
                            <a
                              href={`/admin/edit-return-orders/${orderDetail.returnOrderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-[10px] font-medium transition-colors"
                            >
                              View Return Order
                            </a>
                          </>
                        ) : orderDetail.returnRequestInitiated ? (
                          <>
                            <p className="text-sm font-medium text-gray-400">Return Order</p>
                            <p className="text-xs text-gray-400 mt-0.5">Awaiting approval...</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-400">Return Order</p>
                            <p className="text-xs text-gray-400 mt-0.5">-</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {/* Card View - 3rd column */}
                  <div className="lg:col-span-1">
                    <div className="space-y-3 pr-2 shadow-sm rounded-xl border border-gray-200 bg-white max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-webkit">
                      {updatedOrderDetails?.cart &&
                        Array.isArray(updatedOrderDetails.cart) &&
                        updatedOrderDetails.cart.map((item, index) => {
                          // Check if it's a trade-in product
                          const isTradeIn = item.isTradeIn === true;

                          const imageUrl = getOrderLineItemImageUrl(
                            item,
                            BACKEND_URL
                          );

                          // Check if it's a variant product (has '-' separators) or single product
                          const isVariantProduct =
                            item.name && item.name.includes("-");

                          const productName = item.name || "";
                          const nameParts = isVariantProduct
                            ? item.name.split("-")
                            : [];
                          const color = isVariantProduct ? nameParts[1] : "-";
                          const storage = isVariantProduct
                            ? nameParts[nameParts.length - 1]
                            : "-";
                          const modifiedProductName = productName.replace(
                            /\s*\([^)]+\)/,
                            ""
                          );
                          const modifiedColor = color
                            ? color.replace(/\s*\([^)]+\)/, "")
                            : "-";

                          // Trade-in specific data
                          const tradeInStorage =
                            item.tradeInData?.storageName || "-";
                          const tradeInCondition =
                            item.tradeInData?.conditionName || "-";

                          return (
                            <div
                              key={index}
                              className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                            >
                              {/* Compact Horizontal Layout */}
                              <div className="flex gap-3">
                                {/* Product Image - Smaller */}
                                <div className="flex-shrink-0">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={item.name}
                                      className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                                      <span className="text-gray-400 text-xs font-medium">
                                        No Image
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Product Details - Compact */}
                                <div className="flex-1 min-w-0">
                                  {/* Product Name & Badge */}
                                  <div className="flex items-start gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight flex-1">
                                      {item.productName || item.name}
                                    </h3>
                                    {isTradeIn && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white flex-shrink-0">
                                        🔄
                                      </span>
                                    )}
                                  </div>

                                  {/* Variant Name */}
                                  {isVariantProduct && !isTradeIn && (
                                    <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">
                                      {modifiedProductName}
                                    </p>
                                  )}

                                  {/* SIM Info - Compact */}
                                  {item.selectedSim && (
                                    <p className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block mb-1.5">
                                      📱 {item.selectedSim}
                                    </p>
                                  )}

                                  {/* Compact Info Grid */}
                                  <div className="flex items-center gap-3 text-xs mb-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">
                                        Color:
                                      </span>
                                      {isTradeIn ? (
                                        <span className="text-gray-400">
                                          N/A
                                        </span>
                                      ) : (
                                        <span className="font-semibold text-gray-700">
                                          {modifiedColor}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-gray-300">•</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">
                                        Storage:
                                      </span>
                                      <span className="font-semibold text-gray-700">
                                        {isTradeIn
                                          ? tradeInStorage
                                          : storage || "-"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Trade-in Details - Compact */}
                                  {isTradeIn && item.tradeInData && (
                                    <div className="mb-2 p-2 rounded-lg border-l-2 border-blue-400 bg-blue-50/50">
                                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                                        <div>
                                          <span className="text-gray-500 text-[10px] uppercase">
                                            Brand:
                                          </span>
                                          <p className="font-bold text-gray-900">
                                            {item.tradeInData.brandName}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 text-[10px] uppercase">
                                            Condition:
                                          </span>
                                          <p className="font-bold text-blue-700">
                                            {tradeInCondition}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Quantity, Price, Total - Inline */}
                                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-xs">
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">
                                          Qty:
                                        </span>
                                        {isEditing && !isTradeIn ? (
                                          <input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) =>
                                              handleQuantityChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="w-12 px-1.5 py-0.5 border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold"
                                          />
                                        ) : (
                                          <span
                                            className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${
                                              isTradeIn
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                          >
                                            {item.qty}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">
                                          Price:
                                        </span>
                                        {isEditing && !isTradeIn ? (
                                          <div className="flex items-center gap-0.5">
                                            <span className="text-gray-600 text-xs">
                                              £
                                            </span>
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={item.salePrice}
                                              onChange={(e) =>
                                                handlePriceChange(
                                                  index,
                                                  e.target.value
                                                )
                                              }
                                              className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-semibold"
                                            />
                                          </div>
                                        ) : (
                                          <span className="font-semibold text-gray-900 text-xs">
                                            £{item.salePrice.toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span
                                        className={`text-sm font-bold ${
                                          isTradeIn
                                            ? "text-blue-700"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        £
                                        {(item.salePrice * item.qty).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Remove Button - Compact */}
                                  {isEditing && (
                                    <button
                                      onClick={() => handleRemoveProduct(index)}
                                      className="mt-2 w-full px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-1"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Order Summary - Subtotal, Discount, and Total */}
                      {(() => {
                        // Calculate cart subtotal
                        const cartSubtotal = (
                          updatedOrderDetails?.cart ||
                          orderDetail?.cart ||
                          []
                        ).reduce(
                          (acc, item) => acc + item.salePrice * item.qty,
                          0
                        );

                        // Get active coupon (same logic as OrderTotals)
                        const getActiveCoupon = () => {
                          // Check if coupon was applied during editing
                          if (updatedOrderDetails?.appliedCoupon) {
                            return updatedOrderDetails.appliedCoupon;
                          }

                          // Check if coupon was explicitly removed
                          if (
                            Object.prototype.hasOwnProperty.call(
                              updatedOrderDetails,
                              "coupon"
                            ) &&
                            (updatedOrderDetails.coupon === "" ||
                              (Array.isArray(updatedOrderDetails.coupon) &&
                                updatedOrderDetails.coupon.length === 0))
                          ) {
                            return null;
                          }

                          // Check if coupon exists in updatedOrderDetails (array)
                          if (
                            updatedOrderDetails?.coupon &&
                            Array.isArray(updatedOrderDetails.coupon) &&
                            updatedOrderDetails.coupon.length > 0
                          ) {
                            return updatedOrderDetails.coupon[0];
                          }

                          // Check if original order has a coupon
                          if (
                            orderDetail?.coupon &&
                            Array.isArray(orderDetail.coupon) &&
                            orderDetail.coupon.length > 0
                          ) {
                            return orderDetail.coupon[0];
                          }

                          return null;
                        };

                        const activeCoupon = getActiveCoupon();

                        // Calculate discount amount
                        let discountAmount = 0;
                        if (activeCoupon) {
                          if (activeCoupon.discount_type === "flat") {
                            discountAmount = activeCoupon.discount;
                          } else if (
                            activeCoupon.discount_type === "percentage"
                          ) {
                            const percentageDiscount =
                              (cartSubtotal * activeCoupon.discount) / 100;
                            discountAmount = activeCoupon.upto
                              ? Math.min(percentageDiscount, activeCoupon.upto)
                              : percentageDiscount;
                          }
                        }

                        // Calculate final total
                        const finalTotal =
                          updatedOrderDetails?.totalOrderValue ||
                          (updatedOrderDetails?.discountedTotal
                            ? parseFloat(updatedOrderDetails.discountedTotal)
                            : cartSubtotal - discountAmount);

                        const hasDiscount =
                          activeCoupon || updatedOrderDetails?.discountedTotal;

                        return (
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-t-2 border-gray-200 sticky bottom-0">
                            <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                              Order Summary
                            </h3>

                            {isEditing ? (
                              <div className="space-y-2">
                                {/* Coupon Input and Apply Button */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Coupon code"
                                    value={
                                      activeCoupon
                                        ? activeCoupon.code
                                        : typeof updatedOrderDetails?.coupon ===
                                          "string"
                                        ? updatedOrderDetails.coupon
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setUpdatedOrderDetails({
                                        ...updatedOrderDetails,
                                        coupon: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium"
                                    disabled={!!activeCoupon}
                                  />
                                  <button
                                    onClick={() =>
                                      handleApplyCoupon(
                                        updatedOrderDetails?.coupon || ""
                                      )
                                    }
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-xs shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={!!activeCoupon}
                                  >
                                    Apply
                                  </button>
                                </div>

                                {/* Display applied coupon with remove button */}
                                {activeCoupon && (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-block bg-yellow-400 text-white px-3 py-1 rounded text-xs font-bold">
                                      {activeCoupon.code} Applied
                                    </span>
                                    <button
                                      onClick={() =>
                                        setUpdatedOrderDetails({
                                          ...updatedOrderDetails,
                                          appliedCoupon: null,
                                          discountedTotal: null,
                                          coupon: "",
                                        })
                                      }
                                      className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}

                                {/* Display cart total before discount */}
                                <div className="flex items-center justify-between text-xs">
                                  <span
                                    className={
                                      hasDiscount
                                        ? "text-gray-600"
                                        : "text-gray-700 font-semibold"
                                    }
                                  >
                                    {hasDiscount ? "Subtotal:" : "Total:"}
                                  </span>
                                  <span
                                    className={
                                      hasDiscount
                                        ? "text-gray-600"
                                        : "text-base font-bold text-blue-600"
                                    }
                                  >
                                    £{cartSubtotal.toFixed(2)}
                                  </span>
                                </div>

                                {/* Display discount amount */}
                                {hasDiscount && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">
                                      Discount:
                                    </span>
                                    <span className="font-bold text-blue-600">
                                      -£{(cartSubtotal - finalTotal).toFixed(2)}
                                    </span>
                                  </div>
                                )}

                                {/* Display the discounted total */}
                                {hasDiscount && (
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <span className="text-sm font-bold text-gray-900">
                                      Total After Discount:
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                      £{finalTotal.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {/* Coupon Badge */}
                                {hasDiscount && activeCoupon && (
                                  <div className="mb-2">
                                    <span className="inline-block bg-yellow-400 text-white px-3 py-1 rounded text-xs font-bold">
                                      {activeCoupon.code} Applied
                                    </span>
                                  </div>
                                )}

                                {/* Subtotal */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">
                                    Subtotal:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    £{cartSubtotal.toFixed(2)}
                                  </span>
                                </div>

                                {/* Discount */}
                                {hasDiscount && discountAmount > 0 && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">
                                      Discount
                                      {activeCoupon?.discount_type ===
                                      "percentage"
                                        ? ` (${activeCoupon.discount}%)`
                                        : ""}
                                      :
                                    </span>
                                    <span className="font-bold text-blue-600">
                                      -£{discountAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}

                                {/* Total */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                  <span className="text-sm font-bold text-gray-900">
                                    Total:
                                  </span>
                                  <span className="text-lg font-bold text-blue-600">
                                    £{finalTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <OrderInfo
                    orderDetail={orderDetail}
                    updatedOrderDetails={updatedOrderDetails}
                    isEditing={isEditing}
                    onInputChange={handleInputChange}
                    onShippingChange={handleShippingDetailsChange}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    checkoutLabel={orderLabel}
                    onLabelClick={handleLabelClick}
                    onShippingUpdateClick={handleShippingUpdateClick}
                  />

                  <div className="space-y-2 border border-gray-200 rounded-xl ">
                    <CustomerDetails
                      orderDetail={orderDetail}
                      updatedOrderDetails={updatedOrderDetails}
                      isEditing={isEditing}
                      onShippingChange={handleShippingDetailsChange}
                      onContactChange={handleContactDetailsChange}
                    />

                    <AddressDetails
                      updatedOrderDetails={updatedOrderDetails}
                      isEditing={isEditing}
                      onShippingChange={handleShippingDetailsChange}
                    />

                  </div>
                </div>
              </div>

              <RefundDetails
                orderDetail={orderDetail}
                updatedOrderDetails={updatedOrderDetails}
                isEditing={isEditing}
                onInputChange={handleInputChange}
                setUpdatedOrderDetails={setUpdatedOrderDetails}
              />

              {/* Your Order Items Section */}
              {false && (
                <div className="mt-8 sm:mt-10 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-100">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Your Order Items
                      </h1>
                      <p className="text-sm text-gray-500 mt-1">
                        Review and manage order items
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Product
                      </button>
                    )}
                  </div>

                  {/* Mobile Card View - visible on small screens */}
                  <div className="block md:hidden">
                    <OrderItemsCard
                      updatedOrderDetails={updatedOrderDetails}
                      isEditing={isEditing}
                      handleQuantityChange={handleQuantityChange}
                      handlePriceChange={handlePriceChange}
                      handleRemoveProduct={handleRemoveProduct}
                    />
                    <OrderTotalsCard
                      orderDetail={orderDetail}
                      updatedOrderDetails={updatedOrderDetails}
                      isEditing={isEditing}
                      onApplyCoupon={handleApplyCoupon}
                      setUpdatedOrderDetails={setUpdatedOrderDetails}
                    />
                  </div>

                  {/* Desktop Table and Card View - visible on medium screens and up */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Table View - 2 columns */}
                      <div className="lg:col-span-2 overflow-x-auto scrollbar-thin scrollbar-webkit">
                        <div className="space-y-4">
                          <table className="table-auto w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                  Product
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                  Product Name
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                  Color
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                  Storage
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                                  Total
                                </th>
                                {isEditing && (
                                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Actions
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {updatedOrderDetails?.cart &&
                                Array.isArray(updatedOrderDetails.cart) &&
                                updatedOrderDetails.cart.map((item, index) => {
                                  // Check if it's a trade-in product
                                  const isTradeIn = item.isTradeIn === true;

                                  const imageUrl = getOrderLineItemImageUrl(
                                    item,
                                    BACKEND_URL
                                  );

                                  // Check if it's a variant product (has '-' separators) or single product
                                  const isVariantProduct =
                                    item.name && item.name.includes("-");

                                  const productName = item.name || "";
                                  const nameParts = isVariantProduct
                                    ? item.name.split("-")
                                    : [];
                                  const color = isVariantProduct
                                    ? nameParts[1]
                                    : "-";
                                  const storage = isVariantProduct
                                    ? nameParts[nameParts.length - 1]
                                    : "-";
                                  const modifiedProductName =
                                    productName.replace(/\s*\([^)]+\)/, "");
                                  const modifiedColor = color
                                    ? color.replace(/\s*\([^)]+\)/, "")
                                    : "-";

                                  // Trade-in specific data
                                  const tradeInStorage =
                                    item.tradeInData?.storageName || "-";
                                  const tradeInCondition =
                                    item.tradeInData?.conditionName || "-";

                                  return (
                                    <tr
                                      key={index}
                                      className={`border-b border-gray-200 hover:bg-gray-50/50 transition-colors duration-150`}
                                    >
                                      <td className="px-6 py-4">
                                        {imageUrl ? (
                                          <div className="relative group">
                                            <img
                                              src={imageUrl}
                                              alt={item.name}
                                              className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-200"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                                            <span className="text-gray-400 text-xs font-medium">
                                              No Image
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-left font-medium text-gray-900">
                                        <div className="flex flex-col gap-1.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold">
                                              {item.productName || item.name}
                                            </span>
                                            {isTradeIn && (
                                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg">
                                                🔄 TRADE-IN
                                              </span>
                                            )}
                                          </div>
                                          {isVariantProduct && !isTradeIn && (
                                            <span className="text-sm text-gray-600 font-medium">
                                              {modifiedProductName}
                                            </span>
                                          )}
                                          {isTradeIn && item.tradeInData && (
                                            <div className="mt-3 p-4 rounded-xl border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
                                              <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="bg-white/60 rounded-lg p-2">
                                                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                                    Brand
                                                  </p>
                                                  <p className="font-bold text-gray-900 text-base">
                                                    {item.tradeInData.brandName}
                                                  </p>
                                                </div>
                                                <div className="bg-white/60 rounded-lg p-2">
                                                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                                    Category
                                                  </p>
                                                  <p className="font-bold text-gray-900 text-base">
                                                    {
                                                      item.tradeInData
                                                        .categoryName
                                                    }
                                                  </p>
                                                </div>
                                                <div className="bg-white/60 rounded-lg p-2">
                                                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                                    Condition
                                                  </p>
                                                  <p className="font-bold text-blue-700 text-base">
                                                    {tradeInCondition}
                                                  </p>
                                                </div>
                                                <div className="bg-white/60 rounded-lg p-2">
                                                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                                    Trade Value
                                                  </p>
                                                  <p className="font-bold text-blue-700 text-lg">
                                                    £
                                                    {
                                                      item.tradeInData
                                                        .tradeInValue
                                                    }
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {item.selectedSim && (
                                            <p className="text-sm text-gray-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-lg inline-block border border-purple-200 mt-2">
                                              📱 With Free SIM:{" "}
                                              <span className="font-bold text-purple-700">
                                                {item.selectedSim}
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {isTradeIn ? (
                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                                            N/A
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                                            {modifiedColor}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {isTradeIn ? (
                                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-100 text-blue-700">
                                            {tradeInStorage}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                                            {storage || "-"}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {isEditing && !isTradeIn ? (
                                          <input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) =>
                                              handleQuantityChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
                                          />
                                        ) : (
                                          <span
                                            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-base ${
                                              isTradeIn && isEditing
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                          >
                                            {item.qty}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-right font-semibold">
                                        {isEditing && !isTradeIn ? (
                                          <div className="flex items-center justify-end gap-1">
                                            <span className="text-gray-600 font-semibold">
                                              £
                                            </span>
                                            <input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              value={item.salePrice}
                                              onChange={(e) =>
                                                handlePriceChange(
                                                  index,
                                                  e.target.value
                                                )
                                              }
                                              className="w-28 px-3 py-2 border-2 border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
                                            />
                                          </div>
                                        ) : (
                                          <div className="text-right">
                                            <span
                                              className={`text-xl font-bold ${
                                                isTradeIn
                                                  ? "text-blue-700"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              £
                                              {(
                                                item.salePrice * item.qty
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        )}
                                      </td>
                                      {isEditing && (
                                        <td className="px-6 py-4 text-center">
                                          <button
                                            onClick={() =>
                                              handleRemoveProduct(index)
                                            }
                                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1.5 mx-auto"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            Remove
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}

                              <OrderTotals
                                orderDetail={orderDetail}
                                updatedOrderDetails={updatedOrderDetails}
                                isEditing={isEditing}
                                onApplyCoupon={handleApplyCoupon}
                                setUpdatedOrderDetails={setUpdatedOrderDetails}
                              />
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Card View - 1 column */}
                      <div className="lg:col-span-1">
                        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-webkit pr-2">
                          {updatedOrderDetails?.cart &&
                            Array.isArray(updatedOrderDetails.cart) &&
                            updatedOrderDetails.cart.map((item, index) => {
                              // Check if it's a trade-in product
                              const isTradeIn = item.isTradeIn === true;

                              const imageUrl = getOrderLineItemImageUrl(
                                item,
                                BACKEND_URL
                              );

                              // Check if it's a variant product (has '-' separators) or single product
                              const isVariantProduct =
                                item.name && item.name.includes("-");

                              const productName = item.name || "";
                              const nameParts = isVariantProduct
                                ? item.name.split("-")
                                : [];
                              const color = isVariantProduct
                                ? nameParts[1]
                                : "-";
                              const storage = isVariantProduct
                                ? nameParts[nameParts.length - 1]
                                : "-";
                              const modifiedProductName = productName.replace(
                                /\s*\([^)]+\)/,
                                ""
                              );
                              const modifiedColor = color
                                ? color.replace(/\s*\([^)]+\)/, "")
                                : "-";

                              // Trade-in specific data
                              const tradeInStorage =
                                item.tradeInData?.storageName || "-";
                              const tradeInCondition =
                                item.tradeInData?.conditionName || "-";

                              return (
                                <div
                                  key={index}
                                  className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  {/* Product Image */}
                                  <div className="flex justify-center mb-4">
                                    {imageUrl ? (
                                      <img
                                        src={imageUrl}
                                        alt={item.name}
                                        className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-md"
                                      />
                                    ) : (
                                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                                        <span className="text-gray-400 text-xs font-medium">
                                          No Image
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Name */}
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 flex-wrap justify-center mb-2">
                                      <h3 className="font-bold text-gray-900 text-center">
                                        {item.productName || item.name}
                                      </h3>
                                      {isTradeIn && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg">
                                          🔄 TRADE-IN
                                        </span>
                                      )}
                                    </div>
                                    {isVariantProduct && !isTradeIn && (
                                      <p className="text-sm text-gray-600 font-medium text-center">
                                        {modifiedProductName}
                                      </p>
                                    )}
                                  </div>

                                  {/* Trade-in Details */}
                                  {isTradeIn && item.tradeInData && (
                                    <div className="mb-4 p-4 rounded-xl border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-white/60 rounded-lg p-2">
                                          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                            Brand
                                          </p>
                                          <p className="font-bold text-gray-900 text-sm">
                                            {item.tradeInData.brandName}
                                          </p>
                                        </div>
                                        <div className="bg-white/60 rounded-lg p-2">
                                          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                            Category
                                          </p>
                                          <p className="font-bold text-gray-900 text-sm">
                                            {item.tradeInData.categoryName}
                                          </p>
                                        </div>
                                        <div className="bg-white/60 rounded-lg p-2">
                                          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                            Condition
                                          </p>
                                          <p className="font-bold text-blue-700 text-sm">
                                            {tradeInCondition}
                                          </p>
                                        </div>
                                        <div className="bg-white/60 rounded-lg p-2">
                                          <p className="text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">
                                            Trade Value
                                          </p>
                                          <p className="font-bold text-blue-700 text-base">
                                            £{item.tradeInData.tradeInValue}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* SIM Info */}
                                  {item.selectedSim && (
                                    <div className="mb-4 text-center">
                                      <p className="text-sm text-gray-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-lg inline-block border border-purple-200">
                                        📱 With Free SIM:{" "}
                                        <span className="font-bold text-purple-700">
                                          {item.selectedSim}
                                        </span>
                                      </p>
                                    </div>
                                  )}

                                  {/* Product Details Grid */}
                                  <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Color
                                      </p>
                                      {isTradeIn ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                          N/A
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                          {modifiedColor}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Storage
                                      </p>
                                      {isTradeIn ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                                          {tradeInStorage}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                          {storage || "-"}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quantity and Price */}
                                  <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-semibold text-gray-700">
                                        Quantity:
                                      </span>
                                      {isEditing && !isTradeIn ? (
                                        <input
                                          type="number"
                                          min="1"
                                          value={item.qty}
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          className="w-20 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-sm"
                                        />
                                      ) : (
                                        <span
                                          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-base ${
                                            isTradeIn && isEditing
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-blue-100 text-blue-700"
                                          }`}
                                        >
                                          {item.qty}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-semibold text-gray-700">
                                        Price:
                                      </span>
                                      {isEditing && !isTradeIn ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-gray-600 font-semibold text-sm">
                                            £
                                          </span>
                                          <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.salePrice}
                                            onChange={(e) =>
                                              handlePriceChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="w-24 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-sm"
                                          />
                                        </div>
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-900">
                                          £{item.salePrice.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                      <span className="text-base font-bold text-gray-900">
                                        Total:
                                      </span>
                                      <span
                                        className={`text-lg font-bold ${
                                          isTradeIn
                                            ? "text-blue-700"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        £
                                        {(item.salePrice * item.qty).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Remove Button */}
                                  {isEditing && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <button
                                        onClick={() =>
                                          handleRemoveProduct(index)
                                        }
                                        className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Remove Product
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>No order details found.</p>
          )}
        </main>
      </div>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <OrderLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        onApply={handleLabelApply}
        orderId={id}
      />

      <ShippingUpdateModal
        isOpen={isShippingModalOpen}
        onClose={handleShippingUpdateClose}
        onSubmit={handleShippingUpdate}
        currentStatus={orderDetail?.status}
        currentProvider={orderDetail?.shippingDetails?.provider}
        currentTrackingNumber={orderDetail?.shippingDetails?.trackingNumber}
        currentNotes={orderDetail?.shippingDetails?.notes}
        orderTotal={calculateOrderTotal()}
        isLoading={isShippingUpdating}
      />

      {/* Return Item Modal */}
      {isReturnModalOpen && orderDetail && (
        <ReturnItemModal
          isReturnModalOpen={isReturnModalOpen}
          setIsReturnModalOpen={setIsReturnModalOpen}
          selectedOrderData={orderDetail}
        />
      )}

      {/* Order Chat Modal */}
      <OrderChatModal
        isOpen={isMessageModalOpen}
        onClose={handleCloseMessageModal}
        order={orderDetail}
      />
    </>
  );
};

export default OrderDetails;
