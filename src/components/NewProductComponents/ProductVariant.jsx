import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";

export default function ProductVariant({ variants, setVariants, saveData }) {
  // Dynamic variant attributes from API (only names initially)
  const [variantAttributes, setVariantAttributes] = useState([]);
  // Cache for loaded attribute values
  const [attributeValuesCache, setAttributeValuesCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingValues, setLoadingValues] = useState({});

  const auth = useAuth();

  useEffect(() => {
    fetchVariantAttributeNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch only variant attribute names (without values) - Step 1
  async function fetchVariantAttributeNames() {
    try {
      setLoading(true);
      const response = await axios.get(`${auth.ip}get/variant-attributes/names`);
      console.log("Variant Attribute Names API Response:", response.data);
      if (response.data.status === 200) {
        setVariantAttributes(response.data.variantAttributes);
        console.log("Loaded variant attribute names:", response.data.variantAttributes);
      } else {
        toast.error(response.data.message || "Failed to fetch variant attributes");
      }
    } catch (error) {
      console.error("Error fetching variant attribute names:", error);
      toast.error("Failed to load variant attributes");
    } finally {
      setLoading(false);
    }
  }

  // Fetch values for a specific attribute by ID - Step 2 (lazy loading)
  async function fetchAttributeValues(attributeId) {
    // Check if already cached
    if (attributeValuesCache[attributeId]) {
      console.log("Using cached values for:", attributeId);
      return attributeValuesCache[attributeId];
    }

    try {
      setLoadingValues(prev => ({ ...prev, [attributeId]: true }));
      const response = await axios.get(`${auth.ip}get/variant-attribute/${attributeId}/values`);
      console.log("Attribute Values API Response:", response.data);

      if (response.data.status === 200) {
        const values = response.data.values;
        // Cache the values
        setAttributeValuesCache(prev => ({ ...prev, [attributeId]: values }));
        console.log("Loaded values for attribute:", attributeId, values);
        return values;
      } else {
        toast.error(response.data.message || "Failed to fetch attribute values");
        return [];
      }
    } catch (error) {
      console.error("Error fetching attribute values:", error);
      toast.error("Failed to load attribute values");
      return [];
    } finally {
      setLoadingValues(prev => ({ ...prev, [attributeId]: false }));
    }
  }

  // Get available attributes for selection (excluding already selected ones)
  const getAvailableAttributes = (variant) => {
    const selectedSlugs = variants
      .filter((v) => v.id !== variant.id)
      .map((v) => v.selectedAttributeSlug)
      .filter(Boolean);

    return variantAttributes
      .filter((attr) => !selectedSlugs.includes(attr.slug))
      .map((attr) => ({
        value: attr.slug,
        label: attr.name,
        hasModels: attr.hasModels,
        attributeId: attr._id
      }));
  };

  // Get current attribute value for react-select
  const getCurrentAttributeValue = (variant) => {
    if (!variant.selectedAttributeSlug) return null;
    console.log("Looking for slug:", variant.selectedAttributeSlug, "in", variantAttributes.map(a => a.slug));
    const attr = variantAttributes.find(a => a.slug === variant.selectedAttributeSlug);
    if (!attr) {
      console.log("Attribute not found for slug:", variant.selectedAttributeSlug);
      return null;
    }
    return {
      value: attr.slug,
      label: attr.name,
      hasModels: attr.hasModels,
      attributeId: attr._id
    };
  };

  // Get options for a selected attribute (from cache)
  const getOptionsForAttribute = (attributeId, attributeSlug) => {
    const values = attributeValuesCache[attributeId];
    if (!values || values.length === 0) {
      console.log('No cached values found for:', attributeId);
      return [];
    }

    console.log('Cached values for', attributeSlug, ':', values);

    return values.map((val) => ({
      value: JSON.stringify({
        name: val.name,
        slug: val.slug,
        colorCode: val.colorCode || null,
        models: val.models || []
      }),
      label:
        attributeSlug === "color" && val.colorCode
          ? renderColorLabel(val.name, val.colorCode)
          : val.name
    }));
  };

  // Get models for a specific value (for hasModels attributes like Brand)
  const getModelsForValue = (attributeId, valueSlug) => {
    const values = attributeValuesCache[attributeId];
    const value = values?.find((v) => v.slug === valueSlug);

    return (value?.models || []).map((model) => ({
      value: JSON.stringify({ name: model.name, slug: model.slug }),
      label: model.name
    }));
  };

  const isColorAttribute = (variant) => {
    const slug = String(variant.selectedAttributeSlug || variant.name || "")
      .toLowerCase()
      .replace(/^variant\s+/, "")
      .trim();
    const name = String(variant.selectedAttributeName || "").toLowerCase();
    return (
      slug === "color" ||
      slug === "colour" ||
      slug.includes("colour") ||
      slug.includes("color") ||
      name.includes("colour") ||
      name.includes("color")
    );
  };

  // Render color label with swatch
  const renderColorLabel = (name, colorCode) => (
    <div className="flex items-center gap-2">
      <span
        className="w-4 h-4 rounded-full border border-gray-300 inline-block"
        style={{ backgroundColor: colorCode }}
      />
      <span>{name}</span>
      <span className="text-gray-400 text-xs">({colorCode})</span>
    </div>
  );

  // Check if all attributes have been selected
  const allAttributesSelected = variants.length >= variantAttributes.length;

  const addNewVariant = () => {
    const newVariantId =
      variants.length > 0 ? variants[variants.length - 1].id + 1 : 0;
    const newVariant = {
      id: newVariantId,
      name: `Variant ${newVariantId + 1}`,
      selectedAttributeSlug: "",
      selectedAttributeName: "",
      selectedAttributeId: null,
      hasModels: false,
      options: []
    };
    setVariants([...variants, newVariant]);
  };

  // Handle attribute type selection (e.g., Color, Brand, Storage)
  const handleAttributeChange = async (variantId, selectedOption) => {
    const selectedSlug = selectedOption?.value || "";
    const attribute = variantAttributes.find((a) => a.slug === selectedSlug);

    const updatedVariants = variants.map((variant) => {
      if (variant.id === variantId) {
        return {
          ...variant,
          selectedAttributeSlug: selectedSlug,
          selectedAttributeName: attribute?.name || "",
          selectedAttributeId: attribute?._id || null,
          hasModels: attribute?.hasModels || false,
          options: [] // Reset options when attribute changes
        };
      }
      return variant;
    });
    setVariants(updatedVariants);

    // Fetch values for the selected attribute (lazy loading)
    if (attribute?._id) {
      await fetchAttributeValues(attribute._id);
    }
  };

  // Handle option selection for an attribute
  const handleOptionChange = (variantId, selectedOptions) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        if (variant.id === variantId) {
          const options = selectedOptions.map((option, index) => {
            const parsed = JSON.parse(option.value);
            return {
              id: index,
              name: parsed.name,
              slug: parsed.slug,
              colorCode: parsed.colorCode || null,
              models: variant.hasModels ? [] : undefined // Initialize empty models array for hasModels
            };
          });
          return {
            ...variant,
            options
          };
        }
        return variant;
      })
    );
  };

  // Handle model selection for hasModels attributes (e.g., Brand → Models)
  const handleModelChange = (variantId, optionSlug, selectedModels) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        if (variant.id === variantId) {
          const updatedOptions = variant.options.map((opt) => {
            if (opt.slug === optionSlug) {
              return {
                ...opt,
                models: selectedModels.map((m) => JSON.parse(m.value))
              };
            }
            return opt;
          });
          return {
            ...variant,
            options: updatedOptions
          };
        }
        return variant;
      })
    );
  };

  const removeVariant = (variantId) => {
    setVariants((prevVariants) =>
      prevVariants.filter((variant) => variant.id !== variantId)
    );
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent",
      display: "flex",
      flexWrap: "nowrap",
      boxShadow: "none",
      borderColor: "transparent"
    }),
    input: (provided, state) => ({
      ...provided,
      boxShadow: state.isFocused ? "none" : provided.boxShadow,
      outline: state.isFocused ? "none" : provided.outline,
      border: state.isFocused ? "none" : provided.border,
      caretColor: "#000"
    }),
    option: (provided) => ({
      ...provided,
      display: "flex",
      alignItems: "center"
    })
  };

  if (loading) {
    return (
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4 space-y-3">
          <h1 className="font-bold">Product Variants</h1>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="py-4 px-4 space-y-3">
        <div className="flex flex-row items-center justify-between">
          <h1 className="font-bold">Product Variants</h1>
          <button
            className="text-blue-600 bg-gray-50 group flex rounded-lg p-2 gap-2 text-sm leading-6 font-semibold border-gray-300 border disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addNewVariant}
            disabled={allAttributesSelected}
          >
            Add New Variant
          </button>
        </div>
        <div>
          {variants.map((variant) => (
            <div key={variant.id} className="mb-6">
              <div className="flex flex-row items-center justify-between mt-5 mb-1">
                <label
                  htmlFor={`variantName${variant.id}`}
                  className="block text-sm font-medium leading-6 text-gray-900 capitalize"
                >
                  {variant.name}
                </label>
                <div className="relative rounded-md w-3/4 flex flex-row">
                  <div className="flex-1">
                    <Select
                      id={`variantName${variant.id}`}
                      name={`variantName${variant.id}`}
                      value={getCurrentAttributeValue(variant)}
                      onChange={(selected) =>
                        handleAttributeChange(variant.id, selected)
                      }
                      options={getAvailableAttributes(variant)}
                      placeholder="Select an attribute..."
                      isClearable
                      styles={{
                        ...customStyles,
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: '38px',
                          borderColor: state.isFocused ? '#2563EB' : '#d1d5db',
                          boxShadow: state.isFocused ? '0 0 0 1px #2563EB' : 'none',
                          '&:hover': {
                            borderColor: '#2563EB'
                          }
                        })
                      }}
                      className="capitalize"
                    />
                  </div>
                  <button
                    className="text-red-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold ml-3 items-center border borer-gray-300"
                    onClick={() => removeVariant(variant.id)}
                  >
                    Remove
                    <svg
                      className="h-4 w-4 shrink-0 text-red-600 my-auto"
                      width="16"
                      height="18"
                      viewBox="0 0 16 18"
                      fill="none"
                    >
                      <path
                        d="M3 18C2.45 18 1.97933 17.8043 1.588 17.413C1.19667 17.0217 1.00067 16.5507 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8043 17.021 14.413 17.413C14.0217 17.805 13.5507 18.0007 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Options selection for selected attribute */}
              {variant.selectedAttributeSlug && (
                <div className="w-full mt-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900 mb-1 capitalize">
                    {variant.selectedAttributeName} Options
                  </label>
                  {loadingValues[variant.selectedAttributeId] ? (
                    <div className="flex items-center gap-2 p-3 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Loading {variant.selectedAttributeName} options...</span>
                    </div>
                  ) : getOptionsForAttribute(variant.selectedAttributeId, variant.selectedAttributeSlug).length === 0 ? (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                      No options available for {variant.selectedAttributeName}.
                      Please add values to this attribute in the Variant Attributes settings.
                    </div>
                  ) : (
                    <Select
                      isMulti
                      isSearchable={isColorAttribute(variant)}
                      closeMenuOnSelect={!isColorAttribute(variant)}
                      className="aa"
                      styles={customStyles}
                      value={variant.options.map((opt) => ({
                        value: JSON.stringify({
                          name: opt.name,
                          slug: opt.slug,
                          colorCode: opt.colorCode,
                          models: opt.models || []
                        }),
                        label:
                          isColorAttribute(variant) && opt.colorCode
                            ? renderColorLabel(opt.name, opt.colorCode)
                            : opt.name
                      }))}
                      options={getOptionsForAttribute(variant.selectedAttributeId, variant.selectedAttributeSlug)}
                      onChange={(selectedOptions) =>
                        handleOptionChange(variant.id, selectedOptions || [])
                      }
                      placeholder={
                        isColorAttribute(variant)
                          ? "Search colours..."
                          : `Select ${variant.selectedAttributeName} options...`
                      }
                      noOptionsMessage={() =>
                        isColorAttribute(variant) ? "No colours found" : "No options"
                      }
                      formatOptionLabel={(option) => {
                        // For color options, render with swatch
                        if (isColorAttribute(variant)) {
                          try {
                            const parsed = JSON.parse(option.value);
                            if (parsed.colorCode) {
                              return renderColorLabel(parsed.name, parsed.colorCode);
                            }
                          } catch {
                            return option.label;
                          }
                        }
                        return option.label;
                      }}
                    />
                  )}
                </div>
              )}

              {/* Model selection for hasModels attributes (e.g., Brand → Models) */}
              {variant.hasModels && variant.options.length > 0 && (
                <div className="mt-4 space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Models for Each {variant.selectedAttributeName}
                  </label>
                  {variant.options.map((option) => (
                    <div
                      key={option.slug}
                      className="pl-4 border-l-2 border-blue-200"
                    >
                      <p className="text-sm font-medium mb-1">{option.name}</p>
                      <Select
                        isMulti
                        styles={customStyles}
                        placeholder={`Select ${option.name} models...`}
                        options={getModelsForValue(
                          variant.selectedAttributeId,
                          option.slug
                        )}
                        value={(option.models || []).map((model) => ({
                          value: JSON.stringify(model),
                          label: model.name
                        }))}
                        onChange={(selected) =>
                          handleModelChange(variant.id, option.slug, selected)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            className="text-blue-600 bg-gray-50 group flex rounded-lg p-2 gap-2 text-sm leading-6 font-semibold border-gray-300 border"
            onClick={saveData}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

ProductVariant.propTypes = {
  variants: PropTypes.array.isRequired,
  setVariants: PropTypes.func.isRequired,
  saveData: PropTypes.func.isRequired
};
