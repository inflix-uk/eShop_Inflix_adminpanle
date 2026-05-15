"use client";

import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { createBlogPost, updateBlogPost, getAllCategories } from "../service/blogService";
import BlogFormTabs from "../components/createblog/BlogFormTabs";
import ContentTabForm from "../components/createblog/ContentTabForm";
import SeoTabForm from "../components/createblog/SeoTabForm";
import PublishSettings from "../components/createblog/PublishSettings";
import FeaturedImage from "../components/createblog/FeaturedImage";
import CategoriesSelector from "../components/createblog/CategoriesSelector";
import Notification from "../components/createblog/Notification";
import BlocksTabForm from "../components/createblog/BlocksTabForm";
import {
  blocksHaveRenderableContent,
  extractWidgetSlideDataUrls,
  extractNewsletterWidgetImageDataUrls,
  extractGalleryWidgetImageDataUrls,
  extractTestimonialsWidgetAvatarDataUrls,
  extractVideoWidgetDataUrls,
  extractSiteBannersWidgetImageDataUrls,
  extractCategoryCardsWidgetImageDataUrls,
  extractPromotionalSectionsWidgetImageDataUrls,
} from "../utils/blockContentValidation";
import BlogsTab from '../../blogs/BlogsTab';
import Side from '../../nav/Side';
import Top from '../../nav/Top';

function userFacingApiError(error, fallback) {
  if (typeof error === "string" && error.trim()) return error;
  const m = error && typeof error.message === "string" ? error.message.trim() : "";
  return m || fallback;
}

export default function CreateBlogPage({ initialData = {} } = {}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [selectedTab, setSelectedTab] = useState("new-blog");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const isEditing = !!initialData.id;

  // Available categories from API
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [content, setContent] = useState(initialData.content || "");
  const [excerpt, setExcerpt] = useState(initialData.excerpt || "");
  const [blocks, setBlocks] = useState(initialData.blocks || []);  
  const [categories, setCategories] = useState(initialData.categories || []);
  const [tags, setTags] = useState(initialData.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.featuredImage || null);
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData.featuredImageAlt || "");
  const [featuredImageDescription, setFeaturedImageDescription] = useState(initialData.featuredImageDescription || "");
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialData.bannerImage || null);
  const [bannerImageAlt, setBannerImageAlt] = useState(initialData.bannerImageAlt || "");
  const [bannerImageDescription, setBannerImageDescription] = useState(initialData.bannerImageDescription || "");
  const [publishStatus, setPublishStatus] = useState(initialData.publishStatus || "draft");
  const [publishDate, setPublishDate] = useState(
    initialData.publishDate || new Date().toISOString().split('T')[0]
  );
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState(initialData.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData.metaDescription || "");
  const [metaSchema, setMetaSchema] = useState(initialData.metaSchema ? 
    (Array.isArray(initialData.metaSchema) ? initialData.metaSchema : [initialData.metaSchema]) : 
    []);
  const [metaTags, setMetaTags] = useState(initialData.metaTags || []);
  
  // UI state
  const [activeTab, setActiveTab] = useState("content");
  /** Create flow: 0 = content only, 1 = +SEO, 2 = +Blocks. Edit: always 2 (all tabs open). */
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(() => (isEditing ? 2 : 0));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** After content step save — used for SEO + blocks updates (create flow only). */
  const [createdPostId, setCreatedPostId] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (isEditing) setMaxUnlockedIndex(2);
  }, [isEditing]);

  const requestTab = (tab) => {
    const order = { content: 0, seo: 1, blocks: 2 };
    const idx = order[tab];
    if (idx !== undefined && idx <= maxUnlockedIndex) {
      setActiveTab(tab);
    }
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await getAllCategories();
        setAvailableCategories(categories.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [title, slug]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner image upload
  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    console.log("Validating form with blocks:", JSON.stringify(blocks, null, 2));
    
    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    // Check if either markdown content OR blocks content exists
    const hasContent = content.trim().length > 0;
    
    // Debug block structure
    console.log("Block structure check:", blocks);
    
    const hasBlocks = blocksHaveRenderableContent(blocks);
    
    console.log("Has markdown content:", hasContent);
    console.log("Has blocks content:", hasBlocks);
    
    if (!hasContent && !hasBlocks) newErrors.content = "Content is required";
    if (!excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!featuredImage && !imagePreview) newErrors.featuredImage = "Thumbnail image is required";
    if (!bannerImage && !bannerPreview) newErrors.bannerImage = "Banner image is required";
    if (categories.length === 0) newErrors.categories = "At least one category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Step 1: title, slug, excerpt, images, categories (markdown/blocks validated on final submit). */
  const validateContentStep = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!featuredImage && !imagePreview) newErrors.featuredImage = "Thumbnail image is required";
    if (!bannerImage && !bannerPreview) newErrors.bannerImage = "Banner image is required";
    if (categories.length === 0) newErrors.categories = "At least one category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueFromContent = async () => {
    if (!validateContentStep()) {
      setNotification({
        show: true,
        message: "Please fix the errors in this step before continuing",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const step1Payload = {
        title: title.trim(),
        slug: slug.trim(),
        content: (content || "").trim(),
        excerpt: excerpt.trim(),
        blocks: [],
        categories,
        tags,
        publishStatus: "draft",
        publishDate,
        metaTitle: title.trim(),
        metaDescription: excerpt.trim(),
        metaTags: [],
        metaSchema: [],
        featuredImageAlt,
        featuredImageDescription,
        bannerImageAlt,
        bannerImageDescription,
        blockImageCount: 0,
      };

      if (featuredImage instanceof File) {
        step1Payload.featuredImage = featuredImage;
      } else if (imagePreview) {
        step1Payload.featuredImage = imagePreview;
      }
      if (bannerImage instanceof File) {
        step1Payload.bannerImage = bannerImage;
      } else if (bannerPreview) {
        step1Payload.bannerImage = bannerPreview;
      }

      const result = await createBlogPost({ ...step1Payload });
      const newId = result?._id || result?.id;
      if (!newId) {
        throw new Error("No post id returned from server");
      }
      setCreatedPostId(newId);
      if (result.featuredImage) {
        setImagePreview(result.featuredImage);
        setFeaturedImage(null);
      }
      if (result.bannerImage) {
        setBannerPreview(result.bannerImage);
        setBannerImage(null);
      }

      setMaxUnlockedIndex(1);
      setActiveTab("seo");
      setNotification({
        show: true,
        message: "Content saved as draft. Continue with SEO.",
        type: "success",
      });
    } catch (error) {
      console.error("Content step save failed:", error);
      setNotification({
        show: true,
        message: userFacingApiError(
          error,
          "Failed to save content. Check slug is unique, network/CORS, and try again."
        ),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueFromSeo = async () => {
    if (!createdPostId) {
      setNotification({
        show: true,
        message: "Save the Content tab first.",
        type: "error",
      });
      return;
    }

    const schemaList = Array.isArray(metaSchema) ? metaSchema.filter((s) => s && String(s).trim()) : [];

    setIsSubmitting(true);
    try {
      await updateBlogPost(createdPostId, {
        metaTitle: (metaTitle || title).trim(),
        metaDescription: (metaDescription || excerpt).trim(),
        metaTags,
        metaSchema: schemaList,
      });
      setMaxUnlockedIndex(2);
      setActiveTab("blocks");
      setNotification({
        show: true,
        message: "SEO saved. Add blocks and publish when ready.",
        type: "success",
      });
    } catch (error) {
      console.error("SEO step save failed:", error);
      setNotification({
        show: true,
        message: userFacingApiError(error, "Failed to save SEO."),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close notification
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // Helper function to convert data URL to File object
  const dataURLToFile = (dataURL, filename) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Form submission — optional explicitStatus ('draft' | 'published') when using dual action buttons
  const handleSubmit = async (e, explicitStatus) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    if (!isEditing && activeTab !== "blocks") {
      setNotification({
        show: true,
        message: "Complete SEO, then use the Blocks tab to publish or save as draft.",
        type: "error",
      });
      return;
    }

    if (!isEditing && !createdPostId) {
      setNotification({
        show: true,
        message: "Save the Content tab first, then SEO, before publishing.",
        type: "error",
      });
      return;
    }

    if (!validateForm()) {
      setNotification({
        show: true,
        message: "Please fix the errors before submitting",
        type: "error"
      });
      return;
    }
    
    const effectivePublishStatus = explicitStatus ?? publishStatus;

    setIsSubmitting(true);
    
    try {
      // Clone blocks to modify without affecting state
      const processedBlocks = JSON.parse(JSON.stringify(blocks));
      const blockImageFiles = [];
      let blockImageIndex = 0;
      
      // Extract image data URLs from blocks and replace with placeholder URLs
      processedBlocks.forEach((row, rowIndex) => {
        row.columns.forEach((column, colIndex) => {
          column.blocks.forEach((block, blockIndex) => {
            if (block.type === 'image' && block.content && block.content.url) {
              // Check if URL is a data URL (starts with 'data:')
              if (block.content.url.startsWith('data:')) {
                const filename = `block-image-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.jpg`;
                try {
                  // Convert data URL to File
                  const file = dataURLToFile(block.content.url, filename);
                  blockImageFiles.push({
                    file,
                    path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][url]`
                  });
                  
                  // Replace data URL with placeholder
                  block.content.url = `__FILE_REFERENCE__${blockImageIndex}__`;
                  blockImageIndex++;
                } catch (error) {
                  console.error('Error converting data URL to file:', error);
                }
              }
            }
          });
        });
      });

      const widgetExtract = extractWidgetSlideDataUrls(
        processedBlocks,
        dataURLToFile,
        blockImageIndex
      );
      blockImageFiles.push(...widgetExtract.blockImageFiles);

      const nlExtract = extractNewsletterWidgetImageDataUrls(
        processedBlocks,
        dataURLToFile,
        widgetExtract.blockImageIndex
      );
      blockImageFiles.push(...nlExtract.blockImageFiles);

      const galleryExtract = extractGalleryWidgetImageDataUrls(
        processedBlocks,
        dataURLToFile,
        nlExtract.blockImageIndex
      );
      blockImageFiles.push(...galleryExtract.blockImageFiles);

      const testimonialsExtract = extractTestimonialsWidgetAvatarDataUrls(
        processedBlocks,
        dataURLToFile,
        galleryExtract.blockImageIndex
      );
      blockImageFiles.push(...testimonialsExtract.blockImageFiles);

      const vidExtract = extractVideoWidgetDataUrls(
        processedBlocks,
        dataURLToFile,
        testimonialsExtract.blockImageIndex
      );
      blockImageFiles.push(...vidExtract.blockImageFiles);

      const siteBannersExtract = extractSiteBannersWidgetImageDataUrls(
        processedBlocks,
        dataURLToFile,
        vidExtract.blockImageIndex
      );
      blockImageFiles.push(...siteBannersExtract.blockImageFiles);

      const categoryCardsExtract = extractCategoryCardsWidgetImageDataUrls(
        processedBlocks,
        dataURLToFile,
        siteBannersExtract.blockImageIndex
      );
      blockImageFiles.push(...categoryCardsExtract.blockImageFiles);

      const promotionalSectionsExtract = extractPromotionalSectionsWidgetImageDataUrls(
        processedBlocks,
        dataURLToFile,
        categoryCardsExtract.blockImageIndex
      );
      blockImageFiles.push(...promotionalSectionsExtract.blockImageFiles);
      
      const schemaForSave = Array.isArray(metaSchema) ? metaSchema : [];

      // Prepare blog data: edit = full document; create = only blocks + publish + meta + new files (rest saved in earlier steps)
      let blogData;
      if (isEditing) {
        blogData = {
          id: initialData.id,
          title,
          slug,
          content,
          excerpt,
          blocks: processedBlocks,
          categories,
          tags,
          publishStatus: effectivePublishStatus,
          publishDate,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          metaTags,
          metaSchema: schemaForSave,
          featuredImageAlt,
          featuredImageDescription,
          bannerImageAlt,
          bannerImageDescription,
          blockImageCount: blockImageFiles.length,
        };
        if (featuredImage instanceof File) {
          blogData.featuredImage = featuredImage;
        } else if (imagePreview) {
          blogData.featuredImage = imagePreview;
        }
        if (bannerImage instanceof File) {
          blogData.bannerImage = bannerImage;
        } else if (bannerPreview) {
          blogData.bannerImage = bannerPreview;
        }
      } else {
        blogData = {
          blocks: processedBlocks,
          publishStatus: effectivePublishStatus,
          publishDate,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          metaTags,
          metaSchema: schemaForSave,
          featuredImageAlt,
          featuredImageDescription,
          bannerImageAlt,
          bannerImageDescription,
          blockImageCount: blockImageFiles.length,
        };
        if (featuredImage instanceof File) {
          blogData.featuredImage = featuredImage;
        }
        if (bannerImage instanceof File) {
          blogData.bannerImage = bannerImage;
        }
      }
      
      // Add block image files to the blog data
      blockImageFiles.forEach((item, index) => {
        blogData[`blockImages_${index}`] = item.file;
        blogData[`blockImagePath_${index}`] = item.path;
      });
      
      console.log('Submitting blog data with', blockImageFiles.length, 'block images');
      console.log('Blog data:', blogData);
      
      // Create flow: draft already exists — only update blocks + publish (smaller than one-shot create)
      let result;
      if (isEditing) {
        result = await updateBlogPost(initialData.id, blogData);
      } else {
        result = await updateBlogPost(createdPostId, blogData);
      }
      
      console.log('Server response:', result);
      
      // Show success notification
      setNotification({
        show: true,
        message: isEditing
          ? "Blog post updated successfully!"
          : effectivePublishStatus === "published"
            ? "Blog post published successfully!"
            : "Draft saved successfully!",
        type: "success",
      });
      
      // Redirect to blog management page after a short delay
      setTimeout(() => {
        navigate("/admin/all-blogs");
      }, 1500);
      
    } catch (error) {
      const label = isEditing ? "updating" : "publishing";
      console.error(`Error ${label} blog post:`, error);
      setNotification({
        show: true,
        message: userFacingApiError(
          error,
          `Failed to ${isEditing ? "update" : "publish"} blog post. Please try again.`
        ),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const narrowMain = activeTab === "content" || (!isEditing && activeTab === "blocks");
  const showRightColumn = activeTab === "content" || (!isEditing && activeTab === "blocks");

  return (
    <>
      <Side selectedPage="blogs" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="blogs" setSelectedPage={() => {}} />
        <main className="py-5">
          <div className="container mx-auto px-4 py-8">
            <BlogsTab
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            {/* Header */}
            <div className="mb-8 mt-5">
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditing
                  ? "Update your existing blog post"
                  : "Create and publish a new blog post to your website"}
              </p>
            </div>

            {/* Notification */}
            <Notification notification={notification} closeNotification={closeNotification} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className={`space-y-6 ${narrowMain ? "lg:col-span-2" : "lg:col-span-3"}`}>
                  <BlogFormTabs
                    activeTab={activeTab}
                    onRequestTab={requestTab}
                    maxUnlockedIndex={maxUnlockedIndex}
                  />

                  {activeTab === "content" ? (
                    <>
                      <ContentTabForm
                        title={title}
                        setTitle={setTitle}
                        slug={slug}
                        setSlug={setSlug}
                        excerpt={excerpt}
                        setExcerpt={setExcerpt}
                        errors={errors}
                        bannerPreview={bannerPreview}
                        bannerInputRef={bannerInputRef}
                        handleBannerUpload={handleBannerUpload}
                        setBannerImage={setBannerImage}
                        setBannerPreview={setBannerPreview}
                        bannerImageAlt={bannerImageAlt}
                        setBannerImageAlt={setBannerImageAlt}
                        bannerImageDescription={bannerImageDescription}
                        setBannerImageDescription={setBannerImageDescription}
                        tags={tags}
                        currentTag={currentTag}
                        setCurrentTag={setCurrentTag}
                        handleAddTag={handleAddTag}
                        handleTagKeyDown={handleTagKeyDown}
                        removeTag={removeTag}
                      />
                      {!isEditing && (
                        <div className="flex justify-start border-t border-gray-100 pt-6">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleContinueFromContent}
                            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Saving…" : "Save & continue to SEO"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : activeTab === "seo" ? (
                    <>
                      <SeoTabForm
                        metaTitle={metaTitle}
                        setMetaTitle={setMetaTitle}
                        metaDescription={metaDescription}
                        setMetaDescription={setMetaDescription}
                        metaSchema={metaSchema}
                        setMetaSchema={setMetaSchema}
                        metaTags={metaTags}
                        setMetaTags={setMetaTags}
                        errors={errors}
                      />
                      {!isEditing && (
                        <div className="flex justify-start border-t border-gray-100 pt-6">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleContinueFromSeo}
                            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Saving…" : "Save & continue to Blocks"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <BlocksTabForm blocks={blocks} setBlocks={setBlocks} errors={errors} />
                  )}
                </div>

                {showRightColumn && (
                  <div className="space-y-6">
                    {activeTab === "content" && (
                      <>
                        {isEditing && (
                          <PublishSettings
                            publishStatus={publishStatus}
                            setPublishStatus={setPublishStatus}
                            publishDate={publishDate}
                            setPublishDate={setPublishDate}
                            isSubmitting={isSubmitting}
                            handleSubmit={handleSubmit}
                            isEditMode
                            submitButtonType="button"
                          />
                        )}
                        <FeaturedImage
                          imagePreview={imagePreview}
                          errors={errors}
                          fileInputRef={fileInputRef}
                          handleImageUpload={handleImageUpload}
                          setFeaturedImage={setFeaturedImage}
                          setImagePreview={setImagePreview}
                          featuredImageAlt={featuredImageAlt}
                          setFeaturedImageAlt={setFeaturedImageAlt}
                          featuredImageDescription={featuredImageDescription}
                          setFeaturedImageDescription={setFeaturedImageDescription}
                        />
                        <CategoriesSelector
                          categories={categories}
                          toggleCategory={toggleCategory}
                          availableCategories={availableCategories}
                          errors={errors}
                        />
                        {loadingCategories && (
                          <div className="py-2 text-center text-sm text-gray-500">Loading categories...</div>
                        )}
                      </>
                    )}
                    {!isEditing && activeTab === "blocks" && (
                      <PublishSettings
                        publishStatus={publishStatus}
                        setPublishStatus={setPublishStatus}
                        publishDate={publishDate}
                        setPublishDate={setPublishDate}
                        isSubmitting={isSubmitting}
                        handleSubmit={handleSubmit}
                        submitButtonType="button"
                        useDualActionButtons
                      />
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

CreateBlogPage.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string,
    content: PropTypes.string,
    excerpt: PropTypes.string,
    blocks: PropTypes.array,
    categories: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        slug: PropTypes.string
      })
    ])),
    tags: PropTypes.arrayOf(PropTypes.string),
    featuredImage: PropTypes.string,
    featuredImageAlt: PropTypes.string,
    featuredImageDescription: PropTypes.string,
    bannerImage: PropTypes.string,
    bannerImageAlt: PropTypes.string,
    bannerImageDescription: PropTypes.string,
    publishStatus: PropTypes.string,
    publishDate: PropTypes.string,
    metaTitle: PropTypes.string,
    metaDescription: PropTypes.string,
    metaSchema: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string
    ]),
    metaTags: PropTypes.arrayOf(PropTypes.string)
  })
};
