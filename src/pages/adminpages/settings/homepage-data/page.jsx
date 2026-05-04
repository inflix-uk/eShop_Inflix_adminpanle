"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import BlockEditor from "../../blog-new/components/createblog/BlockEditor/BlockEditor";
import SeoTabForm from "../../blog-new/components/createblog/SeoTabForm";
import {
  getHomepageData,
  saveHomepageData,
  getHomepageSeo,
  patchHomepageSeo,
} from "./service/homepageDataService";
import {
  extractWidgetSlideDataUrls,
  extractNewsletterWidgetImageDataUrls,
  extractGalleryWidgetImageDataUrls,
  extractTestimonialsWidgetAvatarDataUrls,
  extractVideoWidgetDataUrls,
  extractSiteBannersWidgetImageDataUrls,
  extractCategoryCardsWidgetImageDataUrls,
  extractPromotionalSectionsWidgetImageDataUrls,
} from "../../blog-new/utils/blockContentValidation";

function dataURLToFile(dataURL, filename) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const TAB_CONTENT = "content";
const TAB_SEO = "seo";

export default function HomepageDataSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "seo" ? TAB_SEO : TAB_CONTENT;

  const setTab = useCallback(
    (tab) => {
      if (tab === TAB_SEO) {
        setSearchParams({ tab: "seo" }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams]
  );

  const [selectedPage, setSelectedPage] = useState("homepage-data-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [blocks, setBlocks] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentUpdatedAt, setContentUpdatedAt] = useState(null);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaSchema, setMetaSchema] = useState([]);
  const [metaTags, setMetaTags] = useState([]);
  const [loadingSeo, setLoadingSeo] = useState(true);
  const [seoUpdatedAt, setSeoUpdatedAt] = useState(null);

  const [isSubmittingContent, setIsSubmittingContent] = useState(false);
  const [isSubmittingSeo, setIsSubmittingSeo] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const loadContentData = async () => {
    setLoadingContent(true);
    setProgress(30);
    try {
      const data = await getHomepageData();
      if (data) {
        setBlocks(data.blocks || []);
        setContentUpdatedAt(data.updatedAt || null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoadingContent(false);
      setProgress(100);
    }
  };

  const loadSeoData = async () => {
    setLoadingSeo(true);
    setProgress(30);
    try {
      const data = await getHomepageSeo();
      if (data) {
        setSeoUpdatedAt(data.updatedAt || null);
        setMetaTitle(data.metaTitle || "");
        setMetaDescription(data.metaDescription || "");
        setMetaTags(Array.isArray(data.metaTags) ? data.metaTags : []);
        const ms = data.metaSchema;
        setMetaSchema(ms ? (Array.isArray(ms) ? ms : [ms]) : []);
      }
    } catch (error) {
      console.error("Error loading homepage SEO data:", error);
    } finally {
      setLoadingSeo(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    loadContentData();
    loadSeoData();
  }, []);

  const handleSubmitContent = async (e) => {
    e.preventDefault();
    setIsSubmittingContent(true);
    setProgress(50);

    try {
      const processedBlocks = JSON.parse(JSON.stringify(blocks));
      const blockImageFiles = [];
      let blockImageIndex = 0;

      processedBlocks.forEach((row, rowIndex) => {
        row.columns.forEach((column, colIndex) => {
          column.blocks.forEach((block, blockIndex) => {
            if (block.type === "image" && block.content && block.content.url) {
              if (
                typeof block.content.url === "string" &&
                block.content.url.startsWith("data:")
              ) {
                const filename = `block-image-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.jpg`;
                try {
                  const file = dataURLToFile(block.content.url, filename);
                  blockImageFiles.push({
                    file,
                    path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][url]`,
                  });
                  block.content.url = `__FILE_REFERENCE__${blockImageIndex}__`;
                  blockImageIndex += 1;
                } catch (err) {
                  console.error("Error converting block image data URL:", err);
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

      const promotionalSectionsExtract =
        extractPromotionalSectionsWidgetImageDataUrls(
          processedBlocks,
          dataURLToFile,
          categoryCardsExtract.blockImageIndex
        );
      blockImageFiles.push(...promotionalSectionsExtract.blockImageFiles);

      const homepagePayload = {
        blocks: processedBlocks,
        blockImageCount: blockImageFiles.length,
      };
      blockImageFiles.forEach((item, index) => {
        homepagePayload[`blockImages_${index}`] = item.file;
        homepagePayload[`blockImagePath_${index}`] = item.path;
      });

      await saveHomepageData(homepagePayload);
      await loadContentData();
      setNotification({
        show: true,
        message: "Homepage content saved successfully!",
        type: "success",
      });
      setTimeout(() => setNotification((n) => ({ ...n, show: false })), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setNotification({
        show: true,
        message: "Failed to save homepage data",
        type: "error",
      });
    } finally {
      setIsSubmittingContent(false);
      setProgress(100);
    }
  };

  const handleSubmitSeo = async (e) => {
    e.preventDefault();
    setIsSubmittingSeo(true);
    setProgress(50);
    try {
      await patchHomepageSeo({
        metaTitle,
        metaDescription,
        metaTags,
        metaSchema,
      });
      await loadSeoData();
      setNotification({
        show: true,
        message: "Homepage SEO saved successfully!",
        type: "success",
      });
      setTimeout(() => setNotification((n) => ({ ...n, show: false })), 3000);
    } catch (error) {
      console.error("Error saving homepage SEO:", error);
      setNotification({
        show: true,
        message: "Failed to save homepage SEO",
        type: "error",
      });
    } finally {
      setIsSubmittingSeo(false);
      setProgress(100);
    }
  };

  const tabBtnClass = (tab) =>
    `whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
      activeTab === tab
        ? "border-primary text-primary"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    }`;

  return (
    <>
      <Helmet>
        <title>
          {activeTab === TAB_SEO ? "Homepage SEO" : "Homepage content"} — Admin
        </title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Homepage</h1>
              <p className="mt-2 text-gray-600">
                Edit homepage blocks and SEO meta in one place. Use the tabs
                below to switch between content and SEO.
              </p>
            </div>

            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex gap-8" aria-label="Homepage settings">
                <button
                  type="button"
                  onClick={() => setTab(TAB_CONTENT)}
                  className={tabBtnClass(TAB_CONTENT)}
                >
                  Homepage content
                </button>
                <button
                  type="button"
                  onClick={() => setTab(TAB_SEO)}
                  className={tabBtnClass(TAB_SEO)}
                >
                  SEO
                </button>
              </nav>
            </div>

            {notification.show && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  notification.type === "success"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {notification.message}
              </div>
            )}

            {activeTab === TAB_CONTENT && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {loadingContent ? (
                  <div className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContent} className="px-6 py-6">
                    <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
                      <p className="font-semibold text-sky-950">
                        Widget blocks need two switches to show on the store
                      </p>
                      <p className="mt-2 leading-relaxed text-sky-900/95">
                        This screen saves <strong>layout and content</strong> (rows, columns, which
                        widget types you added). The storefront <strong>also</strong> reads{" "}
                        <strong>Site widgets</strong> — global on/off for each type (slider,
                        newsletter, FAQ, etc.). If widgets disappear on <code className="rounded bg-white/80 px-1 text-xs">/</code>, open{" "}
                        <Link
                          to="/admin/settings/widgets"
                          className="font-semibold text-sky-800 underline decoration-sky-400 underline-offset-2 hover:text-sky-950"
                        >
                          Settings → Site widgets
                        </Link>{" "}
                        and turn on the types you use here.
                      </p>
                    </div>
                    {contentUpdatedAt && (
                      <p className="text-sm text-gray-500 mb-4">
                        Content last updated:{" "}
                        {new Date(contentUpdatedAt).toLocaleString()}
                      </p>
                    )}
                    <div className="space-y-6">
                      <div className="mb-3">
                        <label className="block text-lg font-medium text-gray-700">
                          Content blocks
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          Drag the grip handle on each row to reorder sections. Click{" "}
                          <strong className="font-medium text-gray-600">
                            Save homepage content
                          </strong>{" "}
                          to apply the same order on the public site.
                        </p>
                      </div>
                      <BlockEditor
                        blocks={blocks}
                        setBlocks={setBlocks}
                        className="p-4"
                      />
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingContent}
                        className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingContent ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save homepage content"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === TAB_SEO && (
              <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
                {loadingSeo ? (
                  <div className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitSeo} className="px-6 py-6">
                    {seoUpdatedAt && (
                      <p className="text-sm text-gray-500 mb-4">
                        SEO last updated:{" "}
                        {new Date(seoUpdatedAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-6">
                      Meta title, description, keywords, and schema for the
                      homepage (same fields as blog SEO).
                    </p>
                    <SeoTabForm
                      metaTitle={metaTitle}
                      setMetaTitle={setMetaTitle}
                      metaDescription={metaDescription}
                      setMetaDescription={setMetaDescription}
                      metaSchema={metaSchema}
                      setMetaSchema={setMetaSchema}
                      metaTags={metaTags}
                      setMetaTags={setMetaTags}
                      showBlogSeoHint={false}
                    />
                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingSeo}
                        className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingSeo ? "Saving..." : "Save homepage SEO"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
