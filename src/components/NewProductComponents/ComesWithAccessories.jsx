import PropTypes from "prop-types";
import Adapter from "../../assets/Adapter";
import PowerCable from "../../assets/PowerCable";
import ProtectionBundle from "../../assets/ProtectionBundle";
import Tree from "../../assets/Tree";
import hdmiCable from "../../assets/hdmi-cable.png";
import pawerCableNew from "../../assets/Pawer-cable.png";
import onexcontrollerImg from "../../assets/onexcontroller.png";
import twoxcontrollerImg from "../../assets/twoxcontroller.png";
import SimImg from "../../assets/sim.png";
import ScreenProtectorImg from "../../assets/screenprotector.png";
import BackCoverImg from "../../assets/backcover.png";
export default function ComesWithAccessories({
  powerAdapter,
  setPowerAdapter,
  powerCable,
  setPowerCable,
  protectionBundle,
  setProtectionBundle,
  treePlanted,
  setTreePlanted,
  hdmi,
  setHdmi,
  powerCableNewIncluded,
  setPowerCableNewIncluded,
  onexcontroller,
  setOnexcontroller,
  twoxcontroller,
  setTwoxcontroller,
  freeSim,
  setFreeSim,
  onexScreenProtector,
  setOnexScreenProtector,
  onexBackCover,
  setOnexBackCover,
}) {
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
                  checked={powerAdapter}
                  onChange={() => setPowerAdapter(!powerAdapter)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
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
                  checked={powerCable}
                  onChange={() => setPowerCable(!powerCable)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
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
                    checked={protectionBundle}
                    onChange={() => setProtectionBundle(!protectionBundle)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            {/* Power Cable New */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <img
                  src={pawerCableNew}
                  alt="Power Cable New"
                  className="h-6 w-6"
                />
                <label
                  htmlFor="powerCableNewIncluded"
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
                  checked={powerCableNewIncluded}
                  onChange={() =>
                    setPowerCableNewIncluded(!powerCableNewIncluded)
                  }
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* HDMI */}
            <div className="flex flex-row items-center justify-between py-2">
              <div className="flex flex-row items-center gap-2">
                <img src={hdmiCable} alt="HDMI Cable" className="h-6 w-6" />
                <label
                  htmlFor="hdmi"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  HDMI
                </label>
              </div>
              <label className="items-center cursor-pointer">
                <input
                  id="hdmi"
                  name="hdmi"
                  type="checkbox"
                  checked={hdmi}
                  onChange={() => setHdmi(!hdmi)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
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
                  checked={onexcontroller}
                  onChange={() => setOnexcontroller(!onexcontroller)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* twoxcontroller */}
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
                  checked={twoxcontroller}
                  onChange={() => setTwoxcontroller(!twoxcontroller)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* FreeSim */}
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <img src={SimImg} alt="freeSim" className="h-6 w-6" />
                  <label
                    htmlFor="freesim"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Free Sim
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="freesim"
                    name="freesim"
                    type="checkbox"
                    checked={freeSim}
                    onChange={() => setFreeSim(!freeSim)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
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
                    name="ScreenProtector"
                    type="checkbox"
                    checked={onexScreenProtector}
                    onChange={() =>
                      setOnexScreenProtector(!onexScreenProtector)
                    }
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
            {/* One X Back Cover */}
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                  <img src={BackCoverImg} alt="BackCover" className="h-6 w-6" />
                  <label
                    htmlFor="BackCover"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    1x Back Cover
                  </label>
                </div>
                <label className="items-center cursor-pointer">
                  <input
                    id="BackCover"
                    name="BackCover"
                    type="checkbox"
                    checked={onexBackCover}
                    onChange={() => setOnexBackCover(!onexBackCover)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
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
                    checked={treePlanted}
                    onChange={() => setTreePlanted(!treePlanted)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ComesWithAccessories.propTypes = {
  powerAdapter: PropTypes.bool.isRequired,
  setPowerAdapter: PropTypes.func.isRequired,
  powerCable: PropTypes.bool.isRequired,
  setPowerCable: PropTypes.func.isRequired,
  protectionBundle: PropTypes.bool.isRequired,
  setProtectionBundle: PropTypes.func.isRequired,
  treePlanted: PropTypes.bool.isRequired,
  setTreePlanted: PropTypes.func.isRequired,
  hdmi: PropTypes.bool.isRequired,
  setHdmi: PropTypes.func.isRequired,
  powerCableNewIncluded: PropTypes.bool.isRequired,
  setPowerCableNewIncluded: PropTypes.func.isRequired,
  onexcontroller: PropTypes.bool.isRequired,
  setOnexcontroller: PropTypes.func.isRequired,
  twoxcontroller: PropTypes.bool.isRequired,
  setTwoxcontroller: PropTypes.func.isRequired,
  freeSim: PropTypes.bool.isRequired,
  setFreeSim: PropTypes.func.isRequired,
  onexScreenProtector: PropTypes.bool.isRequired,
  setOnexScreenProtector: PropTypes.func.isRequired,
  onexBackCover: PropTypes.bool.isRequired,
  setOnexBackCover: PropTypes.func.isRequired,
};
