import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

const PLACEMENT_OPTIONS = [
  { value: "after_logo", label: "After Logo & Social Media" },
  { value: "after_useful_links", label: "After Useful Links" },
  { value: "after_customer_care", label: "After Customer Care" },
  { value: "after_newsletter", label: "After Newsletter" },
];

const defaultForm = {
  isEnabled: false,
  title: "Custom Links",
  placement: "after_useful_links",
  links: [],
};

const CustomSectionEditor = ({ data, onSave, isSaving }) => {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (data) {
      setFormData({
        isEnabled: data.isEnabled === true,
        title: data.title || defaultForm.title,
        placement: data.placement || defaultForm.placement,
        links: Array.isArray(data.links) ? data.links : [],
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddLink = () => {
    const newLink = {
      text: "",
      link: "",
      isActive: true,
      order: formData.links.length,
    };
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, newLink],
    }));
  };

  const handleRemoveLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i })),
    }));
  };

  const handleLinkChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleMoveLink = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.links.length) return;

    const newLinks = [...formData.links];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    newLinks.forEach((item, i) => {
      item.order = i;
    });

    setFormData((prev) => ({
      ...prev,
      links: newLinks,
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      title: (formData.title || "").trim(),
      placement: formData.placement || defaultForm.placement,
      links: formData.links.map((item, i) => ({
        ...item,
        order: i,
      })),
    });
  };

  const placementLabel =
    PLACEMENT_OPTIONS.find((opt) => opt.value === formData.placement)?.label ||
    "After Useful Links";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Custom Section</h2>
      <p className="text-gray-600 text-sm mb-6">
        Same link-column style as Useful Links. Choose where it appears in the
        footer; other columns shift forward to make room.
      </p>

      <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) => handleChange("isEnabled", e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary/30 h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-800">
            Enable custom section on storefront
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-2 ml-7">
          When disabled, existing footer columns keep their current layout.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g., Quick Links"
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Place after
        </label>
        <select
          value={formData.placement}
          onChange={(e) => handleChange("placement", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          {PLACEMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Custom column will render {placementLabel.toLowerCase()}. Any section
          that was already in that slot moves one column to the right.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Links</h3>
          <button
            type="button"
            onClick={handleAddLink}
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <FaPlus /> Add Link
          </button>
        </div>

        <div className="space-y-4">
          {formData.links.length === 0 && (
            <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4 text-center">
              No links yet. Add links to show in this custom column.
            </p>
          )}
          {formData.links.map((link, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-700">Link #{index + 1}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveLink(index, "up")}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveLink(index, "down")}
                    disabled={index === formData.links.length - 1}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) =>
                      handleLinkChange(index, "text", e.target.value)
                    }
                    placeholder="e.g., About Us"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={link.link}
                    onChange={(e) =>
                      handleLinkChange(index, "link", e.target.value)
                    }
                    placeholder="/about or https://..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) =>
                        handleLinkChange(index, "isActive", e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary/30"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Custom Section"}
        </button>
      </div>
    </div>
  );
};

export default CustomSectionEditor;
