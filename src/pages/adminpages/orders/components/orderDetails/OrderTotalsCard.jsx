import PropTypes from 'prop-types';

const OrderTotalsCard = ({
    orderDetail,
    updatedOrderDetails,
    isEditing,
    onApplyCoupon,
    setUpdatedOrderDetails
}) => {
    // Calculate cart total dynamically
    const calculateCartTotal = () => {
        const cart = updatedOrderDetails?.cart || orderDetail.cart || [];
        return cart.reduce((acc, item) => acc + (item.salePrice * item.qty), 0);
    };

    // Get the active coupon (either from updated state or original order)
    const getActiveCoupon = () => {
        // Check if coupon was applied during editing
        if (updatedOrderDetails.appliedCoupon) {
            return updatedOrderDetails.appliedCoupon;
        }

        // Check if coupon was explicitly removed (set to empty string or empty array)
        if (Object.prototype.hasOwnProperty.call(updatedOrderDetails, 'coupon') &&
            (updatedOrderDetails.coupon === '' ||
             (Array.isArray(updatedOrderDetails.coupon) && updatedOrderDetails.coupon.length === 0))) {
            return null;
        }

        // Check if coupon exists in updatedOrderDetails (array)
        if (updatedOrderDetails.coupon && Array.isArray(updatedOrderDetails.coupon) && updatedOrderDetails.coupon.length > 0) {
            return updatedOrderDetails.coupon[0];
        }

        // Check if original order has a coupon
        if (orderDetail.coupon && Array.isArray(orderDetail.coupon) && orderDetail.coupon.length > 0) {
            return orderDetail.coupon[0];
        }

        return null;
    };

    // Calculate discounted total dynamically
    const calculateDiscountedTotal = () => {
        const cartTotal = calculateCartTotal();
        const activeCoupon = getActiveCoupon();

        // If there's a manually set discounted total from coupon application, use it
        if (updatedOrderDetails.discountedTotal) {
            return parseFloat(updatedOrderDetails.discountedTotal);
        }

        // If there's an active coupon, calculate discount
        if (activeCoupon) {
            let discountAmount = 0;

            if (activeCoupon.discount_type === "flat") {
                discountAmount = activeCoupon.discount;
            } else if (activeCoupon.discount_type === "percentage") {
                const percentageDiscount = (cartTotal * activeCoupon.discount) / 100;
                discountAmount = activeCoupon.upto
                    ? Math.min(percentageDiscount, activeCoupon.upto)
                    : percentageDiscount;
            }

            return cartTotal - discountAmount;
        }

        // Otherwise, return the cart total
        return cartTotal;
    };

    const cartTotal = calculateCartTotal();
    const discountedTotal = calculateDiscountedTotal();
    const activeCoupon = getActiveCoupon();
    const hasDiscount = activeCoupon || updatedOrderDetails.discountedTotal;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            {isEditing ? (
                <div>
                    {/* Coupon Input and Apply Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={
                                activeCoupon
                                    ? activeCoupon.code
                                    : (typeof updatedOrderDetails.coupon === 'string'
                                        ? updatedOrderDetails.coupon
                                        : '')
                            }
                            onChange={(e) =>
                                setUpdatedOrderDetails({
                                    ...updatedOrderDetails,
                                    coupon: e.target.value,
                                })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            disabled={!!activeCoupon}
                        />
                        <button
                            onClick={() => onApplyCoupon(updatedOrderDetails.coupon)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                            disabled={!!activeCoupon}
                        >
                            Apply
                        </button>
                    </div>

                    {/* Display applied coupon with remove button */}
                    {activeCoupon && (
                        <div className="mb-3 flex items-center justify-between gap-2 p-2 bg-blue-50 rounded-md">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-semibold">
                                {activeCoupon.code} Applied
                            </span>
                            <button
                                onClick={() => setUpdatedOrderDetails({
                                    ...updatedOrderDetails,
                                    appliedCoupon: null,
                                    discountedTotal: null,
                                    coupon: ''
                                })}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Display cart total before discount */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className={hasDiscount ? "text-sm text-gray-600" : "text-base font-semibold text-gray-900"}>
                                {hasDiscount ? "Subtotal:" : "Total:"}
                            </span>
                            <span className={hasDiscount ? "text-sm text-gray-600" : "text-lg font-bold text-blue-600"}>
                                £{cartTotal.toFixed(2)}
                            </span>
                        </div>

                        {/* Display discount amount */}
                        {hasDiscount && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-blue-600 font-semibold">
                                    Discount:
                                </span>
                                <span className="text-sm text-blue-600 font-semibold">
                                    -£{(cartTotal - discountedTotal).toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Display the discounted total */}
                        {hasDiscount && (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-base font-semibold text-gray-900">
                                    Total After Discount:
                                </span>
                                <span className="text-lg font-bold text-blue-600">
                                    £{discountedTotal.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Calculate cart subtotal */}
                    {(() => {
                        const cartSubtotal = (updatedOrderDetails.cart || orderDetail.cart).reduce(
                            (acc, item) => acc + item.salePrice * item.qty,
                            0
                        );
                        const hasCoupon = orderDetail.coupon && orderDetail.coupon.length > 0;

                        // Calculate discount amount if coupon exists
                        let discountAmount = 0;
                        if (hasCoupon) {
                            const couponData = orderDetail.coupon[0];
                            if (couponData.discount_type === "flat") {
                                discountAmount = couponData.discount;
                            } else if (couponData.discount_type === "percentage") {
                                const percentageDiscount = (cartSubtotal * couponData.discount) / 100;
                                discountAmount = couponData.upto
                                    ? Math.min(percentageDiscount, couponData.upto)
                                    : percentageDiscount;
                            }
                        }

                        const finalTotal = updatedOrderDetails.totalOrderValue || (cartSubtotal - discountAmount);

                        return (
                            <div className="space-y-2">
                                {/* Display coupon code if exists */}
                                {hasCoupon && (
                                    <div className="mb-3">
                                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold text-sm">
                                            {orderDetail.coupon[0].code} Applied
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-3 space-y-2">
                                    {/* Display subtotal before discount */}
                                    {hasCoupon && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 line-through">
                                                Subtotal:
                                            </span>
                                            <span className="text-sm text-gray-600 line-through">
                                                £{cartSubtotal.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Display discount amount */}
                                    {hasCoupon && discountAmount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-blue-600 font-semibold">
                                                Discount ({orderDetail.coupon[0].discount_type === "percentage"
                                                    ? `${orderDetail.coupon[0].discount}%`
                                                    : 'Flat'}):
                                            </span>
                                            <span className="text-sm text-blue-600 font-semibold">
                                                -£{discountAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Display final total */}
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-base font-semibold text-gray-900">
                                            Total:
                                        </span>
                                        <span className="text-xl font-bold text-blue-600">
                                            £{finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

OrderTotalsCard.propTypes = {
    orderDetail: PropTypes.shape({
        cart: PropTypes.arrayOf(PropTypes.shape({
            salePrice: PropTypes.number.isRequired,
            qty: PropTypes.number.isRequired,
        })).isRequired,
        coupon: PropTypes.arrayOf(PropTypes.shape({
            code: PropTypes.string,
            discount_type: PropTypes.string,
            discount: PropTypes.number,
            upto: PropTypes.number,
        })),
    }).isRequired,
    updatedOrderDetails: PropTypes.shape({
        cart: PropTypes.arrayOf(PropTypes.shape({
            salePrice: PropTypes.number.isRequired,
            qty: PropTypes.number.isRequired,
        })),
        coupon: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.shape({
                code: PropTypes.string,
            })),
        ]),
        appliedCoupon: PropTypes.shape({
            code: PropTypes.string,
            discount_type: PropTypes.string,
            discount: PropTypes.number,
            upto: PropTypes.number,
        }),
        totalOrderValue: PropTypes.number,
        discountedTotal: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    }).isRequired,
    isEditing: PropTypes.bool.isRequired,
    onApplyCoupon: PropTypes.func.isRequired,
    setUpdatedOrderDetails: PropTypes.func.isRequired,
};

export default OrderTotalsCard;

