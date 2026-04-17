import PropTypes from "prop-types";
import { useState, Fragment, useRef } from "react";
import { PlusIcon, XMarkIcon, EyeIcon, PhotoIcon, PencilIcon } from "@heroicons/react/20/solid";
import { Dialog, Transition } from "@headlessui/react";
import { Editor } from "@tinymce/tinymce-react";

// Import all icons
import Adapter from "../../assets/Adapter";
import PowerCable from "../../assets/PowerCable";
import ProtectionBundle from "../../assets/ProtectionBundle";
import Tree from "../../assets/Tree";
import hdmiCable from "../../assets/hdmi-cable.png";
import powerCableNew from "../../assets/Pawer-cable.png";
import onexcontrollerImg from "../../assets/onexcontroller.png";
import twoxcontrollerImg from "../../assets/twoxcontroller.png";
import SimImg from "../../assets/sim.png";
import ScreenProtectorImg from "../../assets/screenprotector.png";
import BackCoverImg from "../../assets/backcover.png";

// Available icons list
const AVAILABLE_ICONS = [
  { id: "noIcon", name: "No Icon", type: "none" },
  { id: "powerAdapter", name: "Power Adapter", type: "component", component: Adapter },
  { id: "chargingCable", name: "Charging Cable", type: "component", component: PowerCable },
  { id: "protectionBundle", name: "Protection Bundle", type: "component", component: ProtectionBundle },
  { id: "powerCableNew", name: "Power Cable", type: "image", src: powerCableNew },
  { id: "hdmiCable", name: "HDMI Cable", type: "image", src: hdmiCable },
  { id: "onexController", name: "1x Controller", type: "image", src: onexcontrollerImg },
  { id: "twoxController", name: "2x Controller", type: "image", src: twoxcontrollerImg },
  { id: "freeSim", name: "Free Sim", type: "image", src: SimImg },
  { id: "screenProtector", name: "1x Screen Protector", type: "image", src: ScreenProtectorImg },
  { id: "backCover", name: "1x Back Cover", type: "image", src: BackCoverImg },
  { id: "treePlanted", name: "Tree Planted", type: "component", component: Tree },
];

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

// Icon renderer component
const IconRenderer = ({ icon, customIcon, className = "h-6 w-6" }) => {
  // Handle custom icon (SVG or any HTML)
  if (customIcon) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: customIcon }}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      />
    );
  }

  if (!icon) return null;

  // Handle noIcon
  if (icon === "noIcon" || icon?.id === "noIcon") {
    return (
      <span className={`${className} flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded`}>
        <XMarkIcon className="h-4 w-4" />
      </span>
    );
  }

  const iconData = AVAILABLE_ICONS.find((i) => i.id === icon.id || i.id === icon);
  if (!iconData) {
    // If not found in predefined icons, treat as custom icon string
    if (typeof icon === "string" && icon.includes("<")) {
      return (
        <span
          className={className}
          dangerouslySetInnerHTML={{ __html: icon }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        />
      );
    }
    return null;
  }

  if (iconData.type === "none") {
    return (
      <span className={`${className} flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded`}>
        <XMarkIcon className="h-4 w-4" />
      </span>
    );
  }

  if (iconData.type === "component") {
    const IconComponent = iconData.component;
    return <IconComponent className={className} />;
  }
  return <img src={iconData.src} alt={iconData.name} className={className} />;
};

IconRenderer.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  customIcon: PropTypes.string,
  className: PropTypes.string,
};

export default function ProductComesWith({ product, setProduct }) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [customIcon, setCustomIcon] = useState("");
  const [newItemImage, setNewItemImage] = useState(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const descriptionEditorRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleOpenAddModal = () => {
    setNewItemTitle("");
    setNewItemDescription("");
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setCustomIcon("");
    setNewItemImage(null);
    setNewItemImagePreview(null);
    setIsEditMode(false);
    setEditingIndex(null);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item, index) => {
    setNewItemTitle(item.title || "");
    setNewItemDescription(item.description || "");

    // Find the icon in AVAILABLE_ICONS or set to noIcon
    const foundIcon = AVAILABLE_ICONS.find((i) => i.id === item.icon);
    if (foundIcon) {
      setSelectedIcon(foundIcon);
      setCustomIcon("");
    } else if (item.icon && typeof item.icon === "string" && item.icon.includes("<")) {
      setSelectedIcon(AVAILABLE_ICONS[0]); // noIcon
      setCustomIcon(item.icon);
    } else {
      setSelectedIcon(AVAILABLE_ICONS[0]);
      setCustomIcon("");
    }

    // Handle image - preserve existing image object or File
    if (item.imagePreview) {
      setNewItemImagePreview(item.imagePreview);
    } else if (item.image?.url) {
      setNewItemImagePreview(item.image.url);
    } else {
      setNewItemImagePreview(null);
    }
    // Keep the existing image object (could be File or {filename, path, url})
    setNewItemImage(item.image || null);

    setIsEditMode(true);
    setEditingIndex(index);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewItemTitle("");
    setNewItemDescription("");
    setSelectedIcon(AVAILABLE_ICONS[0]);
    setCustomIcon("");
    setNewItemImage(null);
    setNewItemImagePreview(null);
    setIsEditMode(false);
    setEditingIndex(null);
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

  const handleSaveItem = () => {
    if (newItemTitle.trim() === "") return;
    const currentItems = product?.comesWith || [];

    // Determine which icon to use
    let iconValue = null;
    if (customIcon.trim()) {
      iconValue = customIcon.trim();
    } else if (selectedIcon.id !== "noIcon") {
      iconValue = selectedIcon.id;
    }

    const newItem = {
      title: newItemTitle.trim(),
      description: newItemDescription,
      icon: iconValue,
      image: newItemImage || null,
      imagePreview: newItemImagePreview || null,
    };

    if (isEditMode && editingIndex !== null) {
      // Update existing item
      const updatedItems = [...currentItems];
      updatedItems[editingIndex] = newItem;
      setProduct({
        ...product,
        comesWith: updatedItems,
      });
    } else {
      // Add new item
      setProduct({
        ...product,
        comesWith: [...currentItems, newItem],
      });
    }
    handleCloseAddModal();
  };

  const handleRemoveItem = (index) => {
    const currentItems = product?.comesWith || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setProduct({
      ...product,
      comesWith: updatedItems,
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

  const getIconName = (iconId) => {
    if (!iconId) return "No Icon";
    if (typeof iconId === "string" && iconId.includes("<")) return "Custom Icon";
    const icon = AVAILABLE_ICONS.find((i) => i.id === iconId);
    return icon?.name || "Custom Icon";
  };

  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4">
          <div className="flex flex-row items-center justify-between mb-2">
            <h1 className="font-bold">Comes with</h1>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center rounded-md bg-primary p-1.5 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Display added items */}
          {product?.comesWith?.length > 0 ? (
            <div className="flex flex-col gap-2 mt-2">
              {product.comesWith.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 border border-gray-200"
                >
                  <div className="flex items-center gap-2 flex-1 truncate">
                    <IconRenderer icon={item.icon} className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleViewItem(item)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditItem(item, index)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 focus:outline-none"
                      title="Delete"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No items added yet. Click + to add.
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseAddModal}>
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
                    {isEditMode ? "Edit Comes With Item" : "Add Comes With Item"}
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    {/* Icon Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Icon
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_ICONS.map((icon) => (
                          <button
                            key={icon.id}
                            type="button"
                            onClick={() => {
                              setSelectedIcon(icon);
                              setCustomIcon("");
                            }}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedIcon.id === icon.id && !customIcon
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            title={icon.name}
                          >
                            <IconRenderer icon={icon} className="h-6 w-6" />
                          </button>
                        ))}
                      </div>

                      {/* Custom Icon Input - Only show when No Icon is selected */}
                      {selectedIcon.id === "noIcon" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Or paste custom icon (SVG/HTML)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customIcon}
                              onChange={(e) => setCustomIcon(e.target.value)}
                              placeholder="Paste SVG or icon code here..."
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                            />
                            {customIcon && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                                <span className="text-xs text-gray-500">Preview:</span>
                                <IconRenderer customIcon={customIcon} className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        placeholder="Enter title..."
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image (315 x 257)
                      </label>
                      {newItemImagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={newItemImagePreview}
                            alt="Preview"
                            className="w-[157px] h-[128px] object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="flex flex-col items-center justify-center w-[157px] h-[128px] border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary transition-colors"
                        >
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                          <span className="mt-1 text-xs text-gray-500">Click to upload</span>
                          <span className="text-xs text-gray-400">315 x 257</span>
                        </div>
                      )}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {/* Description with Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Editor
                        tinymceScriptSrc="/tinymce/tinymce.min.js"
                        licenseKey="gpl"
                        onInit={(evt, editor) => {
                          descriptionEditorRef.current = editor;
                        }}
                        value={newItemDescription}
                        init={tinymceModalInit}
                        onEditorChange={(newContent) => setNewItemDescription(newContent)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleCloseAddModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleSaveItem}
                    >
                      {isEditMode ? "Update" : "Save"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* View Item Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseViewModal}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    <IconRenderer icon={viewingItem?.icon} className="h-6 w-6" />
                    {viewingItem?.title}
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    {/* Show image if available */}
                    {(viewingItem?.imagePreview || viewingItem?.image?.url) && (
                      <div className="flex justify-center">
                        <img
                          src={viewingItem?.imagePreview || viewingItem?.image?.url}
                          alt={viewingItem?.title || "Item image"}
                          className="max-w-[315px] max-h-[257px] object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Icon</h4>
                      <p className="text-sm text-gray-500">{getIconName(viewingItem?.icon)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                      {viewingItem?.description ? (
                        <div
                          className="text-sm text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: viewingItem.description }}
                        />
                      ) : (
                        <p className="text-sm text-gray-500">No description available</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleCloseViewModal}
                    >
                      Close
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

ProductComesWith.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
