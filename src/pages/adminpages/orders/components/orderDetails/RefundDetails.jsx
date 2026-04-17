import PropTypes from "prop-types";

const RefundDetails = ({
  orderDetail,
  updatedOrderDetails,
  isEditing,
  onInputChange,
  setUpdatedOrderDetails,
}) => {
  if (
    updatedOrderDetails.status !== "Cancelled" &&
    updatedOrderDetails.status !== "Refunded"
  ) {
    return null;
  }

  return (
    <div className="mt-10 p-6 bg-white rounded-lg shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-red-600">
        {updatedOrderDetails.status === "Cancelled"
          ? "Cancellation Details"
          : "Refund Details"}
      </h2>

      {/* Reason field */}
      <div className="flex flex-col mb-4">
        <label htmlFor="reason" className="font-semibold mb-1">
          Reason:
        </label>
        {isEditing ? (
          <textarea
            id="reason"
            name="reason"
            value={updatedOrderDetails.reason || ""}
            onChange={onInputChange}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            rows={3}
            placeholder="Enter reason for cancellation/refund..."
          />
        ) : (
          <p className="text-gray-900">
            {orderDetail.reason || "No reason provided"}
          </p>
        )}
      </div>

      {/* Refund details - shown only for Refunded status */}
      {updatedOrderDetails.status === "Refunded" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="refundType" className="font-semibold mb-1">
              Refund Type:
            </label>
            {isEditing ? (
              <select
                id="refundType"
                name="refundType"
                value={updatedOrderDetails.refund?.refundType || "full"}
                onChange={(e) => {
                  setUpdatedOrderDetails({
                    ...updatedOrderDetails,
                    refund: {
                      ...updatedOrderDetails.refund,
                      refundType: e.target.value,
                    },
                  });
                }}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value="full">Full Refund</option>
                <option value="partial">Partial Refund</option>
              </select>
            ) : (
              <p className="text-gray-900 text-lg capitalize">
                {orderDetail.refund?.refundType || "Full"}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="refundAmount" className="font-semibold mb-1">
              Refund Amount (£):
            </label>
            {isEditing ? (
              <input
                type="number"
                id="refundAmount"
                name="refundAmount"
                step="0.01"
                min="0"
                value={updatedOrderDetails.refund?.refundAmount || ""}
                onChange={(e) => {
                  setUpdatedOrderDetails({
                    ...updatedOrderDetails,
                    refund: {
                      ...updatedOrderDetails.refund,
                      refundAmount: parseFloat(e.target.value),
                    },
                  });
                }}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter refund amount"
              />
            ) : (
              <p className="text-gray-900 text-2xl font-bold">
                £{orderDetail.refund?.refundAmount?.toFixed(2) || "0.00"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

RefundDetails.propTypes = {
  orderDetail: PropTypes.shape({
    reason: PropTypes.string,
    refund: PropTypes.shape({
      refundType: PropTypes.string,
      refundAmount: PropTypes.number,
    }),
  }).isRequired,
  updatedOrderDetails: PropTypes.shape({
    status: PropTypes.string.isRequired,
    reason: PropTypes.string,
    refund: PropTypes.shape({
      refundType: PropTypes.string,
      refundAmount: PropTypes.number,
    }),
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  setUpdatedOrderDetails: PropTypes.func.isRequired,
};

export default RefundDetails;
