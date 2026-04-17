// SeoMetaSection.jsx
// Modularized SEO meta fields for blog forms
import PropTypes from "prop-types";

const SeoMetaSection = ({
  blogMetaTitle,
  setblogMetaTitle,
  blogMetaImage,
  setblogMetaImage,
  handleMetaImage,
  blogMetaImageAlt,
  setblogMetaImageAlt,
  blogMetaDesc,
  setblogMetaDesc,
  blogMetakeywords,
  setblogMetakeywords,
  metaSchemas,
  handleAddSchema,
  handleSchemaChange,
  handleRemoveSchema
}) => (
  <>
    <div className="col-span-2">
      <label htmlFor="metatitle" className="block mb-2 text-sm font-medium text-gray-900 ">
        Meta Title
      </label>
      <input
        type="text"
        name="metatitle"
        id="metatitle"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
        placeholder="Type blog meta title"
        value={blogMetaTitle}
        onChange={e => setblogMetaTitle(e.target.value)}
      />
    </div>
    <div className="col-span-2">
      <label htmlFor="blogContent" className="block text-sm font-medium leading-6 text-gray-900">
        Meta Image: <span className="text-red-600">*</span>
      </label>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  ">
        <div className="text-center">
          {blogMetaImage ? (
            <>
              <img
                src={blogMetaImage instanceof Blob ? URL.createObjectURL(blogMetaImage) : `${blogMetaImage}`}
                alt="Thumbnail"
                className="h-12 rounded-md mx-auto cursor-pointer"
                onClick={() => setblogMetaImage(null)}
              />
              <p className="text-xs text-red-600">Click image to delete</p>
            </>
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <div className="mt-2 flex text-sm leading-6 text-gray-600">
            <label htmlFor="metaImage" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary">
              <span>Upload a file</span>
              <input
                id="metaImage"
                name="metaImage"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleMetaImage}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
    <div className="col-span-full">
      <label htmlFor="blogmetaImgalt" className="block text-sm font-medium leading-6 text-gray-900">
        Blog Meta Image Alt
      </label>
      <div className="mt-2 w-full ">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
          <input
            type="text"
            name="blogmetaImgalt"
            id="blogmetaImgalt"
            autoComplete="blogImgalt"
            className=" block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="blogmetaImgalt"
            value={blogMetaImageAlt}
            onChange={e => setblogMetaImageAlt(e.target.value)}
          />
        </div>
      </div>
    </div>
    <div className="col-span-2">
      <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 ">
        Meta Description
      </label>
      <textarea
        id="description"
        rows="4"
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
        placeholder="Write product description here"
        value={blogMetaDesc}
        onChange={e => setblogMetaDesc(e.target.value)}
      />
    </div>
    <div className="col-span-full">
      <label htmlFor="blogmetakeywords" className="block text-sm font-medium leading-6 text-gray-900">
        Meta Keywords
      </label>
      <div className="mt-2  w-full">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
          <input
            type="text"
            name="blogmetakeywords"
            id="blogmetakeywords"
            autoComplete="blogmetakeywords"
            className=" block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Blog Meta Keywords"
            value={blogMetakeywords}
            onChange={e => setblogMetakeywords(e.target.value)}
          />
        </div>
      </div>
    </div>
    <div className="col-span-full">
      <div className="flex justify-between items-center mb-3">
        <label htmlFor="metaSchemas" className="block text-sm font-medium leading-6 text-gray-900">
          Meta Schemas
        </label>
        <button
          type="button"
          onClick={handleAddSchema}
          className="text-white bg-primary hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 text-center transition duration-300 ease-in-out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col justify-between items-center w-full gap-4">
        {metaSchemas && metaSchemas.map((schema, index) => (
          <div key={index} className="flex items-center rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary w-full">
            <textarea
              rows={3}
              name={`blogmetakeywords-${index}`}
              id={`blogmetakeywords-${index}`}
              autoComplete={`blogmetakeywords-${index}`}
              className="block flex-1 border-0 border-r border-gray-300 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 w-full"
              placeholder="Meta Schema"
              value={schema}
              onChange={e => handleSchemaChange(index, e.target.value)}
            />
            {metaSchemas.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSchema(index)}
                className="text-red-600 hover:text-red-800 px-2 py-1 rounded focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  </>
);

SeoMetaSection.propTypes = {
  blogMetaTitle: PropTypes.string.isRequired,
  setblogMetaTitle: PropTypes.func.isRequired,
  blogMetaImage: PropTypes.any,
  setblogMetaImage: PropTypes.func.isRequired,
  handleMetaImage: PropTypes.func.isRequired,
  blogMetaImageAlt: PropTypes.string.isRequired,
  setblogMetaImageAlt: PropTypes.func.isRequired,
  blogMetaDesc: PropTypes.string.isRequired,
  setblogMetaDesc: PropTypes.func.isRequired,
  blogMetakeywords: PropTypes.string.isRequired,
  setblogMetakeywords: PropTypes.func.isRequired,
  metaSchemas: PropTypes.array.isRequired,
  handleAddSchema: PropTypes.func.isRequired,
  handleSchemaChange: PropTypes.func.isRequired,
  handleRemoveSchema: PropTypes.func.isRequired,
};

export default SeoMetaSection;
