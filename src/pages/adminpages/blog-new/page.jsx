"use client";

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { getAllBlogPosts, deleteBlogPost, API_BASE_URL } from './service/blogService';
import BlogSearchFilter from './components/BlogSearchFilter';
import BlogTable from './components/BlogTable';
import BlogPagination from './components/BlogPagination';
import BlogsTab from '../blogs/BlogsTab';
import Side from '../nav/Side';
import Top from '../nav/Top';

export default function BlogManagement() {
  const BLOGS_PER_PAGE = 10;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [selectedTab, setSelectedTab] = useState("all-blogs");
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Categories' }]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch blog posts from the backend
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage(''); // Clear any previous success messages
      const filters = { page: 1, limit: 1000 };
      const blogPosts = await getAllBlogPosts(filters);
      setBlogs(blogPosts);
      
      // Extract unique categories from blogs and create category options
      const categoryMap = new Map();
      blogPosts.forEach(blog => {
        if (blog.categories && blog.categories.length > 0) {
          blog.categories.forEach(cat => {
            if (typeof cat === 'object' && cat._id) {
              // Handle category objects
              categoryMap.set(cat._id, { id: cat._id, name: cat.name });
            } else if (typeof cat === 'string') {
              // Handle legacy string categories
              categoryMap.set(cat, { id: cat, name: cat });
            }
          });
        }
      });
      
      const categoryOptions = [{ id: 'all', name: 'All Categories' }];
      categoryMap.forEach(category => {
        categoryOptions.push(category);
      });
      
      setCategories(categoryOptions);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      setErrorMessage('Failed to load blog posts. Please try again later.');
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting, filtering, and search
  const filteredAndSortedBlogs = [...blogs]
    .filter(blog => {
      // Apply category filter
      if (filterCategory !== 'all') {
        if (!blog.categories || blog.categories.length === 0) {
          return false;
        }
        
        // Check if any category matches the filter
        const categoryMatch = blog.categories.some(cat => {
          if (typeof cat === 'object' && cat._id) {
            return cat._id === filterCategory;
          } else {
            return cat === filterCategory;
          }
        });
        
        if (!categoryMatch) {
          return false;
        }
      }
      
      // Apply search filter
      if (searchTerm && !blog.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Handle null values for dates
      if (sortConfig.key === 'publishDate' || sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Convert string dates to Date objects for comparison
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        
        if (dateA < dateB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Sort for other fields
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBlogs.length / BLOGS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startOffset = (safeCurrentPage - 1) * BLOGS_PER_PAGE;
  const paginatedBlogs = filteredAndSortedBlogs.slice(startOffset, startOffset + BLOGS_PER_PAGE);
  const startIndex = filteredAndSortedBlogs.length === 0 ? 0 : startOffset + 1;
  const endIndex = Math.min(startOffset + BLOGS_PER_PAGE, filteredAndSortedBlogs.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  // Helper function to format image paths correctly
  const getImageSrc = (imagePath) => {
    if (!imagePath) return '/placeholder-blog.jpg';
    
    // Check if it's a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Check if it already has the /uploads prefix
    if (imagePath.startsWith('/uploads/')) {
      return imagePath;
    }
    
    // Check if it already has a leading slash
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Otherwise add the /uploads/ prefix
    return `/uploads/${imagePath}`;
  };
  
  // Helper to get full image URL with backend URL if needed
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-blog.jpg';
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, prepend the backend URL
    const baseUrl = `${API_BASE_URL}/uploads/`;
    const path = getImageSrc(imagePath);
    return `${baseUrl}${path}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  
  // Handle blog deletion
  const handleDeleteBlog = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      setIsLoading(true);
      await deleteBlogPost(blogId);
      
      // Remove the deleted blog from state
      setBlogs(blogs.filter(blog => blog._id !== blogId));
      
      setSuccessMessage('Blog post deleted successfully');
      alert('Success: Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setErrorMessage('Failed to delete blog post');
      alert('Error: Failed to delete blog post');
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="flex justify-between items-center mb-6 mt-5">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
                <button 
                  onClick={fetchBlogs} 
                  className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full"
                  disabled={isLoading}
                  title="Refresh blog posts"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <Link to="/admin/new-blog" className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <FaPlus size={18} />
                <span>New Blog Post</span>
              </Link>
            </div>
            {/* Status Messages */}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6" role="alert">
                <p className="text-blue-700">{successMessage}</p>
              </div>
            )}
            {/* Search and filter bar */}
            <BlogSearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
            />
            {/* Blog posts table */}
            <BlogTable
              isLoading={isLoading}
              filteredAndSortedBlogs={paginatedBlogs}
              requestSort={requestSort}
              handleDeleteBlog={handleDeleteBlog}
              getFullImageUrl={getFullImageUrl}
              formatDate={formatDate}
            />
            {/* Pagination */}
            <BlogPagination
              filteredCount={filteredAndSortedBlogs.length}
              totalCount={blogs.length}
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </>
  );
}