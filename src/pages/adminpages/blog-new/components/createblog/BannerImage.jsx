"use client";


import { FaTimes, FaUpload } from "react-icons/fa";

import PropTypes from 'prop-types';

export default function BannerImage({
  bannerPreview,
  errors,
  bannerInputRef,
  handleBannerUpload,
  setBannerImage,
  setBannerPreview,
  bannerImageAlt,
  setBannerImageAlt,
  bannerImageDescription,
  setBannerImageDescription
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Image</h3>
      
      {bannerPreview ? (
        <div className="relative">
          <div className="aspect-[21/9] w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={bannerPreview}
              alt="Banner preview"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setBannerImage(null);
              setBannerPreview(null);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="Remove banner image"
          >
            <FaTimes size={16} className="text-gray-700" />
          </button>
          
          {/* Alt Text and Description Fields */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={bannerImageAlt || ''}
                onChange={(e) => setBannerImageAlt && setBannerImageAlt(e.target.value)}
                placeholder="Describe the banner image for accessibility"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Image Description
              </label>
              <textarea
                value={bannerImageDescription || ''}
                onChange={(e) => setBannerImageDescription && setBannerImageDescription(e.target.value)}
                placeholder="Additional description for the banner image"
                rows={2}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => bannerInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg ${
            errors.bannerImage ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400"
          } p-6 text-center cursor-pointer transition-colors`}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <FaUpload className="h-4 w-4 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload a banner image
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Recommended size: 1200×514 pixels (21:9 ratio)
            </p>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
        </div>
      )}
      
      {errors.bannerImage && (
        <p className="mt-2 text-sm text-red-600">{errors.bannerImage}</p>
      )}
    </div>
  );
}

BannerImage.propTypes = {
  bannerPreview: PropTypes.string,
  errors: PropTypes.object.isRequired,
  bannerInputRef: PropTypes.object.isRequired,
  handleBannerUpload: PropTypes.func.isRequired,
  setBannerImage: PropTypes.func.isRequired,
  setBannerPreview: PropTypes.func.isRequired,
  bannerImageAlt: PropTypes.string,
  setBannerImageAlt: PropTypes.func,
  bannerImageDescription: PropTypes.string,
  setBannerImageDescription: PropTypes.func
};
