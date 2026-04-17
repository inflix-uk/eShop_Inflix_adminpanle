import { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ProductTypeDetail({
  ProductTypes,
  product,
  setProduct,
}) {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingTypeChange, setPendingTypeChange] = useState(null);

  const handleTypeChange = (newType) => {
    // If changing from variant to single, show warning
    if (product?.productType?.type === "variant" && newType === "single") {
      setPendingTypeChange(newType);
      setShowWarningModal(true);
    } else {
      // Allow single to variant or same type selection without warning
      updateProductType(newType);
    }
  };

  const updateProductType = (newType) => {
    if (newType === "single" && product?.productType?.type === "variant") {
      // Convert variant to single - keep only first variant's data
      const firstVariant = product.variantValues?.[0] || {};

      setProduct({
        ...product,
        productType: {
          type: "single",
        },
        variantValues: [
          {
            name: "single",
            Cost: firstVariant.Cost || null,
            Price: firstVariant.Price || null,
            Quantity: firstVariant.Quantity || null,
            SKU: firstVariant.SKU || null,
            EIN: firstVariant.EIN || null,
            MPN: firstVariant.MPN || null,
            salePrice: firstVariant.salePrice || null,
            status: true,
          },
        ],
        variantNames: [],
        varImgGroup: [],
        variantDescription: [],
      });
    } else {
      // Just update the type
      setProduct({
        ...product,
        productType: {
          type: newType,
        },
      });
    }
  };

  const confirmConversion = () => {
    if (pendingTypeChange) {
      updateProductType(pendingTypeChange);
    }
    setShowWarningModal(false);
    setPendingTypeChange(null);
  };

  const cancelConversion = () => {
    setShowWarningModal(false);
    setPendingTypeChange(null);
  };

  return (
    <>
      <div className=" px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
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
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    value={type.id}
                    checked={product?.productType?.type === type.id}
                    onChange={(e) => handleTypeChange(e.target.value)}
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

      {/* Warning Modal */}
      <Transition appear show={showWarningModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelConversion}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900"
                    >
                      Convert to Single Product?
                    </Dialog.Title>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-4 font-semibold">
                      This action will result in PERMANENT DATA LOSS:
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>
                              All variant combinations will be deleted
                            </strong>{" "}
                            ({product?.variantValues?.length || 0} variants → 1
                            product)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>Individual pricing per variant</strong> will
                            be lost
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>Individual inventory tracking</strong> per
                            variant will be lost
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>Variant-specific images</strong> will be
                            lost
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>Variant-specific SEO meta tags</strong> will
                            be lost
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>Individual SKUs</strong> for each variant
                            will be lost
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">❌</span>
                          <span>
                            <strong>
                              Customers will no longer be able to select options
                            </strong>{" "}
                            (color, storage, etc.)
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-2 font-semibold">
                        What will be kept:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          <span>
                            Data from first variant: Price, Cost, Quantity, SKU
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          <span>Main product images and gallery</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          <span>
                            Product description, specifications, and details
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={cancelConversion}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={confirmConversion}
                    >
                      Yes, Convert to Single Product
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

ProductTypeDetail.propTypes = {
  ProductTypes: PropTypes.array.isRequired,
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
