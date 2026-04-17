"use client";

import PropTypes from "prop-types";
import ImageUploader from "../../../../banners/components/ImageUploader";
import WarrantyList from "../../../../banners/components/WarrantyList";
import ColorSelector from "../../../../banners/components/ColorSelector";
import FontSizeSelector from "../../../../banners/components/FontSizeSelector";
import { defaultBannerContent } from "./bannerWidgetDefaults";

export default function InlineBannerItemEditor({ item, index, onUpdateItem }) {
  const content = item.content || defaultBannerContent();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("content.")) {
      const fieldName = name.split(".")[1];
      onUpdateItem({
        content: { ...content, [fieldName]: value },
      });
      return;
    }
    onUpdateItem({
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleColorChange = (field, colorValue) => {
    onUpdateItem({ content: { ...content, [field]: colorValue } });
  };

  const handleSizeChange = (field, sizeValue) => {
    onUpdateItem({ content: { ...content, [field]: sizeValue } });
  };

  const handleImageDataUrl = (field, file) => {
    if (!file) {
      onUpdateItem({ [field]: "" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateItem({ [field]: reader.result || "" });
    };
    reader.readAsDataURL(file);
  };

  const handleWarrantyChange = (warrantyItems) => {
    onUpdateItem({ content: { ...content, warranty: warrantyItems } });
  };

  return (
    <div className="rounded-lg border border-orange-200 bg-white p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-orange-100 pb-2">
        <span className="text-xs font-semibold text-orange-900">Banner {index + 1}</span>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">Banner type *</span>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`type-${item.id}`}
              value="simple"
              checked={item.type === "simple"}
              onChange={() => {
                if (item.type === "simple") return;
                onUpdateItem({
                  type: "simple",
                  extraImage: "",
                  content: defaultBannerContent(),
                  buttonText: item.buttonText || "SHOP NOW",
                  buttonLink: item.buttonLink || "",
                });
              }}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Simple (image + button)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`type-${item.id}`}
              value="full"
              checked={item.type === "full"}
              onChange={() => {
                if (item.type === "full") return;
                onUpdateItem({
                  type: "full",
                  buttonText: "",
                  buttonLink: "",
                  content: { ...defaultBannerContent(), ...item.content },
                });
              }}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Full featured</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor={`alt-${item.id}`} className="block text-sm font-medium text-gray-700">
          Alt text *
        </label>
        <input
          type="text"
          name="altText"
          id={`alt-${item.id}`}
          value={item.altText || ""}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
          placeholder="Describe the banner for accessibility"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ImageUploader
          label="Large image (desktop)"
          value={item.imageLarge || ""}
          onChange={(file) => handleImageDataUrl("imageLarge", file)}
          required
        />
        <ImageUploader
          label="Small image (mobile)"
          value={item.imageSmall || ""}
          onChange={(file) => handleImageDataUrl("imageSmall", file)}
          required
        />
      </div>

      {item.type === "simple" && (
        <>
          <div>
            <label htmlFor={`bt-${item.id}`} className="block text-sm font-medium text-gray-700">
              Button text *
            </label>
            <input
              type="text"
              name="buttonText"
              id={`bt-${item.id}`}
              value={item.buttonText || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
              placeholder="e.g. SHOP NOW"
            />
          </div>
          <div>
            <label htmlFor={`bl-${item.id}`} className="block text-sm font-medium text-gray-700">
              Button link *
            </label>
            <input
              type="url"
              name="buttonLink"
              id={`bl-${item.id}`}
              value={item.buttonLink || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {item.type === "full" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Text position</span>
              <div className="flex flex-wrap gap-3">
                {["left", "center", "right"].map((value) => (
                  <label key={value} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`textPosition-${item.id}`}
                      value={value}
                      checked={(content.textPosition || "right") === value}
                      onChange={() =>
                        onUpdateItem({ content: { ...content, textPosition: value } })
                      }
                      className="h-4 w-4 text-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm capitalize text-gray-700">{value}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Text alignment</span>
              <div className="flex flex-wrap gap-3">
                {["left", "center", "right"].map((value) => (
                  <label key={value} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`textAlign-${item.id}`}
                      value={value}
                      checked={(content.textAlign || "left") === value}
                      onChange={() =>
                        onUpdateItem({ content: { ...content, textAlign: value } })
                      }
                      className="h-4 w-4 text-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm capitalize text-gray-700">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              name="content.title"
              value={content.title || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
            />
            <ColorSelector
              label="Title color"
              value={content.titleColor}
              onChange={(color) => handleColorChange("titleColor", color)}
              defaultColor="#FFFFFF"
            />
            <FontSizeSelector
              label="Title size"
              value={content.titleSize}
              onChange={(size) => handleSizeChange("titleSize", size)}
              defaultSize="24px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subtitle *</label>
            <input
              type="text"
              name="content.subtitle"
              value={content.subtitle || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
            />
            <ColorSelector
              label="Subtitle color"
              value={content.subtitleColor}
              onChange={(color) => handleColorChange("subtitleColor", color)}
              defaultColor="#FFFFFF"
            />
            <FontSizeSelector
              label="Subtitle size"
              value={content.subtitleSize}
              onChange={(size) => handleSizeChange("subtitleSize", size)}
              defaultSize="32px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Paragraph</label>
            <input
              type="text"
              name="content.paragraph"
              value={content.paragraph || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
            />
            <ColorSelector
              label="Paragraph color"
              value={content.paragraphColor}
              onChange={(color) => handleColorChange("paragraphColor", color)}
              defaultColor="#FFFFFF"
            />
            <FontSizeSelector
              label="Paragraph size"
              value={content.paragraphSize}
              onChange={(size) => handleSizeChange("paragraphSize", size)}
              defaultSize="18px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="text"
              name="content.price"
              value={content.price || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
            />
            <ColorSelector
              label="Price color"
              value={content.priceColor}
              onChange={(color) => handleColorChange("priceColor", color)}
              defaultColor="#FF0000"
            />
            <FontSizeSelector
              label="Price size"
              value={content.priceSize}
              onChange={(size) => handleSizeChange("priceSize", size)}
              defaultSize="20px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Buy now link *</label>
            <input
              type="url"
              name="content.buynow"
              value={content.buynow || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sell now link</label>
            <input
              type="url"
              name="content.sellnow"
              value={content.sellnow || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
            />
          </div>

          <WarrantyList value={content.warranty || []} onChange={handleWarrantyChange} />

          <ImageUploader
            label="Extra image (product overlay)"
            value={item.extraImage || ""}
            onChange={(file) => handleImageDataUrl("extraImage", file)}
          />
        </>
      )}

      <div className="flex items-center pt-1">
        <input
          type="checkbox"
          name="isActive"
          id={`active-${item.id}`}
          checked={item.isActive !== false}
          onChange={handleChange}
          className="h-4 w-4 text-primary border-gray-300 rounded"
        />
        <label htmlFor={`active-${item.id}`} className="ml-2 text-sm text-gray-700">
          Active (show in carousel)
        </label>
      </div>
    </div>
  );
}

InlineBannerItemEditor.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
};
