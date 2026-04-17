import { useState } from "react";
import PropTypes from "prop-types";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProductSingleMetaTags({
  product,
  setProduct,
  productMetaImage,
  setproductMetaImage,
}) {
  const [schemas, setSchemas] = useState(
    product.Seo_Meta?.metaSchemas?.length ? product.Seo_Meta.metaSchemas : [""]
  ); // Initialize with existing schemas or a single empty schema

  const handleAddSchema = () => {
    setSchemas([...schemas, ""]);
  };

  const handleSchemaChange = (index, value) => {
    const updatedSchemas = schemas.map((schema, i) =>
      i === index ? value : schema
    );
    setSchemas(updatedSchemas);
    setProduct((prevProduct) => ({
      ...prevProduct,
      Seo_Meta: {
        ...prevProduct.Seo_Meta,
        metaSchemas: updatedSchemas,
      },
    }));
  };

  const handleRemoveSchema = (index) => {
    const updatedSchemas = schemas.filter((_, i) => i !== index);
    setSchemas(updatedSchemas);
    setProduct((prevProduct) => ({
      ...prevProduct,
      Seo_Meta: {
        ...prevProduct.Seo_Meta,
        metaSchemas: updatedSchemas,
      },
    }));
  };

  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4 space-y-3">
          <h1 className="font-bold">SEO Meta Tags</h1>
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
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                value={product.Seo_Meta?.metaTitle || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    Seo_Meta: {
                      ...product.Seo_Meta,
                      metaTitle: e.target.value,
                    },
                  });
                }}
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
                id="metaDesc"
                name="metaDesc"
                rows="3"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                value={product.Seo_Meta?.metaDescription || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    Seo_Meta: {
                      ...product.Seo_Meta,
                      metaDescription: e.target.value,
                    },
                  });
                }}
              />
            </div>
          </div>

          {/* Meta Keywords Input */}
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaKeywords"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Keywords
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <input
                type="text"
                name="metaKeywords"
                id="metaKeywords"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                value={product.Seo_Meta?.metaKeywords || ""}
                onChange={(e) => {
                  setProduct({
                    ...product,
                    Seo_Meta: {
                      ...product.Seo_Meta,
                      metaKeywords: e.target.value,
                    },
                  });
                }}
                placeholder="Enter keywords separated by commas"
              />
            </div>
          </div>
          {/* Meta Schemas */}
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaSchema"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Schema
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <div className="flex justify-end mt-2 items-center w-full">
                <button
                  type="button"
                  onClick={handleAddSchema}
                  className="text-blue-600 bg-gray-50 group flex rounded-lg p-2 text-sm leading-6 font-bold border-gray-300 border"
                >
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
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
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meta Image Section */}
          <div className="flex flex-row items-center justify-between">
            <label
              htmlFor="metaImage"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Meta Image
            </label>
            <div className="relative mt-2 rounded-md shadow-sm w-3/4">
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  {product?.meta_Image?.path || productMetaImage ? (
                    <>
                      <img
                        src={
                          productMetaImage
                            ? productMetaImage
                            : `${BACKEND_URL}${product?.meta_Image?.path}`
                        }
                        alt="meta_Image"
                        className="h-12 rounded-md mx-auto cursor-pointer"
                        onClick={() => {
                          setproductMetaImage(null);
                          setProduct((prevProduct) => ({
                            ...prevProduct,
                            meta_Image: null,
                          }));
                        }}
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
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
                    >
                      <span>Upload a file</span>
                      <input
                        id="metaImage"
                        name="metaImage"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          const fileUrl = URL.createObjectURL(file);

                          setproductMetaImage(fileUrl);
                          setProduct((prevProduct) => {
                            const updatedProduct = {
                              ...prevProduct,
                              meta_Image: e.target.files[0],
                            };
                            console.log("Updated product:", updatedProduct);
                            return updatedProduct;
                          });
                        }}
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

ProductSingleMetaTags.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
  productMetaImage: PropTypes.string,
  setproductMetaImage: PropTypes.func.isRequired,
};
