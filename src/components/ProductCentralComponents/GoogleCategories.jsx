import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";

const EMPTY_FORM = {
  googleId: "",
  name: "",
  fullPath: "",
  pathLevels: "",
  level: 1,
  parentGoogleId: "",
  isLeaf: false,
  isActive: true,
  isFeatured: false,
  note: "",
};

export default function GoogleCategories() {
  const auth = useAuth();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [leafFilter, setLeafFilter] = useState("");
  const [sortBy, setSortBy] = useState("fullPath");
  const [sortDir, setSortDir] = useState("asc");

  // Counts banner
  const [counts, setCounts] = useState({ total: 0, active: 0, featured: 0, byLevel: [] });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  const debounceRef = useRef(null);

  const fetchCounts = useCallback(async () => {
    try {
      const r = await axios.get(`${auth.ip}get/google/categories/counts`);
      if (r.data?.status === 200) setCounts(r.data);
    } catch (e) {
      /* ignore */
    }
  }, [auth.ip]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortDir,
      };
      if (search) params.search = search;
      if (levelFilter !== "") params.level = levelFilter;
      if (activeFilter !== "") params.isActive = activeFilter;
      if (featuredFilter !== "") params.isFeatured = featuredFilter;
      if (leafFilter !== "") params.isLeaf = leafFilter;
      const r = await axios.get(`${auth.ip}get/google/categories`, { params });
      if (r.data?.status === 201) {
        setItems(r.data.googleCategories || []);
        setTotal(r.data.total || 0);
        setTotalPages(r.data.totalPages || 1);
      } else {
        toast.error(r.data?.message || "Failed to load");
      }
    } catch (e) {
      toast.error("Failed to load google categories");
    } finally {
      setIsLoading(false);
    }
  }, [auth.ip, page, limit, search, levelFilter, activeFilter, featuredFilter, leafFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Debounce search/filter changes -> reset to page 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchItems();
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, levelFilter, activeFilter, featuredFilter, leafFilter, sortBy, sortDir, limit]);

  // Page change -> fetch
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      googleId: row.googleId,
      name: row.name || "",
      fullPath: row.fullPath || "",
      pathLevels: (row.pathLevels || []).join(" > "),
      level: row.level || 1,
      parentGoogleId: row.parentGoogleId ?? "",
      isLeaf: !!row.isLeaf,
      isActive: !!row.isActive,
      isFeatured: !!row.isFeatured,
      note: row.note || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.fullPath.trim()) {
      toast.error("Name and Full Path are required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        pathLevels: form.pathLevels
          ? form.pathLevels.split(">").map((s) => s.trim()).filter(Boolean)
          : [],
        parentGoogleId: form.parentGoogleId === "" ? null : form.parentGoogleId,
      };
      if (editingId) {
        const r = await axios.patch(`${auth.ip}update/google/category/${editingId}`, payload);
        if (r.data?.status === 200) {
          toast.success("Updated");
          closeModal();
          fetchItems();
        } else toast.error(r.data?.message || "Update failed");
      } else {
        if (payload.googleId === "" || payload.googleId === null) {
          toast.error("googleId is required for new entries");
          setIsSaving(false);
          return;
        }
        const r = await axios.post(`${auth.ip}create/google/category`, payload);
        if (r.data?.status === 201) {
          toast.success("Created");
          closeModal();
          fetchItems();
          fetchCounts();
        } else toast.error(r.data?.message || "Create failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (row) => {
    try {
      const r = await axios.patch(`${auth.ip}status/google/category/${row._id}`);
      if (r.data?.status === 200) {
        setItems((prev) => prev.map((x) => (x._id === row._id ? r.data.googleCategory : x)));
        fetchCounts();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const toggleFeatured = async (row) => {
    try {
      const r = await axios.patch(`${auth.ip}feature/google/category/${row._id}`);
      if (r.data?.status === 200) {
        setItems((prev) => prev.map((x) => (x._id === row._id ? r.data.googleCategory : x)));
        fetchCounts();
      }
    } catch {
      toast.error("Failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const r = await axios.delete(`${auth.ip}delete/google/category/${deleteId}`);
      if (r.data?.status === 200) {
        toast.success("Deleted");
        setDeleteId(null);
        fetchItems();
        fetchCounts();
      } else toast.error(r.data?.message || "Delete failed");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      {/* Counts banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total" value={counts.total} tone="bg-blue-50 text-blue-700" />
        <StatCard label="Active" value={counts.active} tone="bg-emerald-50 text-emerald-700" />
        <StatCard label="Featured" value={counts.featured} tone="bg-amber-50 text-amber-700" />
        <StatCard label="Top-Level" value={(counts.byLevel?.find?.((b) => b._id === 1)?.count) || 0} tone="bg-violet-50 text-violet-700" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or full path…"
          className="flex-1 min-w-[240px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-2 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All levels</option>
          {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
            <option key={lvl} value={lvl}>Level {lvl}</option>
          ))}
        </select>
        <select
          value={leafFilter}
          onChange={(e) => setLeafFilter(e.target.value)}
          className="px-2 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Leaf / Branch</option>
          <option value="true">Leaf only</option>
          <option value="false">Branch only</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-2 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="px-2 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All featured</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>
        <select
          value={`${sortBy}:${sortDir}`}
          onChange={(e) => {
            const [s, d] = e.target.value.split(":");
            setSortBy(s);
            setSortDir(d);
          }}
          className="px-2 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="fullPath:asc">Path A→Z</option>
          <option value="fullPath:desc">Path Z→A</option>
          <option value="name:asc">Name A→Z</option>
          <option value="name:desc">Name Z→A</option>
          <option value="googleId:asc">GoogleID asc</option>
          <option value="googleId:desc">GoogleID desc</option>
          <option value="level:asc">Level asc</option>
        </select>
        <button
          onClick={openCreate}
          className="px-3 py-2 rounded-md text-sm bg-emerald-600 text-white hover:bg-emerald-700"
        >
          + New
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Google ID</Th>
              <Th>Name</Th>
              <Th>Full Path</Th>
              <Th>Level</Th>
              <Th>Leaf</Th>
              <Th>Active</Th>
              <Th>Featured</Th>
              <Th className="text-right pr-4">Actions</Th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  No categories match the filters
                </td>
              </tr>
            )}
            {!isLoading &&
              items.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{row.googleId}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{row.name}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-[420px]" title={row.fullPath}>
                    {row.fullPath}
                  </td>
                  <td className="px-3 py-2">{row.level}</td>
                  <td className="px-3 py-2">
                    <Pill ok={row.isLeaf} okLabel="Leaf" notLabel="Branch" />
                  </td>
                  <td className="px-3 py-2">
                    <ToggleSwitch checked={row.isActive} onClick={() => toggleActive(row)} />
                  </td>
                  <td className="px-3 py-2">
                    <ToggleSwitch checked={row.isFeatured} onClick={() => toggleFeatured(row)} tone="amber" />
                  </td>
                  <td className="px-3 py-2 text-right pr-4 whitespace-nowrap">
                    <button
                      onClick={() => openEdit(row)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(row._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm">
        <div className="text-gray-500">
          Showing page <b>{page}</b> of <b>{totalPages}</b> · {total} total
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-md"
          >
            {[20, 50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 border rounded-md disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 border rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Google Category" : "Create Google Category"}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <form onSubmit={submitForm} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Google ID" required>
                  <input
                    type="number"
                    value={form.googleId}
                    onChange={(e) => setForm({ ...form, googleId: e.target.value })}
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </Field>
                <Field label="Level" required>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </Field>
              </div>
              <Field label="Name (leaf)" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </Field>
              <Field label="Full Path (use ' > ' between levels)" required>
                <input
                  type="text"
                  value={form.fullPath}
                  onChange={(e) => setForm({ ...form, fullPath: e.target.value })}
                  placeholder="Apparel & Accessories > Clothing > Shirts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </Field>
              <Field label="Path Levels (auto-derived if blank — separate with ' > ')">
                <input
                  type="text"
                  value={form.pathLevels}
                  onChange={(e) => setForm({ ...form, pathLevels: e.target.value })}
                  placeholder="Apparel & Accessories > Clothing > Shirts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Parent Google ID (optional)">
                  <input
                    type="number"
                    value={form.parentGoogleId}
                    onChange={(e) => setForm({ ...form, parentGoogleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </Field>
                <Field label="Note">
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Checkbox label="Leaf" checked={form.isLeaf} onChange={(v) => setForm({ ...form, isLeaf: v })} />
                <Checkbox label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
                <Checkbox label="Featured" checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : editingId ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold mb-2">Delete category?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove this Google category. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${tone}`}>
      <div className="text-xs">{label}</div>
      <div className="text-2xl font-bold">{value ?? 0}</div>
    </div>
  );
}

function Pill({ ok, okLabel, notLabel }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {ok ? okLabel : notLabel}
    </span>
  );
}

function ToggleSwitch({ checked, onClick, tone = "emerald" }) {
  const on = tone === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? on : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      {label}
    </label>
  );
}
