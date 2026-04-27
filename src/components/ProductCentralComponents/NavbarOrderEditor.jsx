import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";
import Select from "react-select";

const DND_INDEX_MIME = "application/x-navbar-order-index";

function normalizeProductCategories(res) {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d.productCategories)) return d.productCategories;
  if (Array.isArray(d.data)) return d.data;
  return [];
}

function normalizeNavbarRows(res) {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d.data)) return d.data;
  if (Array.isArray(d)) return d;
  return [];
}

/** Stable string for Mongo-style ids from JSON (string, { $oid }, or ObjectId-like). */
function mongoIdToString(id) {
  if (id == null) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    if (id.$oid != null) return String(id.$oid);
    if (typeof id.toString === "function") {
      const s = id.toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return String(id);
}

/**
 * Must be unique per row in this list. Namespace by kind so a Navbar doc _id
 * can never collide with a ProductCategory _id (both are 24-char hex).
 */
function dndRowIdForCategory(categoryId) {
  const id = mongoIdToString(categoryId);
  return `cat-${id || "x"}`;
}

function dndRowIdForCustomNavbarDoc(navbarDocId) {
  const id = mongoIdToString(navbarDocId);
  return `cust-${id || "x"}`;
}

function dndRowIdForNewCustom() {
  return `newcust-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function mapApiRowToNavRow(row) {
  if (row.itemType === "custom") {
    const nid = mongoIdToString(row._id);
    return {
      dndRowId: dndRowIdForCustomNavbarDoc(row._id),
      itemType: "custom",
      label: row.label || "",
      path: row.path || "",
      order: row.order,
      navbarDocId: nid,
    };
  }
  const cid = mongoIdToString(row._id);
  return {
    dndRowId: dndRowIdForCategory(row._id),
    itemType: "category",
    _id: cid,
    name: row.name || "",
    subCategory: row.subCategory || [],
    isPublish: row.isPublish,
    isFeatured: row.isFeatured,
    Logo: row.Logo,
    bannerImage: row.bannerImage,
    order: row.order,
  };
}

export default function NavbarOrderEditor() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [navRows, setNavRows] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [customLabel, setCustomLabel] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragFromIndexRef = useRef(null);
  const [supportPhone, setSupportPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);

  const adminJsonHeaders = {
    "x-user-role": "admin",
    "Content-Type": "application/json",
  };

  const apiBase = () =>
    (auth.ip || "").endsWith("/") ? auth.ip : `${auth.ip || ""}/`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const base = apiBase();
    if (!base || base === "/") {
      setLoadError("Backend URL is not configured (VITE_BACKEND_URL).");
      setLoading(false);
      return;
    }

    Promise.all([
      axios.get(`${base}get/category/for/navbar`),
      axios.get(`${base}get/product/category`),
      axios.get(`${base}navbar-header`, { headers: adminJsonHeaders }).catch(() => ({
        data: { success: false },
      })),
    ])
      .then(([navRes, allRes, phoneRes]) => {
        if (cancelled) return;
        if (phoneRes?.data?.success && phoneRes.data.data != null) {
          setSupportPhone(String(phoneRes.data.data.supportPhone ?? ""));
        }
        const nav = normalizeNavbarRows(navRes);
        const all = normalizeProductCategories(allRes);
        const statusOk =
          allRes.data?.status === 201 ||
          allRes.data?.status === 200 ||
          all.length > 0;

        if (!statusOk && allRes.data?.message) {
          toast.error(allRes.data.message);
        }

        const selected = nav
          .map(mapApiRowToNavRow)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const selectedCategoryIds = new Set(
          selected
            .filter((r) => r.itemType === "category")
            .map((r) => String(r._id))
        );
        const available = all
          .filter((c) => c && c._id && !selectedCategoryIds.has(String(c._id)))
          .map((category) => ({
            label: category.name,
            value: category._id,
            fullData: category,
          }));
        setNavRows(selected);
        setAvailableCategories(available);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to load data";
          setLoadError(msg);
          toast.error("Failed to load navbar items");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.ip]);

  const handleSelectCategory = (selectedOption) => {
    if (!selectedOption) return;
    const isAlreadySelected = navRows.some(
      (row) =>
        row.itemType === "category" &&
        String(row._id) === String(selectedOption.value)
    );
    if (isAlreadySelected) {
      toast.error("This category is already added.");
      return;
    }
    const selectedCategory = availableCategories.find(
      (category) => category.label === selectedOption.label
    );
    if (!selectedCategory) return;
    const full = selectedCategory.fullData;
    setNavRows((prev) => [
      ...prev,
      {
        dndRowId: dndRowIdForCategory(full._id),
        itemType: "category",
        _id: String(full._id),
        name: full.name,
        subCategory: full.subCategory || [],
        isPublish: full.isPublish,
        isFeatured: full.isFeatured,
        Logo: full.Logo,
        bannerImage: full.bannerImage,
        order: prev.length + 1,
      },
    ]);
    setAvailableCategories(
      availableCategories.filter(
        (category) => category.label !== selectedOption.label
      )
    );
  };

  const handleAddCustom = () => {
    const label = customLabel.trim();
    const path = customPath.trim();
    if (!label) {
      toast.error("Enter a label for the custom link.");
      return;
    }
    if (!path) {
      toast.error("Enter a path or URL for the custom link.");
      return;
    }
    setNavRows((prev) => [
      ...prev,
      {
        dndRowId: dndRowIdForNewCustom(),
        itemType: "custom",
        label,
        path,
        navbarDocId: null,
      },
    ]);
    setCustomLabel("");
    setCustomPath("");
  };

  /** Native HTML5 DnD — reliable vs @hello-pangea/dnd in nested admin layouts. */
  const handleRowDragStart = (e, index) => {
    e.stopPropagation();
    dragFromIndexRef.current = index;
    const payload = String(index);
    try {
      e.dataTransfer.setData("text/plain", payload);
      e.dataTransfer.setData(DND_INDEX_MIME, payload);
    } catch {
      /* ignore setData restrictions in some environments */
    }
    e.dataTransfer.effectAllowed = "move";
  };

  const handleRowDragEnd = () => {
    dragFromIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleRowDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRowDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleRowDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleRowDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const plain = e.dataTransfer.getData("text/plain");
    const mime = e.dataTransfer.getData(DND_INDEX_MIME);
    const raw = plain || mime;
    let from = dragFromIndexRef.current;
    if (from == null && raw !== "") {
      from = parseInt(raw, 10);
    }

    if (from == null || Number.isNaN(from)) {
      dragFromIndexRef.current = null;
      return;
    }
    if (from === dropIndex) {
      dragFromIndexRef.current = null;
      return;
    }

    setNavRows((prev) => {
      const items = Array.from(prev);
      const [reorderedItem] = items.splice(from, 1);
      items.splice(dropIndex, 0, reorderedItem);
      return items.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
    dragFromIndexRef.current = null;
  };

  const handleDeleteRow = (row) => {
    if (row.itemType === "category") {
      setAvailableCategories((prev) => [
        ...prev,
        {
          label: row.name,
          value: row._id,
          fullData: {
            _id: row._id,
            name: row.name,
            subCategory: row.subCategory || [],
            isPublish: row.isPublish,
            isFeatured: row.isFeatured,
            Logo: row.Logo,
            bannerImage: row.bannerImage,
          },
        },
      ]);
    }
    setNavRows((prev) =>
      prev.filter((item) => item.dndRowId !== row.dndRowId).map((item, index) => ({
        ...item,
        order: index + 1,
      }))
    );
  };

  const handleSaveSupportPhone = () => {
    const trimmed = supportPhone.trim();
    setPhoneSaving(true);
    axios
      .post(
        `${apiBase()}navbar-header`,
        { supportPhone: trimmed },
        { headers: adminJsonHeaders }
      )
      .then((response) => {
        if (response.data?.success) {
          setSupportPhone(String(response.data.data?.supportPhone ?? ""));
          toast.success(response.data.message || "Header phone saved");
        } else {
          toast.error(
            response.data?.message || response.data?.error || "Save failed."
          );
        }
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to save phone."
        );
      })
      .finally(() => setPhoneSaving(false));
  };

  const handleSaveOrder = () => {
    const payload = navRows.map((r, i) => {
      const order = i + 1;
      if (r.itemType === "custom") {
        return {
          itemType: "custom",
          order,
          customLabel: r.label,
          customPath: r.path,
        };
      }
      return {
        itemType: "category",
        order,
        _id: r._id,
      };
    });
    setSaving(true);
    axios
      .post(`${apiBase()}create/category/for/navbar`, payload)
      .then((response) => {
        if (response.data.status === 201) {
          toast.success("Navbar order saved successfully!");
          navigate("/admin/product-central/categories");
        } else {
          toast.error(
            response.data.message || response.data.error || "Failed to save."
          );
        }
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Error saving order."
        );
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-md max-w-xl" />
          <div className="h-48 bg-gray-100 rounded-md" />
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">Loading…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6">
        <p className="text-sm text-red-800 mb-4">{loadError}</p>
        <Link
          to="/admin/product-central/categories"
          className="inline-flex rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
        >
          Back to categories
        </Link>
      </div>
    );
  }

  const categoryCount = navRows.filter((r) => r.itemType === "category").length;
  const customCount = navRows.filter((r) => r.itemType === "custom").length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Header help phone number
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Shown next to &quot;Need Help?&quot; on the storefront top bar (desktop).
          Leave blank to hide the number. Digits, spaces, and{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">+</code> are allowed.
        </p>
        <div className="flex flex-col gap-3 max-w-xl sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="navbar-support-phone"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Phone number
            </label>
            <input
              id="navbar-support-phone"
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="Optional — e.g. 0333 344 8541"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              autoComplete="tel"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveSupportPhone}
            disabled={phoneSaving}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 shrink-0"
          >
            {phoneSaving ? "Saving…" : "Save phone"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Add category to navbar
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Choose a category to append to the list. You can reorder rows below by
          dragging.
        </p>
        <div className="max-w-xl">
          <Select
            options={availableCategories}
            onChange={handleSelectCategory}
            placeholder="Select a category"
            className="text-sm"
            classNamePrefix="rs"
            isClearable
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Add custom link
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Internal paths like <code className="text-xs bg-gray-100 px-1 rounded">/deals-and-discounts</code> or full
          URLs (<code className="text-xs bg-gray-100 px-1 rounded">https://…</code>). Custom links share the same order
          list as categories.
        </p>
        <div className="flex flex-col gap-3 max-w-xl">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Label (shown in navbar)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="Path or URL"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="self-start rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Add custom link
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Navbar order ({navRows.length} items — {categoryCount} categories,{" "}
            {customCount} custom)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Drag the grip (⋮⋮) on the left to reorder. Order numbers update
            automatically. Click Save order when done.
          </p>
        </div>

        <div className="min-w-0 text-sm bg-white">
          <div
            className="grid grid-cols-[2.25rem_minmax(0,1fr)_4rem_8.5rem] gap-2 items-center border-b border-gray-200 px-3 py-3 font-semibold text-gray-900 sm:px-5"
            aria-hidden
          >
            <span className="sr-only">Drag</span>
            <span>Item</span>
            <span>Order</span>
            <span className="text-center">Actions</span>
          </div>
          <div className="divide-y divide-gray-100">
            {navRows.length === 0 ? (
              <div className="py-10 px-5 text-center text-gray-500">
                No items in the navbar yet. Add a category or a custom link
                above.
              </div>
            ) : (
              navRows.map((row, index) => (
                <div
                  key={row.dndRowId}
                  role="listitem"
                  onDragEnter={handleRowDragEnter}
                  onDragOver={(e) => handleRowDragOver(e, index)}
                  onDragLeave={handleRowDragLeave}
                  onDrop={(e) => handleRowDrop(e, index)}
                  className={`grid grid-cols-[2.25rem_minmax(0,1fr)_4rem_8.5rem] gap-2 items-center px-3 py-3 sm:px-5 hover:bg-gray-50/80 transition-shadow ${
                    dragOverIndex === index
                      ? "bg-violet-50/80 ring-2 ring-inset ring-violet-400"
                      : ""
                  }`}
                >
                  <div
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, index)}
                    onDragEnd={handleRowDragEnd}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 cursor-grab active:cursor-grabbing select-none"
                    aria-label="Drag to reorder"
                    title="Drag to reorder"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") e.preventDefault();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 pointer-events-none"
                      aria-hidden
                    >
                      <path d="M7 4h2v2H7V4zm0 5h2v2H7V9zm0 5h2v2H7v-2zm4-10h2v2h-2V4zm0 5h2v2h-2V9zm0 5h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-gray-800">
                    {row.itemType === "custom" ? (
                      <div>
                        <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 mr-2">
                          Custom
                        </span>
                        <span className="font-medium">{row.label}</span>
                        <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                          {row.path}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 mr-2">
                          Category
                        </span>
                        <span className="font-medium">{row.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-gray-600 tabular-nums">
                    {row.order ?? index + 1}
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row)}
                      className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Remove
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Link
          to="/admin/product-central/categories"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save order"}
        </button>
      </div>
    </div>
  );
}
