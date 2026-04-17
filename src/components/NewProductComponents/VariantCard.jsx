import PropTypes from "prop-types";

export default function VariantCard({
  variant,
  variantValues,
  updateVariantValue,
  toggleDropdown,
  modal,
  colorCode = null
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Variant Name */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {colorCode && (
            <span
              className="w-4 h-4 rounded-full border border-gray-300 inline-block flex-shrink-0"
              style={{ backgroundColor: colorCode }}
            />
          )}
          <span className="font-mono text-sm text-gray-800">{variant}</span>
        </div>
      </div>

      {/* Main Fields Grid */}
      <div className="space-y-3">
        {/* Cost */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cost
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].cost
                ? variantValues[variant].cost
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "cost", e.target.value)
            }
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].price
                ? variantValues[variant].price
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "price", e.target.value)
            }
          />
        </div>

        {/* Sale Price */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sale Price
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].salePrice
                ? variantValues[variant].salePrice
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "salePrice", e.target.value)
            }
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].quantity
                ? variantValues[variant].quantity
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "quantity", e.target.value)
            }
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].sku
                ? variantValues[variant].sku
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "sku", e.target.value)
            }
          />
        </div>

        {/* EAN */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            EAN
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].ein
                ? variantValues[variant].ein
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "ein", e.target.value)
            }
          />
        </div>

        {/* MPN */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            MPN
          </label>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={
              variantValues[variant] && variantValues[variant].mpn
                ? variantValues[variant].mpn
                : ""
            }
            onChange={(e) =>
              updateVariantValue(variant, "mpn", e.target.value)
            }
          />
        </div>
      </div>

      {/* Expand Button */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="relative rounded-md flex flex-row justify-end">
          <button
            className="text-blue-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold"
            onClick={() => {
              toggleDropdown(variant);
            }}
          >
            <svg
              className="h-3 w-3 shrink-0 text-blue-600 my-auto"
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
      </div>

      {/* Expanded Details Section */}
      {modal[variant] && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {/* Variant Images */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Variant Images
            </label>
            <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25">
              <div className="text-center py-4">
                <div className="flex flex-row gap-x-4 flex-wrap justify-center">
                  {variantValues[variant] &&
                  variantValues[variant].logo?.length > 0 ? (
                    variantValues[variant].logo.map((image, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(image)}
                        alt={`Image ${index + 1}`}
                        className="h-14 rounded-md py-2"
                      />
                    ))
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300 cursor-pointer"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Meta Title */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Meta Title
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Type product name"
              value={
                variantValues[variant] && variantValues[variant].metaTitle
                  ? variantValues[variant].metaTitle
                  : ""
              }
              onChange={(e) =>
                updateVariantValue(variant, "metaTitle", e.target.value)
              }
            />
          </div>

          {/* Meta Keywords */}
          <div>
            <label
              htmlFor="metaKeywords"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Meta Keywords
            </label>
            <input
              type="text"
              name="metaKeywords"
              id="metaKeywords"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Type meta keywords"
              value={
                variantValues[variant] && variantValues[variant].metaKeywords
                  ? variantValues[variant].metaKeywords
                  : ""
              }
              onChange={(e) =>
                updateVariantValue(variant, "metaKeywords", e.target.value)
              }
            />
          </div>

          {/* Meta Image */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-900 mt-4 mb-2"
            >
              Meta Image
            </label>
            <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25">
              <div className="text-center py-4">
                {variantValues[variant] &&
                variantValues[variant].metaImage ? (
                  <>
                    <img
                      src={URL.createObjectURL(
                        variantValues[variant].metaImage
                      )}
                      alt="Thumbnail"
                      className="h-12 rounded-md mx-auto cursor-pointer"
                      onClick={() =>
                        updateVariantValue(variant, "metaImage", null)
                      }
                    />
                    <p className="text-xs leading-5 text-red-600 mt-2">
                      Click image to delete
                    </p>
                  </>
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <div className="mt-2 text-sm leading-6 text-gray-600">
                  <label
                    htmlFor={`metaImage-${variant}`}
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload Image</span>
                    <input
                      id={`metaImage-${variant}`}
                      name={`metaImage-${variant}`}
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) =>
                        updateVariantValue(
                          variant,
                          "metaImage",
                          e.target.files[0]
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Meta Description
            </label>
            <textarea
              id="description"
              rows="4"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Meta description"
              value={
                variantValues[variant] && variantValues[variant].metaDesc
                  ? variantValues[variant].metaDesc
                  : ""
              }
              onChange={(e) =>
                updateVariantValue(variant, "metaDesc", e.target.value)
              }
            />
          </div>

          {/* Meta Schemas */}
          <div>
            <label
              htmlFor="metaSchemas"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Meta Schemas
            </label>

            <div className="flex items-center justify-between">
              <textarea
                id="metaSchema-0"
                rows="2"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter schema"
                value={
                  variantValues[variant]?.metaSchemas?.[0] || ""
                }
                onChange={(e) => {
                  const updatedSchemas = [
                    ...(variantValues[variant]?.metaSchemas || []),
                  ];
                  updatedSchemas[0] = e.target.value;
                  updateVariantValue(variant, "metaSchemas", updatedSchemas);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const updatedSchemas = [
                    ...(variantValues[variant]?.metaSchemas || []),
                    "",
                  ];
                  updateVariantValue(variant, "metaSchemas", updatedSchemas);
                }}
                className="text-blue-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold ml-2 border border-gray-300"
              >
                <svg
                  className="h-3 w-3 shrink-0 text-blue-600 my-auto"
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

            {/* Render additional schemas if they exist */}
            {variantValues[variant]?.metaSchemas
              ?.slice(1)
              .map((schema, index) => (
                <div
                  key={index + 1}
                  className="flex items-center w-full mt-2"
                >
                  <textarea
                    id={`metaSchema-${index + 1}`}
                    rows="2"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Enter schema"
                  value={schema}
                  onChange={(e) => {
                    const updatedSchemas = [
                      ...variantValues[variant]
                        .metaSchemas,
                    ];
                    updatedSchemas[index + 1] =
                      e.target.value;
                    updateVariantValue(
                      variant,
                      "metaSchemas",
                      updatedSchemas
                    );
                  }}
                />
                <button
                  type="button"
                  className="text-red-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold ml-2 items-center border border-gray-300"
                  onClick={() => {
                    const updatedSchemas =
                      variantValues[
                        variant
                      ].metaSchemas.filter(
                        (_, i) => i !== index + 1
                      );
                    updateVariantValue(
                      variant,
                      "metaSchemas",
                      updatedSchemas
                    );
                  }}
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
          </div>
        </div>
      )}
    </div>
  );
}

VariantCard.propTypes = {
  variant: PropTypes.string.isRequired,
  variantValues: PropTypes.object.isRequired,
  updateVariantValue: PropTypes.func.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  modal: PropTypes.object.isRequired,
  colorCode: PropTypes.string
};

