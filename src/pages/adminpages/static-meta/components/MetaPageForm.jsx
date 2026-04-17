import PropTypes from 'prop-types';

/**
 * Form component for editing static meta pages
 */
const MetaPageForm = ({ 
  formData, 
  setFormData, 
  selectedPage, 
  handleSubmit, 
  handleCloseModal 
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {!selectedPage && (
          <>
            <div>
              <label htmlFor="pageName" className="block text-sm font-medium text-gray-700">
                Page Name
              </label>
              <input
                type="text"
                id="pageName"
                value={formData.pageName}
                onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                readOnly={selectedPage !== null} // Make page name static/readonly when editing
              />
            </div>
            <div>
              <label htmlFor="path" className="block text-sm font-medium text-gray-700">
                Path
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  /
                </span>
                <input
                  type="text"
                  id="path"
                  value={formData.path.startsWith('/') ? formData.path.substring(1) : formData.path}
                  onChange={(e) => setFormData({ ...formData, path: '/' + e.target.value.replace(/^\/+/, '') })}
                  placeholder="e.g. about-us"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  readOnly={selectedPage !== null} // Make path static/readonly when editing
                />
              </div>
            </div>
          </>
        )}
        <div>
          <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <input
            type="text"
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <textarea
            id="metaDescription"
            rows="3"
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
            Meta Keywords (comma separated)
          </label>
          <input
            type="text"
            id="metaKeywords"
            value={formData.metaKeywords}
            onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Schema Markup</label>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  metaSchemas: [...(prev.metaSchemas || [""]), ""],
                }))
              }
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              + Add
            </button>
          </div>
          <div className="space-y-3 mt-2">
            {(formData.metaSchemas || [""]).map((schema, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <textarea
                  id={`metaSchema-${idx}`}
                  rows="5"
                  value={schema}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaSchemas: (prev.metaSchemas || [""]).map((s, i) =>
                        i === idx ? e.target.value : s
                      ),
                    }))
                  }
                  className="mt-1 block w-full font-mono text-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-1"
                  placeholder='Example: {"@context":"https://schema.org/", ...}'
                ></textarea>
                {(formData.metaSchemas || [""]).length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        metaSchemas: (prev.metaSchemas || [""]).filter((_, i) => i !== idx),
                      }))
                    }
                    className="mt-1 inline-flex items-center px-2 py-2 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleCloseModal}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

MetaPageForm.propTypes = {
  formData: PropTypes.shape({
    pageName: PropTypes.string,
    path: PropTypes.string,
    metaTitle: PropTypes.string,
    metaDescription: PropTypes.string,
    metaKeywords: PropTypes.string,
    metaSchemas: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  selectedPage: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  handleCloseModal: PropTypes.func.isRequired
};

export default MetaPageForm;
