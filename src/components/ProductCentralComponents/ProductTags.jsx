import { React, useState, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";

export default function ProductTags() {
  const auth = useAuth();
  const toastShownRef = useRef(false);
  const [errState, setErrState] = useState();
  const [progress, setProgress] = useState(0);

  const [newTagsModal, setnewTagsModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);

  const [tagID, setTagID] = useState("");
  const [tagName, set_tagName] = useState("");

  const [tags, settags] = useState([]);

  const handlePublishedChange = (index) => {
    const updatedtags = [...tags];
    updatedtags[index].isPublished = !updatedtags[index].isPublished;
    settags(updatedtags);
    console.log(updatedtags[index]);
    setProgress(50);
    axios
      // .patch(` localhost:4000/publish/product/tag/${tags[index]._id}`, {
      .patch(`${auth.ip}publish/product/tag/${tags[index]._id}`, {
        isPublished: updatedtags[index].isPublished,
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
      // .delete(` localhost:4000/delete/product/tag/${id}`)
      .delete(`${auth.ip}delete/product/tag/${id}`)
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

  const formData = new FormData();

  formData.append("name", tagName);

  if (isEdit) {
  } else {
    formData.append("isPublished", true);
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
          .patch(
            // ` localhost:4000/update/product/tag/${tagID}`,
            `${auth.ip}update/product/tag/${tagID}`,
            // formData
            { name: tagName }
          )
          .then((response) => {
            if (response.data.status === 201) {
              toast.success(response.data.message);
              setErrState(false);
              set_tagName("");
              setProgress(100);
              setnewTagsModal(false);
              setisEdit(false);
              getTags();
            } else {
              toast.error(response.data.message);
              setErrState(true);
              setProgress(100);
            }
          })
        : axios
          // .post(" localhost:4000/create/product/tag", {
          .post(`${auth.ip}create/product/tag`, {
            name: tagName,
            isPublished: true,
          })
          .then((response) => {
            if (response.data.status === 201) {
              toast.success(response.data.message);
              setErrState(false);
              set_tagName("");
              setProgress(100);
              setnewTagsModal(false);
              setisEdit(false);
              getTags();
            } else {
              toast.error(response.data.message);
              setErrState(true);
              setProgress(100);
            }
          });
    }
  };

  function getTags() {
    setProgress(50);
    // axios.get(" localhost:4000/get/product/tag").then((response) => {
    axios.get(`${auth.ip}get/product/tag`).then((response) => {
      console.log(response.data.productTags);
      if (response.data.status === 201) {
        if (!toastShownRef.current) {
          // toast.success(response.data.message);
          toastShownRef.current = true;
        }
        setErrState(false);
        settags(response.data.productTags);
        console.log(response.data.productTags);
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
  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {/* <h2 className="text-lg font-bold  text-gray-900">Tags</h2> */}
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
                      Status
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-200 transition-colors duration-150 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Tags
                      </button>
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
                            checked={tag.isPublished}
                            onChange={() => handlePublishedChange(index)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                        </label>
                      </td>

                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setnewTagsModal(true);
                              setisEdit(true);
                              setTagID(tag._id);
                              set_tagName(tag.name);
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
                      fillRulee="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
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
