import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiPlus, FiX } from 'react-icons/fi';

const WarrantyList = ({ value = [], onChange, error }) => {
  const [warrantyItems, setWarrantyItems] = useState(value || []);

  const handleAdd = () => {
    const newItems = [...warrantyItems, ''];
    setWarrantyItems(newItems);
    onChange(newItems);
  };

  const handleChange = (index, newValue) => {
    const newItems = [...warrantyItems];
    newItems[index] = newValue;
    setWarrantyItems(newItems);
    onChange(newItems);
  };

  const handleRemove = (index) => {
    const newItems = warrantyItems.filter((_, i) => i !== index);
    setWarrantyItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Warranty Features
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 text-sm text-primary hover:text-secondary transition-colors"
        >
          <FiPlus size={16} />
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {warrantyItems.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No warranty items added</p>
        ) : (
          warrantyItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="e.g., 1-Year Warranty"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Remove warranty item"
              >
                <FiX size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

WarrantyList.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default WarrantyList;
