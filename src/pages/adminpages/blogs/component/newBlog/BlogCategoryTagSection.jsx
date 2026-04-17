// BlogCategoryTagSection.jsx
// Extracted category, tags, and featured section from NewBlog.jsx
import PropTypes from "prop-types";

const BlogCategoryTagSection = ({
  blogCategory,
  setblogCategory,
  categories,
  blogTagInput,
  setBlogTagInput,
  blogTags,
  setBlogTags,
  featured,
  setFeatured,
}) => (
  <div className="border-b border-gray-900/10 pb-12">
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
      {/* Categories */}
      <div className="sm:col-span-2 sm:col-start-1">
        <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
          Categories <span className="text-red-600">*</span>
        </label>
        <select
          id="category"
          name="category"
          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
          value={blogCategory}
          onChange={e => setblogCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category.name} value={category.name}>{category.name}</option>
          ))}
        </select>
      </div>
      {/* Tags */}
      <div className="sm:col-span-2">
        <label htmlFor="tag" className="block text-sm font-medium leading-6 text-gray-900">Tags</label>
        <div className="mt-2 flex flex-col gap-2">
          <input
            id="tag"
            name="tag"
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
            type="text"
            placeholder="Type a tag and press Enter"
            value={blogTagInput || ''}
            onChange={e => setBlogTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && blogTagInput.trim()) {
                e.preventDefault();
                if (!blogTags.includes(blogTagInput.trim())) {
                  setBlogTags([...blogTags, blogTagInput.trim()]);
                }
                setBlogTagInput('');
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            {blogTags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-primary text-white text-xs">
                {tag}
                <button type="button" className="ml-2 text-white hover:text-gray-200" onClick={() => setBlogTags(blogTags.filter((t, i) => i !== idx))}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Featured */}
      <div className="sm:col-span-2">
        <label htmlFor="featured" className="block text-sm font-medium leading-6 text-gray-900">Featured</label>
        <label className="inline-flex items-center cursor-pointer mt-3">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={featured}
            onChange={() => setFeatured(!featured)}
            className="sr-only peer "
          />
          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
        </label>
      </div>
    </div>
  </div>
);

BlogCategoryTagSection.propTypes = {
  blogCategory: PropTypes.string.isRequired,
  setblogCategory: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  blogTagInput: PropTypes.string.isRequired,
  setBlogTagInput: PropTypes.func.isRequired,
  blogTags: PropTypes.array.isRequired,
  setBlogTags: PropTypes.func.isRequired,
  featured: PropTypes.bool.isRequired,
  setFeatured: PropTypes.func.isRequired,
};

export default BlogCategoryTagSection;
