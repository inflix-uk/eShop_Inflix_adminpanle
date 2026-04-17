import PropTypes from "prop-types";

export default function ProductLowStock({ product, setProduct }) {
  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl h-fit">
      <div className="py-3 px-4 flex items-center justify-between gap-3">
        <h1 className="font-bold text-sm whitespace-nowrap">Low Stock Alert</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="lowStockqty" className="text-xs text-gray-600 whitespace-nowrap">
            Qty:
          </label>
          <input
            type="number"
            name="lowStockqty"
            id="lowStockqty"
            className="w-20 rounded-md border-0 py-1 px-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
            placeholder="0"
            value={product?.low_stock_quantity_alert || ""}
            onChange={(e) => {
              setProduct({
                ...product,
                low_stock_quantity_alert: e.target.value,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

ProductLowStock.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
