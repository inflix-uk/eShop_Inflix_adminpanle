"use client";

import { useEffect } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { generateSlugFromTitle } from "../../service/blogService";
import PropTypes from "prop-types";
import BannerImage from "./BannerImage";
import TagsInput from "./TagsInput";

export default function ContentTabForm({ 
  title, 
  setTitle, 
  slug, 
  setSlug, 
  excerpt, 
  setExcerpt, 
  errors,
  bannerPreview,
  bannerInputRef,
  handleBannerUpload,
  setBannerImage,
  setBannerPreview,
  bannerImageAlt,
  setBannerImageAlt,
  bannerImageDescription,
  setBannerImageDescription,
  tags,
  currentTag,
  setCurrentTag,
  handleAddTag,
  handleTagKeyDown,
  removeTag
}) {
  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const newSlug = generateSlugFromTitle(title);
      setSlug(newSlug);
    }
  }, [title, setSlug]);
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-4 py-2 border ${
            errors.title ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
          placeholder="Enter blog post title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            /blog/
          </span>
          <input
            type="text"
            id="slug"
            value={slug}
            readOnly
            className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md ${
              errors.slug ? "border-red-300" : "border-gray-300"
            } focus:ring-primary focus:border-primary sm:text-sm bg-gray-50 cursor-not-allowed`}
            placeholder="auto-generated-from-title"
          />
        </div>
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
      </div>

      {/* Banner Image */}
      <div className="mt-6">
        <BannerImage
          bannerPreview={bannerPreview}
          errors={errors}
          bannerInputRef={bannerInputRef}
          handleBannerUpload={handleBannerUpload}
          setBannerImage={setBannerImage}
          setBannerPreview={setBannerPreview}
          bannerImageAlt={bannerImageAlt}
          setBannerImageAlt={setBannerImageAlt}
          bannerImageDescription={bannerImageDescription}
          setBannerImageDescription={setBannerImageDescription}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
          Excerpt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className={`w-full px-4 py-2 border ${
            errors.excerpt ? "border-red-300" : "border-gray-300"
          } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
          placeholder="Brief summary of your blog post"
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          A short summary of your post. This will be displayed on blog listing pages.
        </p>
      </div>
      <TagsInput
              tags={tags}
              currentTag={currentTag}
              setCurrentTag={setCurrentTag}
              handleAddTag={handleAddTag}
              handleTagKeyDown={handleTagKeyDown}
              removeTag={removeTag}
            />

    </div>
  );
}

ContentTabForm.propTypes = {
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired,
  slug: PropTypes.string.isRequired,
  setSlug: PropTypes.func.isRequired,
  excerpt: PropTypes.string.isRequired,
  setExcerpt: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  bannerPreview: PropTypes.string,
  bannerInputRef: PropTypes.object.isRequired,
  handleBannerUpload: PropTypes.func.isRequired,
  setBannerImage: PropTypes.func.isRequired,
  setBannerPreview: PropTypes.func.isRequired,
  bannerImageAlt: PropTypes.string,
  setBannerImageAlt: PropTypes.func,
  bannerImageDescription: PropTypes.string,
  setBannerImageDescription: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentTag: PropTypes.string.isRequired,
  setCurrentTag: PropTypes.func.isRequired,
  handleAddTag: PropTypes.func.isRequired,
  handleTagKeyDown: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired
};
