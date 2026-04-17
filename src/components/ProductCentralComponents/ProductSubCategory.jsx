import { React, useState, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";
import EditModalSubCategories from "./EditModalSubCategories";
export default function ProductSubCategory() {
    const auth = useAuth();
    const [progress, setProgress] = useState(0);
    const [categories, setCategories] = useState([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(null);
    const [editedSubcategoryName, setEditedSubcategoryName] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [content, setContent] = useState("");
    const [subcategoryBanner, setSubcategoryBanner] = useState(null);
    const [metaSchemas, setMetaSchemas] = useState([""]);

    useEffect(() => {
        fetchCategories();
    }, []);
    const handleSubCategoryBannerImage = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
                if (file.size <= 5 * 1024 * 1024) {
                    // Resize image if necessary
                    resizeImage(file, 1256, 480, (resizedImage) => {
                        setSubcategoryBanner(resizedImage);
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

    const fetchCategories = () => {
        setProgress(50);
        axios
            .get(`${auth.ip}get/product/category`)
            .then((response) => {
                const categoriesWithSubs = response.data.productCategories.map((category) => ({
                    ...category,
                    subCategories: category.subCategory || [],
                }));
                setCategories(categoriesWithSubs);
                setProgress(100);
            })
            .catch((error) => {
                toast.error("Failed to fetch categories.");
                setProgress(100);
            });
    };

    const handleEditSubcategory = (categoryId, subCategoryName, subIndex) => {
        console.log("handleEditSubcategory called with:", { categoryId, subCategoryName, subIndex });

        const category = categories.find((cat) => cat._id === categoryId);
        console.log("Found category:", category);

        // Check if category and subCategories exist
        if (category && category.subCategories && category.subCategories[subIndex]) {
            const subCategoryData = category.subCategories[subIndex];
            console.log("Subcategory data:", subCategoryData);

            // Log details from metasubCategory
            const metaSubCategoryData = category.metasubCategory[subIndex] || {};
            console.log("Meta subcategory data:", metaSubCategoryData);

            // Pre-fill modal with current subcategory's data
            setSelectedCategoryId(categoryId);
            console.log("Selected category ID set to:", categoryId);

            setSelectedSubcategoryIndex(subIndex);
            console.log("Selected subcategory index set to:", subIndex);

            setEditedSubcategoryName(subCategoryName);
            console.log("Edited subcategory name set to:", subCategoryName);

            setMetaTitle(metaSubCategoryData.metaTitle || "");
            console.log("Meta title set to:", metaSubCategoryData.metaTitle || "");

            setMetaDescription(metaSubCategoryData.metaDescription || "");
            console.log("Meta description set to:", metaSubCategoryData.metaDescription || "");

            setMetaKeywords(metaSubCategoryData.metaKeywords || "");
            console.log("Meta keywords set to:", metaSubCategoryData.metaKeywords || "");

            setContent(metaSubCategoryData.content || "");
            console.log("Content set to:", metaSubCategoryData.content || "");

            setMetaSchemas(metaSubCategoryData.metaSchemas || []);
            console.log("Meta schemas set to:", metaSubCategoryData.metaSchemas || []);

            setSubcategoryBanner(metaSubCategoryData.banner || null);
            console.log("Subcategory banner set to:", metaSubCategoryData.banner || null);

            setEditModalOpen(true);
            console.log("Edit modal opened");
        } else {
            console.error("Subcategory details not found for category ID:", categoryId, "and subIndex:", subIndex);
        }
    };


    const handleMetaSchemaChange = (index, value) => {
        const updatedSchemas = [...metaSchemas];
        updatedSchemas[index] = value;
        setMetaSchemas(updatedSchemas);
    };

    const handleAddMetaSchema = () => {
        setMetaSchemas([...metaSchemas, ""]);
    };

    const handleRemoveMetaSchema = (index) => {
        const updatedSchemas = metaSchemas.filter((_, i) => i !== index);
        setMetaSchemas(updatedSchemas);
    };
    const handleEditSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        console.log("Form submission prevented, starting handleEditSubmit");
        // Process the editedSubcategoryName: trim trailing spaces and replace internal spaces with hyphens
        const processedSubcategoryName = editedSubcategoryName.trimEnd().replace(/\s+/g, '-');
        console.log("Processed Subcategory Name:", processedSubcategoryName);
        const category = categories.find((cat) => cat._id === selectedCategoryId);
        console.log("Selected category:", category);

        // Update only the specific subcategory data in the metasubCategory field
        const updatedSubcategory = {
            metasubCategory: {
                [processedSubcategoryName]: { // Dynamic key using the subcategory name
                    subcategoryName: processedSubcategoryName,
                    metaTitle,
                    metaDescription,
                    metaKeywords,
                    content,
                    metaSchemas,
                    subCategoryIndex: selectedSubcategoryIndex, // Include subcategory index
                }
            }
        };
        console.log("Prepared updated subcategory data:", updatedSubcategory);

        if (subcategoryBanner) {
            console.log("Subcategory banner detected, processing with FormData");

            const formData = new FormData();
            formData.append("banner", subcategoryBanner);
            console.log("Added banner to FormData");

            // Append all other updated subcategory fields
            Object.keys(updatedSubcategory).forEach((key) => {
                console.log(`Appending ${key}:`, updatedSubcategory[key]);
                formData.append(key, JSON.stringify(updatedSubcategory[key])); // Stringify if needed
            });

            // Patch only the specific subcategory with FormData
            axios.patch(`${auth.ip}update/product/subcategory/${selectedCategoryId}`, formData)
                .then((response) => {
                    console.log("Response from server (with banner):", response);
                    toast.success("Subcategory updated successfully.");
                    fetchCategories(); // Refresh categories after the update
                    setEditModalOpen(false); // Close modal
                })
                .catch((error) => {
                    console.error("Failed to update subcategory (with banner):", error);
                    toast.error("Failed to update subcategory.");
                });
        } else {
            console.log("No subcategory banner, sending JSON data");

            // Patch only the specific subcategory (no banner update)
            axios.patch(`${auth.ip}update/product/subcategory/${selectedCategoryId}`, updatedSubcategory)
                .then((response) => {
                    console.log("Response from server (without banner):", response);
                    toast.success("Subcategory updated successfully.");
                    fetchCategories(); // Refresh categories after the update
                    setEditModalOpen(false); // Close modal
                })
                .catch((error) => {
                    console.error("Failed to update subcategory (without banner):", error);
                    toast.error("Failed to update subcategory.");
                });
        }
    };
    return (
        <>
            <LoadingBar color="#2563EB" progress={progress} onLoaderFinished={() => setProgress(0)} />
            <div className="">
                <div className="flow-root">
                    <div className="py-2">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-webkit shadow rounded-md border border-gray-200">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-black uppercase border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 max-w-60 font-bold">Parent Category</th>
                                        <th className="px-4 py-4 max-w-60 font-bold">Subcategory</th>
                                        <th className="px-4 py-4 max-w-60 font-bold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {categories.length > 0 ? (categories.map((category) =>
                                        category.subCategories.map((subCategory, subIndex) => (
                                            <tr key={`${category._id}-${subIndex}`}>
                                                <td className="px-6 py-4 max-w-60 text-gray-900">{category.name}</td>
                                                <td className="px-4 py-4 max-w-60 text-gray-500">{subCategory}</td>
                                                <td className="px-4 py-4 max-w-60 text-center">
                                                    <button
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 shadow-sm"
                                                        onClick={() => handleEditSubcategory(category._id, subCategory, subIndex)}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No categories or subcategories found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            {editModalOpen && (
                <EditModalSubCategories
                    editedSubcategoryName={editedSubcategoryName}
                    setEditedSubcategoryName={setEditedSubcategoryName}
                    metaTitle={metaTitle}
                    setMetaTitle={setMetaTitle}
                    metaDescription={metaDescription}
                    setMetaDescription={setMetaDescription}
                    metaKeywords={metaKeywords}
                    setMetaKeywords={setMetaKeywords}
                    content={content} // Pass content here
                    setContent={setContent} // Pass setContent here
                    subcategoryBanner={subcategoryBanner}
                    setSubcategoryBanner={setSubcategoryBanner}
                    handleSubcategoryBannerImage={handleSubCategoryBannerImage}
                    metaSchemas={metaSchemas}
                    handleMetaSchemaChange={handleMetaSchemaChange}
                    handleAddMetaSchema={handleAddMetaSchema}
                    handleRemoveMetaSchema={handleRemoveMetaSchema}
                    handleEditSubmit={handleEditSubmit}
                    setEditModalOpen={setEditModalOpen}
                />
            )}
        </>
    )
}