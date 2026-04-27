import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ordersService from "../../service/ordersService";
import { getOrderLineItemImageUrl } from "../../utils/orderItemImageUrl";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OrderDetailsCell = ({ orderId }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await ordersService.getOrderCart(orderId);
        if (response.success) {
          setCart(response.cart || []);
        } else {
          setError(response.error || "Failed to load cart");
        }
      } catch (err) {
        setError("Error loading cart");
        console.error("Error fetching cart:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="px-4 py-2 flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2 text-xs text-red-500 text-center">{error}</div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500 text-center">
        No items
      </div>
    );
  }

  return (
    <div className="px-4 py-3 max-w-md">
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-webkit">
        {cart.map((item, index) => {
          const isTradeIn = item.isTradeIn === true;
          const tradeInCondition = item.tradeInData?.conditionName || "-";
          const cleanVariantName =
            item.name?.replace(/\s*\(#[0-9a-fA-F]+\)/g, "") || "";

          const imageUrl = getOrderLineItemImageUrl(item, BACKEND_URL);

          return (
            <div
              key={index}
              className="flex items-start gap-2 p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded"
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.productName || cleanVariantName}
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.png";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                    No img
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900 text-base">
                    {item.productName || cleanVariantName}
                    {!isTradeIn && cleanVariantName && item.productName && (
                      <span>- {cleanVariantName}</span>
                    )}
                  </span>
                  {isTradeIn && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      TRADE-IN
                    </span>
                  )}
                </div>

                {/* Trade-in Details */}
                {isTradeIn && item.tradeInData && (
                  <div className="mb-1 p-1.5 rounded bg-blue-50 border-l-2 border-blue-500">
                    <div className="flex gap-3 text-[10px]">
                      <div>
                        <p className="text-gray-500 uppercase font-semibold">
                          Brand
                        </p>
                        <p className="font-bold text-gray-800">
                          {item.tradeInData.brandName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase font-semibold">
                          Storage
                        </p>
                        <p className="font-bold text-gray-800">
                          {item.tradeInData.storageName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase font-semibold">
                          Condition
                        </p>
                        <p className="font-bold text-blue-600">
                          {tradeInCondition}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SIM Info */}
                {item.selectedSim && (
                  <p className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded inline-block mb-1">
                    With Free SIM:{" "}
                    <span className="font-semibold">{item.selectedSim}</span>
                  </p>
                )}

                {/* SKU, Qty, Total */}
                <div className="flex items-center justify-between gap-2 mt-1 text-[10px]">
                  <span className="text-gray-600 font-mono">
                    SKU: {item.SKU || "-"}
                  </span>
                  <span
                    className={`font-medium ${
                      isTradeIn ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    Qty: {item.qty}
                  </span>
                  <span
                    className={`font-semibold ${
                      isTradeIn ? "text-blue-700" : "text-gray-900"
                    }`}
                  >
                    £{(item.salePrice * item.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

OrderDetailsCell.propTypes = {
  orderId: PropTypes.string.isRequired,
};

export default OrderDetailsCell;
