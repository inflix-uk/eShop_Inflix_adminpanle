import PropTypes from "prop-types";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function ProductVariantDescription({
  variantDesc,
  selectedVariantDescAttr,
  setSelectedVariantDescAttr,
  variantDescAttr,
  setVariantDesc,
}) {
  // Helper to get descriptions array for an option
  const getDescriptions = (optionName) => {
    const descriptions = variantDesc[optionName];

    // Handle both old format (string) and new format (array)
    if (Array.isArray(descriptions)) {
      return descriptions;
    } else if (typeof descriptions === "string" && descriptions) {
      return [descriptions];
    }
    return [""];
  };

  // Handler to update a specific description at an index
  const handleDescriptionChange = (optionName, index, value) => {
    setVariantDesc((prevDesc) => {
      const currentDescriptions = getDescriptions(optionName);
      const updatedDescriptions = [...currentDescriptions];
      updatedDescriptions[index] = value;
      return {
        ...prevDesc,
        [optionName]: updatedDescriptions,
      };
    });
  };

  // Handler to remove a description at an index
  const handleRemoveDescription = (optionName, index) => {
    setVariantDesc((prevDesc) => {
      const currentDescriptions = getDescriptions(optionName);
      if (currentDescriptions.length > 1) {
        const updatedDescriptions = currentDescriptions.filter((_, i) => i !== index);
        return {
          ...prevDesc,
          [optionName]: updatedDescriptions,
        };
      }
      return prevDesc;
    });
  };

  return (
    <>
      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="py-4 px-4 space-y-3">
          <div className="flex flex-row items-center justify-between">
            <h1 className="font-bold">Variant Description</h1>
          </div>
          <div>
            {variantDescAttr.length > 0 && (
              <div className="flex flex-row items-start justify-between gap-4">
                <select
                  id="attributeName"
                  name="attributeName"
                  autoComplete="country-name"
                  className="block w-1/4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  value={selectedVariantDescAttr || ""}
                  onChange={(e) => setSelectedVariantDescAttr(e.target.value)}
                >
                  <option value="" disabled>Choose Attribute</option>
                  {variantDescAttr.map((attr) => (
                    <option key={attr.name} value={attr.name}>
                      {attr.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col gap-y-4 w-3/4">
                  {variantDescAttr
                    .find((attr) => attr.name === selectedVariantDescAttr)
                    ?.options?.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {option.option}
                          </span>
                        </div>
                        <div className="flex flex-col gap-y-2">
                          {getDescriptions(option.option).map((desc, descIndex) => (
                            <div
                              key={descIndex}
                              className="relative flex items-start gap-2"
                            >
                              <textarea
                                rows="3"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder={`Description ${descIndex + 1} for ${option.option}`}
                                value={desc || ""}
                                onChange={(e) =>
                                  handleDescriptionChange(
                                    option.option,
                                    descIndex,
                                    e.target.value
                                  )
                                }
                              />
                              {getDescriptions(option.option).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDescription(option.option, descIndex)
                                  }
                                  className="flex-shrink-0 rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

ProductVariantDescription.propTypes = {
  variantDesc: PropTypes.object.isRequired,
  selectedVariantDescAttr: PropTypes.string,
  setSelectedVariantDescAttr: PropTypes.func.isRequired,
  variantDescAttr: PropTypes.array.isRequired,
  setVariantDesc: PropTypes.func.isRequired,
};
