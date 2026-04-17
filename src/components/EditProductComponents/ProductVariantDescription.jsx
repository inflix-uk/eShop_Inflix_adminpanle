import PropTypes from "prop-types";

export default function ProductVariantDescription({
  product,
  selectedVariantDescAttr,
  setSelectedVariantDescAttr,
  handleVariantDescChange,
  handleRemoveVariantDesc,
  variantNames,
}) {
  const getDescriptions = (optionValue) => {
    if (!optionValue || !selectedVariantDescAttr) return [""];
    const descGroup = product?.variantDescription?.find((desc) => desc[selectedVariantDescAttr]);
    const descriptions = descGroup?.[selectedVariantDescAttr]?.[optionValue];
    if (Array.isArray(descriptions)) return descriptions.length > 0 ? descriptions : [""];
    if (typeof descriptions === "string" && descriptions) return [descriptions];
    return [""];
  };

  const getSelectedAttributeOptions = () => {
    if (!selectedVariantDescAttr) return [];
    const attr = variantNames?.find((a) => a.name === selectedVariantDescAttr);
    return attr?.options?.filter((option) => option != null) || [];
  };

  const getOptionName = (option) => (typeof option === "object" ? option?.value : option);

  return (
    <div className="ring-1 ring-gray-200 rounded-lg bg-white h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">Variant Description</h2>
        {variantNames?.length > 0 && (
          <select
            className="text-xs border-0 bg-gray-100 rounded px-2 py-1 focus:ring-1 focus:ring-primary capitalize"
            value={selectedVariantDescAttr || ""}
            onChange={(e) => setSelectedVariantDescAttr(e.target.value)}
          >
            <option value="" disabled>Select</option>
            {variantNames.map((attr) => (
              <option key={attr.name} value={attr.name}>{attr.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      <div className="p-3 max-h-[320px] overflow-y-auto">
        {(!variantNames || variantNames.length === 0) ? (
          <p className="text-xs text-gray-400 text-center py-4">No variants configured</p>
        ) : !selectedVariantDescAttr ? (
          <p className="text-xs text-gray-400 text-center py-4">Select an attribute above</p>
        ) : (
          <div className="space-y-2">
            {getSelectedAttributeOptions().map((option, optionIndex) => {
              const optionValue = getOptionName(option);
              if (!optionValue) return null;

              return (
                <div key={optionIndex} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  {/* Option Label */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700 capitalize">{optionValue}</span>
                    {getDescriptions(optionValue).filter(d => d).length > 0 && (
                      <span className="text-[10px] text-gray-400">
                        {getDescriptions(optionValue).filter(d => d).length} desc
                      </span>
                    )}
                  </div>

                  {/* Description Fields */}
                  <div className="space-y-1.5">
                    {getDescriptions(optionValue).map((desc, descIndex) => (
                      <div key={descIndex} className="flex items-start gap-1">
                        <textarea
                          rows="2"
                          className="flex-1 text-xs rounded border-gray-200 py-1.5 px-2 focus:ring-1 focus:ring-primary focus:border-primary resize-y min-h-[50px]"
                          placeholder={`Description for ${optionValue}...`}
                          value={desc || ""}
                          onChange={(e) => handleVariantDescChange(optionValue, descIndex, e.target.value)}
                        />
                        {getDescriptions(optionValue).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantDesc(optionValue, descIndex)}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Remove"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

ProductVariantDescription.propTypes = {
  product: PropTypes.object.isRequired,
  selectedVariantDescAttr: PropTypes.string,
  setSelectedVariantDescAttr: PropTypes.func.isRequired,
  handleVariantDescChange: PropTypes.func.isRequired,
  handleRemoveVariantDesc: PropTypes.func.isRequired,
  variantNames: PropTypes.array.isRequired,
};
