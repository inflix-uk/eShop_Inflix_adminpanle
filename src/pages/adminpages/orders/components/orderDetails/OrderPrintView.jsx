import PropTypes from "prop-types";

const OrderPrintView = ({
  showPrintView,
  orderDetails,
  printRef,
  handlePrint,
  setShowPrintView,
  formatDate,
}) => {
  if (!showPrintView || !orderDetails) return null;

  // Calculate totals
  const subtotal = orderDetails.cart?.reduce(
    (acc, item) => acc + item.salePrice * item.qty,
    0
  ) || 0;

  // Calculate discount if coupon exists
  let discount = 0;
  const coupon = orderDetails.coupon?.[0];
  if (coupon) {
    if (coupon.discount_type === "flat") {
      discount = coupon.discount;
    } else if (coupon.discount_type === "percentage") {
      const discountAmount = (subtotal * coupon.discount) / 100;
      discount = coupon.upto ? Math.min(discountAmount, coupon.upto) : discountAmount;
    }
  }

  const total = subtotal - discount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 max-w-4xl w-full max-h-[90vh] overflow-auto rounded-lg shadow-lg">
        {/* Invoice content wrapped for capture */}
        <div ref={printRef} className="p-3 md:p-6 bg-white">
          {/* ====== BEGIN invoice JSX ====== */}
          <div
            className="print:shadow-none print:border-0 w-full max-w-4xl mx-auto flex flex-col"
            style={{
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              padding: "0",
              fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
              backgroundColor: "#ffffff",
              overflow: "hidden",
              pageBreakInside: "avoid",
            }}
          >
            {/* Header with Logo and Invoice Title */}
            <div
              className="print:bg-white"
              style={{
                background: "white",
                padding: "0.75rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src="/inflix_logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="w-20 md:w-28"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div style={{ color: "#333", textAlign: "right" }}>
                <h1
                  className="text-xl md:text-2xl font-extrabold tracking-tight mb-0 leading-none"
                  style={{ letterSpacing: "-0.025em" }}
                >
                  INVOICE
                </h1>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-3 md:px-6 py-3 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
                {/* Store Info */}
                <div className="border border-gray-200 p-2 md:p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-sm mb-2 text-gray-900 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Store Information
                  </h3>
                  <p className="text-xs font-medium mb-1">Tech Store</p>
                  <div className="text-gray-600 text-xs leading-tight">
                    <p>27 Church Street</p>
                    <p>St Helens, WA10 1AX</p>
                    <p>support@</p>
                  </div>
                </div>
                {/* Customer Info */}
                <div className="border border-gray-200 p-2 md:p-3 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-sm mb-2 text-gray-900 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Customer Information
                  </h3>
                  <p className="text-xs font-medium mb-1">
                    {orderDetails.shippingDetails?.firstName} {orderDetails.shippingDetails?.lastName}
                  </p>
                  <div className="text-gray-600 text-xs leading-tight">
                    {orderDetails.shippingDetails ? (
                      <>
                        <p>{orderDetails.shippingDetails.address}</p>
                        {orderDetails.shippingDetails.apartment && <p>{orderDetails.shippingDetails.apartment}</p>}
                        <p>
                          {orderDetails.shippingDetails.city}, {orderDetails.shippingDetails.postalCode}
                        </p>
                      </>
                    ) : (
                      <p>No address available</p>
                    )}
                    <p>{orderDetails.shippingDetails?.phoneNumber}</p>
                  </div>
                </div>
              </div>
              {/* Order Information */}
              <div className="bg-gray-50 p-2 md:p-3 rounded-lg shadow-sm mb-3">
                <h3 className="font-semibold text-sm mb-2 text-gray-900 flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Order Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">ORDER NUMBER</p>
                    <p className="font-semibold text-xs">{orderDetails.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">ORDER DATE</p>
                    <p className="font-semibold text-xs">{formatDate(orderDetails.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">PAYMENT</p>
                    <p className="font-semibold text-xs">{orderDetails.paymentDetails?.cardDetails?.brand || orderDetails.paymentDetails?.cardDetails?.payment_type || orderDetails.paymentDetails?.paymentType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">STATUS</p>
                    <p className="font-semibold text-xs">{orderDetails.status}</p>
                  </div>
                </div>
              </div>
              {/* Products Table */}
              <div className="mb-3">
                <h3 className="font-semibold text-sm mb-2 text-gray-900 flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Product Details
                </h3>
                <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  {/* Desktop */}
                  <div className="hidden md:block">
                    <table className="print:border-collapse w-full" style={{ borderSpacing: 0 }}>
                      <thead>
                        <tr className="bg-gray-800 text-white text-xs">
                          <th className="py-2 px-3 text-left">Product Details</th>
                          <th className="py-2 px-2 text-center w-[15%]">Qty</th>
                          <th className="py-2 px-3 text-right w-[20%]">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.cart?.map((item, i) => {
                          // Remove hex color codes from name
                          const cleanName = item.name?.replace(/\s*\(#[0-9a-fA-F]+\)/g, '') || item.productName || '';

                          return (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                              <td className="py-2 px-3 border-b border-gray-200">
                                <p className="font-medium text-xs mb-0.5">{item.productName}</p>
                                <p className="text-gray-500 text-xs">{cleanName}</p>
                              </td>
                              <td className="py-2 px-2 text-center border-b border-gray-200 text-gray-600 text-xs">
                                <span className="py-1 px-2 bg-gray-100 rounded font-mono text-xs">
                                  {item.qty}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right border-b border-gray-200 font-semibold text-xs">
                                £{(item.salePrice * item.qty).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile */}
                  <div className="md:hidden">
                    {orderDetails.cart?.map((item, i) => {
                      const cleanName = item.name?.replace(/\s*\(#[0-9a-fA-F]+\)/g, '') || item.productName || '';

                      return (
                        <div key={i} className="p-3 border-b border-gray-200" style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-xs mb-0.5">{item.productName}</p>
                              <p className="text-gray-500 text-xs">{cleanName}</p>
                            </div>
                            <p className="font-semibold text-xs">£{(item.salePrice * item.qty).toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <p className="text-gray-500">Qty:</p>
                            <span className="py-0.5 px-2 bg-gray-100 rounded font-mono text-xs">{item.qty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Bottom Section */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-3 md:gap-4 mb-3">
                {/* Thank You */}
                <div className="bg-gray-50 rounded-lg p-3 shadow-sm order-2 md:order-1">
                  <h3 className="font-semibold text-sm mb-1.5 text-gray-900 flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z" />
                    </svg>
                    Thank You for Your Purchase!
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    We appreciate your business. For any questions, contact our customer service at
                    <strong> support@</strong>.
                  </p>
                </div>
                {/* Order Summary */}
                <div className="order-1 md:order-2">
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-900 py-2 px-3 text-white">
                      <h3 className="font-semibold text-xs">Order Summary</h3>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between mb-1.5">
                        <p className="text-gray-500 text-xs">Subtotal</p>
                        <p className="font-medium text-xs">£{subtotal.toFixed(2)}</p>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between mb-1.5">
                          <p className="text-gray-500 text-xs">Discount {coupon?.code && `(${coupon.code})`}</p>
                          <p className="font-medium text-xs text-blue-600">-£{discount.toFixed(2)}</p>
                        </div>
                      )}
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="flex justify-between">
                        <p className="font-bold text-xs">Total</p>
                        <p className="font-bold text-sm text-blue-600">£{total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="text-black px-3 md:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                <img
                  src="/inflix_logo.png"
                  alt="Logo"
                  width={60}
                  height={20}
                  className="w-12 md:w-16"
                  style={{ objectFit: "contain" }}
                />
                <p className="opacity-90 text-xs text-center md:text-left">
                  All copyright reserved © Tech Store 2025
                </p>
              </div>
              <div className="flex flex-col print:flex-row md:flex-col items-center gap-4 md:gap-6 w-full md:w-auto justify-around md:justify-end">
                <div className="text-center md:text-right">
                  <p className="text-xs opacity-80 mb-0.5">CONTACT</p>
                  <p className="text-xs"><strong>support@</strong></p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-xs opacity-80 mb-0.5">WEBSITE</p>
                  <p className="text-xs"><strong>www.</strong></p>
                </div>
              </div>
            </div>
          </div>
          {/* ====== END invoice JSX ====== */}
        </div>
        {/* Modal Action Buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download PDF
          </button>
          <button
            onClick={() => setShowPrintView(false)}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

OrderPrintView.propTypes = {
  showPrintView: PropTypes.bool.isRequired,
  orderDetails: PropTypes.object,
  printRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  handlePrint: PropTypes.func.isRequired,
  setShowPrintView: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default OrderPrintView;
