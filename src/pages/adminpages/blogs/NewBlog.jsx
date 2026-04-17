import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tab } from "@headlessui/react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BlogsTab from "./BlogsTab";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import AddBlogSection from "./component/newBlog/AddBlogSection";
import SeoMetaSection from "./component/newBlog/SeoMetaSection";
import BlogCategoryTagSection from "./component/newBlog/BlogCategoryTagSection";
import config from "./component/newBlog/AddBlogConfig";

function sanitizePermalink(blogName) {
  return blogName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewBlog() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState("blogs");
  const [selectedTab, setSelectedTab] = useState("new-blog");
  const [err, setErr] = useState("");
  const [progress, setProgress] = useState(0);
  const editor = useRef(null);
  const editor1 = useRef(null);
  const [blogName, setblogName] = useState("");
  const [blogdesc, setblogDesc] = useState("");
  const [blogContent, setblogContent] = useState("");
  const [blogContent1, setblogContent1] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [blogImage, setblogimage] = useState(null);
  const [blogImageAlt, setblogimagealt] = useState("");
  const [blogThumbnailImage, setblogthumnailimage] = useState(null);
  const [blogThumbnailImageAlt, setblogthumnailimageAlt] = useState("");
  const [blogMetaTitle, setblogMetaTitle] = useState("");
  const [blogMetaDescription, setblogMetaDescription] = useState("");
  const [blogMetaImage, setblogMetaImage] = useState(null);
  const [blogMetaImageAlt, setblogMetaImageAlt] = useState("");
  const [blogMetakeywords, setblogMetakeywords] = useState("");
  const [metaSchemas, setMetaSchemas] = useState([""]);
  const [blogCategory, setblogCategory] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [blogTags, setBlogTags] = useState([]);
  const [blogTagInput, setBlogTagInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [categories, setCategories] = useState([]);

  const [tabIndex, setTabIndex] = useState(0);
  const [maxUnlockedTab, setMaxUnlockedTab] = useState(0);
  const [createdBlogId, setCreatedBlogId] = useState(null);

  const handleMetaImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
        if (file.size <= 5 * 1024 * 1024) {
          resizeImage(file, 385, 380, (resizedImage) => {
            setblogMetaImage(resizedImage);
          });
        } else {
          toast.error("File size exceeds 5MB limit.");
        }
      } else {
        toast.error("Please select a JPEG or PNG or Webp file.");
      }
    }
  };
  const handleBlogImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
        if (file.size <= 5 * 1024 * 1024) {
          resizeImage(file, 1200, 560, (resizedImage) => {
            setblogimage(resizedImage);
          });
        } else {
          toast.error("File size exceeds 5MB limit.");
        }
      } else {
        toast.error("Please select a JPEG or PNG file.");
      }
    }
  };
  const handleBlogThumnailImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
        if (file.size <= 5 * 1024 * 1024) {
          resizeImage(file, 350, 350, (resizedImage) => {
            setblogthumnailimage(resizedImage);
          });
        } else {
          toast.error("File size exceeds 5MB limit.");
        }
      } else {
        toast.error("Please select a JPEG or PNG file.");
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

  const handleSchemaChange = (index, value) => {
    const newSchemas = [...metaSchemas];
    newSchemas[index] = value;
    setMetaSchemas(newSchemas);
  };

  const handleAddSchema = () => {
    setMetaSchemas([...metaSchemas, ""]);
  };

  const handleRemoveSchema = (index) => {
    const newSchemas = metaSchemas.filter((_, schemaIndex) => schemaIndex !== index);
    setMetaSchemas(newSchemas.length ? newSchemas : [""]);
  };

  const appendCreateDefaults = (formData) => {
    formData.append("metaTitle", "");
    formData.append("metaDescription", "");
    formData.append("metakeywords", "");
    formData.append("metaImageAlt", "");
    formData.append("blogpublisheddate", "");
    metaSchemas.forEach((schema, index) => {
      formData.append(`metaSchemas[${index}]`, schema ?? "");
    });
    formData.append("isFeatured", false);
    formData.append("visibility", false);
    formData.append("blogCategory", blogCategory || "");
  };

  const buildContentStepFormData = () => {
    const formData = new FormData();
    const permalink = sanitizePermalink(blogName);
    formData.append("name", blogName);
    formData.append("permalink", permalink);
    formData.append("blogShortDescription", blogdesc);
    formData.append("content", blogContent);
    formData.append("content1", blogContent1);
    selectedProducts.forEach((productId, idx) => {
      formData.append(`selectedProducts[${idx}]`, productId);
    });
    if (blogImage) formData.append("blogImage", blogImage);
    formData.append("blogImageAlt", blogImageAlt);
    if (blogThumbnailImage) formData.append("blogthumbnailImage", blogThumbnailImage);
    formData.append("blogthumbnailImageAlt", blogThumbnailImageAlt);
    appendCreateDefaults(formData);
    return formData;
  };

  const saveContentStep = async () => {
    setErr("");
    if (blogName === "") {
      toast.error("Enter a Blog name");
      setErr("Enter a Blog name");
      return;
    }
    if (blogdesc === "") {
      toast.error("Enter Blog Description");
      setErr("Enter Blog Description");
      return;
    }
    if (blogContent === "") {
      toast.error("Enter Blog Content");
      setErr("Enter Blog Content");
      return;
    }

    setProgress(30);
    try {
      const formData = buildContentStepFormData();
      const response = await axios.post(`${auth.ip}create/newblog`, formData);
      if (response.data.status === 201) {
        const id = response.data.blog?._id;
        if (!id) {
          toast.error("Blog created but no id returned");
          setProgress(100);
          return;
        }
        setCreatedBlogId(id);
        setMaxUnlockedTab(1);
        setTabIndex(1);
        setErr("");
        toast.success("Content saved. Continue with SEO.");
        setProgress(100);
      } else {
        toast.error(response.data.message || "Failed to create blog");
        setErr(response.data.message || "Unknown error");
        setProgress(100);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create blog";
      toast.error(msg);
      setErr(String(msg));
      setProgress(100);
    }
  };

  const saveSeoStep = async () => {
    if (!createdBlogId) {
      toast.error("Save content first");
      return;
    }
    setProgress(30);
    try {
      const formData = new FormData();
      formData.append("metaTitle", blogMetaTitle);
      formData.append("metaDescription", blogMetaDescription);
      formData.append("metakeywords", blogMetakeywords);
      formData.append("metaImageAlt", blogMetaImageAlt);
      formData.append("blogpublisheddate", publishedDate);
      if (blogMetaImage) formData.append("metaImage", blogMetaImage);
      metaSchemas.forEach((schema, index) => {
        formData.append(`metaSchemas[${index}]`, schema ?? "");
      });

      const response = await axios.patch(`${auth.ip}update/blog/${createdBlogId}`, formData);
      if (response.data.status === 201) {
        setMaxUnlockedTab(2);
        setTabIndex(2);
        toast.success("SEO saved. Set category and publish when ready.");
        setProgress(100);
      } else {
        toast.error(response.data.message || "Failed to save SEO");
        setProgress(100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save SEO");
      setProgress(100);
    }
  };

  const saveCategoryStep = async (publish) => {
    if (!createdBlogId) {
      toast.error("Complete previous steps first");
      return;
    }
    setProgress(30);
    try {
      const formData = new FormData();
      formData.append("blogCategory", blogCategory);
      blogTags.forEach((tag, idx) => {
        formData.append(`blogTags[${idx}]`, tag);
      });
      formData.append("isFeatured", featured);
      formData.append("visibility", publish);

      const response = await axios.patch(`${auth.ip}update/blog/${createdBlogId}`, formData);
      if (response.data.status === 201) {
        toast.success(response.data.message);
        setErr("");
        setProgress(100);
        navigate(publish ? "/admin/all-blogs" : "/admin/draft-blogs");
      } else {
        toast.error(response.data.message || "Failed to update blog");
        setProgress(100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update blog");
      setProgress(100);
    }
  };

  const getCategories = useCallback(() => {
    setProgress(50);
    axios.get(`${auth.ip}get/blog/category/all`).then((response) => {
      if (response.data.status === 201) {
        const filteredCategories = response.data.categories.filter((category) => category.isPublish);
        setCategories(filteredCategories);
        if (filteredCategories.length > 0) {
          setblogCategory((prev) => prev || filteredCategories[0].name);
        }
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setProgress(100);
      }
    });
  }, [auth.ip]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const tabClass = (selected) =>
    `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap ${
      selected ? "bg-white text-primary shadow" : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
    }`;

  const lockedTabClass =
    "w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50";

  return (
    <>
      <LoadingBar color="#2563EB" progress={progress} onLoaderFinished={() => setProgress(0)} />
      <Helmet>
        <title>New Blog</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8 ">
            <BlogsTab selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

            <div className="py-10">
              {err && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{err}</div>
              )}

              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Create your blog in steps</p>
                    <p className="text-sm text-amber-600">
                      Save content first (smaller request), then SEO, then category and publish. Locked tabs open after each
                      step saves successfully.
                    </p>
                  </div>
                </div>
              </div>

              <Tab.Group
                selectedIndex={tabIndex}
                onChange={(index) => {
                  if (index <= maxUnlockedTab) setTabIndex(index);
                }}
              >
                <Tab.List className="flex space-x-1 rounded-xl bg-primary/20 p-1 overflow-x-auto">
                  <Tab className={({ selected }) => tabClass(selected)}>Content &amp; media</Tab>
                  <Tab
                    disabled={maxUnlockedTab < 1}
                    className={maxUnlockedTab < 1 ? lockedTabClass : ({ selected }) => tabClass(selected)}
                  >
                    SEO &amp; meta
                  </Tab>
                  <Tab
                    disabled={maxUnlockedTab < 2}
                    className={maxUnlockedTab < 2 ? lockedTabClass : ({ selected }) => tabClass(selected)}
                  >
                    Category &amp; publish
                  </Tab>
                </Tab.List>

                <Tab.Panels className="mt-6" unmount={false}>
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <AddBlogSection
                      blogName={blogName}
                      setblogName={setblogName}
                      blogdesc={blogdesc}
                      setblogDesc={setblogDesc}
                      blogContent={blogContent}
                      setblogContent={setblogContent}
                      blogContent1={blogContent1}
                      setblogContent1={setblogContent1}
                      selectedProducts={selectedProducts}
                      setSelectedProducts={setSelectedProducts}
                      blogImage={blogImage}
                      setblogimage={setblogimage}
                      blogImageAlt={blogImageAlt}
                      setblogimagealt={setblogimagealt}
                      blogThumbnailImage={blogThumbnailImage}
                      setblogthumnailimage={setblogthumnailimage}
                      blogThumbnailImageAlt={blogThumbnailImageAlt}
                      setblogthumnailimageAlt={setblogthumnailimageAlt}
                      config={config}
                      editor={editor}
                      editor1={editor1}
                      handleBlogImage={handleBlogImage}
                      handleBlogThumnailImage={handleBlogThumnailImage}
                    />
                    <div className="flex justify-center">
                      <button
                        type="button"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                        onClick={saveContentStep}
                      >
                        Save &amp; continue to SEO
                      </button>
                    </div>
                  </Tab.Panel>

                  <Tab.Panel className="space-y-5" unmount={false}>
                    <SeoMetaSection
                      blogMetaTitle={blogMetaTitle}
                      setblogMetaTitle={setblogMetaTitle}
                      blogMetaDescription={blogMetaDescription}
                      setblogMetaDescription={setblogMetaDescription}
                      blogMetaImage={blogMetaImage}
                      handleMetaImage={handleMetaImage}
                      blogMetaImageAlt={blogMetaImageAlt}
                      setblogMetaImageAlt={setblogMetaImageAlt}
                      blogMetakeywords={blogMetakeywords}
                      setblogMetakeywords={setblogMetakeywords}
                      metaSchemas={metaSchemas}
                      handleAddSchema={handleAddSchema}
                      handleSchemaChange={handleSchemaChange}
                      handleRemoveSchema={handleRemoveSchema}
                      publishedDate={publishedDate}
                      setPublishedDate={setPublishedDate}
                    />
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                        onClick={saveSeoStep}
                      >
                        Save &amp; continue to category
                      </button>
                    </div>
                  </Tab.Panel>

                  <Tab.Panel className="space-y-5" unmount={false}>
                    <BlogCategoryTagSection
                      blogCategory={blogCategory}
                      setblogCategory={setblogCategory}
                      categories={categories}
                      blogTagInput={blogTagInput}
                      setBlogTagInput={setBlogTagInput}
                      blogTags={blogTags}
                      setBlogTags={setBlogTags}
                      featured={featured}
                      setFeatured={setFeatured}
                    />
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sticky bottom-0 z-10 bg-white p-2 border border-gray-200 rounded-md">
                      <button
                        type="button"
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                        onClick={() => saveCategoryStep(false)}
                      >
                        Save as draft
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                        onClick={() => saveCategoryStep(true)}
                      >
                        Publish
                      </button>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
