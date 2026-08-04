import { React, useState, useEffect } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BlogsTab from "./BlogsTab";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
export default function BlogTags() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("blogs");
  const [selectedTab, setSelectedTab] = useState("blog-tags");

  const [err, setErr] = useState("");
  const [errState, setErrState] = useState();
  const [progress, setProgress] = useState(0);

  const [newTagsModal, setnewTagsModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);

  const [tagID, setTagID] = useState("");
  const [tagName, set_tagName] = useState("");
  const [tagDesc, set_tagDesc] = useState("");
  // const [tagMetaTitle, set_tagMetaTitle] = useState("");
  // const [tagMetaImage, set_tagMetaImage] = useState("");
  // const [tagMetaDesc, set_tagMetaDesc] = useState("");

  const [tags, settags] = useState([]);

  const handlePublishedChange = (index) => {
    const updatedtags = [...tags];
    updatedtags[index].isPublish = !updatedtags[index].isPublish;
    settags(updatedtags);
    console.log(updatedtags[index].isPublish);
    setProgress(50);
    axios
      .patch(`${auth.ip}publish/blog/tag/${tags[index]._id}`, {
        isPublish: updatedtags[index].isPublish,
      })
      .then((response) => {
        if (response.data.status === 201) {
          toast.success(response.data.message);
          setErrState(false);
          getTags();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          setErrState(true);
          setProgress(100);
        }
      });
  };
  const handleDelete = (id) => {
    setProgress(50);
    axios
      .delete(`${auth.ip}delete/blog/tag/${id}`)
      .then((response) => {
        if (response.data.status === 201) {
          toast.success(response.data.message);
          setErrState(false);
          getTags();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          setErrState(true);
          setProgress(100);
        }
      });
  };
  // const handleMetaImage = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     if (file.type === "image/jpeg" || file.type === "image/png") {
  //       if (file.size <= 5 * 1024 * 1024) {
  //         resizeImage(file, 385, 380, (resizedImage) => {
  //           set_tagMetaImage(resizedImage); // Make sure to set the state to the File object
  //         });
  //       } else {
  //         toast.error("File size exceeds 5MB limit.");
  //         setErrState(true);
  //       }
  //     } else {
  //       toast.error("Please select a JPEG or PNG file.");
  //       setErrState(true);
  //     }
  //   }
  // };

  // const resizeImage = (file, maxWidth, maxHeight, callback) => {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = function (event) {
  //     const img = new Image();
  //     img.src = event.target.result;
  //     img.onload = function () {
  //       const canvas = document.createElement("canvas");
  //       const ctx = canvas.getContext("2d");
  //       let width = img.width;
  //       let height = img.height;

  //       if (width > height) {
  //         if (width > maxWidth) {
  //           height *= maxWidth / width;
  //           width = maxWidth;
  //         }
  //       } else {
  //         if (height > maxHeight) {
  //           width *= maxHeight / height;
  //           height = maxHeight;
  //         }
  //       }
  //       canvas.width = width;
  //       canvas.height = height;
  //       ctx.drawImage(img, 0, 0, width, height);
  //       canvas.toBlob((blob) => {
  //         const resizedFile = new File([blob], file.name, {
  //           type: file.type,
  //           lastModified: Date.now(),
  //         });
  //         callback(resizedFile); // Make sure to pass a File object
  //       }, "image/jpeg");
  //     };
  //   };
  // };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    setProgress(0); // Reset progress bar

    if (tagName === "") {
      toast.error("Enter a tag name");
      setErrState(true);
      setProgress(100);
      return; // Return early if no tag name
    }

    // Create a plain object (similar to ProductTags)
    const tagData = {
      name: tagName,
      shortDescription: tagDesc,
      // metaTitle: tagMetaTitle,
      // metaDescription: tagMetaDesc,
    };

    // If editing, send patch request
    if (isEdit) {
      axios
        .patch(`${auth.ip}update/blog/tag/${tagID}`, tagData)
        .then((response) => {
          if (response.data.status === 201) {
            toast.success(response.data.message);
            set_tagName("");
            set_tagDesc("");
            setProgress(100);
            setnewTagsModal(false); // Close modal
            setisEdit(false); // Reset edit state
            getTags(); // Refresh tags
          } else {
            toast.error(response.data.message);
            setProgress(100);
          }
        })
        .catch((error) => {
          toast.error("Error updating tag");
          setProgress(100);
          console.error(error);
        });
    } else {
      // If creating new tag, send post request
      axios
        .post(`${auth.ip}create/blog/tag`, tagData)
        .then((response) => {
          if (response.data.status === 201) {
            toast.success(response.data.message);
            set_tagName("");
            set_tagDesc("");
            setProgress(100);
            setnewTagsModal(false); // Close modal
            setisEdit(false); // Reset edit state
            getTags(); // Refresh tags
          } else {
            toast.error(response.data.message);
            setProgress(100);
          }
        })
        .catch((error) => {
          toast.error("Error creating tag");
          setProgress(100);
          console.error(error);
        });
    }
  };

  function getTags() {
    setProgress(50);
    axios.get(`${auth.ip}get/blog/tag/all`).then((response) => {
      if (response.data.status === 201) {
        // toast.success(response.data.message);
        setErrState(false);
        settags(response.data.tags);
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setErrState(true);
        setProgress(100);
      }
    });
  }

  useEffect(() => {
    getTags();
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
        <title>Blogs Tags</title>
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
            <div className="py-10">
              <div className="flex justify-between items-center ">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Blog Tags</h1>
                <div className="">
                  <button
                    onClick={() => {
                      setnewTagsModal(true);
                      setisEdit(false);
                    }}
                    type="button"
                    className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Add Tags
                  </button>
                </div>
              </div>
              <div className="mt-4 flow-root">
                <div className="">
                  <div className="py-2">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-webkit shadow rounded-md border border-gray-200">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-black uppercase border-b border-gray-200">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-4 max-w-60 font-bold"
                            >
                              Name
                            </th>

                            <th
                              scope="col"
                              className="px-4 py-4 max-w-60 font-bold"
                            >
                              published
                            </th>

                            <th
                              scope="col"
                              className="px-6 py-4 max-w-60 font-bold"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {tags.map((tag, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {tag.name}
                              </td>

                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value=""
                                    checked={tag.isPublish}
                                    onChange={() =>
                                      handlePublishedChange(index)
                                    }
                                    className="sr-only peer"
                                  />
                                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                </label>
                              </td>

                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 ">
                                <button
                                  onClick={() => {
                                    setnewTagsModal(true);
                                    setisEdit(true);
                                    setTagID(tag._id);
                                    set_tagName(tag.name);
                                    set_tagDesc(tag.shortDescription);
                                    // set_tagMetaTitle(tag.metaTitle);
                                    // set_tagMetaImage(tag.metaImage);
                                    // set_tagMetaDesc(tag.metaDescription);
                                  }}
                                  className="text-primary hover:text-blue-900 mr-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(tag._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {newTagsModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto">
          <div
            id="crud-modal"
            className="relative p-4 w-full max-w-lg max-h-full"
          >
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEdit ? "Edit tag" : "Add new tag"}
                </h3>
                <button
                  onClick={() => setnewTagsModal(false)}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
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
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                      placeholder="Type tag name"
                      value={tagName}
                      onChange={(e) => set_tagName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 ">
                    <label
                      for="description"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Short Description
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                      placeholder="Write tag description here"
                      value={tagDesc}
                      onChange={(e) => set_tagDesc(e.target.value)}
                    />
                  </div>

                  {/* <div className="col-span-2">
                    <label
                      for="name"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                      placeholder="Type Meta Title"
                      value={tagMetaTitle}
                      onChange={(e) => set_tagMetaTitle(e.target.value)}
                    />
                  </div> */}
                  {/* <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  col-span-2">
                    <div className="text-center">
                      {/* {tagMetaImage ? (
                        <>
                          {tagMetaImage.path ? (
                            <>
                              <img
                                // src={` localhost:4000/${tagMetaImage.path}`}
                                src={`${auth.ip}${tagMetaImage.path}`}
                                alt="path"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => {
                                  set_tagMetaImage(null);
                                  console.log(tagMetaImage);
                                  console.log("deleted");
                                  console.log(tagMetaImage);
                                }}
                              />
                              <p className="text-xs  text-red-600">
                                Click image to delete
                              </p>
                            </>
                          ) : (
                            <>
                              <img
                                src={URL.createObjectURL(tagMetaImage)}
                                alt="Thumbnail"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => set_tagMetaImage(null)}
                              />
                              <p className="text-xs leading-5 text-red-600">
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

                      <div className="mt-2 flex text-sm leading-6 text-gray-600">
                        <label
                          for="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleMetaImage}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        PNG, JPG, GIF up to 10MB
                      </p> *
                      {tagMetaImage ? (
                        <>
                          {tagMetaImage.path ? (
                            <>
                              <img
                                src={`${auth.ip}${tagMetaImage.path}`}
                                alt="path"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => {
                                  set_tagMetaImage(null);
                                  console.log(tagMetaImage);
                                }}
                              />
                              <p className="text-xs text-red-600">Click image to delete</p>
                            </>
                          ) : (
                            <>
                              <img
                                src={URL.createObjectURL(tagMetaImage)}
                                alt="Thumbnail"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => set_tagMetaImage(null)}
                              />
                              <p className="text-xs leading-5 text-red-600">Click image to delete</p>
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

                      <div className="mt-2 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleMetaImage}
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label
                      for="description"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Meta Description
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                      placeholder="Write meta description"
                      value={tagMetaDesc}
                      onChange={(e) => set_tagMetaDesc(e.target.value)}
                    />
                  </div> */}
                </div>
                <button
                  type="submit"
                  className="text-white inline-flex items-center bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary dark:hover:bg-primary dark:focus:ring-blue-800"
                >
                  <svg
                    className="me-1 -ms-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  {isEdit ? "Edit tag" : "Add new tag"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
