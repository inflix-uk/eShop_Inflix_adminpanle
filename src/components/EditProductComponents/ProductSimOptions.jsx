import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";

export default function ProductSimOptions({ setProduct, product }) {
  const auth = useAuth();
  const [selectOptions, setSelectOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Fetch "Select Options" items from VariantAttribute API
  useEffect(() => {
    const fetchSelectOptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${auth.ip}get/variant-attributes`);
        if (response.data.status === 200 || response.data.status === 201) {
          const selectOptionsAttribute = response.data.variantAttributes.find(
            (attr) => attr.slug === "select_options"
          );

          if (selectOptionsAttribute && selectOptionsAttribute.values) {
            const activeItems = selectOptionsAttribute.values.filter(
              (item) => item.isActive !== false
            );
            setSelectOptions(activeItems);
          } else {
            setSelectOptions([]);
          }
        }
      } catch (err) {
        console.error("Error fetching select options:", err);
        setError("Failed to load options. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectOptions();
  }, [auth.ip]);

  // Get currently selected option (single slug)
  const selectedOption = product?.selectOption || null;

  // Get selected option data
  const selectedOptionData = selectedOption
    ? selectOptions.find((item) => item.slug === selectedOption)
    : null;

  // Get available options (filter by search)
  const availableOptions = selectOptions.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleSelectOption = (slug) => {
    setProduct({
      ...product,
      selectOption: slug,
    });
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // Handle clear selection
  const handleClear = () => {
    setProduct({
      ...product,
      selectOption: null,
    });
  };

  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-sm">Select Options</h1>
          {selectedOption && (
            <button
              type="button"
              className="text-xs text-red-500 hover:text-red-600 hover:underline"
              onClick={handleClear}
            >
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-3 text-red-500 text-xs">{error}</div>
        ) : selectOptions.length === 0 ? (
          <div className="text-center py-3 text-gray-500 text-xs">
            No options configured. <a href="/admin/variant-attributes" className="text-primary hover:underline">Add here</a>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs border rounded-md transition-all ${
                  isDropdownOpen ? "border-primary ring-1 ring-primary/20" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-gray-500">
                  {selectedOption ? "Change selection..." : "Select an option..."}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                  <div className="p-1.5 border-b border-gray-100">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableOptions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center">
                        No match
                      </div>
                    ) : (
                      availableOptions.map((option) => (
                        <button
                          key={option.slug}
                          type="button"
                          onClick={() => handleSelectOption(option.slug)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                            selectedOption === option.slug ? "bg-primary/5" : ""
                          }`}
                        >
                          <span className={`text-xs font-medium truncate ${selectedOption === option.slug ? "text-primary" : "text-gray-700"}`}>
                            {option.name}
                          </span>
                          {selectedOption === option.slug && (
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected option chip */}
            {selectedOptionData ? (
              <div className="flex flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded text-xs">
                  <span className="font-medium text-primary">{selectedOptionData.name}</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-primary/60 hover:text-red-500"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">No option selected</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ProductSimOptions.propTypes = {
  setProduct: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
};
