import PropTypes from "prop-types";

export default function SingleProductType({
  productCost,
  setProductCost,
  productPrice,
  setProductPrice,
  productSalePrice,
  setProductSalePrice,
  productQty,
  productSKU,
  setProductQty,
  setProductSKU,
  productEIN,
  setProductEIN,
  productMPN,
  setProductMPN,
  productColor,
  setProductColor,
}) {
  return (
    <>
      <div className="px-0  shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 space-y-3">
          <h1 className="font-bold">Product Price And Stock</h1>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productCost"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Cost
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productCost"
                id="productCost"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={productCost}
                onChange={(e) =>
                  setProductCost(e.target.value.replace(/[^0-9.]/g, ""))
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productPrice"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Price
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productPrice"
                id="productPrice"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productSalePrice"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Sale Price
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productSalePrice"
                id="productSalePrice"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={productSalePrice}
                onChange={(e) => setProductSalePrice(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productQty"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Quantity
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productQty"
                id="productQty"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={productQty}
                onChange={(e) => setProductQty(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productSKU"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              SKU
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productSKU"
                id="productSKU"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter SKU"
                value={productSKU}
                onChange={(e) => setProductSKU(e.target.value)}
              />
            </div>
          </div>
          {/* EIN Field */}
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productEAN"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              EAN
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productEAN"
                id="productEAN"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter EAN"
                value={productEIN}
                onChange={(e) => setProductEIN(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productMPN"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              MPN
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productMPN"
                id="productMPN"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter MPN"
                value={productMPN}
                onChange={(e) => setProductMPN(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productColor"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Color
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productColor"
                id="productColor"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="e.g. Black, Gold, Clear"
                value={productColor || ""}
                onChange={(e) => setProductColor?.(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

SingleProductType.propTypes = {
  productCost: PropTypes.string.isRequired,
  setProductCost: PropTypes.func.isRequired,
  productPrice: PropTypes.string.isRequired,
  setProductPrice: PropTypes.func.isRequired,
  productSalePrice: PropTypes.string.isRequired,
  setProductSalePrice: PropTypes.func.isRequired,
  productQty: PropTypes.string.isRequired,
  productSKU: PropTypes.string.isRequired,
  setProductQty: PropTypes.func.isRequired,
  setProductSKU: PropTypes.func.isRequired,
  productEIN: PropTypes.string.isRequired,
  setProductEIN: PropTypes.func.isRequired,
  productMPN: PropTypes.string.isRequired,
  setProductMPN: PropTypes.func.isRequired,
  productColor: PropTypes.string,
  setProductColor: PropTypes.func,
};
