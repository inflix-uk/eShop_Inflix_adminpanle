import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { FaUpload, FaFolder } from "react-icons/fa";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BlockEditor from "../blog-new/components/createblog/BlockEditor/BlockEditor";
import MediaLibraryPicker from "../media/components/media/MediaLibraryPicker";
import {
  getStoredAuthors,
  setStoredAuthors,
  syncAuthorToBlogs,
} from "./service/authorLocalService";

const initialAuthor = {
  name: "",
  email: "",
  designation: "",
  role: "author",
  image: "",
  bio: "",
  blocks: [],
};

const createAuthorId = () =>
  `author_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeAuthors = (list) =>
  (Array.isArray(list) ? list : []).map((item) => ({
    ...item,
    id: item?.id || createAuthorId(),
  }));

export default function Author() {
  const [selectedPage, setSelectedPage] = useState("author");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authorForm, setAuthorForm] = useState(initialAuthor);
  const [authors, setAuthors] = useState(() =>
    normalizeAuthors(getStoredAuthors())
  );
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const profileImageInputRef = useRef(null);

  useEffect(() => {
    setStoredAuthors(authors);
  }, [authors]);

  useEffect(() => {
    setAuthors((prev) => normalizeAuthors(prev));
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAuthorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setAuthorForm((prev) => ({
        ...prev,
        image: loadEvent.target?.result || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMediaLibrarySelect = (url) => {
    setAuthorForm((prev) => ({
      ...prev,
      image: url || "",
    }));
    setIsMediaPickerOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!authorForm.name.trim() || !authorForm.email.trim()) return;
    const normalizedEditingId =
      editingAuthorId == null ? null : String(editingAuthorId);
    const previousEntry =
      normalizedEditingId == null
        ? null
        : authors.find((item) => String(item.id) === normalizedEditingId) || null;

    const payload = {
      ...authorForm,
      id: normalizedEditingId || createAuthorId(),
    };

    setAuthors((prev) => {
      if (normalizedEditingId == null) {
        return [payload, ...prev];
      }
      return prev.map((item) =>
        String(item.id) === normalizedEditingId ? payload : item
      );
    });

    await syncAuthorToBlogs(payload, previousEntry?.name);

    setAuthorForm(initialAuthor);
    setEditingAuthorId(null);
  };

  const handleEditAuthor = (author) => {
    setAuthorForm({
      name: author?.name || "",
      email: author?.email || "",
      designation: author?.designation || "",
      role: author?.role || "author",
      image: author?.image || "",
      bio: author?.bio || "",
      blocks: Array.isArray(author?.blocks) ? author.blocks : [],
    });
    setEditingAuthorId(author?.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setAuthorForm(initialAuthor);
    setEditingAuthorId(null);
  };

  const handleRemoveAuthor = (authorId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to remove this Author/Reviewer?"
    );
    if (!shouldDelete) return;

    const normalizedTargetId = String(authorId);
    setAuthors((prev) =>
      prev.filter((item) => String(item.id) !== normalizedTargetId)
    );
    if (String(editingAuthorId) === normalizedTargetId) {
      handleCancelEdit();
    }
  };

  return (
    <>
      <Helmet>
        <title>Author - Admin</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Author</h1>
              <p className="mt-2 text-gray-600">
                Basic module to manage author profile details.
              </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAuthorId ? "Edit Author / Reviewer" : "Add Author"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={authorForm.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={authorForm.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter author email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={authorForm.designation}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Senior Editor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={authorForm.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="author">Author</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload from PC or choose from Media Library.
                  </p>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => profileImageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      <FaUpload size={11} />
                      Upload from PC
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-secondary"
                    >
                      <FaFolder size={11} />
                      Media Library
                    </button>
                    {authorForm.image ? (
                      <button
                        type="button"
                        onClick={() =>
                          setAuthorForm((prev) => ({ ...prev, image: "" }))
                        }
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {authorForm.image ? (
                    <div className="mt-1">
                      <img
                        src={authorForm.image}
                        alt="Author preview"
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={authorForm.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Short author bio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Rows
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Add text, image, products, or widget blocks for this author.
                  </p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <BlockEditor
                      blocks={Array.isArray(authorForm?.blocks) ? authorForm.blocks : []}
                      setBlocks={(nextBlocks) =>
                        setAuthorForm((prev) => ({
                          ...prev,
                          blocks: (() => {
                            const currentBlocks = Array.isArray(prev?.blocks)
                              ? prev.blocks
                              : [];
                            const resolvedBlocks =
                              typeof nextBlocks === "function"
                                ? nextBlocks(currentBlocks)
                                : nextBlocks;
                            return Array.isArray(resolvedBlocks)
                              ? resolvedBlocks
                              : currentBlocks;
                          })(),
                        }))
                      }
                      collapsibleRows
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {editingAuthorId ? "Update Author" : "Save Author"}
                    </button>
                    {editingAuthorId ? (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Author List
                </h2>
              </div>

              {authors.length === 0 ? (
                <div className="px-6 py-8 text-sm text-gray-500">
                  No authors added yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Bio
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Content Rows
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {authors.map((author) => (
                        <tr key={author.id}>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {author.image ? (
                              <img
                                src={author.image}
                                alt={author.name}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                            {author.name}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 max-w-[180px] truncate">
                            {author.email}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 max-w-[160px] truncate">
                            {author.designation || "-"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 capitalize">
                            {author.role || "author"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700 max-w-[260px] truncate">
                            {author.bio || "-"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">
                            {Array.isArray(author.blocks)
                              ? author.blocks.length
                              : 0}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditAuthor(author)}
                                className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-medium"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAuthor(author.id)}
                                className="inline-flex items-center px-2.5 py-1 rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50 text-[11px] font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MediaLibraryPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaLibrarySelect}
      />
    </>
  );
}
