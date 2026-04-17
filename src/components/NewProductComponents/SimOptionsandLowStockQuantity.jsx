import PropTypes from "prop-types";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
export default function SimOptionsandLowStockQuantity({
  setSimOption,
  simOption,
  simOptions,
  setLowStockQty,
  lowStockQty,
  handleOptionChange,
}) {
  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4">
          <div className="flex justify-between">
            <h1 className="font-bold">Sim Options</h1>
            <p
              className="text-xs leading-5 text-red-600  cursor-pointer hover:underline"
              onClick={() => setSimOption(null)}
            >
              Clear
            </p>
          </div>
          <div className="divide-y-2">
            <RadioGroup
              value={simOption}
              onChange={handleOptionChange}
              className="mt-2 flex flex-col gap-2"
            >
              {simOptions.map((option) => (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  className={
                    "relative flex cursor-pointer rounded-lg border p-2 shadow-sm focus:outline-none"
                  }
                >
                  {({ checked }) => (
                    <>
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900">
                            {option.title}
                          </span>
                        </span>
                      </span>
                      <CheckCircleIcon
                        className={
                          !checked
                            ? "invisible h-5 w-5 text-blue-600"
                            : "h-5 w-5 text-blue-600"
                        }
                        aria-hidden="true"
                      />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
      <div className=" px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 space-y-3">
          <h1 className="font-bold">Low Stock Quantity</h1>
          <div className="flex flex-row items-center justify-between gap-3">
            <label
              htmlFor="lowStockqty"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Quantity
            </label>
            <div className="relative  rounded-md shadow-sm w-3/4">
              <input
                type="number"
                name="lowStockqty"
                id="lowStockqty"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="1"
                value={lowStockQty}
                onChange={(e) => {
                  setLowStockQty(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

SimOptionsandLowStockQuantity.propTypes = {
  setSimOption: PropTypes.func.isRequired,
  simOption: PropTypes.string,
  simOptions: PropTypes.array.isRequired,
  setLowStockQty: PropTypes.func.isRequired,
  lowStockQty: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  handleOptionChange: PropTypes.func.isRequired,
};
