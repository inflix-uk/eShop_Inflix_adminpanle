
import PropTypes from "prop-types";
import { FaTimes, FaPlus } from "react-icons/fa";

export default function TagsInput({
  tags,
  currentTag,
  setCurrentTag,
  handleAddTag,
  handleTagKeyDown,
  removeTag
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-900"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
          >
            <FaPlus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

TagsInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentTag: PropTypes.string.isRequired,
  setCurrentTag: PropTypes.func.isRequired,
  handleAddTag: PropTypes.func.isRequired,
  handleTagKeyDown: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired
};
