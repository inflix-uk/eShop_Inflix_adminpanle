import PropTypes from "prop-types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OrderItemsCard = ({
  updatedOrderDetails,
  isEditing,
  handleQuantityChange,
  handlePriceChange,
  handleRemoveProduct,
}) => {
  if (!updatedOrderDetails?.cart || !Array.isArray(updatedOrderDetails.cart)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {updatedOrderDetails.cart.map((item, index) => {
        // Check if it's a trade-in product
        const isTradeIn = item.isTradeIn === true;

        // Determine image URL
        let imageUrl;
        if (isTradeIn && item.tradeInData?.deviceImage) {
          imageUrl = `${BACKEND_URL}${item.tradeInData.deviceImage}`;
        } else if (item.variantImages && item.variantImages.length > 0) {
          imageUrl = `${BACKEND_URL}${item?.variantImages[0]?.path}`;
        } else if (item.productthumbnail?.path) {
          imageUrl = `${BACKEND_URL}${item?.productthumbnail?.path}`;
        } else if (item.metaImage?.path) {
          imageUrl = `${BACKEND_URL}${item?.metaImage?.path}`;
        } else {
          imageUrl = null;
        }

        // Check if it's a variant product (has '-' separators) or single product
        const isVariantProduct = item.name && item.name.includes("-");

        const productName = item.name || "";
        const nameParts = isVariantProduct ? item.name.split("-") : [];
        const color = isVariantProduct ? nameParts[1] : "-";
        const storage = isVariantProduct
          ? nameParts[nameParts.length - 1]
          : "-";
        const modifiedProductName = productName.replace(/\s*\([^)]+\)/, "");
        const modifiedColor = color ? color.replace(/\s*\([^)]+\)/, "") : "-";

        // Trade-in specific data
        const tradeInStorage = item.tradeInData?.storageName || "-";
        const tradeInCondition = item.tradeInData?.conditionName || "-";

        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {/* Product Image and Name Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900">
                    {item.productName || item.name}
                  </span>
                  {isTradeIn && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                      TRADE-IN
                    </span>
                  )}
                </div>
                {isVariantProduct && !isTradeIn && (
                  <span className="text-sm text-gray-600 block">
                    {modifiedProductName}
                  </span>
                )}
              </div>
            </div>

            {/* Trade-in Details */}
            {isTradeIn && item.tradeInData && (
              <div className="mb-4 p-3 rounded-lg border-l-4 border-blue-500 shadow-sm bg-gray-50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">
                      Brand
                    </p>
                    <p className="font-bold text-gray-800">
                      {item.tradeInData.brandName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">
                      Category
                    </p>
                    <p className="font-bold text-gray-800">
                      {item.tradeInData.categoryName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">
                      Condition
                    </p>
                    <p className="font-bold text-blue-600">
                      {tradeInCondition}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">
                      Trade Value
                    </p>
                    <p className="font-bold text-blue-600 text-lg">
                      £{item.tradeInData.tradeInValue}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SIM Card Info */}
            {item.selectedSim && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                  📱 With Free SIM:{" "}
                  <span className="font-semibold">{item.selectedSim}</span>
                </p>
              </div>
            )}

            {/* Product Details Grid */}
            <div className="grid gap-3 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Color:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {isTradeIn ? (
                    <span className="text-gray-400">N/A</span>
                  ) : (
                    modifiedColor
                  )}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Storage:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {isTradeIn ? (
                    <span className="font-bold text-blue-600">
                      {tradeInStorage}
                    </span>
                  ) : (
                    storage || "-"
                  )}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Quantity:</span>
                <div className="mt-1">
                  {isEditing && !isTradeIn ? (
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span
                      className={`font-medium ${
                        isTradeIn && isEditing ? "text-blue-600" : ""
                      }`}
                    >
                      {item.qty}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-gray-500">Total:</span>
                <div className="mt-1">
                  {isEditing && !isTradeIn ? (
                    <div className="flex items-center gap-1">
                      <span>£</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.salePrice}
                        onChange={(e) =>
                          handlePriceChange(index, e.target.value)
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <span
                      className={`text-lg font-bold ${
                        isTradeIn ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      £{(item.salePrice * item.qty).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Remove Button (only in editing mode) */}
            {isEditing && (
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                >
                  Remove Product
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

OrderItemsCard.propTypes = {
  updatedOrderDetails: PropTypes.shape({
    cart: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        productName: PropTypes.string,
        salePrice: PropTypes.number.isRequired,
        qty: PropTypes.number.isRequired,
        isTradeIn: PropTypes.bool,
        tradeInData: PropTypes.shape({
          deviceImage: PropTypes.string,
          storageName: PropTypes.string,
          conditionName: PropTypes.string,
          tradeInValue: PropTypes.number,
          brandName: PropTypes.string,
          categoryName: PropTypes.string,
        }),
        variantImages: PropTypes.arrayOf(
          PropTypes.shape({
            path: PropTypes.string,
          })
        ),
        productthumbnail: PropTypes.shape({
          path: PropTypes.string,
        }),
        metaImage: PropTypes.shape({
          path: PropTypes.string,
        }),
        selectedSim: PropTypes.string,
      })
    ),
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  handleQuantityChange: PropTypes.func.isRequired,
  handlePriceChange: PropTypes.func.isRequired,
  handleRemoveProduct: PropTypes.func.isRequired,
};

export default OrderItemsCard;
