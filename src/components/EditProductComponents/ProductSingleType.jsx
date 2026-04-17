import PropTypes from "prop-types";

export default function ProductSingleType({ product, setProduct }) {
  // Safety check: ensure variantValues exists
  if (
    !product?.variantValues ||
    !Array.isArray(product.variantValues) ||
    product.variantValues.length === 0
  ) {
    return null;
  }

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
                type="number"
                name="productCost"
                id="productCost"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={product.variantValues[0]?.Cost || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        Cost: e.target.value,
                      },
                    ],
                  });
                  // console.log(product);
                }}
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
                type="number"
                name="productPrice"
                id="productPrice"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={product.variantValues[0]?.Price || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        Price: e.target.value,
                      },
                    ],
                  });
                }}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productCost"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Sale Price
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="number"
                name="productCost"
                id="productCost"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={product.variantValues[0]?.salePrice || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        salePrice: e.target.value,
                      },
                    ],
                  });
                }}
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
                type="number"
                name="productQty"
                id="productQty"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={product.variantValues[0]?.Quantity || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        Quantity: e.target.value,
                      },
                    ],
                  });
                }}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="productSKU"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Sku
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="productSKU"
                id="productSKU"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="0.0"
                value={product.variantValues[0]?.SKU || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        SKU: e.target.value,
                      },
                    ],
                  });
                }}
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Enter EAN"
                value={product.variantValues[0]?.EIN || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        EIN: e.target.value,
                      },
                    ],
                  });
                }}
              />
            </div>
          </div>

          {/* MPN Field */}
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Enter MPN"
                value={product.variantValues[0]?.MPN || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    variantValues: [
                      {
                        ...product.variantValues[0],
                        MPN: e.target.value,
                      },
                    ],
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ProductSingleType.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
