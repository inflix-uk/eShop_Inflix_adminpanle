import PropTypes from 'prop-types';

// Predefined font sizes
const FONT_SIZES = [
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "22px", value: "22px" },
  { label: "24px", value: "24px" },
  { label: "26px", value: "26px" },
  { label: "28px", value: "28px" },
  { label: "30px", value: "30px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "40px", value: "40px" },
  { label: "48px", value: "48px" },
];

const FontSizeSelector = ({ label, value, onChange, defaultSize = "16px" }) => {
  const selectedSize = value || defaultSize;

  const handleSizeChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={selectedSize}
        onChange={handleSizeChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-white"
      >
        {FONT_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
      <div className="mt-1 text-xs text-gray-500">
        Selected: <span className="font-mono font-semibold">{selectedSize}</span>
      </div>
    </div>
  );
};

FontSizeSelector.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  defaultSize: PropTypes.string,
};

export default FontSizeSelector;
