import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";

export default function ProductSubCategory() {
  const auth = useAuth();
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      .catch(() => {
        toast.error("Failed to fetch categories.");
        setProgress(100);
      });
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
                  {categories.length > 0 ? (
                    categories.map((category) =>
                      category.subCategories.map((subCategory, subIndex) => (
                        <tr key={`${category._id}-${subIndex}`}>
                          <td className="px-6 py-4 max-w-60 text-gray-900">{category.name}</td>
                          <td className="px-4 py-4 max-w-60 text-gray-500">{subCategory}</td>
                          <td className="px-4 py-4 max-w-60 text-center">
                            <Link
                              to={`/admin/product-central/edit-subcategory/${category._id}/${subIndex}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 shadow-sm"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                        No categories or subcategories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
