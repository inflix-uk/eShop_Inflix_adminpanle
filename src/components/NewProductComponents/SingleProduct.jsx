import { useState } from "react";
import PropTypes from "prop-types";
export default function SingleProduct({
  productMetaTitle,
  setproductMetaTitle,
  productMetaDescription,
  setproductMetaDescription,
  productMetaImage,
  setproductMetaImage,
  handleProductMetaImage,
  productMetaKeywords,
  setproductMetaKeywords,
  productMetaSchema,
  setproductMetaSchema,
}) {
  const [schemas, setSchemas] = useState(productMetaSchema || [""]);

  const handleAddSchema = () => {
    setSchemas([...schemas, ""]);
  };

  const handleSchemaChange = (index, value) => {
    const updatedSchemas = schemas.map((schema, i) =>
      i === index ? value : schema
    );
    setSchemas(updatedSchemas);
    setproductMetaSchema(updatedSchemas); // Update the parent component's schema state
  };

  const handleRemoveSchema = (index) => {
    const updatedSchemas = schemas.filter((_, i) => i !== index);
    setSchemas(updatedSchemas);
    setproductMetaSchema(updatedSchemas); // Update the parent component's schema state
  };
  return (
    <>
      <div className="px-0  shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 space-y-3">
          <h1 className="font-bold">Seo Meta Tags</h1>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaTitle"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Title
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="metaTitle"
                id="metaTitle"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={productMetaTitle}
                onChange={(e) => setproductMetaTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaDesc"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Description
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <textarea
                id="about"
                name="about"
                rows="3"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={productMetaDescription}
                onChange={(e) => setproductMetaDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaDesc"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Keywords
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <textarea
                id="about"
                name="about"
                rows="3"
                className="block w-full rounded-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={productMetaKeywords}
                onChange={(e) => setproductMetaKeywords(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaDesc"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Schema
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <div className="flex justify-end mt-2 items-center w-full">
                <button
                  type="button"
                  onClick={handleAddSchema}
                  className="text-blue-600 bg-gray-50 group flex rounded-lg p-2 text-sm leading-6 font-bold border-gray-300 border "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Add Schema
                </button>
              </div>
              {schemas.map((schema, index) => (
                <div
                  key={index}
                  className="relative mt-2 rounded-md w-full flex items-center gap-2"
                >
                  <textarea
                    id={`metaSchema-${index}`}
                    name={`metaSchema-${index}`}
                    rows="3"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    value={schema}
                    onChange={(e) => handleSchemaChange(index, e.target.value)}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="text-red-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold ml-3 items-center border borer-gray-300"
                      onClick={() => handleRemoveSchema(index)}
                    >
                      Remove
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
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaDesc"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Image
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  {productMetaImage ? (
                    <>
                      <img
                        src={URL.createObjectURL(productMetaImage)}
                        alt="Thumbnail"
                        className="h-12 rounded-md mx-auto cursor-pointer"
                        onClick={() => setproductMetaImage(null)}
                      />
                      <p className="text-xs leading-5 text-red-600">
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
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="metaImage"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Upload image</span>
                      <input
                        id="metaImage"
                        name="metaImage"
                        type="file"
                        className="sr-only"
                        onChange={handleProductMetaImage}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

SingleProduct.propTypes = {
  productMetaTitle: PropTypes.string.isRequired,
  setproductMetaTitle: PropTypes.func.isRequired,
  productMetaDescription: PropTypes.string.isRequired,
  setproductMetaDescription: PropTypes.func.isRequired,
  productMetaImage: PropTypes.object,
  setproductMetaImage: PropTypes.func.isRequired,
  handleProductMetaImage: PropTypes.func.isRequired,
  productMetaKeywords: PropTypes.string.isRequired,
  setproductMetaKeywords: PropTypes.func.isRequired,
  productMetaSchema: PropTypes.array.isRequired,
  setproductMetaSchema: PropTypes.func.isRequired,
};
