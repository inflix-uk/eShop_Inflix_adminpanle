import { Fragment, useState, useMemo } from "react";
import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

/**
 * ProductPreviewModal - Shows how the product will look on the website
 * Mimics the website's product page layout
 */
const ProductPreviewModal = ({ isOpen, onClose, product, backendUrl }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeTab, setActiveTab] = useState("summary");

  // Get all images (gallery + variant images)
  const allImages = useMemo(() => {
    if (!product) return [];

    const images = [];

    // Add thumbnail
    if (product.thumbnail_image?.url || product.thumbnail_image?.path) {
      images.push({
        url: product.thumbnail_image.url || `${backendUrl}${product.thumbnail_image.path}`,
        label: "Thumbnail"
      });
    }

    // Add gallery images
    if (product.Gallery_Images?.length > 0) {
      product.Gallery_Images.forEach((img, idx) => {
        if (img.url || img.path) {
          images.push({
            url: img.url || `${backendUrl}${img.path}`,
            label: `Gallery ${idx + 1}`
          });
        }
      });
    }

    return images;
  }, [product, backendUrl]);

  // Get variant names and options
  const variantConfig = useMemo(() => {
    if (!product?.variantNames) return [];
    return product.variantNames.map(variant => ({
      name: variant.name,
      displayName: variant.name.charAt(0).toUpperCase() + variant.name.slice(1),
      options: variant.options?.map(opt => ({
        value: opt.value || opt,
        slug: opt.slug || opt,
        colorCode: opt.colorCode
      })) || []
    }));
  }, [product]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!product?.variantValues || Object.keys(selectedOptions).length === 0) {
      // Return first variant as default
      if (Array.isArray(product?.variantValues) && product.variantValues.length > 0) {
        return product.variantValues[0];
      }
      if (typeof product?.variantValues === 'object' && !Array.isArray(product?.variantValues)) {
        const keys = Object.keys(product.variantValues);
        if (keys.length > 0) {
          return { name: keys[0], ...product.variantValues[keys[0]] };
        }
      }
      return null;
    }

    // Find matching variant
    const variantKey = Object.values(selectedOptions).join('-').toLowerCase();

    if (Array.isArray(product.variantValues)) {
      return product.variantValues.find(v => v.name?.toLowerCase() === variantKey);
    }

    return product.variantValues[variantKey] || null;
  }, [product, selectedOptions]);

  // Price display
  const priceInfo = useMemo(() => {
    if (selectedVariant) {
      return {
        price: selectedVariant.Price || 0,
        salePrice: selectedVariant.salePrice || selectedVariant.Price || 0,
        quantity: selectedVariant.Quantity
      };
    }
    return { price: 0, salePrice: 0, quantity: 0 };
  }, [selectedVariant]);

  // Calculate discount percentage
  const discountPercent = useMemo(() => {
    if (priceInfo.price && priceInfo.salePrice && priceInfo.price > priceInfo.salePrice) {
      return Math.round(((priceInfo.price - priceInfo.salePrice) / priceInfo.price) * 100);
    }
    return 0;
  }, [priceInfo]);

  // Navigation handlers
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Stock status
  const getStockStatus = (quantity) => {
    if (!quantity || quantity === 0) return { text: "Out of Stock", color: "red" };
    if (quantity <= 5) return { text: `Only ${quantity} left!`, color: "red" };
    if (quantity <= 10) return { text: "Limited Stock", color: "yellow" };
    return { text: "In Stock", color: "green" };
  };

  const stockStatus = getStockStatus(priceInfo.quantity);

  if (!product) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-gray-900">
                      Product Preview
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      Preview how this product will appear on the website
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        {allImages.length > 0 ? (
                          <>
                            <img
                              src={allImages[currentImageIndex]?.url}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />

                            {/* Discount Badge */}
                            {discountPercent > 0 && (
                              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{discountPercent}%
                              </div>
                            )}

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                              <>
                                <button
                                  onClick={prevImage}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                                >
                                  <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
                                </button>
                                <button
                                  onClick={nextImage}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                                >
                                  <ChevronRightIcon className="h-5 w-5 text-gray-700" />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No images available
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Gallery */}
                      {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                currentImageIndex === idx
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                      {/* Product Title & Category */}
                      <div>
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          {product.category}
                        </p>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {product.name}
                        </h1>
                        {product.condition && (
                          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {product.condition}
                          </span>
                        )}
                      </div>

                      {/* Price Section */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-gray-900">
                            £{Number(priceInfo.salePrice).toFixed(2)}
                          </span>
                          {priceInfo.price > priceInfo.salePrice && (
                            <span className="text-lg text-gray-400 line-through">
                              £{Number(priceInfo.price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                          stockStatus.color === 'green' ? 'text-blue-600' :
                          stockStatus.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            stockStatus.color === 'green' ? 'bg-blue-500' :
                            stockStatus.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {stockStatus.text}
                        </div>
                      </div>

                      {/* Variant Selectors */}
                      {variantConfig.length > 0 && (
                        <div className="space-y-4">
                          {variantConfig.map((variant) => (
                            <div key={variant.name}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {variant.displayName}
                              </label>
                              <RadioGroup
                                value={selectedOptions[variant.name] || ""}
                                onChange={(value) => setSelectedOptions(prev => ({
                                  ...prev,
                                  [variant.name]: value
                                }))}
                                className="flex flex-wrap gap-2"
                              >
                                {variant.options.map((option) => (
                                  <RadioGroup.Option
                                    key={option.slug}
                                    value={option.slug}
                                    className={({ checked }) =>
                                      `cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                        checked
                                          ? "border-blue-500 bg-blue-50 text-blue-700"
                                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                                      }`
                                    }
                                  >
                                    {option.colorCode ? (
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{ backgroundColor: option.colorCode }}
                                        />
                                        {option.value}
                                      </div>
                                    ) : (
                                      option.value
                                    )}
                                  </RadioGroup.Option>
                                ))}
                              </RadioGroup>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Trust Badges */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <TruckIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Free Delivery</span>
                        </div>
                        {product.has_warranty?.status && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              {product.has_warranty.Warranty_duration || "Warranty"}
                            </span>
                          </div>
                        )}
                        {product.is_refundable?.status && (
                          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                            <ArrowPathIcon className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">
                              {product.is_refundable.refund_duration || "Refundable"}
                            </span>
                          </div>
                        )}
                        {product.is_authenticated && (
                          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                            <CheckCircleIcon className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Comes With */}
                      {product.comes_With && Object.values(product.comes_With).some(v => v) && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Comes With</h3>
                          <div className="flex flex-wrap gap-2">
                            {product.comes_With.powerAdapter && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Power Adapter</span>
                            )}
                            {product.comes_With.powerCable && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Power Cable</span>
                            )}
                            {product.comes_With.protectionBundle && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Protection Bundle</span>
                            )}
                            {product.comes_With.hdmi && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">HDMI Cable</span>
                            )}
                            {product.comes_With.onexcontroller && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Controller</span>
                            )}
                            {product.comes_With.twoxcontroller && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">2x Controllers</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Add to Cart Button (Preview Only) */}
                      <button
                        disabled
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl opacity-75 cursor-not-allowed"
                      >
                        Add to Cart (Preview Only)
                      </button>
                    </div>
                  </div>

                  {/* Tabs for Description, Specs, etc. */}
                  <div className="mt-8 border-t pt-6">
                    <div className="flex gap-4 border-b">
                      {["summary", "description", "specifications"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="py-6">
                      {activeTab === "summary" && (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: product.Product_summary || "<p>No summary available</p>" }}
                        />
                      )}

                      {activeTab === "description" && (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: product.Product_description || "<p>No description available</p>" }}
                        />
                      )}

                      {activeTab === "specifications" && (
                        <div className="space-y-2">
                          {product.product_Specifications?.length > 0 ? (
                            product.product_Specifications.map((spec, idx) => (
                              <div key={idx} className="flex border-b border-gray-100 py-2">
                                <span className="w-1/3 text-sm font-medium text-gray-600">{spec.key}</span>
                                <span className="w-2/3 text-sm text-gray-900">{spec.value}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No specifications available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Values Table */}
                  {product.variantValues && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">All Variants</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-600">Variant</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-600">Sale Price</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(Array.isArray(product.variantValues)
                              ? product.variantValues
                              : Object.entries(product.variantValues).map(([key, val]) => ({ name: key, ...val }))
                            ).map((variant, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{variant.name}</td>
                                <td className="px-4 py-3 text-gray-600">£{Number(variant.Price || 0).toFixed(2)}</td>
                                <td className="px-4 py-3 text-blue-600 font-medium">£{Number(variant.salePrice || variant.Price || 0).toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    variant.Quantity > 10 ? 'bg-blue-100 text-blue-700' :
                                    variant.Quantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {variant.Quantity || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{variant.SKU || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProductPreviewModal;
