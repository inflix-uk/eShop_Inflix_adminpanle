"use client";

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import {
  createFooterPage,
  updateFooterPage,
  getFooterPageById,
  API_BASE_URL,
} from "../service/pageService";
import BlocksTabForm from "../../blog-new/components/createblog/BlocksTabForm";
import SeoTabForm from "../../blog-new/components/createblog/SeoTabForm";
import PublishSettings from "../../blog-new/components/createblog/PublishSettings";
import { blocksHaveRenderableContent } from "../../blog-new/utils/blockContentValidation";
import BannerImage from "../../blog-new/components/createblog/BannerImage";
import Notification from "../../blog-new/components/createblog/Notification";
import Side from "../../nav/Side";
import Top from "../../nav/Top";

export default function CreateFooterPage() {
  const params = useParams();
  const id = params?.id;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const navigate = useNavigate();
  const bannerInputRef = useRef(null);
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(isEditing);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerImageAlt, setBannerImageAlt] = useState("");
  const [bannerImageDescription, setBannerImageDescription] = useState("");
  const [publishStatus, setPublishStatus] = useState("draft");
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaSchema, setMetaSchema] = useState([]);
  const [metaTags, setMetaTags] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState("content");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /** Values for <input type="date"> must be yyyy-MM-dd (not full ISO strings). */
  const toDateInputValue = (raw) => {
    if (raw == null || raw === "") {
      return new Date().toISOString().split("T")[0];
    }
    if (typeof raw === "string") {
      const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
    }
    const d = raw instanceof Date ? raw : new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  };

  // Helper to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's a data URL or full URL, return as is
    if (
      imagePath.startsWith("data:") ||
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    // Remove leading slash if present
    let path = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;

    // Construct full URL
    return `${API_BASE_URL}/uploads/${path}`;
  };

  // Load page data if editing
  useEffect(() => {
    if (isEditing && id) {
      const loadPage = async () => {
        try {
          setIsLoading(true);
          const pageData = await getFooterPageById(id);

          console.log('[FooterPage] Loaded page data:', pageData);
          console.log('[FooterPage] bannerImageAlt from API:', pageData.bannerImageAlt);
          console.log('[FooterPage] bannerImageDescription from API:', pageData.bannerImageDescription);
          
          setTitle(pageData.title || "");
          setSlug(pageData.slug || "");
          setBlocks(pageData.blocks || []);

          // Convert banner image path to full URL if it's a relative path
          const bannerImg = pageData.bannerImage || null;
          setBannerPreview(bannerImg ? getFullImageUrl(bannerImg) : null);
          setBannerImageAlt(pageData.bannerImageAlt || "");
          setBannerImageDescription(pageData.bannerImageDescription || "");

          setPublishStatus(pageData.publishStatus || "draft");
          setPublishDate(toDateInputValue(pageData.publishDate));
          setMetaTitle(pageData.metaTitle || "");
          setMetaDescription(pageData.metaDescription || "");
          setMetaSchema(pageData.metaSchema || []);
          setMetaTags(pageData.metaTags || []);
        } catch (error) {
          console.error("Error loading page:", error);
          setNotification({
            show: true,
            message: "Failed to load page data",
            type: "error",
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadPage();
    }
  }, [id, isEditing]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug && !isEditing) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [title, slug, isEditing]);

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

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";

    if (!blocksHaveRenderableContent(blocks)) {
      newErrors.content = "Content blocks are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Close notification
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // Helper function to convert data URL to File object
  const dataURLToFile = (dataURL, filename) => {
    const arr = dataURL.split(",");
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
        type: "error",
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
      processedBlocks.forEach((row, rowIndex) => {
        row.columns.forEach((column, colIndex) => {
          column.blocks.forEach((block, blockIndex) => {
            if (block.type === "image" && block.content && block.content.url) {
              // Check if URL is a data URL (starts with 'data:')
              if (block.content.url.startsWith("data:")) {
                const filename = `block-image-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.jpg`;
                try {
                  // Convert data URL to File
                  const file = dataURLToFile(block.content.url, filename);
                  blockImageFiles.push({
                    file,
                    path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][url]`,
                  });

                  // Replace data URL with placeholder
                  block.content.url = `__FILE_REFERENCE__${blockImageIndex}__`;
                  blockImageIndex++;
                } catch (error) {
                  console.error("Error converting data URL to file:", error);
                }
              }
            }
          });
        });
      });

      // Prepare page data object
      const pageData = {
        id: id,
        title,
        slug,
        blocks: processedBlocks,
        publishStatus,
        publishDate,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || "",
        metaTags,
        metaSchema,
        bannerImageAlt,
        bannerImageDescription,
        blockImageCount: blockImageFiles.length,
      };

      console.log('[FooterPage] Saving with bannerImageAlt:', bannerImageAlt);
      console.log('[FooterPage] Saving with bannerImageDescription:', bannerImageDescription);

      // Handle banner image (send explicit null on edit when removed so API clears stored file)
      if (bannerImage instanceof File) {
        pageData.bannerImage = bannerImage;
      } else if (bannerPreview) {
        pageData.bannerImage = bannerPreview;
      } else if (isEditing) {
        pageData.bannerImage = null;
      }

      // Add block image files to the page data
      blockImageFiles.forEach((item, index) => {
        pageData[`blockImages_${index}`] = item.file;
        pageData[`blockImagePath_${index}`] = item.path;
      });

      console.log(
        "Submitting page data with",
        blockImageFiles.length,
        "block images"
      );

      // Use pageService to create or update page
      let result;
      if (isEditing) {
        result = await updateFooterPage(id, pageData);
      } else {
        result = await createFooterPage(pageData);
      }

      console.log("Server response:", result);

      // Show success notification
      setNotification({
        show: true,
        message: `Page ${isEditing ? "updated" : "created"} successfully!`,
        type: "success",
      });

      // Redirect to pages management page after a short delay
      setTimeout(() => {
        navigate("/admin/footer-pages");
      }, 1500);
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} page:`,
        error
      );
      setNotification({
        show: true,
        message: `Failed to ${
          isEditing ? "update" : "create"
        } page. Please try again.`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Side
          selectedPage="footer-pages"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
        <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
          <Top
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            selectedPage="footer-pages"
            setSelectedPage={() => {}}
          />
          <main className="py-5">
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Side
        selectedPage="footer-pages"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage="footer-pages"
          setSelectedPage={() => {}}
        />
        <main className="py-5">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditing ? "Edit Footer Page" : "Create New Footer Page"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEditing
                  ? "Update your footer page content"
                  : "Create a new footer page (Terms & Conditions, Privacy Policy, etc.)"}
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
                {/* Main content column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title and Slug */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Page Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={`w-full px-4 py-2 border ${
                            errors.title ? "border-red-300" : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500`}
                          placeholder="e.g., Terms and Conditions"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.title}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="slug"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Slug <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            /
                          </span>
                          <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md ${
                              errors.slug ? "border-red-300" : "border-gray-300"
                            } focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                            placeholder="terms-and-conditions"
                          />
                        </div>
                        {errors.slug && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.slug}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner Image */}
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

                  {/* Tabs */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8 px-6">
                        <button
                          type="button"
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "content"
                              ? "border-purple-500 text-purple-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                          onClick={() => setActiveTab("content")}
                        >
                          Content Blocks
                        </button>
                        <button
                          type="button"
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "seo"
                              ? "border-purple-500 text-purple-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                          onClick={() => setActiveTab("seo")}
                        >
                          SEO
                        </button>
                      </nav>
                    </div>

                    <div className="p-6">
                      {activeTab === "content" ? (
                        <BlocksTabForm
                          blocks={blocks}
                          setBlocks={setBlocks}
                          errors={errors}
                        />
                      ) : (
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
                      )}
                    </div>
                  </div>
                </div>

                {/* Right column - Sidebar */}
                <div className="space-y-6">
                  {/* Publish Settings */}
                  <PublishSettings
                    publishStatus={publishStatus}
                    setPublishStatus={setPublishStatus}
                    publishDate={publishDate}
                    setPublishDate={setPublishDate}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                    isEditMode={isEditing}
                  />
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
