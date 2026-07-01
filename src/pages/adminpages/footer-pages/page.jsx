"use client";

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { getAllFooterPages, deleteFooterPage } from './service/pageService';
import Side from '../nav/Side';
import Top from '../nav/Top';
import {
  buildFooterPagePublicPath,
  resolveParentPageSlug,
} from './utils/footerPagePublicPath';
import { TableSkeleton } from '../shared/Skeletons';

const PAGE_SIZE = 10;

export default function FooterPagesManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);

  // Fetch pages from the backend
  const fetchPages = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const footerPages = await getAllFooterPages({});
      const list = Array.isArray(footerPages) ? footerPages : [];
      console.log(
        "[Footer pages admin] Full list from API (all pages, pagination merged):",
        list.length,
        "row(s)"
      );
      if (list.length > 0) {
        console.table(
          list.map((p) => ({
            title: p?.title ?? "",
            slug: p?.slug ?? "",
            path: buildFooterPagePublicPath(
              p?.slug ?? "",
              resolveParentPageSlug(p?.parentPageId, list)
            ),
            publishStatus: p?.publishStatus ?? "",
            id: String(p?._id ?? p?.id ?? ""),
          }))
        );
      } else {
        console.log("[Footer pages admin] Backend payload (empty or non-array):", footerPages);
      }
      setPages(list);
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
  const filteredPages = useMemo(
    () =>
      pages.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [pages, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / PAGE_SIZE));

  const paginatedPages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPages.slice(start, start + PAGE_SIZE);
  }, [filteredPages, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  useEffect(() => {
    if (isLoading) return;
    const searching = Boolean(searchTerm?.trim());
    console.log(
      "[Footer pages admin] Table rows:",
      filteredPages.length,
      "visible /",
      pages.length,
      "loaded (search:",
      searching ? `"${searchTerm}"` : "off)",
      ")"
    );
    if (searching && filteredPages.length < pages.length) {
      const hidden = pages.length - filteredPages.length;
      console.log(
        "[Footer pages admin]",
        hidden,
        "page(s) hidden by search filter (still in loaded list; clear search to see all in table)."
      );
    }
  }, [isLoading, pages.length, filteredPages.length, searchTerm]);

  const getPublicPath = (page, allPagesList = pages) =>
    buildFooterPagePublicPath(
      page?.slug ?? "",
      resolveParentPageSlug(page?.parentPageId, allPagesList)
    );

  const getParentSlug = (page) =>
    resolveParentPageSlug(page?.parentPageId, pages);

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
              <TableSkeleton rows={8} columns={5} />
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
                    {paginatedPages.map((row) => (
                      <tr key={row._id || row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {getPublicPath(row)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.publishStatus === 'published' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.publishStatus || 'draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.updatedAt 
                            ? new Date(row.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={{
                                pathname: `/admin/footer-pages/preview/${row.slug}`,
                                search: getParentSlug(row)
                                  ? `?parentSlug=${encodeURIComponent(getParentSlug(row))}`
                                  : "",
                              }}
                              className="text-primary hover:text-secondary"
                              title="Preview"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/admin/footer-pages/edit/${row._id || row.id}`}
                              className="text-primary hover:text-secondary"
                              title="Edit"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(row._id || row.id, row.title)}
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
                {filteredPages.length > PAGE_SIZE ? (
                  <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredPages.length)} of{' '}
                      {filteredPages.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
