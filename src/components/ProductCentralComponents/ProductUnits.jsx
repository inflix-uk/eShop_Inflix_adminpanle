import { useState, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../../../../context/Auth";

export default function ProductUnits() {
  const auth = useAuth();
  const [err, setErr] = useState("");
  const [errState, setErrState] = useState(false);
  const [progress, setProgress] = useState(0);

  const [newTagsModal, setnewTagsModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);

  const [tagID, setTagID] = useState("");
  const [tagName, set_tagName] = useState("");
  const [tagDesc, set_tagDesc] = useState("");
  const [tagMetaTitle, set_tagMetaTitle] = useState("");
  const [tagMetaImage, set_tagMetaImage] = useState("");
  const [tagMetaDesc, set_tagMetaDesc] = useState("");

  const [tags, settags] = useState([]);


  const handleDelete = (id) => {
    setProgress(50);
    axios
      .delete(`${auth.ip}delete/blog/tag/${id}`)
      .then((response) => {
        if (response.data.status === 201) {
          setErr(response.data.message);
          setErrState(false);
          setTimeout(() => {
            setErr("");
            setErrState(false);
          }, 3000);
          getTags();
          setProgress(100);
        } else {
          setErr(response.data.message);
          setErrState(true);
          setTimeout(() => {
            setErr("");
            setErrState(false);
          }, 3000);
          setProgress(100);
        }
      });
  };


  const formData = new FormData();

  // Append non-file data to the FormData object
  formData.append("name", tagName);
  formData.append("shortDescription", tagDesc);
  formData.append("metaTitle", tagMetaTitle);
  formData.append("metaImage", tagMetaImage);
  formData.append("metaDescription", tagMetaDesc);

  // Append file data to the FormData object
  if (!isEdit) {
    formData.append("isPublish", true);
  }

  const handleSubmit = (event) => {
    setProgress(0);

    event.preventDefault();

    if (tagName === "") {
      setErr("Enter a tag name");
      setErrState(true);
      setTimeout(() => {
        setErr("");
        setErrState(false);
      }, 3000);
      setProgress(100);
    } else {
      isEdit
        ? axios
          .patch(`${auth.ip}update/blog/tag/${tagID}`, formData)
          .then((response) => {
            if (response.data.status === 201) {
              setErr(response.data.message);
              setErrState(false);
              setTimeout(() => {
                setErr("");
                setErrState(false);
              }, 3000);

              set_tagName("");
              set_tagDesc("");
              set_tagMetaTitle("");
              set_tagMetaImage("");
              set_tagMetaDesc("");
              setProgress(100);
              setnewTagsModal(false);
              setisEdit(false);
              getTags();
            } else {
              setErr(response.data.message);
              setErrState(true);
              setTimeout(() => {
                setErr("");
                setErrState(false);
              }, 3000);
              setProgress(100);
            }
          })
        : axios
          .post(`${auth.ip}create/blog/tag`, formData)
          .then((response) => {
            if (response.data.status === 201) {
              setErr(response.data.message);
              setErrState(false);
              setTimeout(() => {
                setErr("");
                setErrState(false);
              }, 3000);

              set_tagName("");
              set_tagDesc("");
              set_tagMetaTitle("");
              set_tagMetaImage("");
              set_tagMetaDesc("");
              setProgress(100);
              setnewTagsModal(false);
              setisEdit(false);
              getTags();
            } else {
              setErr(response.data.message);
              setErrState(true);
              setTimeout(() => {
                setErr("");
                setErrState(false);
              }, 3000);
              setProgress(100);
            }
          });
    }
  };

  function getTags() {
    setProgress(50);
    axios.get(`${auth.ip}get/blog/tag`).then((response) => {
      if (response.data.status === 201) {
        setErr(response.data.message);
        setErrState(false);
        setTimeout(() => {
          setErr("");
          setErrState(false);
        }, 3000);
        settags(response.data.tags);
        console.log(response.data.tags);
        setProgress(100);
      } else {
        setErr(response.data.message);
        setErrState(true);
        setTimeout(() => {
          setErr("");
          setErrState(false);
        }, 3000);
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
      
      {err && (
        <div className={`mt-4 p-2 rounded-md ${errState ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {err}
        </div>
      )}


      <div className="sm:flex sm:items-center mt-10">
        <div className="sm:flex-auto">
          {/* <h2 className="text-lg font-bold  text-gray-900">units</h2> */}
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setnewTagsModal(true);
              setisEdit(false);
            }}
            type="button"
            className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Add Unit
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>

                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
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

                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 ">
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
                    />
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
                      fillRule="evenodd"
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
