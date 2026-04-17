import React from "react";
import PropTypes from "prop-types";
import { Dialog } from '@headlessui/react';

const CouponModal = ({
  isOpen,
  handleCloseModal,
  isEdit,
  couponCode,
  setCouponCode,
  couponType,
  setCouponType,
  allowMultiple,
  setAllowMultiple,
  couponUsage,
  setCouponUsage,
  expiryDate,
  setExpiryDate,
  discount,
  setDiscount,
  upToValue,
  setUpToValue,
  minOrderValue,
  setMinOrderValue,
  handleSubmit
}) => {
  return (
    <Dialog open={isOpen} onClose={handleCloseModal} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative max-w-lg space-y-4 border bg-white p-5 rounded-lg shadow-lg w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{isEdit ? "Edit Coupon" : "Add Coupon"}</h1>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            <label htmlFor="couponCode" className="block font-medium text-gray-700">Coupon Code</label>
            <input
              type="text"
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your coupon code"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="couponType" className="block font-medium text-gray-700">Coupon Type</label>
            <select
              id="couponType"
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="flat">Flat</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="allowMultiple" className="block font-medium text-gray-700">Allow Multiple</label>
              <select
                id="allowMultiple"
                value={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.value)}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="couponUsage" className="block font-medium text-gray-700">Usage Limit</label>
              <input
                type="number"
                id="couponUsage"
                value={couponUsage}
                onChange={(e) => setCouponUsage(e.target.value)}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter usage limit"
              />
            </div>
          </div>


          <div className="space-y-2">
            <label htmlFor="expiryDate" className="block font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="discount" className="block font-medium text-gray-700">
              {couponType === "percentage" ? "Percentage" : "Amount"}
            </label>
            {couponType === "percentage" ? (
              <>
                <input
                  type="number"
                  id="discount"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter percentage"
                  max={100}
                />
                <input
                  type="number"
                  id="upToValue"
                  min={0}
                  value={upToValue}
                  onChange={(e) => setUpToValue(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300 mt-2"
                  placeholder="Up to value (£)"
                />
              </>
            ) : (
              <input
                type="number"
                id="discount"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Enter amount"
              />
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="minOrderValue" className="block font-medium text-gray-700">Minimum Order Value</label>
            <input
              type="number"
              id="minOrderValue"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter minimum order value (£)"
              min={0}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md">
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              Submit
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

CouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  isEdit: PropTypes.bool.isRequired,
  couponCode: PropTypes.string.isRequired,
  setCouponCode: PropTypes.func.isRequired,
  couponType: PropTypes.string.isRequired,
  setCouponType: PropTypes.func.isRequired,
  allowMultiple: PropTypes.string.isRequired,
  setAllowMultiple: PropTypes.func.isRequired,
  couponUsage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setCouponUsage: PropTypes.func.isRequired,
  expiryDate: PropTypes.string.isRequired,
  setExpiryDate: PropTypes.func.isRequired,
  discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setDiscount: PropTypes.func.isRequired,
  upToValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setUpToValue: PropTypes.func.isRequired,
  minOrderValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setMinOrderValue: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

// Using React.createElement to ensure React is used
export default React.memo(CouponModal);
