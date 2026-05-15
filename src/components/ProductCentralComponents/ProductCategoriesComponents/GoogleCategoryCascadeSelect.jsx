import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

const LEVEL_LABELS = [
  "Main category",
  "Sub category",
  "Sub-sub category",
  "Category level 4",
  "Category level 5",
  "Category level 6",
  "Category level 7",
];

function levelLabel(index) {
  return LEVEL_LABELS[index] || `Category level ${index + 1}`;
}

function selectionFromPath(path) {
  if (!path?.length) return null;
  const leaf = path[path.length - 1];
  return {
    googleCategoryId: leaf.googleId,
    googleCategoryName: leaf.name,
    googleCategoryFullPath: leaf.fullPath,
    isLeaf: leaf.isLeaf,
    path,
  };
}

/**
 * Cascading Google taxonomy picker: top-level → children → … until leaf or no children.
 * Uses parentGoogleId so parent names are not repeated in child dropdowns.
 */
export default function GoogleCategoryCascadeSelect({
  apiBase,
  onChange,
  disabled = false,
  initialGoogleCategoryId = null,
}) {
  const [levels, setLevels] = useState([{ loading: true, options: [] }]);
  const [selections, setSelections] = useState([]);
  const [error, setError] = useState("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emitSelection = useCallback((path) => {
    onChangeRef.current?.(selectionFromPath(path));
  }, []);

  const fetchChildren = useCallback(
    async (parentGoogleId) => {
      const res = await axios.get(
        `${apiBase}get/google/categories/children/${parentGoogleId}`,
        { params: { activeOnly: "1" } }
      );
      return res.data?.googleCategories || [];
    },
    [apiBase]
  );

  const fetchCategoryByGoogleId = useCallback(
    async (googleId) => {
      const res = await axios.get(
        `${apiBase}get/google/category/by-google-id/${googleId}`
      );
      return res.data?.googleCategory || null;
    },
    [apiBase]
  );

  const fetchTopLevel = useCallback(async () => {
    setError("");
    setLevels([{ loading: true, options: [] }]);
    setSelections([]);
    onChangeRef.current?.(null);
    try {
      const res = await axios.get(`${apiBase}get/google/categories/top-level`, {
        params: { activeOnly: "1" },
      });
      const options = res.data?.googleCategories || [];
      setLevels([{ loading: false, options }]);
    } catch (e) {
      console.error("Failed to load Google categories:", e);
      setError("Could not load Google categories.");
      setLevels([{ loading: false, options: [] }]);
    }
  }, [apiBase]);

  const hydrateFromGoogleId = useCallback(
    async (googleId) => {
      if (!googleId || !apiBase) {
        await fetchTopLevel();
        return;
      }

      setError("");
      setLevels([{ loading: true, options: [] }]);
      setSelections([]);

      try {
        const path = [];
        let current = await fetchCategoryByGoogleId(googleId);
        if (!current) {
          await fetchTopLevel();
          return;
        }

        while (current) {
          path.unshift(current);
          if (current.parentGoogleId == null) break;
          current = await fetchCategoryByGoogleId(current.parentGoogleId);
        }

        const topRes = await axios.get(`${apiBase}get/google/categories/top-level`, {
          params: { activeOnly: "1" },
        });
        const newLevels = [
          { loading: false, options: topRes.data?.googleCategories || [] },
        ];
        const newSelections = [path[0]];

        for (let i = 1; i < path.length; i++) {
          const children = await fetchChildren(path[i - 1].googleId);
          newLevels.push({ loading: false, options: children });
          newSelections.push(path[i]);
        }

        setLevels(newLevels);
        setSelections(newSelections);
        emitSelection(newSelections);
      } catch (e) {
        console.error("Failed to restore Google category selection:", e);
        setError("Could not restore saved Google category.");
        await fetchTopLevel();
      }
    },
    [apiBase, emitSelection, fetchCategoryByGoogleId, fetchChildren, fetchTopLevel]
  );

  useEffect(() => {
    if (!apiBase) return;
    if (initialGoogleCategoryId) {
      hydrateFromGoogleId(initialGoogleCategoryId);
    } else {
      fetchTopLevel();
    }
  }, [apiBase, initialGoogleCategoryId, fetchTopLevel, hydrateFromGoogleId]);

  const handleLevelChange = async (levelIndex, rawValue) => {
    if (disabled) return;

    if (!rawValue) {
      const trimmedPath = selections.slice(0, levelIndex);
      setSelections(trimmedPath);
      setLevels((prev) => prev.slice(0, levelIndex + 1));
      emitSelection(trimmedPath);
      return;
    }

    const selected = levels[levelIndex]?.options?.find(
      (c) => String(c.googleId) === String(rawValue)
    );
    if (!selected) return;

    const newPath = [...selections.slice(0, levelIndex), selected];
    setSelections(newPath);
    emitSelection(newPath);

    const baseLevels = levels.slice(0, levelIndex + 1);

    if (selected.isLeaf) {
      setLevels(baseLevels);
      return;
    }

    setLevels([...baseLevels, { loading: true, options: [] }]);

    try {
      const children = await fetchChildren(selected.googleId);
      if (children.length === 0) {
        setLevels(baseLevels);
        onChangeRef.current?.({
          googleCategoryId: selected.googleId,
          googleCategoryName: selected.name,
          googleCategoryFullPath: selected.fullPath,
          isLeaf: true,
          path: newPath,
        });
        return;
      }
      setLevels([...baseLevels, { loading: false, options: children }]);
    } catch (e) {
      console.error("Failed to load child categories:", e);
      setError("Could not load subcategories.");
      setLevels(baseLevels);
    }
  };

  const selectedPathText =
    selections.length > 0 ? selections.map((s) => s.name).join(" › ") : "";

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium text-gray-900">
          Google category
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={fetchTopLevel}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          Reset selection
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Pick the main category, then each sub-level. Only direct children appear in the
        next list (parent names are not repeated).
      </p>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {levels.map((level, index) => (
        <div key={`google-cat-level-${index}`}>
          <label className="block mb-1 text-xs font-medium text-gray-700">
            {levelLabel(index)}
          </label>
          <select
            disabled={disabled || level.loading}
            value={selections[index] ? String(selections[index].googleId) : ""}
            onChange={(e) => handleLevelChange(index, e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 disabled:opacity-60"
          >
            <option value="">
              {level.loading ? "Loading…" : `Select ${levelLabel(index).toLowerCase()}`}
            </option>
            {level.options.map((cat) => (
              <option key={cat.googleId} value={String(cat.googleId)}>
                {cat.name}
                {cat.isLeaf ? " (leaf)" : ""}
              </option>
            ))}
          </select>
        </div>
      ))}

      {selectedPathText ? (
        <p className="text-sm text-gray-700 rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
          <span className="font-medium text-gray-900">Selected: </span>
          {selectedPathText}
        </p>
      ) : null}
    </div>
  );
}
