import PropTypes from "prop-types";

export default function ProductImages({
  ProductThumbnailImage,
  setProductThumbnailImage,
  handleProductThumbnailImage,
  productGalleryImages,
  handleProductGalleryImages,
  handleDeleteImage,
}) {
  return (
    <div className="shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="p-4">
        <h1 className="font-bold mb-1">Product Images</h1>
        <p className="text-sm text-gray-500 mb-3">
          Upload main product thumbnail and gallery images.
        </p>

        {/* Thumbnail 1/3, Gallery 2/3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Thumbnail Image - Compact */}
          <div className="md:col-span-1">
            <label
              htmlFor="thumbnail"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Thumbnail
            </label>
            <div className="rounded-lg border border-dashed border-gray-300 p-3 bg-gray-50">
              <div className="flex flex-col items-center">
                {ProductThumbnailImage ? (
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(ProductThumbnailImage)}
                      alt="Thumbnail"
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setProductThumbnailImage(null)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Click to remove</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg">
                    <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <label
                  htmlFor="thumbnail"
                  className="mt-2 text-sm font-medium text-primary cursor-pointer hover:text-primary/80"
                >
                  {ProductThumbnailImage ? "Change" : "Upload"}
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleProductThumbnailImage}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Gallery Images - Larger */}
          <div className="md:col-span-2">
            <label
              htmlFor="galleryImages"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Gallery Images
            </label>
            <div className="rounded-lg border border-dashed border-gray-300 p-4 bg-gray-50 min-h-[140px]">
              <div className="flex flex-wrap gap-3">
                {productGalleryImages.length > 0 ? (
                  productGalleryImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => handleDeleteImage(index)}
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-4 text-gray-400">
                    <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">No gallery images</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-center">
                <label
                  htmlFor="galleryImages"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Images
                  <input
                    id="galleryImages"
                    name="galleryImages"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleProductGalleryImages}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductImages.propTypes = {
  ProductThumbnailImage: PropTypes.object,
  setProductThumbnailImage: PropTypes.func.isRequired,
  handleProductThumbnailImage: PropTypes.func.isRequired,
  productGalleryImages: PropTypes.array.isRequired,
  handleProductGalleryImages: PropTypes.func.isRequired,
  handleDeleteImage: PropTypes.func.isRequired,
};
