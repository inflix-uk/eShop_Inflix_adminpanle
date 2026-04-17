"use client";

import PropTypes from "prop-types";
import ImageUploader from "../../../../banners/components/ImageUploader";

export default function InlineCategoryCardItemEditor({ item, index, onUpdateItem }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onUpdateItem({
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNumber = (e) => {
    const v = e.target.value;
    onUpdateItem({ itemCount: v === "" ? 0 : parseInt(v, 10) || 0 });
  };

  const toDataUrl = (field, file) => {
    if (!file) {
      onUpdateItem({ [field]: "" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onUpdateItem({ [field]: reader.result || "" });
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-lg border border-teal-200 bg-white p-3 shadow-sm space-y-3">
      <div className="border-b border-teal-100 pb-2 text-xs font-semibold text-teal-900">
        Card {index + 1}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category name *</label>
          <input
            type="text"
            name="categoryName"
            value={item.categoryName || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. Mobile-Phones"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shop now link *</label>
          <input
            type="text"
            name="shopNowLink"
            value={item.shopNowLink || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="/categories/Mobile-Phones"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Title color</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/i.test(item.categoryNameColor || "") ? item.categoryNameColor : "#000000"}
              onChange={(e) => onUpdateItem({ categoryNameColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-gray-300 p-1"
            />
            <input
              type="text"
              value={item.categoryNameColor || ""}
              onChange={(e) => onUpdateItem({ categoryNameColor: e.target.value })}
              className="w-24 rounded border border-gray-300 px-2 py-1 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Count color</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/i.test(item.itemCountColor || "") ? item.itemCountColor : "#6B7280"}
              onChange={(e) => onUpdateItem({ itemCountColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-gray-300 p-1"
            />
            <input
              type="text"
              value={item.itemCountColor || ""}
              onChange={(e) => onUpdateItem({ itemCountColor: e.target.value })}
              className="w-24 rounded border border-gray-300 px-2 py-1 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Item count</label>
          <input
            type="number"
            min={0}
            value={item.itemCount ?? 0}
            onChange={handleNumber}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              checked={item.isActive !== false}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary"
            />
            Active
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Overlay (optional)</label>
        <input
          type="text"
          name="overlayColor"
          value={item.overlayColor || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="#00000066 or rgba(0,0,0,0.35)"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ImageUploader
          label="Background image *"
          value={item.backgroundImage || ""}
          onChange={(file) => toDataUrl("backgroundImage", file)}
          required
          maxSizeMB={2}
        />
        <ImageUploader
          label="Category image (optional)"
          value={item.categoryImage || ""}
          onChange={(file) => toDataUrl("categoryImage", file)}
          maxSizeMB={2}
        />
      </div>
    </div>
  );
}

InlineCategoryCardItemEditor.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
};
