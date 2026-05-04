"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  getAllPageCategories,
  createPageCategory,
  updatePageCategory,
  deletePageCategory,
  generateSlugFromTitle,
} from "./service/pageCategoriesService";

export default function PagesCategories() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const list = await getAllPageCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        typeof error === "string"
          ? error
          : "Failed to load categories. Check API URL and server."
      );
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormSortOrder("0");
    setSlugTouched(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingId(row._id);
    setFormName(row.name || "");
    setFormSlug(row.slug || "");
    setFormSortOrder(String(row.sortOrder ?? 0));
    setSlugTouched(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setSaving(false);
  };

  const onNameChange = (value) => {
    setFormName(value);
    if (!editingId && !slugTouched) {
      setFormSlug(generateSlugFromTitle(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        sortOrder: formSortOrder === "" ? 0 : Number(formSortOrder),
      };
      if (editingId) {
        await updatePageCategory(editingId, payload);
        setSuccessMessage("Category updated");
      } else {
        await createPageCategory(payload);
        setSuccessMessage("Category created");
      }
      closeModal();
      await fetchCategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(typeof error === "string" ? error : "Save failed");
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await deletePageCategory(id);
      setSuccessMessage("Category deleted");
      await fetchCategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(typeof error === "string" ? error : "Delete failed");
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (row) =>
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.slug && row.slug.toLowerCase().includes(q))
    );
  }, [categories, searchTerm]);

  return (
    <>
      <Side
        selectedPage="pages-categories"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage="pages-categories"
          setSelectedPage={() => {}}
        />
        <main className="py-5">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Pages categories
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl">
                  Group footer and static pages into categories for navigation
                  and filters. Categories are stored in the database and can be
                  used when assigning pages.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaPlus />
                Add category
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
                {successMessage}
              </div>
            )}

            <div className="mb-6">
              <input
                type="search"
                placeholder="Search by name or slug…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Slug
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 w-32">
                      Sort order
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 w-44">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-16 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        {categories.length === 0
                          ? "No categories yet. Click “Add category” to create one."
                          : "No categories match your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {row.slug}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.sortOrder}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(row)}
                              className="text-purple-600 hover:text-purple-800 p-1"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row._id, row.name)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <div
            className="absolute inset-0"
            aria-hidden
            onClick={() => !saving && closeModal()}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingId ? "Edit category" : "New category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setFormSlug(e.target.value);
                  }}
                  placeholder="auto from name if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort order
                </label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
