"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { updateBlogPost, API_BASE_URL } from "../../service/blogService";
import BlogFormTabs from "../createblog/BlogFormTabs";
import ContentTabForm from "../createblog/ContentTabForm";
import SeoTabForm from "../createblog/SeoTabForm";
import BlocksTabForm from "../createblog/BlocksTabForm";
import PublishSettings from "../createblog/PublishSettings";
import FeaturedImage from "../createblog/FeaturedImage";
import CategoriesSelector from "../createblog/CategoriesSelector";
import Notification from "../createblog/Notification";
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
} from "../../utils/blockContentValidation";

export default function EditBlogForm({ blogData = {}, availableCategories = [] } = {}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState(blogData?.title || "");
  const [slug, setSlug] = useState(blogData?.slug || "");
  const [content, setContent] = useState(blogData?.content || "");
  const [excerpt, setExcerpt] = useState(blogData?.excerpt || "");
  const [blocks, setBlocks] = useState(blogData?.blocks || []);
  // Store only category IDs for selection
  const [categories, setCategories] = useState(
    blogData?.categories?.map(cat => typeof cat === 'object' ? cat._id : cat) || []
  );
  const [tags, setTags] = useState(blogData?.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(blogData?.featuredImage || null);
  const [featuredImageAlt, setFeaturedImageAlt] = useState(blogData?.featuredImageAlt || "");
  const [featuredImageDescription, setFeaturedImageDescription] = useState(blogData?.featuredImageDescription || "");
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(blogData?.bannerImage || null);
  const [bannerImageAlt, setBannerImageAlt] = useState(blogData?.bannerImageAlt || "");
  const [bannerImageDescription, setBannerImageDescription] = useState(blogData?.bannerImageDescription || "");
  


  // Helper to get full image URL with backend URL if needed
  const getFullImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '/placeholder-blog.jpg';
    if (typeof imagePath === 'string' && imagePath.startsWith('data:')) {
      return imagePath;
    }
    // Full URL: return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // /uploads or other path: prepend backend URL
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}/${imagePath}`;
    }
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    // Otherwise, treat as filename in /uploads
    return `${API_BASE_URL}/uploads/${imagePath}`;
  }, []);

  // Process block images to add backend URL prefix if needed
  const processBlockImages = useCallback((blocks) => {
    if (!blocks || !Array.isArray(blocks)) return blocks;
    return blocks.map((row) => ({
      ...row,
      columns: row.columns.map((column) => ({
        ...column,
        blocks: column.blocks.map((block) => {
          if (block.type === "image" && block.content && block.content.url) {
            return {
              ...block,
              content: {
                ...block.content,
                url: getFullImageUrl(block.content.url),
              },
            };
          }
          if (
            block.type === "widget" &&
            block.content?.widgetType === "slider" &&
            Array.isArray(block.content.slides)
          ) {
            return {
              ...block,
              content: {
                ...block.content,
                slides: block.content.slides.map((s) => ({
                  ...s,
                  imageUrl: s.imageUrl ? getFullImageUrl(s.imageUrl) : "",
                })),
              },
            };
          }
          if (
            block.type === "widget" &&
            block.content?.widgetType === "newsletter" &&
            block.content.imageUrl
          ) {
            return {
              ...block,
              content: {
                ...block.content,
                imageUrl: getFullImageUrl(block.content.imageUrl),
              },
            };
          }
          if (
            block.type === "widget" &&
            block.content?.widgetType === "gallery" &&
            Array.isArray(block.content.items)
          ) {
            return {
              ...block,
              content: {
                ...block.content,
                items: block.content.items.map((it) => ({
                  ...it,
                  imageUrl: it?.imageUrl ? getFullImageUrl(it.imageUrl) : "",
                })),
              },
            };
          }
          if (
            block.type === "widget" &&
            block.content?.widgetType === "video" &&
            block.content.videoUrl &&
            typeof block.content.videoUrl === "string" &&
            !block.content.videoUrl.startsWith("data:")
          ) {
            const v = block.content.videoUrl.trim();
            const base = (API_BASE_URL || "").replace(/\/$/, "");
            const resolved =
              v.startsWith("http://") || v.startsWith("https://")
                ? v
                : v.startsWith("/")
                  ? `${base}${v}`
                  : getFullImageUrl(v);
            return {
              ...block,
              content: {
                ...block.content,
                videoUrl: resolved,
              },
            };
          }
          if (
            block.type === "widget" &&
            block.content?.widgetType === "siteBanners" &&
            Array.isArray(block.content.items)
          ) {
            return {
              ...block,
              content: {
                ...block.content,
                items: block.content.items.map((it) => ({
                  ...it,
                  imageLarge: it?.imageLarge ? getFullImageUrl(it.imageLarge) : "",
                  imageSmall: it?.imageSmall ? getFullImageUrl(it.imageSmall) : "",
                  extraImage: it?.extraImage ? getFullImageUrl(it.extraImage) : "",
                })),
              },
            };
          }
          if (
            block.type === "widget" &&
            block.content?.widgetType === "categoryCards" &&
            Array.isArray(block.content.items)
          ) {
            return {
              ...block,
              content: {
                ...block.content,
                items: block.content.items.map((it) => ({
                  ...it,
                  backgroundImage: it?.backgroundImage
                    ? getFullImageUrl(it.backgroundImage)
                    : "",
                  categoryImage: it?.categoryImage ? getFullImageUrl(it.categoryImage) : "",
                })),
              },
            };
          }
          if (block.type === "widget" && block.content?.widgetType === "promotionalSections") {
            const c = block.content;
            const pm = Array.isArray(c.buyNowPayLater?.paymentImages)
              ? c.buyNowPayLater.paymentImages.map((img) =>
                  img ? getFullImageUrl(img) : ""
                )
              : ["", "", ""];
            return {
              ...block,
              content: {
                ...c,
                buyNowPayLater: {
                  ...c.buyNowPayLater,
                  backgroundImage: c.buyNowPayLater?.backgroundImage
                    ? getFullImageUrl(c.buyNowPayLater.backgroundImage)
                    : "",
                  paymentImages: pm,
                },
                sellBuyCards: {
                  sellCard: {
                    ...c.sellBuyCards?.sellCard,
                    backgroundImage: c.sellBuyCards?.sellCard?.backgroundImage
                      ? getFullImageUrl(c.sellBuyCards.sellCard.backgroundImage)
                      : "",
                    productImage: c.sellBuyCards?.sellCard?.productImage
                      ? getFullImageUrl(c.sellBuyCards.sellCard.productImage)
                      : "",
                  },
                  buyCard: {
                    ...c.sellBuyCards?.buyCard,
                    backgroundImage: c.sellBuyCards?.buyCard?.backgroundImage
                      ? getFullImageUrl(c.sellBuyCards.buyCard.backgroundImage)
                      : "",
                    productImage: c.sellBuyCards?.buyCard?.productImage
                      ? getFullImageUrl(c.sellBuyCards.buyCard.productImage)
                      : "",
                  },
                },
                tinyPhoneBanner: {
                  ...c.tinyPhoneBanner,
                  backgroundImage: c.tinyPhoneBanner?.backgroundImage
                    ? getFullImageUrl(c.tinyPhoneBanner.backgroundImage)
                    : "",
                  centerImage: c.tinyPhoneBanner?.centerImage
                    ? getFullImageUrl(c.tinyPhoneBanner.centerImage)
                    : "",
                  rightImage: c.tinyPhoneBanner?.rightImage
                    ? getFullImageUrl(c.tinyPhoneBanner.rightImage)
                    : "",
                },
              },
            };
          }
          return block;
        }),
      })),
    }));
  }, [getFullImageUrl]);

  // Ensure image URLs are valid for Next.js Image component
  useEffect(() => {
    // Only update imagePreview if the processed value is different
    if (imagePreview && typeof imagePreview === 'string') {
      const processedImagePreview = getFullImageUrl(imagePreview);
      if (imagePreview !== processedImagePreview) {
        setImagePreview(processedImagePreview);
      }
    }
    // Only update bannerPreview if the processed value is different
    if (bannerPreview && typeof bannerPreview === 'string') {
      const processedBannerPreview = getFullImageUrl(bannerPreview);
      if (bannerPreview !== processedBannerPreview) {
        setBannerPreview(processedBannerPreview);
      }
    }
    // Only update blocks if the processed value is different
    if (blocks && Array.isArray(blocks)) {
      const processedBlocks = processBlockImages(blocks);
      // Shallow compare blocks and processedBlocks (by JSON.stringify for simplicity)
      if (JSON.stringify(blocks) !== JSON.stringify(processedBlocks)) {
        setBlocks(processedBlocks);
      }
    }
    console.log("Image previews initialized:", { imagePreview, bannerPreview });
    // Log blocks structure for debugging
    if (blocks && Array.isArray(blocks)) {
      console.log("Initial blocks structure:", JSON.stringify(blocks, null, 2));
    }
  }, [bannerPreview, blocks, getFullImageUrl, imagePreview, processBlockImages]);
  const getDateString = (date) => {
    if (!date) return "";
    // If already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // If ISO string, extract yyyy-mm-dd
    if (typeof date === "string" && date.includes("T")) return date.split("T")[0];
    // If Date object
    if (date instanceof Date) return date.toISOString().split("T")[0];
    return date;
  };

  const [publishStatus, setPublishStatus] = useState(blogData?.publishStatus || "draft");
  const [publishDate, setPublishDate] = useState(
    getDateString(blogData?.publishDate) || new Date().toISOString().split('T')[0]
  );
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState(blogData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(blogData?.metaDescription || "");
  // Meta schema state with clearer setter name
  const [metaSchema, setMetaSchema] = useState(blogData?.metaSchema ? 
    (Array.isArray(blogData.metaSchema) ? blogData.metaSchema : [blogData.metaSchema]) : 
    []);
  const [metaTags, setMetaTags] = useState(blogData?.metaTags || []);
  
  // UI state
  const [activeTab, setActiveTab] = useState("content");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

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

  // Form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        show: true,
        message: "Please fix the errors before submitting",
        type: "error"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clone blocks to modify without affecting state
      const processedBlocks = JSON.parse(JSON.stringify(blocks));
      const blockImageFiles = [];
      let blockImageIndex = 0;
      
      // Extract image data URLs from blocks and replace with placeholder URLs
      if (processedBlocks && Array.isArray(processedBlocks)) {
        processedBlocks.forEach((row, rowIndex) => {
          if (row.columns && Array.isArray(row.columns)) {
            row.columns.forEach((column, colIndex) => {
              if (column.blocks && Array.isArray(column.blocks)) {
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
              }
            });
          }
        });
      }

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
      
      // Prepare blog data object
      const updatedBlogData = {
        title,
        slug,
        content,
        excerpt,
        blocks: processedBlocks,
        categories,
        tags,
        publishStatus,
        publishDate,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        metaTags,
        metaSchema,
        featuredImageAlt,
        featuredImageDescription,
        bannerImageAlt,
        bannerImageDescription,
        blockImageCount: blockImageFiles.length
      };
      
      // Handle featured image
      if (featuredImage instanceof File) {
        updatedBlogData.featuredImage = featuredImage;
        console.log('Using featuredImage file:', featuredImage.name, featuredImage.size);
      } else if (imagePreview) {
        // If we have an image preview URL but no file (e.g., from editing), use the URL
        updatedBlogData.featuredImage = imagePreview;
        console.log('Using featuredImage URL:', imagePreview);
      }
      
      // Handle banner image
      if (bannerImage instanceof File) {
        updatedBlogData.bannerImage = bannerImage;
        console.log('Using bannerImage file:', bannerImage.name, bannerImage.size);
      } else if (bannerPreview) {
        // If we have a banner preview URL but no file (e.g., from editing), use the URL
        updatedBlogData.bannerImage = bannerPreview;
        console.log('Using bannerImage URL:', bannerPreview);
      }
      
      // Add block image files to the blog data
      blockImageFiles.forEach((item, index) => {
        updatedBlogData[`blockImages_${index}`] = item.file;
        updatedBlogData[`blockImagePath_${index}`] = item.path;
      });
      
      console.log('Submitting updated blog data with', blockImageFiles.length, 'block images');
      
      // Use blogService to update blog post (support both id and _id)
      const blogId = blogData.id || blogData._id;
         await updateBlogPost(blogId, updatedBlogData);
      
      // Show success notification
      setNotification({
        show: true,
        message: "Blog post updated successfully!",
        type: "success"
      });
      
      // Redirect to blog management page after a short delay
      setTimeout(() => {
        navigate("/admin/all-blogs");
      }, 1500);
      
    } catch (error) {
      console.error("Error updating blog post:", error);
      setNotification({
        show: true,
        message:
          typeof error === "string"
            ? error
            : "Failed to update blog post. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Edit Blog Post
        </h1>
        <p className="text-gray-600 mt-2">
          Update your existing blog post
        </p>
      </div>

      {/* Notification */}
      <Notification 
        notification={notification} 
        closeNotification={closeNotification} 
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content column - adapts based on active tab */}
          <div className={`space-y-6 ${activeTab === "content" ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {/* Blog form tabs */}
            <BlogFormTabs activeTab={activeTab} onRequestTab={setActiveTab} maxUnlockedIndex={2} />

            {/* Tab content */}
            {activeTab === "content" ? (
              <ContentTabForm
                title={title}
                setTitle={setTitle}
                slug={slug}
                setSlug={setSlug}
                excerpt={excerpt}
                setExcerpt={setExcerpt}
                content={content}
                setContent={setContent}
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
                setTags={setTags}
                currentTag={currentTag}
                setCurrentTag={setCurrentTag}
                handleAddTag={handleAddTag}
                handleTagKeyDown={handleTagKeyDown}
                removeTag={removeTag}
              />
            ) : activeTab === "seo" ? (
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
            ) : (
              <BlocksTabForm 
                blocks={blocks}
                setBlocks={setBlocks}
                errors={errors}
              />
            )}
          </div>

          {/* Right column - Sidebar - only shown on content tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Publish Settings */}
              <PublishSettings
                publishStatus={publishStatus}
                setPublishStatus={setPublishStatus}
                publishDate={publishDate}
                setPublishDate={setPublishDate}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                isEditMode={true}
              />

              {/* Featured Image */}
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

              {/* Categories */}
              <CategoriesSelector
                categories={categories}
                toggleCategory={toggleCategory}
                availableCategories={availableCategories}
                errors={errors}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

EditBlogForm.propTypes = {
  blogData: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string,
    content: PropTypes.string,
    excerpt: PropTypes.string,
    blocks: PropTypes.array,
    categories: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
          slug: PropTypes.string
        })
      ])
    ),
    tags: PropTypes.arrayOf(PropTypes.string),
    featuredImage: PropTypes.string,
    featuredImageAlt: PropTypes.string,
    featuredImageDescription: PropTypes.string,
    bannerImage: PropTypes.string,
    bannerImageAlt: PropTypes.string,
    bannerImageDescription: PropTypes.string,
    publishStatus: PropTypes.string,
    publishDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    metaTitle: PropTypes.string,
    metaDescription: PropTypes.string,
    metaSchema: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    metaTags: PropTypes.arrayOf(PropTypes.string)
  }),
  availableCategories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      slug: PropTypes.string
    })
  )
};
