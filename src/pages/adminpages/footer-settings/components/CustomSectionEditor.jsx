import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

const PLACEMENT_OPTIONS = [
  { value: "after_logo", label: "After Logo & Social Media" },
  { value: "after_useful_links", label: "After Useful Links" },
  { value: "after_customer_care", label: "After Customer Care" },
  { value: "after_newsletter", label: "After Newsletter" },
];

const createEmptySection = (order = 0) => ({
  isEnabled: true,
  title: "Custom Links",
  placement: "after_useful_links",
  order,
  links: [],
});

/** Accept legacy single object or array from API. */
function normalizeIncoming(data) {
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      isEnabled: item?.isEnabled === true,
      title: item?.title || "Custom Links",
      placement: item?.placement || "after_useful_links",
      order: typeof item?.order === "number" ? item.order : index,
      links: Array.isArray(item?.links) ? item.links : [],
    }));
  }
  if (data && typeof data === "object") {
    const hasContent =
      data.isEnabled === true ||
      Boolean(String(data.title || "").trim()) ||
      (Array.isArray(data.links) && data.links.length > 0);
    if (hasContent) {
      return [
        {
          isEnabled: data.isEnabled === true,
          title: data.title || "Custom Links",
          placement: data.placement || "after_useful_links",
          order: 0,
          links: Array.isArray(data.links) ? data.links : [],
        },
      ];
    }
  }
  return [];
}

const CustomSectionEditor = ({ data, onSave, isSaving }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    setSections(normalizeIncoming(data));
  }, [data]);

  const updateSection = (sectionIndex, patch) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex ? { ...section, ...patch } : section
      )
    );
  };

  const handleAddSection = () => {
    setSections((prev) => [...prev, createEmptySection(prev.length)]);
  };

  const handleRemoveSection = (sectionIndex) => {
    setSections((prev) =>
      prev
        .filter((_, i) => i !== sectionIndex)
        .map((section, i) => ({ ...section, order: i }))
    );
  };

  const handleMoveSection = (sectionIndex, direction) => {
    const newIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const next = [...sections];
    [next[sectionIndex], next[newIndex]] = [next[newIndex], next[sectionIndex]];
    setSections(next.map((section, i) => ({ ...section, order: i })));
  };

  const handleAddLink = (sectionIndex) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          links: [
            ...section.links,
            {
              text: "",
              link: "",
              isActive: true,
              order: section.links.length,
            },
          ],
        };
      })
    );
  };

  const handleRemoveLink = (sectionIndex, linkIndex) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          links: section.links
            .filter((_, li) => li !== linkIndex)
            .map((link, li) => ({ ...link, order: li })),
        };
      })
    );
  };

  const handleLinkChange = (sectionIndex, linkIndex, field, value) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          links: section.links.map((link, li) =>
            li === linkIndex ? { ...link, [field]: value } : link
          ),
        };
      })
    );
  };

  const handleMoveLink = (sectionIndex, linkIndex, direction) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== sectionIndex) return section;
        const newIndex = direction === "up" ? linkIndex - 1 : linkIndex + 1;
        if (newIndex < 0 || newIndex >= section.links.length) return section;
        const links = [...section.links];
        [links[linkIndex], links[newIndex]] = [links[newIndex], links[linkIndex]];
        return {
          ...section,
          links: links.map((link, li) => ({ ...link, order: li })),
        };
      })
    );
  };

  const handleSave = () => {
    const payload = sections.map((section, index) => ({
      isEnabled: section.isEnabled === true,
      title: (section.title || "").trim(),
      placement: section.placement || "after_useful_links",
      order: index,
      links: (section.links || []).map((link, linkIndex) => ({
        ...link,
        order: linkIndex,
      })),
    }));
    onSave({ sections: payload });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Custom Sections
          </h2>
          <p className="text-gray-600 text-sm">
            Add multiple link columns (same style as Useful Links). Each section
            can be placed after Logo, Useful Links, Customer Care, or Newsletter;
            other columns shift to make room.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddSection}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <FaPlus /> Add Custom Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            No custom sections yet. Add one to create an extra footer column.
          </p>
          <button
            type="button"
            onClick={handleAddSection}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <FaPlus /> Add Custom Section
          </button>
        </div>
      )}

      <div className="space-y-8 mb-8">
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="rounded-lg border border-gray-300 bg-gray-50 p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Custom Section #{sectionIndex + 1}
                {section.title?.trim() ? (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({section.title.trim()})
                  </span>
                ) : null}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveSection(sectionIndex, "up")}
                  disabled={sectionIndex === 0}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  title="Move section up"
                >
                  <FaArrowUp />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveSection(sectionIndex, "down")}
                  disabled={sectionIndex === sections.length - 1}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  title="Move section down"
                >
                  <FaArrowDown />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSection(sectionIndex)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete section"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-md border border-gray-200 bg-white p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.isEnabled === true}
                  onChange={(e) =>
                    updateSection(sectionIndex, { isEnabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-medium text-gray-800">
                  Enable on storefront
                </span>
              </label>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) =>
                    updateSection(sectionIndex, { title: e.target.value })
                  }
                  placeholder="e.g., Quick Links"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Place after
                </label>
                <select
                  value={section.placement}
                  onChange={(e) =>
                    updateSection(sectionIndex, { placement: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Links</h4>
                <button
                  type="button"
                  onClick={() => handleAddLink(sectionIndex)}
                  className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-secondary"
                >
                  <FaPlus /> Add Link
                </button>
              </div>

              {section.links.length === 0 && (
                <p className="rounded-md border border-dashed border-gray-300 bg-white p-3 text-center text-sm text-gray-500">
                  No links in this section yet.
                </p>
              )}

              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <div
                    key={linkIndex}
                    className="rounded-md border border-gray-200 bg-white p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Link #{linkIndex + 1}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleMoveLink(sectionIndex, linkIndex, "up")
                          }
                          disabled={linkIndex === 0}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleMoveLink(sectionIndex, linkIndex, "down")
                          }
                          disabled={linkIndex === section.links.length - 1}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <FaArrowDown />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveLink(sectionIndex, linkIndex)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Link Text
                        </label>
                        <input
                          type="text"
                          value={link.text}
                          onChange={(e) =>
                            handleLinkChange(
                              sectionIndex,
                              linkIndex,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder="e.g., About Us"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Link URL
                        </label>
                        <input
                          type="text"
                          value={link.link}
                          onChange={(e) =>
                            handleLinkChange(
                              sectionIndex,
                              linkIndex,
                              "link",
                              e.target.value
                            )
                          }
                          placeholder="/about or https://..."
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={link.isActive !== false}
                            onChange={(e) =>
                              handleLinkChange(
                                sectionIndex,
                                linkIndex,
                                "isActive",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-primary focus:ring-primary/30"
                          />
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Custom Sections"}
        </button>
      </div>
    </div>
  );
};

export default CustomSectionEditor;
