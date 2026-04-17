import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CouponTable = ({ 
  coupons, 
  onEdit, 
  onDelete,
  onViewDetails 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second for more accurate countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < currentTime;
  };

  const getTimeRemaining = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = currentTime;
    
    if (expiry < now) {
      return { expired: true };
    }
    
    const diffMs = expiry - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { 
      expired: false,
      days: diffDays,
      hours: diffHrs,
      minutes: diffMins,
      seconds: diffSecs
    };
  };
  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-black font-uppercase border-b border-gray-200 text-center p-0">
          <tr>
            <th className="px-6 py-5 max-w-60 font-semibold">Coupon Code</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Coupon Type</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Allow Multiple</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Coupon Usage</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Expiry Date</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Min Order Value</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Amount</th>
            <th className="px-6 py-5 max-w-60 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white text-center">
          {coupons.map((coupon) => (
            <tr key={coupon._id} className="hover:bg-gray-50 transition-colors duration-300 ease-in-out border-b border-gray-200 text-base">
              <td className="px-6 py-3 max-w-60">{coupon.code}</td>
              <td className="px-6 py-3 max-w-60">
                {coupon.discount_type === "percentage" ? "Percentage" : "Flat"}
              </td>
              <td className="px-6 py-3 max-w-60">
              {coupon.allowMultiple ? (
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">Yes</span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">No</span>
              )}
            </td>
              <td className="px-6 py-3 max-w-60">
                <div className="flex flex-col items-center w-full">
                    <span className="mb-1 text-xs text-gray-700 font-semibold">{coupon.used || 0} / {coupon.usage}</span>
                    <div className="w-full bg-gray-200 rounded-full h-5 flex items-center justify-center">
                    <div
                        className="bg-blue-600 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${Math.min(100, Math.round((coupon.used / coupon.usage) * 100))}%` }}
                    >
                        {/* Empty, text moved above */}
                    </div>
                    </div>
                </div>
                </td>
              <td className="px-6 py-3 max-w-60">
                <div className="flex flex-col items-center">
                  <span className="mb-1">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                  {isExpired(coupon.expiryDate) ? (
                    <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">Expired</span>
                  ) : (
                    <div className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex gap-1">
                      {(() => {
                        const remaining = getTimeRemaining(coupon.expiryDate);
                        return (
                          <>
                            {remaining.days > 0 && (
                              <span className="countdown-unit">
                                <span className="font-bold">{remaining.days}</span>d
                              </span>
                            )}
                            <span className="countdown-unit">
                              <span className="font-bold">{String(remaining.hours).padStart(2, '0')}</span>h
                            </span>
                            <span className="countdown-unit">
                              <span className="font-bold">{String(remaining.minutes).padStart(2, '0')}</span>m
                            </span>
                            <span className="countdown-unit">
                              <span className="font-bold">{String(remaining.seconds).padStart(2, '0')}</span>s
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-3 max-w-60">
                £{coupon.minOrderValue ?? 0}
              </td>
              <td className="px-6 py-3 max-w-60">
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount}% upto ${coupon.upto}`
                  : `£${coupon.discount}`}
              </td>
              <td className="py-3 px-4 flex gap-3 items-center justify-center">
                <button
                  onClick={() => onEdit(coupon)}
                  className="bg-blue-600 text-white px-2 py-2 rounded-md flex gap-2 items-center text-sm font-medium">
              
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" data-modal-target="default-modal" data-modal-toggle="default-modal">
                    <g fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" d="M22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2" />
                      <path strokeLinecap="round" d="m2 12.5l1.752-1.533a2.3 2.3 0 0 1 3.14.105l4.29 4.29a2 2 0 0 0 2.564.222l.299-.21a3 3 0 0 1 3.731.225L21 18.5" />
                      <path d="m18.562 2.935l.417-.417a1.77 1.77 0 0 1 2.503 2.503l-.417.417m-2.503-2.503s.052.887.834 1.669s1.669.834 1.669.834m-2.503-2.503L14.727 6.77c-.26.26-.39.39-.5.533a3 3 0 0 0-.338.545c-.078.164-.136.338-.252.686l-.372 1.116m7.8-4.212L17.23 9.273c-.26.26-.39.39-.533.5a3 3 0 0 1-.545.338c-.164.078-.338.136-.686.252l-1.116.372m0 0l-.722.24a.477.477 0 0 1-.604-.603l.241-.722m1.085 1.085L13.265 9.65" />
                    </g>
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(coupon._id)}
                  className="bg-red-600 text-white px-2 py-2 rounded-md flex gap-2 items-center text-sm font-medium"
                >
             
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
                <button
                  onClick={() => onViewDetails(coupon)}
                  className="bg-blue-600 text-white px-2 py-2 rounded-md flex gap-2 items-center text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CouponTable.propTypes = {
  coupons: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      discount_type: PropTypes.string.isRequired,
      allowMultiple: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      usage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      expiryDate: PropTypes.string.isRequired,
      discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      upto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minOrderValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired
};

// Using React.createElement to ensure React is used
export default React.memo(CouponTable);
