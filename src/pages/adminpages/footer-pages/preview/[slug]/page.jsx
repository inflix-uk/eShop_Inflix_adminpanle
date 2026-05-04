import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Edit } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Side from "../../../nav/Side";
import Top from "../../../nav/Top";
import { getFooterPageBySlug, API_BASE_URL } from "../../service/pageService";

// Add this to your global CSS or use a styled-component
// This CSS fixes the issues with lists and tables in page content
const pageContentStyles = `
  /* Critical fixes for lists with paragraphs */
  .page-content ul li p,
  .page-content ol li p {
    display: inline !important;
    margin: 0 !important;
  }

  /* Critical fixes for tables */
  .page-content table {
    display: table !important;
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
    margin: 1.25rem 0 !important;
    border: 1px solid #e5e7eb !important;
  }

  .page-content table td,
  .page-content table th {
    padding: 0.5rem !important;
    border: 1px solid #e5e7eb !important;
    vertical-align: top !important;
    word-break: break-word !important;
  }

  /* Critical fixes for lists */
  .page-content ul,
  .page-content ol {
    list-style-position: outside !important;
    margin: 1rem 0 !important;
    padding-left: 1.5rem !important;
  }

  .page-content ul {
    list-style-type: disc !important;
  }

  .page-content ol {
    list-style-type: decimal !important;
  }

  .page-content li {
    display: list-item !important;
    margin: 0.375rem 0 !important;
  }

  /* Nested lists */
  .page-content ul ul,
  .page-content ol ol,
  .page-content ul ol,
  .page-content ol ul {
    margin: 0.25rem 0 !important;
  }
`;

// Image helper
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder-page.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}/uploads/${imagePath.replace("/uploads/", "")}`;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "Not published";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Status badge
const StatusBadge = ({ status }) => {
  const statusStyles = {
    published: "bg-blue-100 text-blue-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || ""}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

// Page Content Component for rendering HTML
// This component handles proper rendering of HTML content
const PageContent = ({ content }) => {
  return (
    <>
      {/* Include the CSS styles in the component */}
      <style dangerouslySetInnerHTML={{ __html: pageContentStyles }} />
      
      <div
        className="prose prose-lg max-w-none page-content"
        style={{
          width: "100%",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          overflowX: "auto",
          margin: 0,
          padding: "0 0 1rem 0",
        }}
        dangerouslySetInnerHTML={{ __html: content || "" }}
      />
    </>
  );
};

PageContent.propTypes = {
  content: PropTypes.string,
};

// Main Component
export default function FooterPagePreview() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const categorySlugParam = searchParams.get("categorySlug");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setIsLoading(true);
        const data = await getFooterPageBySlug(
          slug,
          categorySlugParam || null
        );
        setPage(data);
      } catch (error) {
        setErrorMessage("Failed to load page preview.");
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchPage();
  }, [slug, categorySlugParam]);

  const contentBlockStyles = {
    width: "100%",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  };

  return (
    <>
      {page && (
        <Helmet>
          <title>{page.metaTitle || page.title}</title>
          <meta name="description" content={page.metaDescription || ""} />
          <meta name="robots" content="index, follow" />
        </Helmet>
      )}

      <Side selectedPage="footer-pages" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""} min-h-screen bg-white`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="footer-pages" setSelectedPage={() => {}} />

        <main className="py-5">
          <div className="container mx-auto py-8 max-w-[1600px]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">Page Preview</h1>
              <Link
                to="/admin/footer-pages"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Back to Pages
              </Link>
            </div>

            <div className="p-4 max-w-[1500px] mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
                </div>
              ) : errorMessage ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              ) : page ? (
                <>
                  {/* Banner at the top */}
                  {page.bannerImage && (
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 mb-6">
                      <img
                        src={getFullImageUrl(page.bannerImage)}
                        alt={page.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-6">
                    {/* Page Content */}
                    <div id="page-content" className="flex-1" style={contentBlockStyles}>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          <StatusBadge status={page.publishStatus} />
                        </div>
                        {page.updatedAt && (
                          <div>
                            <span className="font-medium mr-1">Last updated:</span>
                            {formatDate(page.updatedAt)}
                          </div>
                        )}
                        {page.publishDate && (
                          <div>
                            <span className="font-medium mr-1">Publish Date:</span>
                            {formatDate(page.publishDate)}
                          </div>
                        )}
                      </div>

                      {page.blocks && page.blocks.length > 0 && (
                        <div className="space-y-6 mb-6" style={contentBlockStyles}>
                          {page.blocks.map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`} className="flex flex-col md:flex-row gap-4">
                              {row.columns.map((column, colIndex) => (
                                <div
                                  key={`col-${rowIndex}-${colIndex}`}
                                  className="space-y-4 w-full"
                                  style={{ maxWidth: column.width ? `${column.width}%` : `${100 / row.columns.length}%` }}
                                >
                                  {column.blocks.map((block, blockIndex) => {
                                    switch (block.type) {
                                      case "text":
                                        return (
                                          <PageContent
                                            key={`block-${rowIndex}-${colIndex}-${blockIndex}`}
                                            content={block.content || ""}
                                          />
                                        );
                                      case "image":
                                        return (
                                          <div
                                            key={`block-${rowIndex}-${colIndex}-${blockIndex}`}
                                            className="rounded-lg overflow-hidden"
                                            style={contentBlockStyles}
                                          >
                                            {block.content?.url && (
                                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                                {block.content?.externalLink ? (
                                                  <a href={block.content.externalLink} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                      src={getFullImageUrl(block.content.url)}
                                                      alt={block.content?.alt || ""}
                                                      height={block.content?.height}
                                                      width={block.content?.width}
                                                      style={{
                                                        height: block.content?.height ? `${block.content.height}px` : undefined,
                                                        width: block.content?.width ? `${block.content.width}px` : undefined,
                                                        maxWidth: "100%"
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  <img
                                                    src={getFullImageUrl(block.content.url)}
                                                    alt={block.content?.alt || ""}
                                                    height={block.content?.height}
                                                    width={block.content?.width}
                                                    style={{
                                                      height: block.content?.height ? `${block.content.height}px` : undefined,
                                                      width: block.content?.width ? `${block.content.width}px` : undefined,
                                                      maxWidth: "100%"
                                                    }}
                                                  />
                                                )}
                                              </div>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                              {block.content?.heading && (
                                                <h3 className="text-lg font-semibold">
                                                  {block.content.heading}
                                                </h3>
                                              )}
                                            </div>
                                            {block.content?.alt && (
                                              <p className="text-sm text-gray-500 mt-1">
                                                {block.content.alt}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      default:
                                        return null;
                                    }
                                  })}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Edit Button */}
                      <div className="flex justify-end mt-8">
                        <Link
                          to={`/admin/footer-pages/edit/${page._id || page.id}`}
                          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-12">No page found.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

FooterPagePreview.propTypes = {
  params: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }),
};
