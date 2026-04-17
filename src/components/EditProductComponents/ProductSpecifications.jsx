import PropTypes from "prop-types";

export default function ProductSpecifications({
  product,
  addNewSpec,
  setProduct,
  removeSpec,
  saveSpecs,
}) {
  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4 space-y-3">
          <div className="flex flex-row items-center justify-between">
            <h1 className="font-bold">Specifications</h1>
            <button
              className="text-primary bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold"
              onClick={addNewSpec}
            >
              Add new
              <svg
                className="h-5 w-5 shrink-0 text-primary my-auto"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M8.5 18C8.5 18.3978 8.65804 18.7794 8.93934 19.0607C9.22064 19.342 9.60218 19.5 10 19.5C10.3978 19.5 10.7794 19.342 11.0607 19.0607C11.342 18.7794 11.5 18.3978 11.5 18V11.5H18C18.3978 11.5 18.7794 11.342 19.0607 11.0607C19.342 10.7794 19.5 10.3978 19.5 10C19.5 9.60218 19.342 9.22064 19.0607 8.93934C18.7794 8.65804 18.3978 8.5 18 8.5H11.5V2C11.5 1.60218 11.342 1.22064 11.0607 0.93934C10.7794 0.658035 10.3978 0.5 10 0.5C9.60218 0.5 9.22064 0.658035 8.93934 0.93934C8.65804 1.22064 8.5 1.60218 8.5 2V8.5H2C1.60218 8.5 1.22064 8.65804 0.93934 8.93934C0.658035 9.22064 0.5 9.60218 0.5 10C0.5 10.3978 0.658035 10.7794 0.93934 11.0607C1.22064 11.342 1.60218 11.5 2 11.5H8.5V18Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          {product?.product_Specifications?.map((spec, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-2 my-1"
            >
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Camera"
                value={spec.key}
                id={`specKey${index}`}
                onChange={(e) => {
                  const updatedSpecs = [...product.product_Specifications];
                  updatedSpecs[index] = {
                    ...updatedSpecs[index],
                    key: e.target.value,
                  };
                  setProduct({
                    ...product,
                    product_Specifications: updatedSpecs,
                  });
                }}
              />
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="50mp"
                value={spec.value}
                id={`specValue${index}`}
                onChange={(e) => {
                  const updatedSpecs = [...product.product_Specifications];
                  updatedSpecs[index] = {
                    ...updatedSpecs[index],
                    value: e.target.value,
                  };
                  setProduct({
                    ...product,
                    product_Specifications: updatedSpecs,
                  });
                }}
              />
              <button
                className="text-primary bg-gray-50 group flex gap-x-3 rounded-lg text-sm leading-6 font-semibold items-center"
                onClick={() => removeSpec(index)}
              >
                <svg
                  className="h-4 w-4 shrink-0 text-red-600 my-auto"
                  width="16"
                  height="18"
                  viewBox="0 0 16 18"
                  fill="none"
                >
                  <path
                    d="M3 18C2.45 18 1.97933 17.8043 1.588 17.413C1.19667 17.0217 1.00067 16.5507 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8043 17.021 14.413 17.413C14.0217 17.805 13.5507 18.0007 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              className="text-primary bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold"
              onClick={saveSpecs}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

ProductSpecifications.propTypes = {
  product: PropTypes.object.isRequired,
  addNewSpec: PropTypes.func.isRequired,
  setProduct: PropTypes.func.isRequired,
  removeSpec: PropTypes.func.isRequired,
  saveSpecs: PropTypes.func.isRequired,
};
