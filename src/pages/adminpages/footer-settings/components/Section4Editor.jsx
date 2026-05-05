import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

const Section4Editor = ({ data, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    title: "Hot Selling Gadgets",
    links: [],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "Hot Selling Gadgets",
        links: data.links || [],
      });
    }
  }, [data]);

  const handleTitleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      title: e.target.value,
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
      links: prev.links.filter((_, i) => i !== index),
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
    // Update order
    newLinks.forEach((item, i) => {
      item.order = i;
    });

    setFormData((prev) => ({
      ...prev,
      links: newLinks,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Section 4: Hot Selling Gadgets
      </h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Links */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Product Links</h3>
          <button
            onClick={handleAddLink}
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <FaPlus /> Add Product Link
          </button>
        </div>

        <div className="space-y-4">
          {formData.links.map((link, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-700">Link #{index + 1}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveLink(index, "up")}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => handleMoveLink(index, "down")}
                    disabled={index === formData.links.length - 1}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) =>
                      handleLinkChange(index, "text", e.target.value)
                    }
                    placeholder="e.g., Apple iPhone 16"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product URL
                  </label>
                  <input
                    type="text"
                    value={link.link}
                    onChange={(e) =>
                      handleLinkChange(index, "link", e.target.value)
                    }
                    placeholder="/products/..."
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Section 4"}
        </button>
      </div>
    </div>
  );
};

export default Section4Editor;
