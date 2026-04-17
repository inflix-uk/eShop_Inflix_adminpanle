"use client";

import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Grip, Trash2, ChevronUp, ChevronDown, Package, Pencil } from "lucide-react";
import ProductPickerModal from "./ProductPickerModal";

function normalizeContent(content) {
  if (!content || typeof content !== "object") {
    return {
      sectionTitle: "",
      productIds: [],
      selectedProductsMeta: [],
      productSource: "manual",
    };
  }
  const src = content.productSource;
  const productSource =
    src === "latest" || src === "featured" ? src : "manual";
  return {
    sectionTitle: content.sectionTitle != null ? String(content.sectionTitle) : "",
    productIds: Array.isArray(content.productIds) ? content.productIds : [],
    selectedProductsMeta: Array.isArray(content.selectedProductsMeta)
      ? content.selectedProductsMeta
      : [],
    productSource,
  };
}

export default function ProductsBlock({
  id,
  content,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const c = useMemo(() => normalizeContent(content), [content]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [localTitle, setLocalTitle] = useState(c.sectionTitle);

  useEffect(() => {
    setLocalTitle(c.sectionTitle);
  }, [c.sectionTitle]);

  const pushPatch = (patch) => {
    onChange(id, { ...c, ...patch });
  };

  const metaById = useMemo(() => {
    const m = {};
    (c.selectedProductsMeta || []).forEach((row) => {
      const k = row?._id != null ? String(row._id) : "";
      if (k) m[k] = row.name || k;
    });
    return m;
  }, [c.selectedProductsMeta]);

  const handleBlurTitle = () => {
    if (localTitle !== c.sectionTitle) {
      pushPatch({ sectionTitle: localTitle });
    }
  };

  const moveProduct = (index, dir) => {
    const ids = [...c.productIds];
    const meta = [...(c.selectedProductsMeta || [])];
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    [meta[index], meta[j]] = [meta[j], meta[index]];
    pushPatch({ productIds: ids, selectedProductsMeta: meta });
  };

  const removeProductAt = (index) => {
    const ids = c.productIds.filter((_, i) => i !== index);
    const meta = (c.selectedProductsMeta || []).filter((_, i) => i !== index);
    pushPatch({ productIds: ids, selectedProductsMeta: meta });
  };

  return (
    <div className="border-2 border-emerald-200 rounded-lg p-3 mb-4 bg-emerald-50/30">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Package size={16} className="text-emerald-700" />
          Product slider
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            className="p-1.5 text-gray-500 hover:bg-white rounded-md border border-transparent hover:border-gray-200"
            title="Move up"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            className="p-1.5 text-gray-500 hover:bg-white rounded-md border border-transparent hover:border-gray-200"
            title="Move down"
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
            title="Remove block"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Section title</label>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleBlurTitle}
            placeholder="e.g. Featured phones"
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 border-2 border-emerald-700 shadow-sm hover:bg-emerald-50 hover:border-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 mb-3"
      >
        <Pencil size={14} className="text-emerald-700 shrink-0" aria-hidden />
        Choose products
      </button>

      {c.productSource === "latest" ? (
        <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-2">
          <span className="font-medium">Latest products:</span> the live site will show the 6 newest
          in-stock products automatically.
        </p>
      ) : c.productSource === "featured" && c.productIds.length > 0 ? (
        <p className="text-xs text-gray-600 mb-1">
          <span className="font-medium text-gray-800">Featured selection</span> — order below is the
          slider order on the site.
        </p>
      ) : null}

      {c.productSource === "latest" ? null : c.productIds.length === 0 ? (
        <p className="text-xs text-gray-500">No products selected yet.</p>
      ) : (
        <ul className="space-y-1 border border-emerald-100 rounded-md bg-white/80 p-2">
          {c.productIds.map((pid, idx) => {
            const k = String(pid);
            const label = metaById[k] || k;
            return (
              <li
                key={`${k}-${idx}`}
                className="flex items-center gap-2 text-sm text-gray-800 py-1 border-b border-gray-100 last:border-0"
              >
                <Grip size={14} className="text-gray-400 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                  onClick={() => moveProduct(idx, -1)}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                  onClick={() => moveProduct(idx, 1)}
                  disabled={idx === c.productIds.length - 1}
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  onClick={() => removeProductAt(idx)}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialProductIds={c.productIds}
        initialMeta={c.selectedProductsMeta}
        initialProductSource={c.productSource}
        onApply={({ productIds, selectedProductsMeta, productSource }) => {
          pushPatch({
            productIds,
            selectedProductsMeta,
            productSource: productSource || "manual",
          });
        }}
      />
    </div>
  );
}

ProductsBlock.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
};
