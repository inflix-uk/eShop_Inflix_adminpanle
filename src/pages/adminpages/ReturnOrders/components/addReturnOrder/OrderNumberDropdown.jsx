import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * OrderNumberDropdown Component
 * A searchable dropdown to select order numbers for a specific user
 * Also allows manual input if order not in list
 */
const OrderNumberDropdown = ({
  orders = [],
  isLoading = false,
  selectedOrder,
  onSelectOrder,
  onManualInput,
  disabled = false,
  placeholder = "Select or enter order number..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter orders based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = orders.filter(order => {
        const orderNumber = (order.orderNumber || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return orderNumber.includes(search);
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    onManualInput(value);
  };

  // Handle order selection from dropdown
  const handleSelectOrder = (order) => {
    setSearchTerm(order.orderNumber);
    setIsOpen(false);
    onSelectOrder(order);
  };

  // Handle input focus
  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Display value in input
  const displayValue = selectedOrder
    ? selectedOrder.orderNumber
    : searchTerm;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={disabled ? "Select a customer first..." : placeholder}
          disabled={disabled}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm pr-10 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${selectedOrder ? 'bg-blue-50' : ''}`}
        />
        {/* Dropdown indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          ) : (
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {/* Selected order indicator */}
        {selectedOrder && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <span className="text-blue-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Loading orders...
            </div>
          ) : filteredOrders.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                Select an order or type order number
              </div>
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => handleSelectOrder(order)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.createdAt)} · £{order.total?.toFixed(2)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </button>
              ))}
            </>
          ) : orders.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No orders found for this customer
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500">
                No matching orders for &quot;{searchTerm}&quot;
              </p>
              <p className="text-xs text-gray-400 mt-1">
                You can still use this as a manual order number
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

OrderNumberDropdown.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      orderNumber: PropTypes.string,
      status: PropTypes.string,
      total: PropTypes.number,
      createdAt: PropTypes.string
    })
  ),
  isLoading: PropTypes.bool,
  selectedOrder: PropTypes.shape({
    id: PropTypes.string,
    orderNumber: PropTypes.string,
    status: PropTypes.string,
    total: PropTypes.number,
    createdAt: PropTypes.string
  }),
  onSelectOrder: PropTypes.func.isRequired,
  onManualInput: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string
};

export default OrderNumberDropdown;
