import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
} from "react-icons/fa";

const CONTACT_TYPES = [
  {
    value: "phone",
    label: "Phone",
    Icon: FaPhoneAlt,
    placeholder: "+44 161 000 0000",
    hint: "Opens the phone dialler when tapped.",
  },
  {
    value: "email",
    label: "Email",
    Icon: FaEnvelope,
    placeholder: "sales@yourstore.com",
    hint: "Opens the visitor's email app.",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    Icon: FaWhatsapp,
    placeholder: "+44 7700 900123",
    hint: "Use the full number with country code (e.g. +44…). Opens a WhatsApp chat.",
  },
  {
    value: "address",
    label: "Address",
    Icon: FaMapMarkerAlt,
    placeholder: "1 High Street, Manchester, M1 1AA",
    hint: "Shown as plain text.",
  },
];

const typeConfig = (type) =>
  CONTACT_TYPES.find((t) => t.value === type) || CONTACT_TYPES[0];

const defaultForm = {
  isEnabled: false,
  title: "Contact Us",
  items: [],
};

const ContactSectionEditor = ({ data, onSave, isSaving }) => {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (data) {
      setFormData({
        isEnabled: data.isEnabled === true,
        title: data.title ?? "",
        items: Array.isArray(data.items)
          ? data.items.map((item) => ({
              type: typeConfig(item?.type).value,
              label: item?.label || "",
              value: item?.value || "",
              isActive: item?.isActive !== false,
            }))
          : [],
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (type) => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { type, label: "", value: "", isActive: true }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleMoveItem = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.items.length) return;
    const items = [...formData.items];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setFormData((prev) => ({ ...prev, items }));
  };

  const handleSave = () => {
    if (formData.items.some((item) => !item.value.trim())) {
      toast.error("Fill in each contact detail or remove the empty row");
      return;
    }
    onSave({
      ...formData,
      items: formData.items.map((item, index) => ({ ...item, order: index })),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact</h2>
      <p className="text-gray-600 text-sm mb-8">
        A footer column with your phone, email, WhatsApp and address. Each line
        gets its icon automatically. Change where the column sits under
        &ldquo;Layout &amp; Colours&rdquo;.
      </p>

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) => handleChange("isEnabled", e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          <span className="text-gray-800 font-medium">
            Show contact column in footer
          </span>
        </label>

        <div>
          <label
            htmlFor="contact-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Column title
          </label>
          <input
            id="contact-title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            maxLength={200}
            placeholder="e.g. Contact Us"
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 mr-1">Add:</span>
            {CONTACT_TYPES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAddItem(value)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <FaPlus size={10} />
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {formData.items.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              No contact details yet. Add a phone, email, WhatsApp or address.
            </p>
          ) : null}

          <div className="space-y-4">
            {formData.items.map((item, index) => {
              const config = typeConfig(item.type);
              const Icon = config.Icon;
              return (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="flex items-center gap-2 font-medium text-gray-700">
                      <Icon /> {config.label}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        title="Move up"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === formData.items.length - 1}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        title="Move down"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleItemChange(index, "type", e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {CONTACT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {config.label === "Address" ? "Address" : `${config.label} detail`}
                      </label>
                      {item.type === "address" ? (
                        <textarea
                          rows={2}
                          value={item.value}
                          onChange={(e) =>
                            handleItemChange(index, "value", e.target.value)
                          }
                          maxLength={500}
                          placeholder={config.placeholder}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      ) : (
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) =>
                            handleItemChange(index, "value", e.target.value)
                          }
                          maxLength={500}
                          placeholder={config.placeholder}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      )}
                      <p className="text-xs text-gray-500 mt-1">{config.hint}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text to show{" "}
                        <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) =>
                          handleItemChange(index, "label", e.target.value)
                        }
                        maxLength={200}
                        placeholder={
                          item.type === "whatsapp"
                            ? "e.g. Chat on WhatsApp"
                            : "Leave empty to show the detail itself"
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <label className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isActive}
                          onChange={(e) =>
                            handleItemChange(index, "isActive", e.target.checked)
                          }
                          className="rounded border-gray-300 text-primary focus:ring-primary/30"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save contact section"}
        </button>
      </div>
    </div>
  );
};

export default ContactSectionEditor;
