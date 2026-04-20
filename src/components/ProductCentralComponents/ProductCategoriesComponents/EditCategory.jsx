import React, { useState, useEffect } from 'react'
import LoadingBar from 'react-top-loading-bar'
import ProductCentralTabs from '../../../pages/adminpages/ProductCentral/ProductCentralTabs'
import Top from '../../../pages/adminpages/nav/Top'
import Side from '../../../pages/adminpages/nav/Side'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../../context/Auth';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlockEditor from '../../../pages/adminpages/blog-new/components/createblog/BlockEditor/BlockEditor';
import { appendBlocksToFormData } from '../../../pages/adminpages/blog-new/utils/appendBlocksToFormData';

export default function EditCategory() {
    const auth = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedPage, setSelectedPage] = useState("product-central-main");
    const [selectedTab, setSelectedTab] = useState("product-central");
    const [err, setErr] = useState("");
    const [errState, setErrState] = useState();
    const [progress, setProgress] = useState(0);
    const [productName, set_productName] = useState("");
    const [productDesc, set_productDesc] = useState("");
    const [productMetaTitle, set_productMetaTitle] = useState("");
    const [productMetaImage, set_productMetaImage] = useState(null);
    const [productImage, set_productImage] = useState(null);
    const [productIcon, setProductIcon] = useState(null);
    const [productMetaDesc, set_productMetaDesc] = useState("");
    const [productMetaKeywords, set_productMetaKeywords] = useState("");
    const [productContent, set_productContent] = useState("");
    const [contentBlocks, setContentBlocks] = useState([]);
    const [metaSchemas, setMetaSchemas] = useState([""]);
    const [metaKeywords, setMetaKeywords] = useState("");
    const [saving, setSaving] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    // Function to add new schema input
    const handleAddSchema = () => {
        setMetaSchemas([...metaSchemas, ""]);
    };
    // Function to remove schema input
    const handleRemoveSchema = (index) => {
        setMetaSchemas(metaSchemas.filter((_, i) => i !== index));
    };
    // Function to handle schema change
    const handleSchemaChange = (index, value) => {
        const newSchemas = [...metaSchemas];
        newSchemas[index] = value;
        setMetaSchemas(newSchemas);
    };
    const formatCategoryName = (name) => {
        return name
            .trim() // Remove leading and trailing spaces
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+$/g, ''); // Remove trailing hyphens if any
    };
    const handleIcon = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 385, 380, (resizedImage) => {
                        setProductIcon(resizedImage);
                    });
                } else {
                    // alert("File size exceeds 5MB limit.");
                    toast.error("File size exceeds 5MB limit.");
                    setErrState(true);
                }
            } else {
                // alert("Please select a JPEG or PNG file.");
                toast.error("Please select a JPEG or PNG file.");
                setErrState(true);
            }
        }
    };
    const handleMetaImage = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 385, 380, (resizedImage) => {
                        set_productMetaImage(resizedImage);
                    });
                } else {
                    // alert("File size exceeds 5MB limit.");
                    toast.error("File size exceeds 5MB limit.");
                    setErrState(true);
                }
            } else {
                // alert("Please select a JPEG or PNG file.");
                toast.error("Please select a JPEG or PNG file.");
                setErrState(true);
            }
        }
    };
    const handleCategoryImage = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 1256, 480, (resizedImage) => {
                        set_productImage(resizedImage);
                    });
                } else {
                    // alert("File size exceeds 5MB limit.");
                    toast.error("File size exceeds 5MB limit.");
                    setErrState(true);
                }
            } else {
                // alert("Please select a JPEG or PNG file.");
                toast.error("Please select a JPEG or PNG or WEBP file.");
                setErrState(true);
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
    const handleSubmit = (event) => {
        setProgress(0);
        event.preventDefault();
        if (productName === "") {
            toast.error("Enter a product name");
            setErrState(true);
            setProgress(100);
        } else {
            setSaving(true);
            const formData = new FormData();
            const formattedName = formatCategoryName(productName);
            // Append non-file data to the FormData object
            formData.append("name", formattedName);
            formData.append("metaTitle", productMetaTitle);
            formData.append("metaDescription", productMetaDesc);
            formData.append("metaKeywords", productMetaKeywords);
            formData.append("metaSchemas", JSON.stringify(metaSchemas));
            if (Array.isArray(contentBlocks) && contentBlocks.length > 0) {
                formData.append("content", "");
            } else {
                formData.append("content", productContent ?? "");
            }
            formData.append("isFeatured", true);
            formData.append("isPublish", true);

            appendBlocksToFormData(formData, contentBlocks, {
                jsonField: "content_blocks",
                countField: "categoryBlockImageCount",
                filePrefix: "categoryBlockImages",
                imageFilenamePrefix: "category-content-block",
            });

            // Only append images if they are File objects (newly selected images)
            if (productIcon && productIcon instanceof File) {
                formData.append("Logo", productIcon);
            }
            if (productImage && productImage instanceof File) {
                formData.append("banner", productImage);
            }
            if (productMetaImage && productMetaImage instanceof File) {
                formData.append("metaImage", productMetaImage);
            }

            axios.patch(`${auth.ip}update/product/category/${id}`, formData)
                .then((response) => {
                    console.log(response.data);
                    if (response.data.status === 201) {
                        toast.success(response.data.message);
                        setErrState(false);
                        set_productName("");
                        set_productDesc("");
                        set_productMetaTitle("");
                        set_productMetaImage(null);
                        setProductIcon(null);
                        set_productImage(null);
                        set_productMetaDesc("");
                        set_productMetaKeywords("");
                        set_productContent("");
                        setContentBlocks([]);
                        setMetaSchemas([""]);
                        setProgress(100);
                        navigate('/admin/product-central')
                    } else {
                        toast.error(response.data.message);
                        setErrState(true);
                        setProgress(100);
                    }
                })
                .catch((error) => {
                    console.error("Error updating category:", error);
                    toast.error("Failed to update category");
                    setErrState(true);
                    setProgress(100);
                })
                .finally(() => {
                    setSaving(false);
                });
        }
    };
    function getCategory() {
        setProgress(50);
        axios.get(`${auth.ip}get/category/byid/${id}`).then((response) => {
            if (response.data.status === 201) {
                setErrState(false);
                const category = response.data.category;
                setErrState(false);
                set_productName(category.name || "");
                set_productMetaTitle(category.metaTitle || "");
                set_productMetaDesc(category.metaDescription || "");
                set_productMetaKeywords(category.metaKeywords || "");
                set_productContent(category.content ?? "");
                const rawBlocks = category.content_blocks;
                setContentBlocks(Array.isArray(rawBlocks) ? rawBlocks : []);

                // Handle images - support both blob url and legacy path
                setProductIcon(category.Logo ? { url: category.Logo.url, path: category.Logo.path } : null);
                set_productImage(category.bannerImage ? { url: category.bannerImage.url, path: category.bannerImage.path } : null);
                set_productMetaImage(category.metaImage ? { url: category.metaImage.url, path: category.metaImage.path } : null);

                // Set the meta schemas array
                setMetaSchemas(category.metaSchemas || [""]);
                // setCategory(response.data);
                setIsDataLoaded(true);
                setProgress(100);
            } else {
                toast.error(response.data.message);
                setErrState(true);
                setProgress(100);
            }
        });
    }
    // Fetch categories when the modal opens
    useEffect(() => {
        getCategory();
    }, []);
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
                <title>Edit Category</title>
            </Helmet>
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8 ">
                        <ProductCentralTabs
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                        />
                        <div className="mb-10">
                            <div className="flow-root">
                                <div className="mx-auto">
                                    <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
                                        Edit Category
                                    </h1>
                                    <div>
                                        <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                                            <div className="grid gap-2 mb-4 grid-cols-2">
                                                <div className="col-span-2">
                                                    <label
                                                        htmlFor="categoryname"
                                                        className="block mb-2 text-sm font-medium text-gray-900 "
                                                    >
                                                        Category Name <span className="text-red-600">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="categoryname"
                                                        id="categoryname"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                                                        placeholder="Category Name"
                                                        value={productName}
                                                        onChange={(e) => set_productName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-full col-span-2">
                                                    <label
                                                        htmlFor="name"
                                                        className="block mb-2 text-sm font-medium text-gray-900 "
                                                    >
                                                        Category Icon <span className="text-red-600">*</span>
                                                    </label>
                                                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25">
                                                        <div className="text-center">
                                                            {productIcon ? (
                                                                <>
                                                                    {productIcon instanceof File ? (
                                                                        <>
                                                                            <img
                                                                                src={URL.createObjectURL(productIcon)}
                                                                                alt="obj"
                                                                                className="h-12 rounded-md mx-auto cursor-pointer"
                                                                                onClick={() => setProductIcon(null)}
                                                                            />
                                                                            <p className="text-xs  text-red-600">
                                                                                Click Image to Delete
                                                                            </p>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <img
                                                                                src={productIcon.url || `${auth.ip}${productIcon.path}`}
                                                                                alt="icon"
                                                                                className="h-12 rounded-md mx-auto cursor-pointer"
                                                                                onClick={() => setProductIcon(null)}
                                                                            />
                                                                            <p className="text-xs  text-red-600">
                                                                                Click Image to Delete
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <svg
                                                                    className="mx-auto h-12 w-12 text-gray-300"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            )}

                                                            <div className="mt-2  text-sm leading-6 text-gray-600">
                                                                <label
                                                                    htmlFor="categoryIcon"
                                                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary px-2"
                                                                >
                                                                    <span>Icon</span>
                                                                    <input
                                                                        id="categoryIcon"
                                                                        name="categoryIcon"
                                                                        type="file"
                                                                        className="sr-only"
                                                                        onChange={(event) => {
                                                                            handleIcon(event);
                                                                        }}
                                                                        accept="image/*"
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full col-span-2">
                                                    <label
                                                        htmlFor="catgorybanner"
                                                        className="block mb-2 text-sm font-medium text-gray-900 "
                                                    >
                                                        Category Banner <span className="text-red-600">*</span>
                                                    </label>
                                                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 w-full">
                                                        <div className="text-center">
                                                            {productImage ? (
                                                                <>
                                                                    {productImage instanceof File ? (
                                                                        <>
                                                                            <img
                                                                                src={URL.createObjectURL(productImage)}
                                                                                alt="obj"
                                                                                className="h-12 rounded-md mx-auto cursor-pointer"
                                                                                onClick={() => set_productImage(null)}
                                                                            />
                                                                            <p className="text-xs  text-red-600">
                                                                                Click Image to Delete
                                                                            </p>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <img
                                                                                src={productImage.url || `${auth.ip}${productImage.path}`}
                                                                                alt="banner"
                                                                                className="h-12 rounded-md mx-auto cursor-pointer"
                                                                                onClick={() => set_productImage(null)}
                                                                            />
                                                                            <p className="text-xs  text-red-600">
                                                                                Click Image to Delete
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <svg
                                                                    className="mx-auto h-12 w-12 text-gray-300"
                                                                    viewBox="0 0 24 24"
                                                                    fill="currentColor"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            )}
                                                            <div className="mt-2  text-sm leading-6 text-gray-600">
                                                                <label
                                                                    htmlFor="categoryBanner"
                                                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary px-2">
                                                                    <span>Banner</span>
                                                                    <input
                                                                        id="categoryBanner"
                                                                        name="categoryBanner"
                                                                        type="file"
                                                                        className="sr-only"
                                                                        onChange={(event) => {
                                                                            handleCategoryImage(event);
                                                                        }}
                                                                        accept="image/*"
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label
                                                        htmlFor="name"
                                                        className="block mb-2 text-sm font-medium text-gray-900 "
                                                    >
                                                        Meta Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                                                        placeholder="Category Meta Title"
                                                        value={productMetaTitle}
                                                        onChange={(e) => set_productMetaTitle(e.target.value)}
                                                    />
                                                </div>

                                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  col-span-2">
                                                    <div className="text-center">
                                                        {productMetaImage ? (
                                                            <>
                                                                {productMetaImage instanceof File ? (
                                                                    <>
                                                                        <img
                                                                            src={URL.createObjectURL(productMetaImage)}
                                                                            alt="Thumbnail"
                                                                            className="h-12 rounded-md mx-auto cursor-pointer"
                                                                            onClick={() => set_productMetaImage(null)}
                                                                        />
                                                                        <p className="text-xs leading-5 text-red-600">
                                                                            Click Image to Delete
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <img
                                                                            src={productMetaImage.url || `${auth.ip}${productMetaImage.path}`}
                                                                            alt="meta"
                                                                            className="h-12 rounded-md mx-auto cursor-pointer"
                                                                            onClick={() => set_productMetaImage(null)}
                                                                        />
                                                                        <p className="text-xs  text-red-600">
                                                                            Click Image to Delete
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <svg
                                                                className="mx-auto h-12 w-12 text-gray-300"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        )}
                                                        <div className="mt-2  text-sm leading-6 text-gray-600">
                                                            <label
                                                                htmlFor="categoryMetaImage"
                                                                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary px-2"
                                                            >
                                                                <span>Meta Image</span>
                                                                <input
                                                                    id="categoryMetaImage"
                                                                    name="categoryMetaImage"
                                                                    type="file"
                                                                    className="sr-only"
                                                                    accept="image/*"
                                                                    onChange={handleMetaImage}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label
                                                        htmlFor="description"
                                                        className="block mb-2 text-sm font-medium text-gray-900 "
                                                    >
                                                        Meta Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        rows="4"
                                                        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                                                        placeholder="Write Meta description here"
                                                        value={productMetaDesc}
                                                        onChange={(e) => set_productMetaDesc(e.target.value)}
                                                    />
                                                </div>
                                                {/* Meta Keywords */}
                                                <div className="col-span-2">
                                                    <label
                                                        htmlFor="metaKeywords"
                                                        className="block mb-2 text-sm font-medium text-gray-900"
                                                    >
                                                        Meta Keywords
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="metaKeywords"
                                                        id="metaKeywords"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                                                        placeholder="Meta Keywords (comma separated)"
                                                        value={productMetaKeywords}  // Correctly bound to state
                                                        onChange={(e) => set_productMetaKeywords(e.target.value)}  // Correct onChange handler
                                                    />

                                                </div>
                                                {/* Meta Schemas */}
                                                <div className="col-span-2">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <label htmlFor="metaSchemas" className="block text-sm font-medium text-gray-900">
                                                            Meta Schemas
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={handleAddSchema}  // Function to add a new schema input
                                                            className="text-white bg-primary hover:bg-blue-700 font-medium rounded-lg text-sm px-2 py-2 text-center"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="size-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                            </svg>

                                                        </button>
                                                    </div>

                                                    {/* Display schema inputs dynamically */}
                                                    <div className="flex flex-col gap-2">
                                                        {metaSchemas.map((schema, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    name={`metaSchema-${index}`}
                                                                    id={`metaSchema-${index}`}
                                                                    className="block w-full text-sm border-gray-300 rounded-lg"
                                                                    placeholder={`Meta Schema ${index + 1}`}
                                                                    value={schema}  // Bind the current schema value to the input
                                                                    onChange={(e) => handleSchemaChange(index, e.target.value)}  // Update the schema in state when user types
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSchema(index)}  // Function to remove the schema input
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="size-6">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>

                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Block-based category page content (same as homepage / product description) */}
                                                <div className="col-span-2">
                                                    <label className="block mb-2 text-sm font-medium text-gray-900">
                                                        Content
                                                    </label>
                                                    <p className="mb-3 text-sm text-gray-500">
                                                        Add content rows and pick layouts for text, images, widgets, and product blocks.
                                                        The storefront uses this when rows exist; otherwise it shows the legacy HTML field below.
                                                    </p>
                                                    {isDataLoaded ? (
                                                        <div className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 sm:p-4">
                                                            <BlockEditor
                                                                blocks={contentBlocks}
                                                                setBlocks={setContentBlocks}
                                                                className="p-0 sm:p-2"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="min-h-[320px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                                            <span className="text-gray-500">Loading editor...</span>
                                                        </div>
                                                    )}
                                                    {productContent?.trim() && contentBlocks.length === 0 ? (
                                                        <details className="mt-3 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
                                                            <summary className="cursor-pointer font-medium">
                                                                Legacy HTML content (read-only — not shown on the store once you add content rows)
                                                            </summary>
                                                            <div
                                                                className="prose prose-sm mt-2 max-h-48 overflow-y-auto border border-amber-100 bg-white p-2"
                                                                dangerouslySetInnerHTML={{ __html: productContent }}
                                                            />
                                                        </details>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className={`text-white inline-flex items-center bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary dark:hover:bg-primary dark:focus:ring-blue-800 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {saving ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save'
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
