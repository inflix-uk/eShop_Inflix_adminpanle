import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/Auth";
import SubcategoryEditForm from "../../../components/ProductCentralComponents/SubcategoryEditForm";
import { appendBlocksToFormData } from "../blog-new/utils/appendBlocksToFormData";

export default function ProductCentralEditSubcategory() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { categoryId, subIndex: subIndexParam } = useParams();
  const subIndex = parseInt(String(subIndexParam), 10);

  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [parentCategoryName, setParentCategoryName] = useState("");
  const [editedSubcategoryName, setEditedSubcategoryName] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [content, setContent] = useState("");
  const [contentBlocks, setContentBlocks] = useState([]);
  const [subcategoryBanner, setSubcategoryBanner] = useState(null);
  const [metaSchemas, setMetaSchemas] = useState([""]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleSubCategoryBannerImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
        if (file.size <= 5 * 1024 * 1024) {
          resizeImage(file, 1256, 480, (resizedImage) => {
            setSubcategoryBanner(resizedImage);
          });
        } else {
          toast.error("File size exceeds 5MB limit.");
        }
      } else {
        toast.error("Please select a JPEG, PNG, or WEBP file.");
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

  const loadCategory = useCallback(() => {
    if (!categoryId || Number.isNaN(subIndex) || subIndex < 0) {
      toast.error("Invalid subcategory link.");
      navigate("/admin/product-central/subcategories");
      return;
    }
    setLoading(true);
    setProgress(40);
    axios
      .get(`${auth.ip}get/category/byid/${categoryId}`)
      .then((response) => {
        if (response.data.status !== 201 || !response.data.category) {
          toast.error(response.data.message || "Category not found.");
          navigate("/admin/product-central/subcategories");
          return;
        }
        const category = response.data.category;
        const subs = category.subCategory || [];
        if (!subs[subIndex]) {
          toast.error("Subcategory not found at this index.");
          navigate("/admin/product-central/subcategories");
          return;
        }
        setParentCategoryName(category.name || "");
        const subName = subs[subIndex];
        const metaSub = (category.metasubCategory && category.metasubCategory[subIndex]) || {};

        setEditedSubcategoryName(subName);
        setMetaTitle(metaSub.metaTitle || "");
        setMetaDescription(metaSub.metaDescription || "");
        setMetaKeywords(metaSub.metaKeywords || "");
        setContent(metaSub.content || "");
        const rawBlocks = metaSub.content_blocks;
        setContentBlocks(Array.isArray(rawBlocks) ? rawBlocks : []);
        setMetaSchemas(
          Array.isArray(metaSub.metaSchemas) && metaSub.metaSchemas.length
            ? metaSub.metaSchemas
            : [""]
        );
        setSubcategoryBanner(metaSub.banner || null);
        setProgress(100);
      })
      .catch(() => {
        toast.error("Failed to load category.");
        navigate("/admin/product-central/subcategories");
        setProgress(100);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auth.ip, categoryId, subIndex, navigate]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const handleMetaSchemaChange = (index, value) => {
    const updatedSchemas = [...metaSchemas];
    updatedSchemas[index] = value;
    setMetaSchemas(updatedSchemas);
  };

  const handleAddMetaSchema = () => {
    setMetaSchemas([...metaSchemas, ""]);
  };

  const handleRemoveMetaSchema = (index) => {
    setMetaSchemas(metaSchemas.filter((_, i) => i !== index));
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const processedSubcategoryName = editedSubcategoryName.trimEnd().replace(/\s+/g, "-");
    const hasRows = Array.isArray(contentBlocks) && contentBlocks.length > 0;
    const contentToSave = hasRows ? "" : content;

    const metaPayload = {
      [processedSubcategoryName]: {
        subcategoryName: processedSubcategoryName,
        metaTitle,
        metaDescription,
        metaKeywords,
        content: contentToSave,
        metaSchemas,
        subCategoryIndex: subIndex,
      },
    };

    const formData = new FormData();
    formData.append("metasubCategory", JSON.stringify(metaPayload));
    if (subcategoryBanner instanceof File) {
      formData.append("banner", subcategoryBanner);
    }

    appendBlocksToFormData(formData, contentBlocks, {
      jsonField: "content_blocks",
      countField: "subcategoryBlockImageCount",
      filePrefix: "subcategoryBlockImages",
      imageFilenamePrefix: "subcat-content-block",
    });

    setSaving(true);
    setProgress(30);

    axios
      .patch(`${auth.ip}update/product/subcategory/${categoryId}`, formData)
      .then(() => {
        toast.success("Subcategory updated successfully.");
        navigate("/admin/product-central/subcategories");
      })
      .catch(() => {
        toast.error("Failed to update subcategory.");
      })
      .finally(() => {
        setSaving(false);
        setProgress(100);
      });
  };

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>Edit subcategory - Product Central</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gray-50/50 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
                <li className="inline-flex items-center">
                  <Link
                    to="/admin/product-central"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600"
                  >
                    Product Central
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <Link
                      to="/admin/product-central/subcategories"
                      className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2"
                    >
                      Subcategories
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-blue-600 md:ml-2">Edit</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Edit subcategory</h1>
              <p className="mt-1 text-sm text-gray-500">
                {parentCategoryName ? (
                  <>
                    Parent: <span className="font-medium text-gray-700">{parentCategoryName}</span>
                    {" · "}
                  </>
                ) : null}
                {!loading && editedSubcategoryName ? (
                  <span className="font-medium text-gray-700">{editedSubcategoryName}</span>
                ) : null}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading…</div>
              ) : (
                <SubcategoryEditForm
                  editedSubcategoryName={editedSubcategoryName}
                  setEditedSubcategoryName={setEditedSubcategoryName}
                  metaTitle={metaTitle}
                  setMetaTitle={setMetaTitle}
                  metaDescription={metaDescription}
                  setMetaDescription={setMetaDescription}
                  metaKeywords={metaKeywords}
                  setMetaKeywords={setMetaKeywords}
                  content={content}
                  contentBlocks={contentBlocks}
                  setContentBlocks={setContentBlocks}
                  metaSchemas={metaSchemas}
                  handleMetaSchemaChange={handleMetaSchemaChange}
                  handleAddMetaSchema={handleAddMetaSchema}
                  handleRemoveMetaSchema={handleRemoveMetaSchema}
                  subcategoryBanner={subcategoryBanner}
                  setSubcategoryBanner={setSubcategoryBanner}
                  handleSubcategoryBannerImage={handleSubCategoryBannerImage}
                  handleEditSubmit={handleEditSubmit}
                  onCancel={() => navigate("/admin/product-central/subcategories")}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
