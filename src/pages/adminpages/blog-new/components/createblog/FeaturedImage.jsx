"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { FaImage, FaUpload, FaFolder } from "react-icons/fa";
import MediaLibraryPicker from "../../../media/components/media/MediaLibraryPicker";

export default function FeaturedImage({
  imagePreview,
  errors,
  fileInputRef,
  handleImageUpload,
  setFeaturedImage,
  setImagePreview,
  featuredImageAlt,
  setFeaturedImageAlt,
  featuredImageDescription,
  setFeaturedImageDescription,
}) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleMediaSelect = (url) => {
    setFeaturedImage(null);
    setImagePreview(url);
    setIsMediaPickerOpen(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFeaturedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thumbnail Image</h3>
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            errors.featuredImage ? "border-red-300" : "border-gray-300"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          {imagePreview ? (
            <div className="space-y-2">
              <img
                src={imagePreview}
                alt="Featured preview"
                className="h-full w-full object-cover rounded-md"
              />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaUpload size={12} />
                  Upload from PC
                </button>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  <FaFolder size={12} />
                  Media Library
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <FaImage className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload from PC or choose from Media Library
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaUpload size={12} />
                  Upload from PC
                </button>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  <FaFolder size={12} />
                  Media Library
                </button>
              </div>
            </div>
          )}
        </div>
        {errors.featuredImage && (
          <p className="mt-1 text-sm text-red-600">Thumbnail image is required</p>
        )}

        {imagePreview && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={featuredImageAlt || ""}
                onChange={(e) => setFeaturedImageAlt && setFeaturedImageAlt(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Image Description
              </label>
              <textarea
                value={featuredImageDescription || ""}
                onChange={(e) =>
                  setFeaturedImageDescription && setFeaturedImageDescription(e.target.value)
                }
                placeholder="Additional description for the image"
                rows={2}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <MediaLibraryPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}

FeaturedImage.propTypes = {
  imagePreview: PropTypes.string,
  errors: PropTypes.object,
  fileInputRef: PropTypes.object,
  handleImageUpload: PropTypes.func,
  setFeaturedImage: PropTypes.func,
  setImagePreview: PropTypes.func,
  featuredImageAlt: PropTypes.string,
  setFeaturedImageAlt: PropTypes.func,
  featuredImageDescription: PropTypes.string,
  setFeaturedImageDescription: PropTypes.func,
};
