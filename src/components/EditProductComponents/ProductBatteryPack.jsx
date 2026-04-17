import PropTypes from "prop-types";

export default function ProductBatteryPack({ product, setProduct }) {
  const handleBatteryToggle = () => {
    setProduct((prevProduct) => {
      const battery = prevProduct.battery?.[0]
        ? typeof prevProduct.battery[0] === "string"
          ? JSON.parse(prevProduct.battery[0])
          : prevProduct.battery[0]
        : { status: false, batteryPrice: "" };

      const newBatteryStatus = !battery.status;

      return {
        ...prevProduct,
        battery: [
          {
            status: newBatteryStatus,
            batteryPrice: newBatteryStatus ? battery.batteryPrice : "",
          },
        ],
      };
    });
  };

  const handleBatteryPriceChange = (e) => {
    const { value } = e.target;
    setProduct((prevProduct) => {
      const battery = prevProduct.battery?.[0]
        ? typeof prevProduct.battery[0] === "string"
          ? JSON.parse(prevProduct.battery[0])
          : prevProduct.battery[0]
        : { status: false, batteryPrice: "" };

      return {
        ...prevProduct,
        battery: [
          {
            ...battery,
            batteryPrice: value,
          },
        ],
      };
    });
  };

  const battery = product.battery?.[0]
    ? typeof product.battery[0] === "string"
      ? JSON.parse(product.battery[0])
      : product.battery[0]
    : { status: false, batteryPrice: "" };

  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl h-fit">
      <div className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-sm">Battery Pack</h1>
          <label className="items-center cursor-pointer">
            <input
              id="battery"
              name="battery"
              type="checkbox"
              checked={battery.status || false}
              onChange={handleBatteryToggle}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/30 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
        {battery.status && (
          <div className="flex items-center gap-2">
            <label htmlFor="batteryPrice" className="text-xs text-gray-600 whitespace-nowrap">
              Price:
            </label>
            <input
              type="number"
              name="batteryPrice"
              id="batteryPrice"
              className="block w-full rounded-md border-0 py-1 px-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
              placeholder="0"
              value={battery.batteryPrice}
              onChange={handleBatteryPriceChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

ProductBatteryPack.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
