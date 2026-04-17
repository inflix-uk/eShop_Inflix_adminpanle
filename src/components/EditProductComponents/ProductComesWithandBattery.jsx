import PropTypes from "prop-types";
import Adapter from "../../assets/Adapter";
import PowerCable from "../../assets/PowerCable";
import ProtectionBundle from "../../assets/ProtectionBundle";
import Tree from "../../assets/Tree";
import hdmiCable from "../../assets/hdmi-cable.png";
import powerCableNew from "../../assets/Pawer-cable.png";
import onexcontrollerImg from "../../assets/onexcontroller.png";
import twoxcontrollerImg from "../../assets/twoxcontroller.png";
import SimImg from "../../assets/sim.png";
import ScreenProtectorImg from "../../assets/screenprotector.png";
import BackCoverImg from "../../assets/backcover.png";
export default function ProductComesWithandBattery({ product, setProduct }) {
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
            batteryPrice: newBatteryStatus ? battery.batteryPrice : "", // Reset batteryPrice if status is toggled off
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
            batteryPrice: value, // Update only the batteryPrice, keep status unchanged
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
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4">
          <h1 className="font-bold">Comes with</h1>
          <div className="divide-y-2">
            {/* Power Adapter */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <Adapter />
                <label
                  htmlFor="powerAdapter"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Power Adapter
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="powerAdapter"
                  name="powerAdapter"
                  type="checkbox"
                  checked={product?.comes_With?.powerAdapter || false}
                  onChange={() => {
                    setProduct({
                      ...product,
                      comes_With: {
                        ...product.comes_With,
                        powerAdapter: !product.comes_With.powerAdapter,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* Power Cable */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <PowerCable />
                <label
                  htmlFor="powerCable"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Charging Cable
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="powerCable"
                  name="powerCable"
                  type="checkbox"
                  checked={product?.comes_With?.powerCable || false}
                  onChange={() => {
                    setProduct({
                      ...product,
                      comes_With: {
                        ...product.comes_With,
                        powerCable: !product.comes_With.powerCable,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* Protection Bundle */}
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <ProtectionBundle />
                  <label
                    htmlFor="protectionBundle"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Protection Bundle
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="protectionBundle"
                    name="protectionBundle"
                    type="checkbox"
                    checked={product?.comes_With?.protectionBundle || false}
                    onChange={() => {
                      setProduct({
                        ...product,
                        comes_With: {
                          ...product?.comes_With,
                          protectionBundle:
                            !product?.comes_With?.protectionBundle,
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                </label>
              </div>
            </div>

            {/* Power Cable New */}

            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <img
                  src={powerCableNew}
                  alt="Power Cable New"
                  className="h-6 w-6"
                />
                <label
                  htmlFor="powerCableNew"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Power Cable
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="powerCableNewIncluded"
                  name="powerCableNewIncluded"
                  type="checkbox"
                  checked={product?.comes_With?.powerCableNewIncluded || false}
                  onChange={() => {
                    setProduct({
                      ...product,
                      comes_With: {
                        ...product.comes_With,
                        powerCableNewIncluded:
                          !product.comes_With.powerCableNewIncluded,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* HDMI Cable */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <img src={hdmiCable} alt="HDMI Cable" className="h-6 w-6" />
                <label
                  htmlFor="hdmi"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  HDMI Cable
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="hdmi"
                  name="hdmi"
                  type="checkbox"
                  checked={product?.comes_With?.hdmi || false}
                  onChange={() => {
                    setProduct({
                      ...product,
                      comes_With: {
                        ...product.comes_With,
                        hdmi: !product.comes_With.hdmi,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* onexcontroller */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <img
                  src={onexcontrollerImg}
                  alt="onexcontroller"
                  className="h-6 w-6"
                />
                <label
                  htmlFor="onexcontroller"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  1x Controller
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="onexcontroller"
                  name="onexcontroller"
                  type="checkbox"
                  checked={product?.comes_With?.onexcontroller || false}
                  onChange={() => {
                    setProduct({
                      ...product,
                      comes_With: {
                        ...product.comes_With,
                        onexcontroller: !product.comes_With.onexcontroller,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* Twoxcontroller */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <img
                  src={twoxcontrollerImg}
                  alt="twoxcontroller"
                  className="h-6 w-6"
                />
                <label
                  htmlFor="twoxcontroller"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  2x Controller
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="twoxcontroller"
                  name="twoxcontroller"
                  type="checkbox"
                  checked={product?.comes_With?.twoxcontroller || false}
                  onChange={() => {
                    setProduct({
                      ...product,
                      comes_With: {
                        ...product.comes_With,
                        twoxcontroller: !product.comes_With.twoxcontroller,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* Free Sim */}
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <img src={SimImg} alt="freeSim" className="h-6 w-6" />
                  <label
                    htmlFor="freeSim"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Free Sim
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="freeSim"
                    name="freeSim"
                    type="checkbox"
                    checked={product?.comes_With?.freeSim || false}
                    onChange={() => {
                      setProduct({
                        ...product,
                        comes_With: {
                          ...product?.comes_With,
                          freeSim: !product?.comes_With?.freeSim,
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                </label>
              </div>
            </div>
            {/* One X Screen Protector */}
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <img
                    src={ScreenProtectorImg}
                    alt="ScreenProtector"
                    className="h-6 w-6"
                  />
                  <label
                    htmlFor="ScreenProtector"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    1x Screen Protector
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="ScreenProtector"
                    name="onexScreenProtector"
                    type="checkbox"
                    checked={product?.comes_With?.onexScreenProtector || false}
                    onChange={() => {
                      setProduct({
                        ...product,
                        comes_With: {
                          ...product?.comes_With,
                          onexScreenProtector:
                            !product?.comes_With?.onexScreenProtector,
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                </label>
              </div>
            </div>
            {/* one X back Cover */}
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <img src={BackCoverImg} alt="backcover" className="h-6 w-6" />
                  <label
                    htmlFor="backcover"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    1x Back Cover
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="backcover"
                    name="backcover"
                    type="checkbox"
                    checked={product?.comes_With?.onexBackCover || false}
                    onChange={() => {
                      setProduct({
                        ...product,
                        comes_With: {
                          ...product?.comes_With,
                          onexBackCover: !product?.comes_With?.onexBackCover,
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                </label>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <Tree />
                  <label
                    htmlFor="treePlanted"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Tree Planted
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="treePlanted"
                    name="treePlanted"
                    type="checkbox"
                    checked={product?.comes_With?.treePlanted || false}
                    onChange={() => {
                      setProduct({
                        ...product,
                        comes_With: {
                          ...product?.comes_With,
                          treePlanted: !product?.comes_With?.treePlanted,
                        },
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Options */}
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
                  checked={battery.status || false}
                  onChange={handleBatteryToggle}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>
            {battery.status && (
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
                  value={battery.batteryPrice}
                  onChange={handleBatteryPriceChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

ProductComesWithandBattery.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
