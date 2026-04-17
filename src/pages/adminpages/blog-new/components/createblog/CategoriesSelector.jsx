import PropTypes from "prop-types";

export default function CategoriesSelector({
  categories,
  toggleCategory,
  availableCategories,
  errors
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
        
        <div className="space-y-2">
          {availableCategories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={categories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
              <span className="ml-2 text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
        {errors.categories && (
          <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
        )}
      </div>
    </div>
  );
}

CategoriesSelector.propTypes = {
  categories: PropTypes.array.isRequired,
  toggleCategory: PropTypes.func.isRequired,
  availableCategories: PropTypes.array.isRequired,
  errors: PropTypes.object
};