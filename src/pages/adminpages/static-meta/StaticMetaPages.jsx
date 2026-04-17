import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Side from "../nav/Side";
import Top from "../nav/Top";

// Import service functions
import { 
  fetchStaticMetaPages, 
  togglePublishStatus as togglePublishStatusService, 
  createStaticMetaPage, 
  updateStaticMetaPage, 
  deleteStaticMetaPage 
} from './service/staticMetaService';

// Import components
import { 
  MetaPageTable, 
  MetaPagePagination, 
  MetaPageModal, 
  DeleteConfirmationModal, 
  SearchBar 
} from './components';

export default function StaticMetaPages() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal + form state for editing meta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    pageName: "",
    path: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaSchemas: [""],
  });

  // Fetch static meta pages from API
  useEffect(() => {
    const loadPages = async () => {
      setLoading(true);
      try {
        const result = await fetchStaticMetaPages();
        // Service returns an array, not { success, data }
        setPages(result);
      } catch (error) {
        console.error('Error fetching static meta pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);

  // Filter pages based on search query
  const filteredPages = pages.filter(page => 
    page.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const indexOfFirstPage = (currentPage - 1) * itemsPerPage;
  const indexOfLastPage = currentPage * itemsPerPage;
  const currentPages = filteredPages.slice(indexOfFirstPage, indexOfLastPage);

  // Toggle publish status
  const handleTogglePublish = async (id) => {
    try {
      const result = await togglePublishStatusService(id);
      
      if (result.success) {
        setPages(pages.map(page => 
          page.id === id ? { ...page, isPublished: !page.isPublished } : page
        ));
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  // Open modal with selected page's data
  const handleEditPage = (page) => {
    setSelectedPage(page);
    setFormData({
      pageName: page.pageName || "",
      path: page.path || "",
      metaTitle: page.titleTag || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      metaSchemas: Array.isArray(page.metaSchemas)
        ? (page.metaSchemas.length ? page.metaSchemas : [""])
        : (page.metaSchema ? [page.metaSchema] : [""]),
    });
    setIsModalOpen(true);
  };

  // Submit changes to API - handles both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out empty schema entries
      const filteredSchemas = formData.metaSchemas.filter(schema => schema.trim() !== '');
      
      if (selectedPage) {
        // Update existing page
        const updateData = {
          pageName: selectedPage.pageName,
          path: selectedPage.path,
          titleTag: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          metaSchemas: filteredSchemas
        };
        
        const result = await updateStaticMetaPage(selectedPage.id, updateData);
        
        if (result.success) {
          // Update local state
          setPages(
            pages.map((p) =>
              p.id === selectedPage.id
                ? {
                    ...p,
                    titleTag: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    metaKeywords: formData.metaKeywords,
                    metaSchemas: filteredSchemas,
                  }
                : p
            )
          );
          setIsModalOpen(false);
          setSelectedPage(null);
        }
      } else {
        // Create new page
        if (!formData.pageName || !formData.path) {
          return;
        }
        
        const newPageData = {
          pageName: formData.pageName,
          path: formData.path,
          titleTag: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          metaSchemas: filteredSchemas,
          isPublished: true
        };
        
        const result = await createStaticMetaPage(newPageData);
        
        if (result.success && result.data) {
          // Add new page to local state
          setPages([result.data, ...pages]);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving static meta page:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPage(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPage(null);
  };
  
  // Delete a static meta page
  const handleDeletePage = async () => {
    if (!selectedPage) return;
    
    try {
      const result = await deleteStaticMetaPage(selectedPage.id);
      
      if (result.success) {
        // Remove the page from local state
        setPages(pages.filter(page => page.id !== selectedPage.id));
        setIsDeleteModalOpen(false);
        setSelectedPage(null);
      }
    } catch (error) {
      console.error('Error deleting static meta page:', error);
    }
  };

  const handleDeleteClick = (page) => {
    setSelectedPage(page);
    setIsDeleteModalOpen(true);
  };

  // handleTogglePublish is defined above and passed to table

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <Helmet>
        <title>Admin | Static Meta Pages</title>
      </Helmet>

     <Side selectedPage="static-meta-pages" setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} toggleSidebar={toggleSidebar} />
     

      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
      <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="static-meta-pages" setSelectedPage={setSelectedPage} />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Static Meta Pages
              </h1>
              
              <button
                onClick={() => {
                  setSelectedPage(null);
                  setFormData({
                    pageName: "",
                    path: "",
                    metaTitle: "",
                    metaDescription: "",
                    metaKeywords: "",
                    metaSchemas: [""]
                  });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Page
              </button>
            </div>

            {/* Search and Filters */}
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />

            {/* Pages Table */}
            <MetaPageTable 
              loading={loading}
              pages={currentPages}
              filteredPages={filteredPages}
              onEdit={handleEditPage}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDeleteClick}
            />

            {/* Pagination */}
            {!loading && filteredPages.length > 0 && (
              <MetaPagePagination 
                currentPage={currentPage}
                totalPages={totalPages}
                indexOfFirstPage={indexOfFirstPage}
                indexOfLastPage={indexOfLastPage}
                filteredPagesLength={filteredPages.length}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        </main>

        {/* Edit/Create Modal */}
        <MetaPageModal 
          isOpen={isModalOpen}
          selectedPage={selectedPage}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleCloseModal={handleCloseModal}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          selectedPage={selectedPage}
          onDelete={handleDeletePage}
          onCancel={handleCloseDeleteModal}
        />
      </div>
    </>
  );
}