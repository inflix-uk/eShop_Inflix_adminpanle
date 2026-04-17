
import { React, useState, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";

export default function ProductStorage() {
    const auth = useAuth();

    // const [err, setErr] = useState("");
    const toastShownRef = useRef(false);
    const [errState, setErrState] = useState();
    const [progress, setProgress] = useState(0);

    const [newTagsModal, setnewTagsModal] = useState(false);
    const [isEdit, setisEdit] = useState(false);

    const [tagID, setTagID] = useState("");
    const [tagName, set_tagName] = useState("");
    const [tagDesc, set_tagDesc] = useState("");
    const [tagMetaTitle, set_tagMetaTitle] = useState("");
    const [tagMetaImage, set_tagMetaImage] = useState("");
    const [tagMetaDesc, set_tagMetaDesc] = useState("");

    const [storages, setStorages] = useState([]);

    const handlePublishedChange = (index) => {
        const updatedtags = [...storages];
        updatedtags[index].isPublish = !updatedtags[index].isPublish;
        setStorages(updatedtags);
        console.log(updatedtags[index].isPublish);

        setProgress(50);
        axios
            .patch(
                // ` localhost:4000/publish/product/condition/${storages[index]._id}`,
                `${auth.ip}publish/product/storage/${storages[index]._id}`,
                {
                    isPublish: updatedtags[index].isPublish,
                }
            )
            .then((response) => {
                if (response.data.status === 201) {
                    toast.success(response.data.message);
                    setErrState(false);
                    getStorage();
                    setProgress(100);
                } else {
                    setErrState(true);
                }
            });
    };
    const handleDelete = (id) => {
        setProgress(50);
        axios
            // .delete(` localhost:4000/delete/product/condition/${id}`)
            .delete(`${auth.ip}delete/product/storage/${id}`)
            .then((response) => {
                if (response.data.status === 201) {
                    toast.success(response.data.message);
                    // setErrState(false);
                    getStorage();
                    setProgress(100);
                } else {
                    setErrState(true);
                    setProgress(100);
                }
            });
    };

    const handleMetaImage = (e) => {
        set_tagMetaImage(e.target.files[0]);
        console.log(e.target.files[0]);
    };
    const formData = new FormData();

    // Append non-file data to the FormData object
    formData.append("name", tagName);
    formData.append("shortDescription", tagDesc);
    formData.append("metaTitle", tagMetaTitle);
    formData.append("metaImage", tagMetaImage);
    formData.append("metaDescription", tagMetaDesc);

    // Append file data to the FormData object
    if (isEdit) {
    } else {
        formData.append("isPublish", true);
    }

    const handleSubmit = (event) => {
        setProgress(0);
        event.preventDefault();
        if (tagName === "") {
            toast.error("Enter a tag name");
            setErrState(true);
            setProgress(100);
        } else {
            isEdit
                ? axios
                    // .patch(` localhost:4000/update/product/condition/${tagID}`, {
                    .patch(`${auth.ip}update/product/storage/${tagID}`, {
                        name: tagName,
                    })
                    .then((response) => {
                        if (response.data.status === 201) {
                            toast.success(response.data.message);
                            setErrState(false);
                            set_tagName("");
                            set_tagDesc("");
                            set_tagMetaTitle("");
                            set_tagMetaImage("");
                            set_tagMetaDesc("");
                            setProgress(100);
                            setnewTagsModal(false);
                            setisEdit(false);
                            getStorage();
                        } else {
                            setErrState(true);
                            setProgress(100);
                        }
                    })
                : axios
                    .post(`${auth.ip}create/product/storage`, {
                        name: tagName,
                        isPublish: true,
                    })
                    .then((response) => {
                        if (response.data.status === 201) {
                            toast.success(response.data.message);
                            setErrState(false);
                            set_tagName("");
                            set_tagDesc("");
                            set_tagMetaTitle("");
                            set_tagMetaImage("");
                            set_tagMetaDesc("");
                            setProgress(100);
                            setnewTagsModal(false);
                            setisEdit(false);
                            getStorage();
                        } else {
                            setErrState(true);
                            setProgress(100);
                        }
                    });
        }
    };

    function getStorage() {
        setProgress(50);
        axios
            .get(`${auth.ip}get/product/storage`)
            .then((response) => {
                if (response.data.status === 201) {
                    if (!toastShownRef.current) {
                        // toast.success(response.data.message);
                        toastShownRef.current = true;
                    }
                    setErrState(false);
                    console.log(response.data);
                    setStorages(response.data.ProductStorages);
                    console.log('All Storages', storages);
                    setProgress(100);
                } else {
                    setErrState(true);
                }
            });
    }

    useEffect(() => {
        getStorage();
    }, []);
    return (
        <>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    {/* <h2 className="text-lg font-bold  text-gray-900">ProductStorage</h2> */}
                </div>
            </div>
            <div className="flow-root">
                <div className="">
                    <div className="py-2">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-webkit shadow rounded-md border border-gray-200">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-black uppercase border-b border-gray-200">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 max-w-60 font-bold"
                                        >
                                            Storage
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 flex justify-end items-center"
                                        >
                                            <button
                                                onClick={() => {
                                                    setnewTagsModal(true);
                                                    setisEdit(false);
                                                }}
                                                type="button"
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-100 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-200 transition-colors duration-150 shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Variant Storage
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {storages && storages.map((tag, index) => (
                                        <tr key={index}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {tag.name}
                                            </td>

                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex justify-end gap-2">
                                                  <button
                                                      onClick={() => {
                                                          setnewTagsModal(true);
                                                          setisEdit(true);
                                                          setTagID(tag._id);
                                                          set_tagName(tag.name);
                                                          set_tagDesc(tag.shortDescription);
                                                          set_tagMetaTitle(tag.metaTitle);
                                                          set_tagMetaImage(tag.metaImage);
                                                          set_tagMetaDesc(tag.metaDescription);
                                                      }}
                                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 shadow-sm"
                                                  >
                                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                      </svg>
                                                      Edit
                                                  </button>
                                                  <button
                                                      onClick={() => handleDelete(tag._id)}
                                                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors duration-150 shadow-sm"
                                                  >
                                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                      </svg>
                                                      Delete
                                                  </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {newTagsModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto">
                    <div
                        id="crud-modal"
                        className="relative p-4 w-full max-w-lg max-h-full"
                    >
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-teal-200">
                                <h3 className="text-lg font-semibold text-teal-700">
                                    {isEdit ? "Edit Variant Storage" : "Add new Variant Storage"}
                                </h3>
                                <button
                                    onClick={() => setnewTagsModal(false)}
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-teal-100 hover:text-teal-700 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                    data-modal-toggle="crud-modal"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        aria-hidden="true"
                                        xmlns=" www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 14 14"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                        />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                                <div className="grid gap-2 mb-4 grid-cols-2">
                                    <div className="col-span-2">
                                        <label
                                            for="name"
                                            className="block mb-2 text-sm font-medium text-gray-900 "
                                        >
                                            Variant Storage Memory <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400"
                                            placeholder="Type Variant Storage Memory"
                                            value={tagName}
                                            onChange={(e) => set_tagName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="text-white inline-flex items-center bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    <svg
                                        className="me-1 -ms-1 w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                    {isEdit ? "Edit Storage" : "Add new Variant Storage"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}




