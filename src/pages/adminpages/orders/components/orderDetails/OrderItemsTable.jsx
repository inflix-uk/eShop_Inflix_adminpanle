import PropTypes from 'prop-types';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OrderItemsTable = ({ orderDetail }) => {
    return (
        <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg border border-gray-100">
            <h1 className="text-2xl font-bold mb-6">Your Order Items</h1>

            <div className="space-y-4">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="px-4 py-2 text-left">Product</th>
                            <th className="px-4 py-2 text-left">Product Name</th>
                            <th className="px-4 py-2 text-center">Color</th>
                            <th className="px-4 py-2 text-left">Storage</th>
                            <th className="px-4 py-2 text-center">Quantity</th>
                            <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderDetail.cart && Array.isArray(orderDetail.cart) && orderDetail.cart.map((item, index) => {
                            const imageUrl = (item.variantImages && item.variantImages.length > 0)
                                ? `${BACKEND_URL}${item?.variantImages[0]?.path}`
                                : `${BACKEND_URL}${item?.productthumbnail?.path}`;
                            const productName = item.name;
                            const color = item.name.split('-')[1]
                            const modifiedProductName = productName.replace(/\s*\([^)]+\)/, '');
                            const modifiedColor = color ? color.replace(/\s*\([^)]+\)/, '') : '';

                            return (
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="px-4 py-2">
                                        <img src={imageUrl} alt={item.name} className="w-20 h-20 rounded-lg" />
                                    </td>
                                    <td className="px-4 py-2 text-left font-medium text-gray-900">
                                        {item.productName} - {modifiedProductName}
                                        {item.selectedSim && (
                                            <p className="text-sm text-gray-700">(With Free SIM: {item.selectedSim})</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {modifiedColor}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {item.name.split('-')[2]}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {item.qty}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        £{(item.salePrice * item.qty).toFixed(2)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

OrderItemsTable.propTypes = {
    orderDetail: PropTypes.shape({
        cart: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            productName: PropTypes.string.isRequired,
            salePrice: PropTypes.number.isRequired,
            qty: PropTypes.number.isRequired,
            variantImages: PropTypes.arrayOf(PropTypes.shape({
                path: PropTypes.string,
            })),
            productthumbnail: PropTypes.shape({
                path: PropTypes.string,
            }),
            selectedSim: PropTypes.string,
        })),
    }).isRequired,
};

export default OrderItemsTable;
