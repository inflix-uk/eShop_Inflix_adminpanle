import { React, useState, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";


export default function ProductBrands() {
  const auth = useAuth();
  const toastShownRef = useRef(false);
  const [errState, setErrState] = useState();
  const [progress, setProgress] = useState(0);

  const [newproductModal, setnewproductModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);

  const [productID, setproductID] = useState("");
  const [productName, set_productName] = useState("");
  const [productDesc, set_productDesc] = useState("");
  const [productMetaTitle, set_productMetaTitle] = useState();
  const [productMetaImage, set_productMetaImage] = useState(null);
  const [productIcon, setProductIcon] = useState(null);
  const [productMetaDesc, set_productMetaDesc] = useState("");

  const [brands, setBrands] = useState([]);

  const handleDelete = (id) => {
    setProgress(50);
    axios
      .delete(`${auth.ip}delete/product/brand/${id}`)
      .then((response) => {
        if (response.data.status === 201) {
          // toast.success(response.data.message);
          setErrState(false);
          getBrands();
          setProgress(100);
        } else {
          // toast.error(response.data.message);
          setErrState(true);

          setProgress(100);
        }
      });
  };

  const handleFeaturedChange = (index) => {
    // console.log(brands[index]._id);
    const updatedBrands = [...brands];
    updatedBrands[index].isFeatured = !updatedBrands[index].isFeatured;
    setBrands(updatedBrands);
    console.log(updatedBrands[index].isFeatured);

    setProgress(50);
    axios
      .patch(
        `${auth.ip}feature/product/brand/${brands[index]._id}`,
        { isFeatured: updatedBrands[index].isFeatured }
      )
      .then((response) => {
        if (response.data.status === 201) {
          // toast.success(response.data.message);
          setErrState(false);
          getBrands();
          setProgress(100);
        } else {
          // toast.error(response.data.message);
          setErrState(true);
          setProgress(100);
        }
      });
  };

  const handleStatusChange = (index) => {
    const updatedBrands = [...brands];
    updatedBrands[index].isPublish = !updatedBrands[index].isPublish;
    setBrands(updatedBrands);
    console.log(updatedBrands[index].isPublish);

    setProgress(50);
    axios
      .patch(
        `${auth.ip}publish/product/brand/${brands[index]._id}`,
        { isPublish: updatedBrands[index].isPublish }
      )
      .then((response) => {
        if (response.data.status === 201) {
          // toast.success(response.data.message);
          setErrState(false);
          getBrands();
          setProgress(100);
        } else {
          // toast.error(response.data.message);
          setErrState(true);
          setProgress(100);
        }
      });
  };

  const handleIcon = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png") {
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
      if (file.type === "image/jpeg" || file.type === "image/png") {
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

  const formData = new FormData();

  // Append non-file data to the FormData object
  formData.append("name", productName);
  formData.append("shortDescription", productDesc);
  formData.append("metaTitle", productMetaTitle);
  formData.append("metaImage", productMetaImage);
  formData.append("Logo", productIcon);
  formData.append("metaDescription", productMetaDesc);

  // Append file data to the FormData object
  if (isEdit) {
  } else {
    formData.append("isFeatured", true);
    formData.append("isPublish", true);
  }

  const handleSubmit = (event) => {
    setProgress(0);

    event.preventDefault();

    if (productName === "") {
      toast.error("Enter a product name");
      setErrState(true);
      setProgress(100);
    } else {
      console.log(formData);

      isEdit
        ? axios
          .patch(
            `${auth.ip}update/product/brand/${productID}`,
            formData
          )

          .then((response) => {
            if (response.data.status === 201) {
              toast.success(response.data.message);
              setErrState(false);
              setproductID("");
              set_productName("");
              set_productDesc("");
              set_productMetaTitle("");
              set_productMetaImage("");
              setProductIcon("");
              set_productMetaDesc("");
              setProgress(100);
              setnewproductModal(false);
              setisEdit(false);
              getBrands();
            } else {
              toast.error(response.data.message);
              setErrState(true);
              setProgress(100);
            }
          })
        : axios
          .post(`${auth.ip}create/product/brand`, formData)
          .then((response) => {
            if (response.data.status === 201) {
              // toast.success(response.data.message);
              setErrState(false);

              setproductID("");
              set_productName("");
              set_productDesc("");
              set_productMetaTitle("");
              set_productMetaImage("");
              setProductIcon("");
              set_productMetaDesc("");
              setProgress(100);
              setnewproductModal(false);
              setisEdit(false);
              getBrands();
            } else {
              // toast.error(response.data.message);
              setErrState(true);
              setProgress(100);
            }
          });
    }
  };

  function getBrands() {
    setProgress(50);
    axios.get(`${auth.ip}get/product/brand`).then((response) => {
      if (response.data.status === 201) {
        if (!toastShownRef.current) {
          // toast.success(response.data.message);
          toastShownRef.current = true;
        }
        setErrState(false);
        setBrands(response.data.productBrands);
        console.log(response.data.productBrands);
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setErrState(true);
        setProgress(100);
      }
    });
  }

  useEffect(() => {
    getBrands();
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
          {/* <h2 className="text-lg font-bold  text-gray-900"> Brands</h2> */}
        </div>
      </div>
      <div className="flow-root">
        <div className="">
          <div className="py-2 ">
            <div className="overflow-x-auto scrollbar-thin scrollbar-webkit shadow rounded-md border border-gray-200">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-black uppercase border-b border-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 max-w-60 font-bold"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Logo
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Featured
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 flex justify-end items-center"
                    >
                      <button
                        onClick={() => {
                          setnewproductModal(true);
                          setisEdit(false);
                        }}
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-200 transition-colors duration-150 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Brand
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {brands.map((product, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {/* {product.shortDescription} */}
                        {product.Logo && (
                          <img
                            className="h-10 rounded-md"
                            src={`${auth.ip}${product.Logo.path}`}
                            alt="logo"
                          />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            checked={product.isFeatured}
                            // onChange={() => {
                            //   product.featured = !product.featured;
                            //   console.log(product.featured);
                            // }}

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
                            checked={product.isPublish}
                            onChange={() => handleStatusChange(index)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                        </label>{" "}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setnewproductModal(true);
                              setisEdit(true);
                              setproductID(product._id);
                              set_productName(product.name);
                              set_productDesc(product.shortDescription);
                              set_productMetaTitle(product.metaTitle);
                              set_productMetaImage(product.metaImage);
                              setProductIcon(product.Logo);
                              set_productMetaDesc(product.metaDescription);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
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

      {newproductModal && (
        <div className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto ">
          <div
            id="crud-modal"
            className="relative p-4 w-full max-w-lg max-h-full"
          >
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEdit ? "Edit product" : "Add new brand"}
                </h3>
                <button
                  onClick={() => {
                    setproductID("");
                    setisEdit(false);
                    setnewproductModal(false);
                    setproductID("");
                    set_productName("");
                    set_productDesc("");
                    set_productMetaTitle("");
                    set_productMetaImage("");
                    setProductIcon("");
                    set_productMetaDesc("");
                  }}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                  data-modal-toggle="crud-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
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
                      placeholder="product name"
                      value={productName}
                      onChange={(e) => set_productName(e.target.value)}
                    />
                  </div>

                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  col-span-2">
                    <div className="text-center">
                      {productIcon ? (
                        <>
                          {productIcon.path ? (
                            <>
                              <img
                                src={`${auth.ip}${productIcon.path}`}
                                alt="path"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => {
                                  setProductIcon(null);
                                  console.log(productIcon);
                                  console.log("deleted");
                                  console.log(productIcon);
                                }}
                              />
                              <p className="text-xs  text-red-600">
                                Click image to delete
                              </p>
                            </>
                          ) : (
                            <>
                              <img
                                src={URL.createObjectURL(productIcon)}
                                alt="obj"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => setProductIcon(null)}
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
                          htmlFor="brandIcon"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary px-2 focus-within:ring-offset-2 hover:text-primary"
                        >
                          <span>Logo</span>
                          <input
                            id="brandIcon"
                            name="brandIcon"
                            type="file"
                            className="sr-only"
                            onChange={handleIcon}
                            accept="image/*"
                          />
                        </label>
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
                      placeholder="Type product name"
                      value={productMetaTitle}
                      onChange={(e) => set_productMetaTitle(e.target.value)}
                    />
                  </div>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  col-span-2">
                    <div className="text-center">
                      {productMetaImage ? (
                        <>
                          {productMetaImage.path ? (
                            <>
                              <img
                                src={`${auth.ip}${productMetaImage.path}`}
                                alt="path"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => set_productMetaImage(null)}
                              />
                              <p className="text-xs  text-red-600">
                                Click image to delete
                              </p>
                            </>
                          ) : (
                            <>
                              <img
                                src={URL.createObjectURL(productMetaImage)}
                                alt="Thumbnail"
                                className="h-12 rounded-md mx-auto cursor-pointer"
                                onClick={() => set_productMetaImage(null)}
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
                      <div className="mt-2 text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="metaImage"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary  px-2 focus-within:ring-offset-2 hover:text-primary"
                        >
                          <span>Meta Image</span>
                          <input
                            id="metaImage"
                            name="metaImage"
                            type="file"
                            className="sr-only"
                            onChange={handleMetaImage}
                            accept="image/*"
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
                      placeholder="Write product description here"
                      value={productMetaDesc}
                      onChange={(e) => set_productMetaDesc(e.target.value)}
                    />
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
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {isEdit ? "Edit Brand" : "Add new Brand"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
