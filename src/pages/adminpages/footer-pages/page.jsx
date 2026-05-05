"use client";

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { getAllFooterPages, deleteFooterPage } from './service/pageService';
import Side from '../nav/Side';
import Top from '../nav/Top';

export default function FooterPagesManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch pages from the backend
  const fetchPages = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const footerPages = await getAllFooterPages({});
      setPages(footerPages);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      setErrorMessage('Failed to load pages. Please try again later.');
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchPages();
  }, []);

  // Handle delete
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const success = await deleteFooterPage(id);
      if (success) {
        setSuccessMessage('Page deleted successfully');
        fetchPages();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to delete page');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Filter pages based on search
  const filteredPages = pages.filter(page =>
    page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getParentSlug = (page) => {
    const parent = page?.parentPageId;
    if (!parent) return "";
    if (typeof parent === "string") return "";
    return String(parent?.slug || "").trim();
  };

  return (
    <>
      <Side selectedPage="footer-pages" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="footer-pages" setSelectedPage={() => {}} />
        <main className="py-5">
          <div className="container mx-auto px-4 py-8">
            {/* Header — stack on narrow widths so the CTA is not crushed by the long intro copy */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-800">Pages</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                  Create and manage your site pages — policies, guides, marketing content, and custom URLs (root or under a parent page).
                </p>
              </div>
              <Link
                to="/admin/footer-pages/create"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-md border border-transparent bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:self-start sm:py-2"
              >
                <FaPlus className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">Create New Page</span>
              </Link>
            </div>

            {/* Messages */}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
                {successMessage}
              </div>
            )}

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Pages Table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No pages found</p>
                {searchTerm && (
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPages.map((page) => (
                      <tr key={page._id || page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {getParentSlug(page)
                              ? `/${getParentSlug(page)}/${page.slug}`
                              : `/${page.slug}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.publishStatus === 'published' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {page.publishStatus || 'draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {page.updatedAt 
                            ? new Date(page.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={{
                                pathname: `/admin/footer-pages/preview/${page.slug}`,
                                search: getParentSlug(page)
                                  ? `?parentSlug=${encodeURIComponent(getParentSlug(page))}`
                                  : "",
                              }}
                              className="text-primary hover:text-secondary"
                              title="Preview"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/admin/footer-pages/edit/${page._id || page.id}`}
                              className="text-primary hover:text-secondary"
                              title="Edit"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(page._id || page.id, page.title)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
