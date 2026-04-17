import { useState } from "react";
import PropTypes from "prop-types";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function SeoTabForm({
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  metaSchema,
  setMetaSchema,
  metaTags = [],
  setMetaTags,
  showBlogSeoHint = true,
} = {}) {
  const [currentMetaSchema, setCurrentMetaSchema] = useState("");
  const [currentMetaTag, setCurrentMetaTag] = useState("");

  // Add new schema URL
  const handleAddMetaSchema = () => {
    const trimmed = currentMetaSchema.trim();
    if (trimmed) {
      const newMetaSchemas = Array.isArray(metaSchema) ? [...metaSchema] : [];
      newMetaSchemas.push(trimmed);
      setMetaSchema(newMetaSchemas);
      setCurrentMetaSchema("");
      console.log("Added metaSchema URL:", trimmed);
    }
  };

  // Handle meta tags
  const handleAddMetaTag = () => {
    const trimmed = currentMetaTag.trim();
    if (trimmed && !metaTags.includes(trimmed)) {
      setMetaTags([...metaTags, trimmed]);
      setCurrentMetaTag("");
    }
  };

  const handleMetaTagKeyDown = (e) => {
    if (e.key === "Enter" && currentMetaTag.trim()) {
      e.preventDefault();
      handleAddMetaTag();
    }
  };

  const removeMetaTag = (tagToRemove) => {
    setMetaTags(metaTags.filter(tag => tag !== tagToRemove));
  };

  // Remove schema URL
  const handleRemoveCanonical = (index) => {
    if (Array.isArray(metaSchema)) {
      const newMetaSchemas = [...metaSchema];
      newMetaSchemas.splice(index, 1);
      setMetaSchema(newMetaSchemas);
    }
  };

  return (
    <div className="space-y-6">
      {showBlogSeoHint ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            Optimize your blog post for search engines. If left empty, Meta Title and Meta Description will default to your post title and excerpt.
          </p>
        </div>
      ) : null}

      {/* Meta Title */}
      <div>
        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Meta Title
        </label>
        <input
          type="text"
          id="metaTitle"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          placeholder="Meta Title (defaults to post title)"
        />
        <p className="mt-1 text-sm text-gray-500">
          {metaTitle.length} / 60 characters
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Meta Description
        </label>
        <textarea
          id="metaDescription"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          placeholder="Meta Description (defaults to excerpt)"
        />
        <p className="mt-1 text-sm text-gray-500">
          {metaDescription.length} / 160 characters
        </p>
      </div>

      {/* Meta keywords */}
      <div>
        <label htmlFor="metaTags" className="block text-sm font-medium text-gray-700 mb-1">
          Meta keywords
        </label>
        <div className="space-y-2">
          <div className="flex">
            <input
              type="text"
              id="metaTags"
              value={currentMetaTag}
              onChange={(e) => setCurrentMetaTag(e.target.value)}
              onKeyDown={handleMetaTagKeyDown}
              className="flex-1 min-w-0 block w-full px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-primary focus:border-primary"
              placeholder="Add meta keywords (e.g., technology, business, marketing)"
            />
            <button
              type="button"
              onClick={handleAddMetaTag}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary rounded-r-md"
            >
              <FaPlus size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Press Enter or click + to add a tag
          </p>
        </div>

        {/* Render meta tags */}
        {metaTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {metaTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeMetaTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center flex-shrink-0 h-4 w-4 text-blue-400 hover:text-blue-500 focus:outline-none"
                >
                  <span className="sr-only">Remove tag</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Meta Schema */}
      <div>
        <label htmlFor="metaSchema" className="block text-sm font-medium text-gray-700 mb-1">
          Meta Schema
        </label>
        <div className="space-y-2">
          <textarea
            id="metaSchema"
            value={currentMetaSchema}
            onChange={(e) => setCurrentMetaSchema(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Paste a URL (e.g., https://example.com/original-content)"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddMetaSchema();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddMetaSchema}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FaPlus size={16} />
            <span className="ml-1">Add</span>
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Add meta schema URLs if this content is republished from other sources or for SEO purposes.
        </p>

        {/* Render metaSchema list */}
        {Array.isArray(metaSchema) && metaSchema.length > 0 && (
          <div className="mt-3 space-y-2">
            {metaSchema.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700 truncate flex-1">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCanonical(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

SeoTabForm.propTypes = {
  metaTitle: PropTypes.string.isRequired,
  setMetaTitle: PropTypes.func.isRequired,
  metaDescription: PropTypes.string.isRequired,
  setMetaDescription: PropTypes.func.isRequired,
  metaSchema: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]).isRequired,
  setMetaSchema: PropTypes.func.isRequired,
  metaTags: PropTypes.arrayOf(PropTypes.string),
  setMetaTags: PropTypes.func.isRequired,
  showBlogSeoHint: PropTypes.bool,
};
