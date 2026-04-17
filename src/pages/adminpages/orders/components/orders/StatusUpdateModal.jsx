import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const StatusUpdateModal = ({ isOpen, onClose, onSubmit, currentStatus, orderTotal }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [refundType, setRefundType] = useState('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      setRefundType('full');
      setRefundAmount('');
      setErrors({});
    }
  }, [isOpen, currentStatus]);

  // Check if form is complete and valid
  const isFormComplete = () => {
    // If status is Refunded, check additional refund fields
    if (selectedStatus === 'Refunded') {
      // If partial refund, amount must be valid
      if (refundType === 'partial') {
        const amount = parseFloat(refundAmount);
        if (!refundAmount || isNaN(amount) || amount <= 0 || amount > orderTotal) {
          return false;
        }
      }
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    // If status is Refunded, validate additional refund fields
    if (selectedStatus === 'Refunded') {
      if (refundType === 'partial') {
        if (!refundAmount || parseFloat(refundAmount) <= 0) {
          newErrors.refundAmount = 'Refund amount must be greater than 0';
        } else if (parseFloat(refundAmount) > orderTotal) {
          newErrors.refundAmount = `Refund amount cannot exceed order total (£${orderTotal})`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const updateData = {
        status: selectedStatus
      };

      // Only include refund data if status is Refunded
      if (selectedStatus === 'Refunded') {
        updateData.refund = {
          refundType,
          refundAmount: refundType === 'full' ? orderTotal : parseFloat(refundAmount)
        };
      }

      onSubmit(updateData);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    setRefundType('full');
    setRefundAmount('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative p-4 w-full max-w-2xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-lg shadow">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
            <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={handleClose}
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

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Status Dropdown */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                  Order Status <span className="text-red-600">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
              </div>

              {/* Refund Fields - Only show when Refunded is selected */}
              {selectedStatus === 'Refunded' && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Refund Details</h4>

                    {/* Refund Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Refund Type <span className="text-red-600">*</span>
                      </label>
                      <div className="flex gap-6">
                        <div className="flex items-center">
                          <input
                            id="refund-full"
                            type="radio"
                            name="refundType"
                            value="full"
                            checked={refundType === 'full'}
                            onChange={(e) => setRefundType(e.target.value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="refund-full" className="ml-2 text-sm font-medium text-gray-900">
                            Full Refund (£{orderTotal.toFixed(2)})
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="refund-partial"
                            type="radio"
                            name="refundType"
                            value="partial"
                            checked={refundType === 'partial'}
                            onChange={(e) => setRefundType(e.target.value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="refund-partial" className="ml-2 text-sm font-medium text-gray-900">
                            Partial Refund
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Refund Amount (only for partial) */}
                    {refundType === 'partial' && (
                      <div className="mb-4">
                        <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-900 mb-2">
                          Refund Amount <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            £
                          </span>
                          <input
                            type="number"
                            id="refundAmount"
                            step="0.01"
                            min="0.01"
                            max={orderTotal}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className={`block w-full pl-8 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                              errors.refundAmount ? 'ring-red-500' : 'ring-gray-300'
                            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.refundAmount && (
                          <p className="mt-1 text-sm text-red-600">{errors.refundAmount}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum refund amount: £{orderTotal.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b">
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormComplete()}
                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none ${
                  isFormComplete()
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

StatusUpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  currentStatus: PropTypes.string.isRequired,
  orderTotal: PropTypes.number.isRequired,
};

export default StatusUpdateModal;
