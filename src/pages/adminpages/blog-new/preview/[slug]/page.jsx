import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { Edit } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Side from "../../../nav/Side";
import Top from "../../../nav/Top";
import { getBlogPostBySlugWithoutCache, API_BASE_URL } from "../../service/blogService";
import TableOfContents from "./TableOfContents";

// Add this to your global CSS or use a styled-component
// This CSS fixes the issues with lists and tables in blog content
const blogContentStyles = `
  /* Critical fixes for lists with paragraphs */
  .blog-content ul li p,
  .blog-content ol li p {
    display: inline !important;
    margin: 0 !important;
  }

  /* Critical fixes for tables */
  .blog-content table {
    display: table !important;
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
    margin: 1.25rem 0 !important;
    border: 1px solid #e5e7eb !important;
  }

  .blog-content table td,
  .blog-content table th {
    padding: 0.5rem !important;
    border: 1px solid #e5e7eb !important;
    vertical-align: top !important;
    word-break: break-word !important;
  }

  /* Critical fixes for lists */
  .blog-content ul,
  .blog-content ol {
    list-style-position: outside !important;
    margin: 1rem 0 !important;
    padding-left: 1.5rem !important;
  }

  .blog-content ul {
    list-style-type: disc !important;
  }

  .blog-content ol {
    list-style-type: decimal !important;
  }

  .blog-content li {
    display: list-item !important;
    margin: 0.375rem 0 !important;
  }

  /* Nested lists */
  .blog-content ul ul,
  .blog-content ol ol,
  .blog-content ul ol,
  .blog-content ol ul {
    margin: 0.25rem 0 !important;
  }
`;

// Image helper
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder-blog.jpg";
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

// Blog Content Component
// This component handles proper rendering of HTML content
const BlogContent = ({ content }) => {
  return (
    <>
      {/* Include the CSS styles in the component */}
      <style dangerouslySetInnerHTML={{ __html: blogContentStyles }} />
      
      <div
        className="prose prose-lg max-w-none blog-content"
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

BlogContent.propTypes = {
  content: PropTypes.string,
};

// Main Component
export default function BlogPreviewPage() {
  const { slug } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const data = await getBlogPostBySlugWithoutCache(slug);
        setBlog(data);
      } catch (error) {
        setErrorMessage("Failed to load blog preview.");
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  const contentBlockStyles = {
    width: "100%",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  };

  const isLocalhost = window.location.hostname === "localhost";
  const canonicalUrl = blog?.slug
    ? isLocalhost
      ? window.location.href
      : `https://zextons.co.uk/blog/${blog.slug}`
    : "";

  return (
    <>
      {blog && (
        <Helmet>
          <title>{blog.metaTitle || blog.title}</title>
          <meta name="description" content={blog.metaDescription || blog.excerpt} />
          <link rel="canonical" href={canonicalUrl} />
          <meta name="robots" content="index, follow" />
        </Helmet>
      )}

      <Side selectedPage="blogs" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""} min-h-screen bg-white`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="blogs" setSelectedPage={() => {}} />

        <main className="py-5">
          <div className="container mx-auto py-8 max-w-[1600px]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">Blog Preview</h1>
              <Link to="/admin/all-blogs" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md">
                Back to Blogs
              </Link>
            </div>

            <div className="p-4 max-w-[1500px] mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : errorMessage ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              ) : blog ? (
                <>
                  {/* ✅ Banner at the top */}
                  {blog.featuredImage && (
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 mb-6">
                      <img
                        src={getFullImageUrl(blog.featuredImage)}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* ✅ Table of Contents */}
                    <aside className="w-full md:w-72 min-w-[16rem] max-w-xs bg-white border border-gray-200 rounded-lg shadow p-4 h-fit sticky top-8 self-start">
                      <TableOfContents />
                    </aside>

                    {/* ✅ Blog Content */}
                    <div id="blog-content" className="flex-1" style={contentBlockStyles}>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          <StatusBadge status={blog.status} />
                        </div>
                        {blog.updatedAt && (
                          <div>
                            <span className="font-medium mr-1">Last updated:</span>
                            {formatDate(blog.updatedAt)}
                          </div>
                        )}
                        {blog.publishDate && (
                          <div>
                            <span className="font-medium mr-1">Publish Date:</span>
                            {formatDate(blog.publishDate)}
                          </div>
                        )}
                        {blog.tags?.length > 0 && (
                          <div>
                            <span className="font-medium mr-1">Tags:</span>
                            {blog.tags.join(", ")}
                          </div>
                        )}
                        {blog.categories?.length > 0 && (
                          <div>
                            <span className="font-medium mr-1">Categories:</span>
                            {blog.categories.map((cat) =>
                              typeof cat === "object" ? cat.name : cat
                            ).join(", ")}
                          </div>
                        )}
                      </div>

                      {blog.excerpt && (
                        <div className="bg-gray-50 border-l-4 border-gray-200 p-4 italic text-gray-700 mb-6">
                          {blog.excerpt}
                        </div>
                      )}

                      {blog.blocks && blog.blocks.length > 0 && (
                        <div className="space-y-6 mb-6" style={contentBlockStyles}>
                          {blog.blocks.map((row, rowIndex) => (
                            <div key={`row-${rowIndex}`} className="flex flex-col md:flex-row gap-4">
                              {row.columns.map((column, colIndex) => (
                                <div
                                  key={`col-${rowIndex}-${colIndex}`}
                                  className="space-y-4 w-full"
                                  style={{ maxWidth: column.width ? `${column.width}%` : `${100 / row.columns.length}%` }}
                                >
                                  {column.blocks.map((block, blockIndex) => {
                                    switch (block.type) {
                                      case "heading":
                                        return (
                                          <h2
                                            key={`block-${rowIndex}-${colIndex}-${blockIndex}`}
                                            className="text-2xl font-bold"
                                            style={contentBlockStyles}
                                          >
                                            {block.content?.text}
                                          </h2>
                                        );
                                      case "paragraph":
                                        return (
                                          <p
                                            key={`block-${rowIndex}-${colIndex}-${blockIndex}`}
                                            className="text-gray-700"
                                            style={contentBlockStyles}
                                          >
                                            {block.content?.text}
                                          </p>
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
                                                {(block.content?.height || block.content?.width) && (
                                                  <div className="text-xs text-gray-500 mt-1">
                                                    {block.content?.height ? `${block.content.height}px` : ""}
                                                    {block.content?.width ? ` x ${block.content.width}px` : ""}
                                                  </div>
                                                )}
                                             </div>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                              {block.content?.heading && (
                                                <h3 className="text-lg font-semibold">
                                                  {block.content.heading}
                                                </h3>
                                              )}
                                              {block.content?.externalLink && (
                                                <a
                                                  href={block.content.externalLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-block bg-[rgb(22,163,74)] hover:bg-[rgb(22,163,74,0.8)] text-white font-medium py-2 px-4 rounded-md transition-colors text-sm whitespace-nowrap ml-4"
                                                >
                                                  Buy Now
                                                </a>
                                              )}
                                            </div>
                                            {block.content?.caption && (
                                              <p className="text-sm text-gray-500 mt-1">
                                                {block.content.caption}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      case "text":
                                        return (
                                          <BlogContent
                                            key={`block-${rowIndex}-${colIndex}-${blockIndex}`}
                                            content={block.content || ""}
                                          />
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
                          to={`/admin/blog/editblog?id=${blog._id}`}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-12">No blog post found.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

BlogPreviewPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};