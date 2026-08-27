import { useState, useEffect, useRef, Fragment } from "react";
import { AlertCircle, Code2, CreditCard, Package, Plus, Pencil, RefreshCw, Trash2 } from "lucide-react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  reorderPackages,
  getBookingPageContent,
  patchBookingPageContent,
  getBookingSettings,
  syncPackagesToStripe,
} from "../service/bookingService";
import PackageModal from "./PackageModal";
import InlineWidgetModal from "./InlineWidgetModal";
import PackagesPreview from "./PackagesPreview";
import { getSelectableStripeAccounts } from "../../stripe/service/stripeSettingsService";
import { formatDurationLabel } from "../utils/durationDisplay";

const TYPE_COLORS = {
  service: "bg-blue-100 text-blue-800",
  consultation: "bg-purple-100 text-purple-800",
  studio: "bg-green-100 text-green-800",
  editing: "bg-amber-100 text-amber-800",
};

function normalizeInlineWidgets(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((w) => w && typeof w === "object")
    .map((w) => ({
      enabled: typeof w.enabled === "boolean" ? w.enabled : true,
      afterPackageCount:
        Number.isFinite(Number(w.afterPackageCount)) && Number(w.afterPackageCount) > 0
          ? Math.floor(Number(w.afterPackageCount))
          : 3,
      html: typeof w.html === "string" ? w.html : "",
      css: typeof w.css === "string" ? w.css : "",
    }));
}

function findStripeAccount(accounts, id) {
  if (!id) return null;
  return (accounts || []).find((a) => String(a._id) === String(id)) || null;
}

function findWidgetAt(widgets, afterPackageCount) {
  return (widgets || []).find(
    (w) => Number(w.afterPackageCount) === Number(afterPackageCount)
  );
}

export default function PackagesTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragNode = useRef(null);

  const [pageContent, setPageContent] = useState(null);
  const [inlineWidgets, setInlineWidgets] = useState([]);
  const [studioMicCapacity, setStudioMicCapacity] = useState(5);
  const [stripeAccounts, setStripeAccounts] = useState([]);
  const [syncingStripe, setSyncingStripe] = useState(false);
  const [widgetModal, setWidgetModal] = useState(null); // { afterPackageCount, widget? }
  const [widgetSaving, setWidgetSaving] = useState(false);
  const [widgetDeleteConfirm, setWidgetDeleteConfirm] = useState(null);

  useEffect(() => {
    loadAll();
  }, [filterType]);

  const loadAll = async () => {
    setLoading(true);
    setProgress(30);
    const params = filterType ? { type: filterType } : {};
    const [pkgData, contentData, settingsData, stripeData] = await Promise.all([
      getPackages(params),
      getBookingPageContent(),
      getBookingSettings(),
      getSelectableStripeAccounts(),
    ]);
    if (pkgData?.packages) {
      setPackages(pkgData.packages);
    }
    if (contentData?.content) {
      setPageContent(contentData.content);
      setInlineWidgets(normalizeInlineWidgets(contentData.content.inlineWidgets));
    }
    if (settingsData?.settings) {
      setStudioMicCapacity(Number(settingsData.settings.studioMicCapacity) || 5);
    }
    if (stripeData?.data) {
      setStripeAccounts(stripeData.data);
    }
    setLoading(false);
    setProgress(100);
  };

  const loadPackages = async () => {
    setProgress(30);
    const params = filterType ? { type: filterType } : {};
    const data = await getPackages(params);
    if (data?.packages) {
      setPackages(data.packages);
    }
    setProgress(100);
  };

  const persistInlineWidgets = async (nextWidgets) => {
    setWidgetSaving(true);
    setProgress(50);
    // Always merge onto latest content so we don't wipe hero / footer widget.
    const latest = await getBookingPageContent();
    const base = latest?.content || pageContent || {};
    const saved = await patchBookingPageContent({
      ...base,
      inlineWidgets: nextWidgets,
    });
    setWidgetSaving(false);
    setProgress(100);
    if (saved?.content) {
      setPageContent(saved.content);
      setInlineWidgets(normalizeInlineWidgets(saved.content.inlineWidgets));
      return true;
    }
    return false;
  };

  const handleCreate = () => {
    setEditPackage(null);
    setModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditPackage(pkg);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    const result = editPackage
      ? await updatePackage(editPackage._id, formData)
      : await createPackage(formData);

    // The service already toasted the reason. Keep the modal open so the
    // admin's work survives a validation / network failure.
    if (!result) return;

    setModalOpen(false);
    loadPackages();
  };

  const handleSyncStripe = async () => {
    setSyncingStripe(true);
    setProgress(40);
    await syncPackagesToStripe();
    setSyncingStripe(false);
    setProgress(100);
    loadPackages();
  };

  const handleDelete = async (id) => {
    await deletePackage(id);
    setDeleteConfirm(null);
    loadPackages();
  };

  const openAddWidget = (afterPackageCount) => {
    setWidgetModal({
      afterPackageCount,
      widget: findWidgetAt(inlineWidgets, afterPackageCount) || null,
    });
  };

  const handleSaveWidget = async (widgetData) => {
    const count = Number(widgetData.afterPackageCount) || 3;
    const without = inlineWidgets.filter(
      (w) => Number(w.afterPackageCount) !== count
    );
    const next = [...without, { ...widgetData, afterPackageCount: count }].sort(
      (a, b) => a.afterPackageCount - b.afterPackageCount
    );
    const ok = await persistInlineWidgets(next);
    if (ok) setWidgetModal(null);
  };

  const handleDeleteWidget = async (afterPackageCount) => {
    const next = inlineWidgets.filter(
      (w) => Number(w.afterPackageCount) !== Number(afterPackageCount)
    );
    const ok = await persistInlineWidgets(next);
    if (ok) setWidgetDeleteConfirm(null);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    dragNode.current = e.target;
    e.target.style.opacity = "0.5";
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = "1";
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newPackages = [...packages];
      const [draggedItem] = newPackages.splice(draggedIndex, 1);
      newPackages.splice(dragOverIndex, 0, draggedItem);
      setPackages(newPackages);

      let orderedIds = newPackages.map((pkg) => pkg._id);

      // The server rewrites sortOrder as 0..n-1 over whatever ids it is sent.
      // Under a type filter that would renumber only the visible packages and
      // collide with the hidden ones, so rebuild the FULL order: hidden
      // packages keep their slots, visible ones shuffle within their own.
      if (filterType) {
        const all = await getPackages();
        const allIds = (all?.packages || []).map((pkg) => pkg._id);
        if (allIds.length > 0) {
          const visible = new Set(orderedIds);
          const queue = [...orderedIds];
          orderedIds = allIds.map((id) => (visible.has(id) ? queue.shift() : id));
        }
      }

      const saved = await reorderPackages(orderedIds);
      // Optimistic order was wrong if the save failed — fall back to server truth.
      if (!saved) loadPackages();
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNode.current = null;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  /** Slots after every completed row of 3 packages (3, 6, 9…). */
  const widgetSlotCounts = [];
  for (let n = 3; n <= packages.length; n += 3) {
    widgetSlotCounts.push(n);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="service">Service</option>
            <option value="consultation">Consultation</option>
            <option value="studio">Studio</option>
            <option value="editing">Editing</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSyncStripe}
          disabled={syncingStripe}
          title="Re-create every package in the Stripe product catalog"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={syncingStripe ? "animate-spin" : ""} />
          {syncingStripe ? "Syncing…" : "Sync to Stripe"}
        </button>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Package
        </button>
        </div>
      </div>

      {packages.length > 1 && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          Drag rows to reorder packages. After every 3 packages you can add an HTML/CSS widget for the booking page.
        </p>
      )}

      {/* Packages Table with widget slots after every 3 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new package.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <span className="sr-only">Drag</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg, index) => {
                const afterCount = index + 1;
                const showWidgetSlot = afterCount % 3 === 0;
                const existingWidget = showWidgetSlot
                  ? findWidgetAt(inlineWidgets, afterCount)
                  : null;

                return (
                  <Fragment key={pkg._id}>
                    <tr
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      className={`hover:bg-gray-50 cursor-move transition-all ${
                        dragOverIndex === index
                          ? "bg-primary/10 border-t-2 border-primary"
                          : ""
                      } ${draggedIndex === index ? "opacity-50" : ""}`}
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {pkg.image && (
                            <img
                              src={pkg.image}
                              alt={pkg.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pkg.name}
                            </div>
                            {pkg.highlightBadgeEnabled ? (
                              <div className="mt-1 inline-flex items-center rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-900">
                                Badge: {pkg.highlightBadgeText || "Most Popular"}
                              </div>
                            ) : null}
                            {pkg.stripeSyncError ? (
                              <div
                                className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-900"
                                title={pkg.stripeSyncError}
                              >
                                <AlertCircle size={11} />
                                Stripe sync failed
                              </div>
                            ) : pkg.stripeProductId ? (
                              <div
                                className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900"
                                title={`Stripe product ${pkg.stripeProductId}`}
                              >
                                <Package size={11} />
                                In Stripe catalog
                              </div>
                            ) : (
                              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                <Package size={11} />
                                Not in Stripe
                              </div>
                            )}
                            {pkg.stripeAccountId ? (
                              <div
                                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  findStripeAccount(stripeAccounts, pkg.stripeAccountId)
                                    ?.usableInActiveMode === false
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-indigo-100 text-indigo-900"
                                }`}
                                title="Payments for this package go to this Stripe account"
                              >
                                <CreditCard size={11} />
                                {findStripeAccount(stripeAccounts, pkg.stripeAccountId)?.label ||
                                  "Unknown Stripe account"}
                              </div>
                            ) : null}
                            {pkg.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {pkg.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[pkg.type]}`}
                        >
                          {pkg.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDurationLabel(
                          pkg.durationMinutes,
                          pkg.durationDisplayUnit
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        £{pkg.price.toFixed(2)}
                        <div className="text-xs font-normal text-gray-500">
                          {pkg.pricingMode === 'fixed' ? 'static price' : 'per hour'}
                          {Number(pkg.maxHours) > 0
                            ? ` · max ${Number(pkg.maxHours)} hr${Number(pkg.maxHours) === 1 ? '' : 's'}`
                            : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pkg.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="text-primary hover:text-secondary mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(pkg._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {showWidgetSlot ? (
                      <tr className="bg-violet-50/70">
                        <td colSpan={7} className="px-4 py-3">
                          {existingWidget ? (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-200 bg-white px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <Code2 className="text-violet-600 shrink-0" size={18} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    HTML / CSS widget after {afterCount} packages
                                    {!existingWidget.enabled ? (
                                      <span className="ml-2 text-xs font-normal text-gray-400">
                                        (disabled)
                                      </span>
                                    ) : null}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-xl">
                                    {existingWidget.html?.trim()
                                      ? existingWidget.html.replace(/\s+/g, " ").slice(0, 80)
                                      : "No HTML yet"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openAddWidget(afterCount)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Pencil size={14} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setWidgetDeleteConfirm(afterCount)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAddWidget(afterCount)}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-violet-300 bg-white/80 px-4 py-3 text-sm font-medium text-violet-700 hover:bg-violet-100/60 hover:border-violet-400 transition-colors"
                            >
                              <Plus size={16} />
                              Add Widget (HTML / CSS) — after {afterCount} packages
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && packages.length > 0 && packages.length < 3 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
          Add at least 3 packages to unlock the first “Add Widget” slot (shown after every
          row of 3).
        </p>
      ) : null}

      {/* Orphan widgets (saved for rows beyond current package count) */}
      {!loading &&
        inlineWidgets.some(
          (w) => !widgetSlotCounts.includes(Number(w.afterPackageCount))
        ) && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-sm font-medium text-gray-900">
              Other saved row widgets
            </p>
            <p className="text-xs text-gray-500">
              These are saved for package counts that don’t match a full row right now
              (e.g. after reordering or deleting packages).
            </p>
            {inlineWidgets
              .filter((w) => !widgetSlotCounts.includes(Number(w.afterPackageCount)))
              .map((w) => (
                <div
                  key={`orphan-${w.afterPackageCount}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                >
                  <span className="text-sm text-gray-700">
                    After {w.afterPackageCount} packages
                    {!w.enabled ? " (disabled)" : ""}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openAddWidget(w.afterPackageCount)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setWidgetDeleteConfirm(w.afterPackageCount)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

      <PackagesPreview
        packages={packages}
        inlineWidgets={inlineWidgets}
        services={pageContent?.services}
        studioMicCapacity={studioMicCapacity}
        loading={loading}
      />

      <PackageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editPackage={editPackage}
      />

      <InlineWidgetModal
        isOpen={!!widgetModal}
        onClose={() => setWidgetModal(null)}
        onSave={handleSaveWidget}
        afterPackageCount={widgetModal?.afterPackageCount || 3}
        initialWidget={widgetModal?.widget || null}
        saving={widgetSaving}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Package</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this package? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {widgetDeleteConfirm != null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setWidgetDeleteConfirm(null)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Widget</h3>
              <p className="text-sm text-gray-500 mb-6">
                Remove the HTML/CSS widget after {widgetDeleteConfirm} packages?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setWidgetDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteWidget(widgetDeleteConfirm)}
                  disabled={widgetSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {widgetSaving ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
