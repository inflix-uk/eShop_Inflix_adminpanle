import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";

export default function HomepageNavLinksEditor() {
  const auth = useAuth();
  const [homeNavLinks, setHomeNavLinks] = useState([]);
  const [homeNavLinksLoading, setHomeNavLinksLoading] = useState(true);
  const [homeNavLinksSaving, setHomeNavLinksSaving] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState("");
  const [newNavPath, setNewNavPath] = useState("");

  const apiBase = () =>
    (auth.ip || "").endsWith("/") ? auth.ip : `${auth.ip || ""}/`;

  useEffect(() => {
    let cancelled = false;
    setHomeNavLinksLoading(true);
    axios
      .get(`${apiBase()}homepage-nav-links/public`)
      .then((res) => {
        if (cancelled) return;
        if (res.data?.success && Array.isArray(res.data.data?.links)) {
          setHomeNavLinks(res.data.data.links);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load storefront nav links");
      })
      .finally(() => {
        if (!cancelled) setHomeNavLinksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.ip]);

  const saveHomeNavLinks = () => {
    setHomeNavLinksSaving(true);
    axios
      .put(
        `${apiBase()}homepage-nav-links`,
        { links: homeNavLinks },
        {
          headers: {
            "x-user-role": "admin",
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data?.links)) {
          setHomeNavLinks(res.data.data.links);
          toast.success(res.data.message || "Links saved");
        } else {
          toast.error(res.data?.message || "Save failed");
        }
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to save storefront nav links"
        );
      })
      .finally(() => setHomeNavLinksSaving(false));
  };

  const addHomeNavLinkRow = () => {
    const label = newNavLabel.trim();
    const path = newNavPath.trim();
    if (!label || !path) {
      toast.error("Enter both display name and path");
      return;
    }
    setHomeNavLinks((prev) => [...prev, { label, path }]);
    setNewNavLabel("");
    setNewNavPath("");
  };

  const removeHomeNavLinkRow = (index) => {
    setHomeNavLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveHomeNavLink = (index, dir) => {
    setHomeNavLinks((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">
        Storefront nav links
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        These appear in the website navbar (with categories) and in the homepage
        quick-links row. Use a path starting with{" "}
        <code className="rounded bg-white px-1">/</code> (e.g.{" "}
        <code className="rounded bg-white px-1">/categories/Mobile-Phones</code>)
        or a full <code className="rounded bg-white px-1">https://</code> URL.
      </p>
      {homeNavLinksLoading ? (
        <p className="mt-3 text-sm text-gray-500">Loading links…</p>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {homeNavLinks.length === 0 ? (
              <p className="text-sm text-gray-500">No links yet. Add one below.</p>
            ) : (
              homeNavLinks.map((row, index) => (
                <div
                  key={`${row.path}-${index}`}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white p-3"
                >
                  <span className="min-w-[2rem] text-xs text-gray-400">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    className="min-w-[8rem] flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
                    value={row.label}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHomeNavLinks((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, label: v } : r
                        )
                      );
                    }}
                    placeholder="Display name"
                  />
                  <input
                    type="text"
                    className="min-w-[10rem] flex-[2] rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
                    value={row.path}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHomeNavLinks((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, path: v } : r
                        )
                      );
                    }}
                    placeholder="/path or https://..."
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveHomeNavLink(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHomeNavLink(index, 1)}
                      disabled={index === homeNavLinks.length - 1}
                      className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHomeNavLinkRow(index)}
                      className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-violet-200/80 pt-4">
            <div className="min-w-[8rem] flex-1">
              <label className="block text-xs font-medium text-gray-700">
                New display name
              </label>
              <input
                type="text"
                value={newNavLabel}
                onChange={(e) => setNewNavLabel(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                placeholder="e.g. Deals"
              />
            </div>
            <div className="min-w-[10rem] flex-[2]">
              <label className="block text-xs font-medium text-gray-700">
                Path or URL
              </label>
              <input
                type="text"
                value={newNavPath}
                onChange={(e) => setNewNavPath(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
                placeholder="/deals-and-discounts"
              />
            </div>
            <button
              type="button"
              onClick={addHomeNavLinkRow}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Add link
            </button>
            <button
              type="button"
              onClick={saveHomeNavLinks}
              disabled={homeNavLinksSaving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {homeNavLinksSaving ? "Saving…" : "Save to website"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
