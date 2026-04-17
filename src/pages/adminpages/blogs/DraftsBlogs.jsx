import { React, useState, useEffect, useRef } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BlogsTab from "./BlogsTab";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs } from "../../../redux/reducers/blogsSlice";
import { Helmet } from "react-helmet-async";
export default function DraftsBlogs() {
    const [selectedPage, setSelectedPage] = useState("blogs");
    const auth = useAuth();
    const [selectedTab, setSelectedTab] = useState("draft-blogs");
    const [allBlogs, setAllBlogs] = useState([]);
    const [errState, setErrState] = useState();
    const [progress, setProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isDeleting, setIsDeleting] = useState(false);
    const blogsPerPage = 20;

    const handleDelete = async (id) => {
        try {
            setIsDeleting(true);
            setProgress(50);
            const response = await axios.delete(`${auth.ip}delete/blog/${id}`);
            if (response.data.status === 201) {
                toast.success(response.data.message);
                setErrState(false);
                dispatch(fetchBlogs());
            } else {
                toast.error(response.data.message);
                setErrState(true);
            }
        } catch (error) {
            toast.error('Failed to delete blog');
        } finally {
            setProgress(100);
            setIsDeleting(false);
        }
    };

    const dispatch = useDispatch();
    const { blogs, isLoading } = useSelector((state) => state.blogs);
    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    useEffect(() => {
        // whenever blogs from Redux changes, set local state
        const drafts = blogs.filter(blog => !blog.visibility);
        setAllBlogs(drafts);
    }, [blogs]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const debouncedSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const filteredBlogs = allBlogs.filter(blog => {
        const searchableText = `${blog.name} ${blog.blogShortDescription} ${blog.blogCategory}`.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchableText.includes(searchTermLower);
        const matchesCategory = filterCategory === 'all' || blog.blogCategory === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

    const categories = ['all', ...new Set(allBlogs.map(blog => blog.blogCategory))];

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleFeaturedChange = (index) => {
        // Create a *new* array of blogs, ensuring we also create 
        // a new object for the one we want to modify:
        const updatedBlogs = allBlogs.map((blog, i) => {
            if (i !== index) return blog;           // no change
            return { ...blog, isFeatured: !blog.isFeatured }; // toggle isFeatured
        });

        setAllBlogs(updatedBlogs);

        // Then call your API:
        axios
            .patch(`${auth.ip}feature/blog/${updatedBlogs[index]._id}`, {
                isFeatured: updatedBlogs[index].isFeatured
            })
            .then((response) => {
                if (response.data.status === 201) {
                    toast.success("Blog Featured Successfully");
                    dispatch(fetchBlogs());
                } else {
                    toast.error("Failed to change Blog status");
                }
            });
    };


    const handleStatusChange = (index) => {
        // Create a new array, new object for the changed blog
        const updatedBlogs = allBlogs.map((blog, i) => {
            if (i !== index) return blog;
            return { ...blog, visibility: !blog.visibility };
        });

        setAllBlogs(updatedBlogs);

        // Then call your API:
        axios
            .patch(`${auth.ip}status/blog/${updatedBlogs[index]._id}`, {
                visibility: updatedBlogs[index].visibility
            })
            .then((response) => {
                if (response.data.status === 201) {
                    toast.success("Blog Visible status changed successfully");
                    dispatch(fetchBlogs());
                } else {
                    toast.error("Failed to change blog status");
                }
            });
    };

    return (
        <>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <Helmet>
                <title>All Blogs | Admin</title>
                <meta name="description" content="Manage all blogs in the admin dashboard" />
            </Helmet>
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 min-h-screen bg-gray-50 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-8">
                    <div className="px-4 sm:px-8">
                        <BlogsTab
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                        />

                        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm mt-5">
                            <div className="w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search blogs by name, description..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                />
                            </div>
                            <h2 className='text-4xl font-bold'>Draft Blogs</h2>
                            <div className="w-full sm:w-auto">
                                <select
                                    className="w-full sm:w-48 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={filterCategory}
                                    onChange={(e) => {
                                        setFilterCategory(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium text-gray-900">No blogs found</h3>
                                <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {currentBlogs.map((post, index) => (
                                        <article
                                            key={post._id}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                                        >
                                            <div className="relative aspect-video">
                                                <img
                                                    src={`${auth.ip}${post.thumbnailImage}`}
                                                    className="w-full h-full object-cover"
                                                    alt={post.name}
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity hover:bg-opacity-30" />

                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    <Link
                                                        to={`/admin/edit-blog/${post.permalink}`}
                                                        className="rounded-full bg-white p-2 hover:bg-gray-100 transition-colors shadow-sm"
                                                        title="Edit blog"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-blue-500">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        disabled={isDeleting}
                                                        className="rounded-full bg-white p-2 hover:bg-gray-100 transition-colors shadow-sm"
                                                        title="Delete blog"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-red-600">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                                                        {post.blogCategory}
                                                    </span>
                                                    <time className="text-sm text-gray-500">
                                                        {new Date(post.updatedAt).toLocaleDateString()}
                                                    </time>
                                                </div>

                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {post.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                    {post.blogShortDescription}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <p className='text-lg font-bold'>Featured</p>
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            value=""
                                                            checked={post.isFeatured}
                                                            onChange={() => handleFeaturedChange(index)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                                    </label>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className='text-lg font-bold'>Visible</p>
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            value=""
                                                            checked={post.visibility}
                                                            onChange={() => handleStatusChange(index)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                                    </label>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-center">
                                    <nav className="inline-flex items-center gap-1.5" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>

                                        {totalPages > 7 ? (
                                            <>
                                                {[...Array(Math.min(3, totalPages))].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => handlePageChange(index + 1)}
                                                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === index + 1
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                                {currentPage > 4 && <span className="px-2 py-2 text-gray-500">...</span>}
                                                {currentPage > 3 && currentPage < totalPages - 2 && (
                                                    <button
                                                        onClick={() => handlePageChange(currentPage)}
                                                        className="px-3.5 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium"
                                                    >
                                                        {currentPage}
                                                    </button>
                                                )}
                                                {currentPage < totalPages - 3 && <span className="px-2 py-2 text-gray-500">...</span>}
                                                {[...Array(Math.min(2, totalPages))].map((_, index) => (
                                                    <button
                                                        key={totalPages - 1 + index}
                                                        onClick={() => handlePageChange(totalPages - 1 + index)}
                                                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages - 1 + index
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {totalPages - 1 + index}
                                                    </button>
                                                ))}
                                            </>
                                        ) : (
                                            [...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === index + 1
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))
                                        )}

                                        <button
                                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                        >
                                            Next
                                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
