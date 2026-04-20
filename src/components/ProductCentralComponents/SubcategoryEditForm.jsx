import React from "react";
import { useAuth } from "../../context/Auth";
import BlockEditor from "../../pages/adminpages/blog-new/components/createblog/BlockEditor/BlockEditor";

/** Preview URL for banner: blob URL, legacy API path, or new File upload. */
export function getSubcategoryBannerPreviewSrc(banner, apiBase) {
  if (!banner) return null;
  if (banner instanceof File) {
    return URL.createObjectURL(banner);
  }
  if (typeof banner === "object") {
    if (banner.url && typeof banner.url === "string") {
      return banner.url;
    }
    if (banner.path && typeof banner.path === "string") {
      const p = banner.path.trim();
      if (/^https?:\/\//i.test(p)) return p;
      const base = (apiBase || "").replace(/\/$/, "");
      return `${base}/${p.replace(/^\//, "")}`;
    }
  }
  return null;
}

/**
 * Subcategory fields: banner, meta, block-based page content (same editor as categories / homepage).
 */
export default function SubcategoryEditForm({
  editedSubcategoryName,
  setEditedSubcategoryName,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  metaKeywords,
  setMetaKeywords,
  content,
  contentBlocks,
  setContentBlocks,
  metaSchemas,
  handleMetaSchemaChange,
  handleAddMetaSchema,
  handleRemoveMetaSchema,
  subcategoryBanner,
  setSubcategoryBanner,
  handleSubcategoryBannerImage,
  handleEditSubmit,
  onCancel,
  saving = false,
}) {
  const auth = useAuth();
  const bannerPreviewSrc = getSubcategoryBannerPreviewSrc(subcategoryBanner, auth.ip);

  return (
    <form
      className="p-4 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleEditSubmit(e);
      }}
    >
      <div className="grid gap-4 grid-cols-2 max-w-4xl">
        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Subcategory name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary dark:focus:border-primary"
            value={editedSubcategoryName}
            onChange={(e) => setEditedSubcategoryName(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label
            htmlFor="subcategory-banner-upload"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Subcategory banner
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 w-full">
            <div className="text-center py-4">
              {subcategoryBanner ? (
                <>
                  {bannerPreviewSrc ? (
                    <>
                      <img
                        src={bannerPreviewSrc}
                        alt="Subcategory banner preview"
                        className="h-12 rounded-md mx-auto cursor-pointer"
                        onClick={() => setSubcategoryBanner(null)}
                      />
                      <p className="text-xs text-red-600">Click image to delete</p>
                    </>
                  ) : null}
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
              <div className="mt-2 text-sm leading-6 text-gray-600">
                <label
                  htmlFor="subcategory-banner-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary px-2"
                >
                  <span>Banner</span>
                  <input
                    id="subcategory-banner-upload"
                    name="subcategoryBanner"
                    type="file"
                    className="sr-only"
                    onChange={handleSubcategoryBannerImage}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-900">Meta title</label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-900">Meta description</label>
          <textarea
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-900">Meta keywords</label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Meta schemas</label>
            <button
              type="button"
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
              onClick={handleAddMetaSchema}
            >
              +
            </button>
          </div>
          {metaSchemas.map((schema, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={schema}
                onChange={(e) => handleMetaSchemaChange(index, e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <button
                type="button"
                className="ml-2 text-red-500"
                onClick={() => handleRemoveMetaSchema(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="col-span-2 max-w-none">
          <label className="block mb-2 text-sm font-medium text-gray-900">Content</label>
          <p className="mb-3 text-sm text-gray-500">
            Add content rows and pick layouts for text, images, widgets, and product blocks — same as
            category and homepage editors. The storefront uses this when rows exist; otherwise legacy HTML
            below applies.
          </p>
          <div className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 sm:p-4">
            <BlockEditor
              blocks={contentBlocks}
              setBlocks={setContentBlocks}
              className="p-0 sm:p-2"
            />
          </div>
          {content?.trim() && (!Array.isArray(contentBlocks) || contentBlocks.length === 0) ? (
            <details className="mt-3 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
              <summary className="cursor-pointer font-medium">
                Legacy HTML content (read-only — not shown on the store once you add content rows)
              </summary>
              <div
                className="prose prose-sm mt-2 max-h-48 overflow-y-auto border border-amber-100 bg-white p-2"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </details>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 max-w-4xl">
        <button
          type="button"
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
