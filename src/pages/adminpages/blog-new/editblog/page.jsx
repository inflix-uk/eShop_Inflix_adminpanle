import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBlogPostById, getAllCategories } from "../service/blogService";
import EditBlogForm from "../components/editblog/EditBlogForm";
import Side from '../../nav/Side';
import Top from '../../nav/Top';

export default function EditBlogPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const blogId = searchParams.get("id");
  
  const [blog, setBlog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if no blog ID is provided
    if (!blogId) {
      navigate("/admin/all-blogs");
      return;
    }

    // Fetch blog data and categories
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both blog data and categories in parallel
        const [blogData, categoriesData] = await Promise.all([
          getBlogPostById(blogId),
          getAllCategories()
        ]);
        
        setBlog(blogData);
        setCategories(categoriesData.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug
        })));
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load blog data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [blogId, navigate]);

  if (loading) {
    return (
      <>
        <Side selectedPage="blogs" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
          <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="blogs" setSelectedPage={() => {}} />
          <main className="py-5">
            <div className="container mx-auto py-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Side selectedPage="blogs" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
        <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
          <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="blogs" setSelectedPage={() => {}} />
          <main className="py-5">
            <div className="container mx-auto py-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate("/admin/all-blogs")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Back to Blog Management.
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Side selectedPage="blogs" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage="blogs" setSelectedPage={() => {}} />
        <main className="py-5">
          <div className="container mx-auto py-8">
            <EditBlogForm blogData={blog} availableCategories={categories} />
          </div>
        </main>
      </div>
    </>
  );
}
