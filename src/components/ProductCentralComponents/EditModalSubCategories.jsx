import React, { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useAuth } from "../../context/Auth";

const tinymceInit = {
    height: 500,
    menubar: true,
    plugins: [
        "advlist",
        "autolink",
        "lists",
        "link",
        "image",
        "charmap",
        "preview",
        "anchor",
        "searchreplace",
        "visualblocks",
        "code",
        "fullscreen",
        "insertdatetime",
        "media",
        "table",
        "help",
        "wordcount",
    ],
    toolbar:
        "undo redo | blocks fontsize | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | table | removeformat | code fullscreen",
    table_toolbar:
        "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
    content_style: `
        body { font-family:Helvetica,Arial,sans-serif; font-size:14px; }
        ul { list-style-type: disc; padding-left: 2rem; margin: 1rem 0; }
        ol { list-style-type: decimal; padding-left: 2rem; margin: 1rem 0; }
        ul ul { list-style-type: circle; }
        ul ul ul { list-style-type: square; }
        ol ol { list-style-type: lower-alpha; }
        ol ol ol { list-style-type: lower-roman; }
        li { margin-bottom: 0.25rem; }
        li > h1, li > h2, li > h3, li > h4, li > h5, li > h6 { display: inline; margin: 0; }
    `,
    advlist_bullet_styles: "disc,circle,square",
    advlist_number_styles: "decimal,lower-alpha,upper-alpha,lower-roman,upper-roman",
};
export default function EditModalSubCategories({
    editedSubcategoryName,
    setEditedSubcategoryName,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    metaKeywords,
    setMetaKeywords,
    content, // Add content here
    setContent, // Add setContent here
    metaSchemas,
    handleMetaSchemaChange,
    handleAddMetaSchema,
    handleRemoveMetaSchema,
    subcategoryBanner,
    setSubcategoryBanner,
    handleSubcategoryBannerImage,
    handleEditSubmit,
    setEditModalOpen,
}) {
    const editorRef = useRef(null);
    const auth = useAuth();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editorRef.current) {
            setContent(editorRef.current.getContent());
        }
        setTimeout(() => {
            handleEditSubmit(e);
        }, 0);
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50">
                <div
                    id="edit-subcategory-modal"
                    className="relative p-4 w-full max-w-lg max-h-full"
                >
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Edit Subcategory Details
                            </h3>
                            <button
                                onClick={() => {
                                    setEditModalOpen(false);
                                    setContent('');
                                    setEditedSubcategoryName('');
                                }}
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                                data-modal-toggle="edit-subcategory-modal"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin scrollbar-webkit" style={{ height: 'auto' }}>

                            <form className="p-4 md:p-5" onSubmit={handleFormSubmit}>
                                <div className="grid gap-4 grid-cols-2">
                                    <div className="col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Subcategory Name</label>
                                        <input
                                            type="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary dark:focus:border-primary"
                                            value={editedSubcategoryName}
                                            onChange={(e) => setEditedSubcategoryName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="w-full col-span-2">
                                            <label
                                                htmlFor="catgorybanner"
                                                className="block mb-2 text-sm font-medium text-gray-900 "
                                            >
                                                Sub Category Banner <span className="text-red-600">*</span>
                                            </label>
                                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 w-full">
                                                <div className="text-center">
                                                    {subcategoryBanner ? (
                                                        <>
                                                            {subcategoryBanner.path ? (
                                                                <>
                                                                    <img
                                                                        src={`${auth.ip}${subcategoryBanner.path}`}
                                                                        alt="path"
                                                                        className="h-12 rounded-md mx-auto cursor-pointer"
                                                                        onClick={() => {
                                                                            setSubcategoryBanner(null);
                                                                        }}
                                                                    />
                                                                    <p className="text-xs  text-red-600">
                                                                        Click image to delete
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <img
                                                                        src={URL.createObjectURL(subcategoryBanner)}
                                                                        alt="obj"
                                                                        className="h-12 rounded-md mx-auto cursor-pointer"
                                                                        onClick={() => setSubcategoryBanner(null)}
                                                                    />
                                                                    <p className="text-xs  text-red-600">
                                                                        Click image to delete
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
                                                            className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary px-2"
                                                        >
                                                            <span>Banner</span>
                                                            <input
                                                                id="categoryBanner"
                                                                name="categoryBanner"
                                                                type="file"
                                                                className="sr-only"
                                                                onChange={(event) => {

                                                                    handleSubcategoryBannerImage(event);
                                                                }}
                                                                accept="image/*"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Meta Title</label>
                                        <input
                                            type="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                                            value={metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Meta Description</label>
                                        <textarea
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                                            value={metaDescription}
                                            onChange={(e) => setMetaDescription(e.target.value)}
                                            rows="3"
                                        ></textarea>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Meta Keywords</label>
                                        <input
                                            type="text"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                                            value={metaKeywords}
                                            onChange={(e) => setMetaKeywords(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-gray-700">Meta Schemas</label>
                                            <button
                                                type="button"
                                                className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
                                                onClick={handleAddMetaSchema}
                                            >
                                                +
                                            </button>
                                        </div>
                                        {metaSchemas.map((schema, index) => (
                                            <div key={index} className="flex items-center mb-2">
                                                <input
                                                    type="text"
                                                    value={schema}
                                                    onChange={(e) => handleMetaSchemaChange(index, e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded"
                                                />
                                                <button
                                                    type="button"
                                                    className="ml-2 text-red-500"
                                                    onClick={() => handleRemoveMetaSchema(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}

                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-900">Content</label>
                                        <Editor
                                            tinymceScriptSrc="/tinymce/tinymce.min.js"
                                            licenseKey="gpl"
                                            onInit={(evt, editorInstance) => {
                                                editorRef.current = editorInstance;
                                            }}
                                            initialValue={content}
                                            init={tinymceInit}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4 mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                                        onClick={() => setEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}