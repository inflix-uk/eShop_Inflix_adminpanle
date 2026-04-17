import PropTypes from "prop-types";

export default function ProductBattery({
  battery,
  setBattery,
  setBatteryPrice,
  batteryPrice,
}) {
  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4">
          <div className="flex flex-col">
            <div className="flex flex-row items-center justify-between py-2">
              <h1 className="font-bold">Battery Pack</h1>
              <label className="items-center cursor-pointer">
                <input
                  id="battery"
                  name="battery"
                  type="checkbox"
                  checked={battery}
                  onChange={() => {
                    setBattery(!battery);
                    setBatteryPrice(""); // Reset batteryPrice when battery checkbox is toggled
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>
            {battery && (
              <>
                <div className="flex flex-row items-center justify-between py-2">
                  <label
                    htmlFor="batteryPrice"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    New Battery
                  </label>
                  <input
                    type="number"
                    name="batteryPrice"
                    id="batteryPrice"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-32 sm:text-sm sm:leading-6"
                    placeholder="Enter Price"
                    value={batteryPrice}
                    onChange={(e) => setBatteryPrice(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

ProductBattery.propTypes = {
  battery: PropTypes.bool.isRequired,
  setBattery: PropTypes.func.isRequired,
  setBatteryPrice: PropTypes.func.isRequired,
  batteryPrice: PropTypes.string.isRequired,
};
