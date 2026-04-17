import PropTypes from "prop-types";
import { useState, Fragment, useRef } from "react";
import { PlusIcon, XMarkIcon, EyeIcon, PhotoIcon, PencilIcon } from "@heroicons/react/20/solid";
import { Dialog, Transition } from "@headlessui/react";
import { Editor } from "@tinymce/tinymce-react";

const tinymceModalInit = {
  height: 250,
  menubar: false,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "charmap",
    "searchreplace",
    "code",
    "wordcount",
  ],
  toolbar:
    "undo redo | blocks fontsize | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist | link | removeformat",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } li > h1, li > h2, li > h3, li > h4, li > h5, li > h6 { display: inline; margin: 0; }",
};

export default function ProductSwitches({ product, setProduct }) {
  // Modal states for Top Section
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemImage, setNewItemImage] = useState(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const imageInputRef = useRef(null);
  const descriptionEditorRef = useRef(null);

  // Perks and Benefits modal states
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
  const [perksDescription, setPerksDescription] = useState("");
  const [perksImage, setPerksImage] = useState(null);
  const [perksImagePreview, setPerksImagePreview] = useState(null);
  const perksImageInputRef = useRef(null);
  const perksEditorRef = useRef(null);

  // Perks and Benefits handlers
  const handleOpenPerksModal = () => {
    const perksData = product?.perks_and_benefits || {};
    setPerksDescription(perksData.description || "");
    setPerksImage(perksData.image || null);
    setPerksImagePreview(perksData.image?.url || perksData.imagePreview || null);
    setIsPerksModalOpen(true);
  };

  const handleClosePerksModal = () => {
    setIsPerksModalOpen(false);
  };

  const handlePerksImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPerksImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPerksImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePerksImage = () => {
    setPerksImage(null);
    setPerksImagePreview(null);
    if (perksImageInputRef.current) {
      perksImageInputRef.current.value = "";
    }
  };

  const handleSavePerks = () => {
    setProduct({
      ...product,
      perks_and_benefits: {
        ...product.perks_and_benefits,
        status: product?.perks_and_benefits?.status || false,
        description: perksDescription,
        image: perksImage,
        imagePreview: perksImagePreview,
      },
    });
    handleClosePerksModal();
  };

  const handleOpenAddModal = () => {
    setNewItemName("");
    setNewItemDescription("");
    setNewItemImage(null);
    setNewItemImagePreview(null);
    setIsEditMode(false);
    setEditingIndex(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewItemName("");
    setNewItemDescription("");
    setNewItemImage(null);
    setNewItemImagePreview(null);
    setIsEditMode(false);
    setEditingIndex(null);
  };

  const handleEditItem = (item, index) => {
    setNewItemName(typeof item === "string" ? item : item.name || "");
    setNewItemDescription(typeof item === "string" ? "" : item.description || "");
    setNewItemImage(typeof item === "string" ? null : item.image || null);
    setNewItemImagePreview(typeof item === "string" ? null : item.imagePreview || item.image?.url || null);
    setIsEditMode(true);
    setEditingIndex(index);
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewItemImage(null);
    setNewItemImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSaveTopSection = () => {
    if (newItemName.trim() === "") return;
    const currentItems = product?.topsection || [];
    const newItem = {
      name: newItemName.trim(),
      description: newItemDescription.trim(),
      image: newItemImage || null,
      imagePreview: newItemImagePreview || null,
    };

    if (isEditMode && editingIndex !== null) {
      // Update existing item
      const updatedItems = [...currentItems];
      updatedItems[editingIndex] = newItem;
      setProduct({
        ...product,
        topsection: updatedItems,
      });
    } else {
      // Add new item
      setProduct({
        ...product,
        topsection: [...currentItems, newItem],
      });
    }
    handleCloseAddModal();
  };

  const handleRemoveTopSection = (index) => {
    const currentItems = product?.topsection || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setProduct({
      ...product,
      topsection: updatedItems,
    });
  };

  const handleViewItem = (item) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
  };

  const handleRefundableChange = () => {
    if (product.is_refundable?.status) {
      // If it was true, turn it off and reset the object
      setProduct({
        ...product,
        is_refundable: {
          status: false,
          refund_duration: "",
          refund_type: "Days",
        },
      });
    } else {
      // If it was false, turn it on and keep the previous values
      setProduct({
        ...product,
        is_refundable: {
          ...product.is_refundable,
          status: true,
        },
      });
    }
  };
  // Reusable compact toggle component
  const CompactToggle = ({ id, checked, onChange }) => (
    <label className="items-center cursor-pointer flex-shrink-0">
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="relative w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/30 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
    </label>
  );

  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-3 px-4">
          <h1 className="font-bold text-sm mb-3 pb-2 border-b border-gray-100">Product Toggles</h1>

          {/* Quick Toggles Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            {/* See Accessories */}
            <div className="flex items-center justify-between">
              <label htmlFor="seeAccessoriesWeDontNeed" className="text-xs text-gray-700">
                See Accessories
              </label>
              <CompactToggle
                id="seeAccessoriesWeDontNeed"
                checked={product?.seeAccessoriesWeDontNeed || false}
                onChange={() => setProduct({ ...product, seeAccessoriesWeDontNeed: !product.seeAccessoriesWeDontNeed })}
              />
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between">
              <label htmlFor="featured" className="text-xs text-gray-700">
                Featured
              </label>
              <CompactToggle
                id="featured"
                checked={product?.is_featured || false}
                onChange={() => setProduct({ ...product, is_featured: !product.is_featured })}
              />
            </div>

            {/* Verified Refurbished */}
            <div className="flex items-center justify-between">
              <label htmlFor="authentic" className="text-xs text-gray-700">
                Verified Refurbished
              </label>
              <CompactToggle
                id="authentic"
                checked={product?.is_authenticated || false}
                onChange={() => setProduct({ ...product, is_authenticated: !product.is_authenticated })}
              />
            </div>

            {/* Perks and Benefits */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <label htmlFor="perksAndBenefits" className="text-xs text-gray-700">
                  Perks
                </label>
                <button
                  type="button"
                  onClick={handleOpenPerksModal}
                  className="p-0.5 text-gray-400 hover:text-primary"
                  title="Edit Perks"
                >
                  <PencilIcon className="h-3 w-3" />
                </button>
              </div>
              <CompactToggle
                id="perksAndBenefits"
                checked={product?.perks_and_benefits?.status || false}
                onChange={() => setProduct({ ...product, perks_and_benefits: { ...product.perks_and_benefits, status: !product?.perks_and_benefits?.status } })}
              />
            </div>
          </div>

          {/* Refundable Section */}
          <div className="border-t border-gray-100 pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="refundable" className="text-xs font-medium text-gray-700">
                Refundable
              </label>
              <CompactToggle
                id="refundable"
                checked={product?.is_refundable?.status || false}
                onChange={handleRefundableChange}
              />
            </div>
            {product?.is_refundable?.status && (
              <div className="flex items-center gap-2 pl-2">
                <input
                  type="number"
                  className="w-16 rounded-md border-0 py-1 px-2 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  value={product?.is_refundable?.refund_duration || ""}
                  onChange={(e) => setProduct({ ...product, is_refundable: { ...product.is_refundable, refund_duration: e.target.value } })}
                />
                <select
                  className="rounded-md border-0 py-1 px-2 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary"
                  value={product?.is_refundable?.refund_type || "Day"}
                  onChange={(e) => setProduct({ ...product, is_refundable: { ...product.is_refundable, refund_type: e.target.value } })}
                >
                  <option value="Day">Days</option>
                  <option value="Month">Months</option>
                </select>
              </div>
            )}
          </div>

          {/* Warranty Section */}
          <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="warranty" className="text-xs font-medium text-gray-700">
                Warranty
              </label>
              <CompactToggle
                id="warranty"
                checked={product?.has_warranty?.status || false}
                onChange={() => setProduct({ ...product, has_warranty: { ...product.has_warranty, status: !product.has_warranty?.status } })}
              />
            </div>
            {product?.has_warranty?.status && (
              <div className="space-y-2 pl-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="replacementWarranty" className="text-xs text-gray-600">
                    Replacement
                  </label>
                  <CompactToggle
                    id="replacementWarranty"
                    checked={product?.has_warranty?.has_replacement_warranty || false}
                    onChange={() => setProduct({ ...product, has_warranty: { ...product.has_warranty, has_replacement_warranty: !product.has_warranty?.has_replacement_warranty } })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 rounded-md border-0 py-1 px-2 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary"
                    placeholder="0"
                    value={product?.has_warranty?.Warranty_duration || ""}
                    onChange={(e) => setProduct({ ...product, has_warranty: { ...product.has_warranty, Warranty_duration: e.target.value } })}
                  />
                  <select
                    className="rounded-md border-0 py-1 px-2 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary"
                    value={product?.has_warranty?.Warranty_type || "Day"}
                    onChange={(e) => setProduct({ ...product, has_warranty: { ...product.has_warranty, Warranty_type: e.target.value } })}
                  >
                    <option value="Day">Days</option>
                    <option value="Month">Months</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Perks and Benefits Modal */}
      <Transition appear show={isPerksModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClosePerksModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Perks and Benefits
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image (Optional)
                      </label>
                      {perksImagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={perksImagePreview}
                            alt="Preview"
                            className="w-[157px] h-[128px] object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePerksImage}
                            className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => perksImageInputRef.current?.click()}
                          className="flex flex-col items-center justify-center w-[157px] h-[128px] border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary transition-colors"
                        >
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                          <span className="mt-1 text-xs text-gray-500">Click to upload</span>
                        </div>
                      )}
                      <input
                        ref={perksImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePerksImageChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Editor
                        tinymceScriptSrc="/tinymce/tinymce.min.js"
                        licenseKey="gpl"
                        onInit={(evt, editor) => {
                          perksEditorRef.current = editor;
                        }}
                        value={perksDescription}
                        init={tinymceModalInit}
                        onEditorChange={(newContent) => setPerksDescription(newContent)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleClosePerksModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleSavePerks}
                    >
                      Save
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

ProductSwitches.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
