import { useState, useEffect, useCallback } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BlogsTab from "./BlogsTab";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
export default function BlogCategories() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("blogs");
  const [selectedTab, setSelectedTab] = useState("blog-categories");



  const [progress, setProgress] = useState(0);

  const [newCategoryModal, setnewCategoryModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);

  const [categoryID, setcategoryID] = useState("");
  const [categoryName, set_categoryName] = useState("");
  const [categoryDesc, set_categoryDesc] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");

  const [categories, setCategories] = useState([]);

  const handleDelete = (id) => {
    setProgress(50);
    axios
      .delete(`${auth.ip}delete/blog/category/${id}`)
      .then((response) => {
        if (response.data.status === 201) {
          toast.error(response.data.message);
          // removed setErrState(false);
          refreshCategories();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          // removed setErrState(true);
          setProgress(100);
        }
      });
  };

  const handleFeaturedChange = (index) => {
    const updatedCategories = [...categories];
    updatedCategories[index].isFeatured = !updatedCategories[index].isFeatured;
    setCategories(updatedCategories);

    setProgress(50);
    axios
      .patch(
        `${auth.ip}feature/blog/category/${categories[index]._id}`,
        { isFeatured: updatedCategories[index].isFeatured }
      )
      .then((response) => {
        if (response.data.status === 201) {
          toast.success(response.data.message);
          // removed setErrState(false);
          refreshCategories();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          // removed setErrState(true);
          setProgress(100);
        }
      });
  };

  const handleStatusChange = (index) => {
    const updatedCategories = [...categories];
    updatedCategories[index].isPublish = !updatedCategories[index].isPublish;
    setCategories(updatedCategories);

    setProgress(50);
    axios
      .patch(
        `${auth.ip}status/blog/category/${categories[index]._id}`,
        { isPublish: updatedCategories[index].isPublish }
      )
      .then((response) => {
        if (response.data.status === 201) {
          toast.success(response.data.message);
          // removed setErrState(false);
          refreshCategories();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          // removed setErrState(true);
          setProgress(100);
        }
      });
  };
  // Handle image file selection
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Append file data to the FormData object


  const handleSubmit = (event) => {
    setProgress(0);

    event.preventDefault();

    if (categoryName === "") {
      toast.error("Enter a Category name");
      setProgress(100);
    } else {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('shortDescription', categoryDesc);
      
      // Append banner image if it exists
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Set the correct headers for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      if (isEdit) {
        axios
          .patch(`${auth.ip}update/blog/category/${categoryID}`, formData, config)
          .then((response) => {
            if (response.data.status === 201) {
              toast.success(response.data.message);
              setcategoryID("");
              set_categoryName("");
              set_categoryDesc("");

              setBannerImage(null);

              setBannerImagePreview("");
              setProgress(100);
              setnewCategoryModal(false);
              setisEdit(false);
              refreshCategories();
            } else {
              toast.error(response.data.message);
              setProgress(100);
            }
          })
          .catch((error) => {
            console.error("Error updating category:", error);
            toast.error("Error updating category");
            setProgress(100);
          });
      } else {
        axios
          .post(`${auth.ip}create/blog/category`, formData, config)
          .then((response) => {
            if (response.data.status === 201) {
              toast.success(response.data.message);
              setcategoryID("");
              set_categoryName("");
              set_categoryDesc("");

              setBannerImage(null);

              setBannerImagePreview("");
              setProgress(100);
              setnewCategoryModal(false);
              setisEdit(false);
              refreshCategories();
            } else {
              toast.error(response.data.message || "Failed to create category");
              setProgress(100);
            }
          })
          .catch((error) => {
            console.error("Error creating category:", error);
            toast.error("Error creating category");
            setProgress(100);
          });
      }
    }
  };

  const refreshCategories = useCallback(() => {
    setProgress(50);
    axios.get(`${auth.ip}get/blog/category/all`).then((response) => {
      if (response.data.status === 201) {
        setCategories(response.data.categories);
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setProgress(100);
      }
    });
  }, [auth.ip]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);
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
        <title>Blogs Categories</title>
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
              <div className="flex justify-between items-center">

                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Blog Categories</h1>
                <div className="">
                  <button
                    onClick={() => {
                      setnewCategoryModal(true);
                      setisEdit(false);
                    }}
                    type="button"
                    className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Add Category
                  </button>
                </div>
              </div>
              <div className="mt-4 flow-root">
                <div className="">
                  <div className=" py-2">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-webkit shadow rounded-md border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="text-xs text-black uppercase border-b border-gray-200">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-4 max-w-60 text-left font-bold "
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-4 max-w-60 text-left font-bold"
                            >
                              Description
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-4 max-w-60 text-left font-bold"
                            >
                              Banner Image
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 max-w-60 text-left font-bold"
                            >
                              Featured
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 max-w-60 text-left font-bold"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 max-w-60 text-left   font-bold"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {categories.map((category, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {category.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {category.shortDescription}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {category.bannerImage && category.bannerImage.path ? (
                                  <img 
                                    src={`${auth.baseUrl}/${category.bannerImage.path.replace(/\\/g, '/')}`}
                                    alt={`${category.name} banner`}
                                    className="h-16 w-auto object-contain"
                                  />
                                ) : (
                                  <span className="text-gray-400">No banner</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value=""
                                    checked={category.isFeatured}
                                    onChange={() => handleFeaturedChange(index)}
                                    className="sr-only peer"
                                  />
                                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                </label>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value=""
                                    checked={category.isPublish}
                                    onChange={() => handleStatusChange(index)}
                                    className="sr-only peer"
                                  />
                                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                </label>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6 ">
                                <button
                                  onClick={() => {
                                    setnewCategoryModal(true);
                                    setisEdit(true);

                                    setcategoryID(category._id);
                                    set_categoryName(category.name);
                                    set_categoryDesc(category.shortDescription);
                                    
                                    // Set banner image preview if it exists
                                    if (category.bannerImage && category.bannerImage.path) {
                                      const bannerImageUrl = `${auth.baseUrl}/${category.bannerImage.path.replace(/\\/g, '/')}`;
                                      setBannerImagePreview(bannerImageUrl);
                                    } else {
                                      setBannerImagePreview('');
                                    }
                                  }}
                                  className="text-primary hover:text-blue-900 mr-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(category._id)}
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

      {newCategoryModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto">
          {/* <Toast err={err} errState={errState} /> */}
          <div
            id="crud-modal"
            className="relative p-4 w-full max-w-lg max-h-full"
          >
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEdit ? "Edit Category" : "Add new category"}
                </h3>
                <button
                  onClick={() => {
                    setcategoryID("");
                    setisEdit(false);
                    setnewCategoryModal(false);
                    set_categoryName("");
                    set_categoryDesc("");
      
                    setBannerImage(null);
      
                    setBannerImagePreview("");
                  }}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                  data-modal-toggle="crud-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                <div className="grid gap-2 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                      placeholder="Category name"
                      value={categoryName}
                      onChange={(e) => set_categoryName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 ">
                    <label
                      htmlFor="description"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Short Description
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
                      placeholder="Write Category description here"
                      value={categoryDesc}
                      onChange={(e) => set_categoryDesc(e.target.value)}
                    ></textarea>
                  </div>



                  {/* Banner Image Upload */}
                  <div className="col-span-2">
                    <label
                      htmlFor="bannerImage"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Banner Image
                    </label>
                    <input
                      type="file"
                      id="bannerImage"
                      accept="image/*"
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      onChange={handleBannerImageChange}
                    />
                    {bannerImagePreview && (
                      <div className="mt-2">
                        <img
                          src={bannerImagePreview}
                          alt="Banner Image Preview"
                          className="h-24 w-auto object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="text-white inline-flex items-center bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary dark:hover:bg-primary dark:focus:ring-blue-800"
                >
                  <svg
                    className="me-1 -ms-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns=" www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {isEdit ? "Edit Category" : "Add new category"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
