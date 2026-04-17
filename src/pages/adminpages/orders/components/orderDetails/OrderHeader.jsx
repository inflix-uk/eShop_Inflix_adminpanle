import PropTypes from 'prop-types';

const OrderHeader = ({
    orderNumber,
    isEditing,
    onEdit,
    onCancel,
    onSave,
    onAddProduct,
    onShip,
    onReturn,
    onMessage,
    onDelete,
    unreadCount = 0,
}) => {
    return (
        <div className='w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-gray-100'>
            <div className='flex-1'>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Your Order Details
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-lg font-semibold text-gray-700">
                        Order <span className="text-blue-600 font-bold">{orderNumber}</span>
                    </p>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <p className="text-gray-500 text-sm sm:text-base">Thank you for shopping with us!</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={onAddProduct}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
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
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Save
                        </button>
                    </>
                ) : (
                    <>
                        {/* Edit Button */}
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg flex gap-2 items-center text-sm font-semibold transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>

                        {/* Ship Button */}
                        {onShip && (
                            <button
                                onClick={onShip}
                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Ship
                            </button>
                        )}

                        {/* Return Button */}
                        {onReturn && (
                            <button
                                onClick={onReturn}
                                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 hover:border-orange-300 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Return
                            </button>
                        )}

                        {/* Chat Button */}
                        {onMessage && (
                            <button
                                onClick={onMessage}
                                className="relative px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Delete Button */}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

OrderHeader.propTypes = {
    orderNumber: PropTypes.string.isRequired,
    isEditing: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onAddProduct: PropTypes.func,
    onShip: PropTypes.func,
    onReturn: PropTypes.func,
    onMessage: PropTypes.func,
    onDelete: PropTypes.func,
    unreadCount: PropTypes.number,
};

export default OrderHeader;
