"use client";

import { useState, useEffect } from 'react';
import Side from '../../nav/Side';
import Top from '../../nav/Top';
import { Search, Plus, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { getCategoryStats, createCategory, updateCategory, deleteCategory } from '../service/blogService';

export default function CategoryManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getCategoryStats();
        
        setCategories(categoryData.map(category => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          postCount: category.postCount || 0,
          createdAt: category.createdAt
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and search
  const filteredAndSortedCategories = [...categories]
    .filter(category => {
      if (searchTerm && !category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle new category input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        [name]: value
      });
    } else {
      setNewCategory({
        ...newCategory,
        [name]: value
      });
    }
  };

  // Generate slug function
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (newCategory.name) {
      setNewCategory(n => ({
        ...n,
        slug: generateSlug(n.name)
      }));
    }
  }, [newCategory.name]);

  useEffect(() => {
    if (editingCategory?.name) {
      setEditingCategory({
        ...editingCategory,
        slug: generateSlug(editingCategory.name)
      });
    }
  }, [editingCategory, editingCategory?.name]);

  // Handle form submission for new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description
        });
        
        // Refresh categories list
        const categoryData = await getCategoryStats();
        setCategories(categoryData.map(category => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          postCount: category.postCount || 0,
          createdAt: category.createdAt
        })));
        
        setEditingCategory(null);
      } else {
        // Add new category
        await createCategory({
          name: newCategory.name,
          slug: newCategory.slug,
          description: newCategory.description
        });
        
        // Refresh categories list
        const categoryData = await getCategoryStats();
        setCategories(categoryData.map(category => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          postCount: category.postCount || 0,
          createdAt: category.createdAt
        })));
        
        setNewCategory({ name: '', slug: '', description: '' });
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.message || 'An error occurred while saving the category');
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        
        // Refresh categories list
        const categoryData = await getCategoryStats();
        setCategories(categoryData.map(category => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          postCount: category.postCount || 0,
          createdAt: category.createdAt
        })));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.message || 'An error occurred while deleting the category');
      }
    }
  };

  // Handle category editing
  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  return (
    <>
      <Side selectedPage="new-blog-category" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="new-blog-category" setSelectedPage={() => {}} />
        <main className="py-5">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: '', slug: '', description: '' });
                  setShowAddModal(true);
                }}
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New Category</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Name</span>
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('postCount')}
                      >
                        <div className="flex items-center">
                          <span>Posts</span>
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('createdAt')}
                      >
                        <div className="flex items-center">
                          <span>Created</span>
                          <ArrowUpDown size={14} className="ml-1" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      // Loading skeleton
                      Array(5).fill(0).map((_, index) => (
                        <tr key={`skeleton-${index}`}>
                          <td className="px-6 py-4">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-12 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredAndSortedCategories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No categories found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{category.slug}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{category.postCount}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{formatDate(category.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleEdit(category)}
                                className="text-amber-600 hover:text-amber-900"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                                onClick={() => handleDelete(category.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add/Edit Category Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={editingCategory ? editingCategory.name : newCategory.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Category name"
                        />
                      </div>
                      
                      {/* Slug */}
                      <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                          Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="slug"
                          name="slug"
                          required
                          value={editingCategory ? editingCategory.slug : newCategory.slug}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="category-slug"
                          readOnly
                        />
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows="3"
                          value={editingCategory ? editingCategory.description : newCategory.description}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Brief description of the category"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-600"
                      >
                        {editingCategory ? 'Update Category' : 'Add Category'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}