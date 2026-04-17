import PropTypes from "prop-types";

export default function ProductTypesComp({ ProductTypes, setProductType }) {
  return (
    <>
      <div className="px-0  shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 flex flex-row items-center justify-between">
          <h1 className="font-bold">Product Type</h1>
          <fieldset className="">
            <legend className="sr-only">Product Type</legend>
            <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
              {ProductTypes.map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    id={type.id}
                    name="notification-method"
                    type="radio"
                    defaultChecked={type.id === "singleProduct"}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                    value={type.id}
                    onClick={(e) => setProductType(e.target.value)}
                  />
                  <label
                    htmlFor={type.id}
                    className="ml-3 block text-sm font-medium leading-6 text-gray-900 cursor-pointer"
                  >
                    {type.title}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </>
  );
}

ProductTypesComp.propTypes = {
  ProductTypes: PropTypes.array.isRequired,
  setProductType: PropTypes.func.isRequired,
};
