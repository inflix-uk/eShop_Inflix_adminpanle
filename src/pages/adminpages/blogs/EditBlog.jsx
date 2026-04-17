import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';
import Side from '../nav/Side';
import Top from '../nav/Top';
import BlogsTab from './BlogsTab';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/Auth';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import config from './component/editBlog/EditBlogConfig';
import EditBlogSection from './component/editBlog/EditBlogSection';
import SeoMetaSection from './component/editBlog/SeoMetaSection';
import BlogCategoryTagSection from './component/editBlog/BlogCategoryTagSection';

export default function EditBlog() {
    const [selectedPage, setSelectedPage] = useState("blogs");``
    const [selectedTab, setSelectedTab] = useState("all-blogs");
    const auth = useAuth();
    const { id } = useParams();
    console.log('Id', id);

    const [progress, setProgress] = useState(0);

    const [blogID, setBlogID] = useState("");
    const [blogName, setblogName] = useState("");
    const [blogDesc, setblogDesc] = useState("");
    const [blogMetaTitle, setblogMetaTitle] = useState("");
    const [blogImage, setblogimage] = useState(null);
    const [blogImageAlt, setblogimagealt] = useState('');
    const [blogThumbnailImage, setblogthumbnailimage] = useState(null);
    const [blogThumbnailImageAlt, setblogthumnailimageAlt] = useState('');
    const [blogMetaImage, setblogMetaImage] = useState(null);
    const [blogMetaImageAlt, setblogMetaImageAlt] = useState('');
    const [blogMetakeywords, setblogMetakeywords] = useState('');
    const [metaSchemas, setMetaSchemas] = useState([""]); // Initialize with one empty schema
    const [blogMetaDesc, setblogMetaDesc] = useState("");
    const [blogCategory, setblogCategory] = useState("");
    const [publishedDate, setPublishedDate] = useState("");
    const [blogTags, setBlogTags] = useState([]);
    const [blogTagInput, setBlogTagInput] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [featured, setFeatured] = useState(false);
    const [categories, setCategories] = useState([]);
    const editor = useRef(null);
    const editor1 = useRef(null);
    const [blogContent, setblogContent] = useState("");
    const [blogContent1, setblogContent1] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const handleBlogImage = (e) => {
        // setblogimage(e.target.files[0]);
        const file = e.target.files[0];
        console.log(file);
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 1200, 560, (resizedImage) => {
                        setblogimage(resizedImage);
                    });
                } else {
                    // alert("File size exceeds 5MB limit.");
                    toast.error("File size exceeds 5MB limit.");
                    
                }
            } else {
                // alert("Please select a JPEG or PNG file.");
                toast.error("Please select a JPEG or PNG file.");
                
            }
        }
    };
    const handleBlogThumbnailImage = (e) => {
        // setblogimage(e.target.files[0]);
        const file = e.target.files[0];
        console.log(file);
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 350, 350, (resizedImage) => {
                        setblogthumbnailimage(resizedImage);
                    });
                } else {
                    // alert("File size exceeds 5MB limit.");
                    toast.error("File size exceeds 5MB limit.");
                    
                }
            } else {
                // alert("Please select a JPEG or PNG file.");
                toast.error("Please select a JPEG or PNG file.");
                
            }
        }
    };
    const handleMetaImage = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 1200, 560, (resizedImage) => {
                        setblogMetaImage(resizedImage);
                    });
                } else {
                    // alert("File size exceeds 5MB limit.");
                    toast.error("File size exceeds 5MB limit.");
                    
                }
            } else {
                // alert("Please select a JPEG or PNG file.");
                toast.error("Please select a JPEG or PNG or WebP file.");
                
            }
        }
    };

    const resizeImage = (file, maxWidth, maxHeight, callback) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    callback(resizedFile);
                }, "image/jpeg");
            };
        };
    };
    const handleSchemaChange = (index, value) => {
        const newSchemas = [...metaSchemas];
        newSchemas[index] = value;
        setMetaSchemas(newSchemas);
    };

    // Add a new schema input
    const handleAddSchema = () => {
        setMetaSchemas([...metaSchemas, ""]);
    };

    // Remove a schema input
    const handleRemoveSchema = (index) => {
        const newSchemas = metaSchemas.filter((_, schemaIndex) => schemaIndex !== index);
        setMetaSchemas(newSchemas.length ? newSchemas : []); // Ensure there's always one input
    };
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior


        const formData = new FormData();
        const formattedMetaSchemasArray = metaSchemas.map((schema) => `${schema}`);
        console.log("Formatted Meta Schemas Array:", formattedMetaSchemasArray);
        const sanitizedBlogName = blogName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove all characters except alphabets, numbers, and spaces
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-');  // Replace multiple hyphens with a single hyphen
        // Append other fields to formData
        formData.append("name", blogName);
        formData.append("permalink", sanitizedBlogName);
        formData.append("blogShortDescription", blogDesc);
        formData.append("content", blogContent);
        formData.append("content1", blogContent1);
        // Append each selected product ID to the formData
        selectedProducts.forEach((productId, index) => {
            formData.append(`selectedProducts[${index}]`, productId);
        });
        formData.append("isFeatured", featured);
        formData.append("visibility", visibility);
        formData.append("blogCategory", blogCategory);
        formData.append("blogpublisheddate", publishedDate);
        
        // Append each tag to the formData
        blogTags.forEach((tag, index) => {
            formData.append(`blogTags[${index}]`, tag);
        });
        
        formData.append("metaTitle", blogMetaTitle);
        formData.append("metaDescription", blogMetaDesc);
        formData.append("metakeywords", blogMetakeywords);
        formattedMetaSchemasArray.forEach((schema, index) => {
            formData.append(`metaSchemas[${index}]`, schema);
        });
        // Check if a new image is selected
        if (blogImage) {
            formData.append("blogImage", blogImage);
        }
        // Check if a new Blog image is selected
        if (blogThumbnailImage) {
            formData.append("blogthumbnailImage", blogThumbnailImage);
        }

        if (blogMetaImage) {
            formData.append("metaImage", blogMetaImage);
        }
        // Append file data to the FormData object
        formData.append("blogImageAlt", blogImageAlt);
        formData.append("blogthumbnailImageAlt", blogThumbnailImageAlt);
        formData.append("metaImageAlt", blogMetaImageAlt);
        // Log FormData before sending
        console.log("FormData before sending:");
        for (let entry of formData.entries()) {
            console.log(entry[0], entry[1]); // Log each key-value pair in the FormData
        }

        setProgress(0);

        // Validate form fields
        if (blogName === "") {
            toast.error("Enter a Blog name");
            
            setProgress(100);
            return;
        } else if (blogDesc === "") {
            toast.error("Enter Blog Description");
            
            setProgress(100);
            return;
        } else if (blogContent === "") {
            toast.error("Enter Blog Content");
            
            setProgress(100);
            return;
        }

        // Axios patch request to send form data to the backend
        axios.patch(`${auth.ip}update/blog/${blogID}`, formData)
            .then((response) => {
                // Log the response from the backend
                console.log("Response from the backend:", response.data);

                if (response.data.status === 201) {
                    toast.success(response.data.message);
                    

                    // Log the FormData once again to ensure everything was processed
                    console.log("FormData sent successfully:");
                    formData.forEach((value, key) => {
                        console.log(key, value);
                    });

                    // Reset form fields after successful submission
                    setblogName("");
            setblogDesc("");
            setblogContent("");
            setblogContent1("");
            setSelectedProducts([]);
            setPublishedDate('');
            setblogimage(null);
                    setblogimagealt('');
                    setblogthumbnailimage(null);
                    setblogthumnailimageAlt('');
                    setblogMetaTitle("");
                    setblogMetaDesc("");
                    setblogMetaImage(null);
                    setblogMetaImageAlt('');
                    setMetaSchemas([""]);
                    setblogMetakeywords();
                    setblogCategory("");
                    setBlogTags([]);
                    setVisibility(false);
                    setFeatured(false);
                    setProgress(100);
                } else {
                    toast.error(response.data.message);
                    
                    setProgress(100);
                }
            })
            .catch((error) => {
                // Log any errors that occur during the request
                console.error("Error while updating blog:", error);
                toast.error("Error updating blog");
                
                setProgress(100);
            });
    };
    const getBlog = useCallback(() => {
        setProgress(50);
        axios.get(`${auth.ip}get/blog/${id}`).then((response) => {
            if (response.data.status === 201) {
                const blog = response.data.blog;
                console.log('Blog Data', blog);

                // Set the state with the retrieved data
                setBlogID(blog._id || "");
                setblogName(blog.name || "");
                setblogDesc(blog.blogShortDescription || "");
                setblogContent(blog.content || "");
                setblogContent1(blog.content1 || "");
                setSelectedProducts(blog.selectedProducts || []);
                setblogimage(blog.blogImage ? `${auth.ip}${blog.blogImage}` : null);
                setblogimagealt(blog.blogImageAlt || "");
                setblogthumbnailimage(blog.thumbnailImage ? `${auth.ip}${blog.thumbnailImage}` : null);
                setblogthumnailimageAlt(blog.blogthumbnailImageAlt || "");
                setblogMetaTitle(blog.metaTitle || "");
                setblogMetaImage(blog.metaImage ? `${auth.ip}${blog.metaImage}` : null);
                setblogMetaImageAlt(blog.metaImageAlt || "");
                setblogMetaDesc(blog.metaDescription || "");
                setblogMetakeywords(blog.metakeywords || "");
                setMetaSchemas(blog.metaschemas || [""]);
                setPublishedDate(blog.blogpublisheddate || "");
                setblogCategory(blog.blogCategory || "");
                setBlogTags(blog.blogTags || []);
                setFeatured(blog.isFeatured);
                setVisibility(blog.visibility);
            } else {
                toast.error(response.data.message);
                
                setProgress(100);
            }
        });
    }, [auth.ip, id, setProgress, setBlogID, setblogName, setblogDesc, setblogContent, setblogimage, setblogimagealt, setblogthumbnailimage, setblogthumnailimageAlt, setblogMetaTitle, setblogMetaImage, setblogMetaImageAlt, setblogMetaDesc, setblogMetakeywords, setMetaSchemas, setPublishedDate, setblogCategory, setBlogTags, setFeatured, setVisibility]);

    // We don't need to fetch tags anymore since we're using a free-form input
    function getTags() {
        setProgress(50);
        setProgress(100);
    }
    const getCategories = useCallback(() => {
        setProgress(50);
        axios.get(`${auth.ip}get/blog/category/all`).then((response) => {
            if (response.data.status === 201) {
                const filteredCategories = response.data.categories.filter(
                    (category) => category.isPublish
                );
                setCategories(filteredCategories);
                if (filteredCategories.length > 0) {
                    setblogCategory(filteredCategories[0].name);
                }
                setProgress(100);
            } else {
                toast.error(response.data.message);
                
                setProgress(100);
            }
        });
    }, [auth.ip, setProgress, setCategories, setblogCategory]);
    useEffect(() => {
        getTags();
        getCategories();
    }, [getCategories]);
    useEffect(() => {
        getBlog();
    }, [getBlog]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    return (
        <>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <Helmet>
                <title>Edit Blogs</title>
            </Helmet>
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8 ">
                        <BlogsTab
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                        />
                        <div className="my-10">
                            <div className="mx-auto ">
                                <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                                    <EditBlogSection
                                      blogName={blogName}
                                      setblogName={setblogName}
                                      blogDesc={blogDesc}
                                      setblogDesc={setblogDesc}
                                      blogContent={blogContent}
                                      setblogContent={setblogContent}
                                      blogContent1={blogContent1}
                                      setblogContent1={setblogContent1}
                                      selectedProducts={selectedProducts}
                                      setSelectedProducts={setSelectedProducts}
                                      editor={editor}
                                      editor1={editor1}
                                      config={config}
                                      blogImage={blogImage}
                                      setblogimage={setblogimage}
                                      handleBlogImage={handleBlogImage}
                                      blogImageAlt={blogImageAlt}
                                      setblogimagealt={setblogimagealt}
                                      blogThumbnailImage={blogThumbnailImage}
                                      setblogthumbnailimage={setblogthumbnailimage}
                                      handleBlogThumbnailImage={handleBlogThumbnailImage}
                                      blogThumbnailImageAlt={blogThumbnailImageAlt}
                                      setblogthumnailimageAlt={setblogthumnailimageAlt}
                                    />
                                    <SeoMetaSection
                                        blogMetaTitle={blogMetaTitle}
                                        setblogMetaTitle={setblogMetaTitle}
                                        blogMetaImage={blogMetaImage}
                                        setblogMetaImage={setblogMetaImage}
                                        handleMetaImage={handleMetaImage}
                                        blogMetaImageAlt={blogMetaImageAlt}
                                        setblogMetaImageAlt={setblogMetaImageAlt}
                                        blogMetaDesc={blogMetaDesc}
                                        setblogMetaDesc={setblogMetaDesc}
                                        blogMetakeywords={blogMetakeywords}
                                        setblogMetakeywords={setblogMetakeywords}
                                        metaSchemas={metaSchemas}
                                        handleAddSchema={handleAddSchema}
                                        handleSchemaChange={handleSchemaChange}
                                        handleRemoveSchema={handleRemoveSchema}
                                    />
                                    <div className="col-span-full">
                                        <div className="flex justify-between items-center mb-3">
                                            <label htmlFor="blogpublisheddate" className="block text-sm font-medium leading-6 text-gray-900">
                                                Blog Published Date
                                            </label>
                                        </div>
                                        <input
                                            type="date"
                                            name="blogpublisheddate"
                                            id="blogpublisheddate"
                                            className="border border-gray-300 py-1.5 px-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                            value={publishedDate}
                                            onChange={(e) => setPublishedDate(e.target.value)}
                                        />
                                    </div>
                                    <BlogCategoryTagSection
                                        blogCategory={blogCategory}
                                        setblogCategory={setblogCategory}
                                        categories={categories}
                                        blogTagInput={blogTagInput}
                                        setBlogTagInput={setBlogTagInput}
                                        blogTags={blogTags}
                                        setBlogTags={setBlogTags}
                                        featured={featured}
                                        setFeatured={setFeatured}
                                        visibility={visibility}
                                        setVisibility={setVisibility}
                                    />
                                    <button
                                        type="submit"
                                        className="text-white inline-flex items-center bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary dark:hover:bg-primary dark:focus:ring-blue-800"
                                    >
                                        Edit Blog
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
