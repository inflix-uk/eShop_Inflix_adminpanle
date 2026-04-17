import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";

export default function ProductVariants({
  variants,
  setVariants,
  saveVariants,
  existingVariantNames = [], // Pass existing variant attribute names from product
}) {
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

  // Pre-fetch values for existing variant attributes when component loads
  useEffect(() => {
    if (variantAttributes.length > 0 && variants.length > 0) {
      variants.forEach(async (variant) => {
        if (variant.selectedAttributeId && !attributeValuesCache[variant.selectedAttributeId]) {
          await fetchAttributeValues(variant.selectedAttributeId);
        }
        // Also try to match by slug if attributeId is missing
        if (variant.selectedAttributeSlug && !variant.selectedAttributeId) {
          const attr = variantAttributes.find(a => a.slug === variant.selectedAttributeSlug);
          if (attr && !attributeValuesCache[attr._id]) {
            await fetchAttributeValues(attr._id);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantAttributes, variants]);

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
      .filter((v) => v.id !== variant.id && v._id !== variant._id)
      .map((v) => v.selectedAttributeSlug || v.name)
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
    const slug = variant.selectedAttributeSlug || variant.name;
    if (!slug) return null;

    const attr = variantAttributes.find(a => a.slug === slug);
    if (!attr) {
      // Return a fallback for existing variants with unmatched slugs
      return {
        value: slug,
        label: variant.selectedAttributeName || variant.name || slug,
        hasModels: variant.hasModels || false,
        attributeId: variant.selectedAttributeId || variant.attributeId
      };
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
      // Show color swatch whenever colorCode exists (not just for "color" attribute)
      label: val.colorCode
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
    // Generate a unique numeric ID using timestamp + random
    const newVariantId = Date.now() + Math.floor(Math.random() * 1000);
    const newVariant = {
      id: newVariantId,
      _id: newVariantId,
      name: "",
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
      if (variant.id === variantId || variant._id === variantId) {
        return {
          ...variant,
          name: selectedSlug,
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
        if (variant.id === variantId || variant._id === variantId) {
          const options = selectedOptions.map((option, index) => {
            const parsed = JSON.parse(option.value);
            return {
              id: index,
              name: parsed.name,
              slug: parsed.slug,
              value: parsed.name, // For backward compatibility
              colorCode: parsed.colorCode || null,
              models: variant.hasModels ? [] : undefined
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
        if (variant.id === variantId || variant._id === variantId) {
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
      prevVariants.filter((variant) => variant.id !== variantId && variant._id !== variantId)
    );
  };

  // Convert existing options to the format expected by react-select
  const getSelectedOptionsValue = (variant) => {
    const attrId = variant.selectedAttributeId ||
      variantAttributes.find(a => a.slug === (variant.selectedAttributeSlug || variant.name))?._id;
    const attrSlug = variant.selectedAttributeSlug || variant.name;

    return (variant.options || []).map((opt) => {
      // Handle both old format (string) and new format (object)
      const optionName = typeof opt === 'string' ? opt : (opt.name || opt.value || opt.label || String(opt));
      // Always normalize to SEO-friendly slug (hyphens instead of underscores)
      const rawSlug = typeof opt === 'string'
        ? opt
        : (opt.slug || optionName);
      const optionSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
      const colorCode = typeof opt === 'object' ? opt.colorCode : null;

      return {
        value: JSON.stringify({
          name: optionName,
          slug: optionSlug,
          colorCode: colorCode,
          models: (typeof opt === 'object' ? opt.models : []) || []
        }),
        label:
          colorCode
            ? renderColorLabel(optionName, colorCode)
            : optionName
      };
    });
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

  // Toggle option selection (for chip-based selection)
  const toggleOption = (variantId, option, isSelected) => {
    const variant = variants.find(v => (v.id ?? v._id) === variantId);
    if (!variant) return;

    let newOptions;
    if (isSelected) {
      // Use normalized comparison when filtering out the option
      const normalizedOptionSlug = normalizeSlug(option.slug);
      newOptions = variant.options.filter(opt => normalizeSlug(opt.slug) !== normalizedOptionSlug);
    } else {
      newOptions = [...variant.options, {
        id: variant.options.length,
        name: option.name,
        slug: option.slug, // Use the SEO-friendly slug from API
        value: option.name,
        colorCode: option.colorCode || null,
        models: variant.hasModels ? [] : undefined
      }];
    }

    setVariants(prevVariants =>
      prevVariants.map(v => {
        if ((v.id ?? v._id) === variantId) {
          return { ...v, options: newOptions };
        }
        return v;
      })
    );
  };

  // Normalize slug for comparison (underscore -> hyphen)
  const normalizeSlug = (slug) => {
    if (!slug) return '';
    return slug.toLowerCase().replace(/_/g, '-');
  };

  const isOptionSelected = (variant, optionSlug) => {
    const normalizedOptionSlug = normalizeSlug(optionSlug);
    return variant.options?.some(opt => normalizeSlug(opt.slug) === normalizedOptionSlug);
  };

  if (loading) {
    return (
      <div className="ring-1 ring-gray-200 rounded-lg bg-white">
        <div className="px-3 py-2 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Product Variants</h2>
        </div>
        <div className="p-4 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ring-1 ring-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">Product Variants</h2>
        <div className="flex gap-2">
          <button
            className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            onClick={addNewVariant}
            disabled={allAttributesSelected}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
          <button
            className="text-[11px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
            onClick={saveVariants}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {variants.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">No variants. Click "Add" to create one.</p>
        ) : (
          variants.map((variant) => {
            const variantId = variant.id ?? variant._id;
            const attrSlug = variant.selectedAttributeSlug || variant.name;
            const attrId = variant.selectedAttributeId ||
              variantAttributes.find(a => a.slug === attrSlug)?._id;
            const availableOptions = attrId ? (attributeValuesCache[attrId] || []) : [];

            return (
              <div key={variantId} className="bg-gray-50 rounded-lg p-2">
                {/* Single Row: Attribute + Values + Remove */}
                <div className="flex items-start gap-2">
                  {/* Attribute Selector */}
                  <div className="w-28 flex-shrink-0">
                    <Select
                      value={getCurrentAttributeValue(variant)}
                      onChange={(selected) => handleAttributeChange(variantId, selected)}
                      options={getAvailableAttributes(variant)}
                      placeholder="Select..."
                      isClearable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: '28px',
                          height: '28px',
                          fontSize: '11px',
                          borderColor: state.isFocused ? '#2563EB' : '#d1d5db',
                          boxShadow: state.isFocused ? '0 0 0 1px #2563EB' : 'none',
                          cursor: 'pointer'
                        }),
                        valueContainer: (provided) => ({
                          ...provided,
                          height: '26px',
                          padding: '0 6px'
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          fontSize: '11px',
                          fontWeight: '500'
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          fontSize: '10px',
                          color: '#9ca3af'
                        }),
                        input: (provided) => ({
                          ...provided,
                          margin: '0',
                          padding: '0'
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          padding: '2px'
                        }),
                        indicatorSeparator: () => ({ display: 'none' }),
                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: '26px'
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                          fontSize: '11px'
                        }),
                        menuPortal: (provided) => ({
                          ...provided,
                          zIndex: 9999
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          fontSize: '11px',
                          padding: '6px 10px',
                          backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#f0fdf4' : 'white',
                          color: state.isSelected ? 'white' : '#374151',
                          cursor: 'pointer'
                        })
                      }}
                      className="capitalize"
                    />
                  </div>

                  {/* Values as Clickable Chips */}
                  <div className="flex-1 min-w-0">
                    {!attrSlug ? (
                      <p className="text-[10px] text-gray-400 py-1">Select attribute</p>
                    ) : loadingValues[attrId] ? (
                      <div className="flex items-center gap-1 py-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        <span className="text-[10px] text-gray-500">Loading...</span>
                      </div>
                    ) : availableOptions.length === 0 ? (
                      <p className="text-[10px] text-amber-600 py-1">No options available</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {availableOptions.map((opt) => {
                          const selected = isOptionSelected(variant, opt.slug);
                          return (
                            <button
                              key={opt.slug}
                              type="button"
                              onClick={() => toggleOption(variantId, opt, selected)}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                                selected
                                  ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              {opt.colorCode && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0"
                                  style={{ backgroundColor: opt.colorCode }}
                                />
                              )}
                              <span className="capitalize">{opt.name}</span>
                              {selected && (
                                <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeVariant(variantId)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Model selection for hasModels attributes */}
                {variant.hasModels && variant.options.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                    <p className="text-[10px] text-gray-500 mb-1">Models:</p>
                    {variant.options.map((option) => (
                      <div key={option.slug || option.name} className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-gray-700 w-16 flex-shrink-0 capitalize truncate">{option.name}</span>
                        <div className="flex-1">
                          <Select
                            isMulti
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                minHeight: '24px',
                                fontSize: '10px',
                                borderColor: state.isFocused ? '#2563EB' : '#e5e7eb',
                                boxShadow: 'none'
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: '0 4px'
                              }),
                              multiValue: (provided) => ({
                                ...provided,
                                backgroundColor: '#f0fdf4',
                                fontSize: '10px'
                              }),
                              input: (provided) => ({
                                ...provided,
                                margin: '0',
                                padding: '0'
                              }),
                              dropdownIndicator: (provided) => ({
                                ...provided,
                                padding: '2px'
                              }),
                              indicatorSeparator: () => ({ display: 'none' }),
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                                fontSize: '10px'
                              }),
                              menuPortal: (provided) => ({
                                ...provided,
                                zIndex: 9999
                              }),
                              option: (provided) => ({
                                ...provided,
                                fontSize: '10px',
                                padding: '4px 8px'
                              })
                            }}
                            placeholder="Select models..."
                            options={getModelsForValue(attrId, option.slug)}
                            value={(option.models || []).map((model) => ({
                              value: JSON.stringify(model),
                              label: model.name
                            }))}
                            onChange={(selected) =>
                              handleModelChange(variantId, option.slug, selected)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

ProductVariants.propTypes = {
  variants: PropTypes.array.isRequired,
  setVariants: PropTypes.func.isRequired,
  saveVariants: PropTypes.func.isRequired,
  existingVariantNames: PropTypes.array,
};
