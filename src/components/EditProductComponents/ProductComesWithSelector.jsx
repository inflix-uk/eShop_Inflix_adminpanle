import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";

// Import all icons (same as ProductComesWith.jsx)
import Adapter from "../../assets/Adapter";
import PowerCable from "../../assets/PowerCable";
import ProtectionBundle from "../../assets/ProtectionBundle";
import Tree from "../../assets/Tree";
import hdmiCable from "../../assets/hdmi-cable.png";
import powerCableNew from "../../assets/Pawer-cable.png";
import onexcontrollerImg from "../../assets/onexcontroller.png";
import twoxcontrollerImg from "../../assets/twoxcontroller.png";
import SimImg from "../../assets/sim.png";
import ScreenProtectorImg from "../../assets/screenprotector.png";
import BackCoverImg from "../../assets/backcover.png";
  
// Map icon IDs to their components/images
const ICON_MAP = {
  powerAdapter: { type: "component", component: Adapter, name: "Power Adapter" },
  chargingCable: { type: "component", component: PowerCable, name: "Charging Cable" },
  protectionBundle: { type: "component", component: ProtectionBundle, name: "Protection Bundle" },
  treePlanted: { type: "component", component: Tree, name: "Tree Planted" },
  hdmiCable: { type: "image", src: hdmiCable, name: "HDMI Cable" },
  powerCableNew: { type: "image", src: powerCableNew, name: "Power Cable" },
  onexController: { type: "image", src: onexcontrollerImg, name: "1x Controller" },
  twoxController: { type: "image", src: twoxcontrollerImg, name: "2x Controller" },
  freeSim: { type: "image", src: SimImg, name: "Free Sim" },
  screenProtector: { type: "image", src: ScreenProtectorImg, name: "Screen Protector" },
  backCover: { type: "image", src: BackCoverImg, name: "Back Cover" },
};

/** Match preset keys when DB has snake_case / kebab-case (e.g. back_cover, back-cover). */
function normalizePresetIconKey(id) {
  if (!id || typeof id !== "string") return id;
  const t = id.trim();
  if (!t) return t;
  return t.replace(/[-_]([a-z0-9])/gi, (_, c) => c.toUpperCase());
}

function decodeIconHtmlIfNeeded(str) {
  if (!str || typeof str !== "string") return str;
  const t = str.trim();
  if (t.includes("&lt;") && !t.includes("<")) {
    try {
      const ta = document.createElement("textarea");
      ta.innerHTML = t;
      return ta.value.trim();
    } catch {
      return t;
    }
  }
  return t;
}

function looksLikeIconHtml(str) {
  if (!str || typeof str !== "string") return false;
  const decoded = decodeIconHtmlIfNeeded(str);
  return decoded.includes("<");
}

function looksLikeImageUrl(str) {
  if (!str || typeof str !== "string") return false;
  const t = str.trim();
  return (
    /^https?:\/\//i.test(t) ||
    /^\/uploads\//i.test(t) ||
    /^data:image\//i.test(t)
  );
}

function getVariantValueImageSrc(image, apiBase) {
  if (!image) return null;
  if (image.url) return image.url;
  if (image.path && apiBase) {
    const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const p = image.path.startsWith("/") ? image.path : `/${image.path}`;
    return `${base}${p}`;
  }
  return null;
}

function resolveIconMapEntry(iconId) {
  if (!iconId || typeof iconId !== "string") return null;
  const raw = iconId.trim();
  const camelized = normalizePresetIconKey(raw);
  const lcFirst = camelized ? camelized.charAt(0).toLowerCase() + camelized.slice(1) : camelized;
  return ICON_MAP[raw] || ICON_MAP[camelized] || ICON_MAP[lcFirst] || null;
}

function normalizeSlugForMatch(s) {
  if (!s || typeof s !== "string") return "";
  return s.toLowerCase().replace(/[-_]+/g, "-");
}

function orderedUniqueStrings(arr) {
  const seen = new Set();
  const out = [];
  for (const s of arr || []) {
    if (s == null || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

// Icon renderer component
const IconRenderer = ({ iconId, image, apiBase, className = "h-6 w-6" }) => {
  const placeholder = (
    <span className={`${className} flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded`}>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </span>
  );

  const rawIcon = typeof iconId === "string" ? iconId.trim() : iconId;
  const hasIcon = rawIcon !== undefined && rawIcon !== null && String(rawIcon).length > 0;

  // Custom HTML icons (Flaticon, inline SVG) — including HTML-encoded saves
  if (hasIcon && typeof rawIcon === "string" && looksLikeIconHtml(rawIcon)) {
    const html = decodeIconHtmlIfNeeded(rawIcon);
    return (
      <span
        className={`${className} flex items-center justify-center [&>i]:text-base [&>svg]:w-full [&>svg]:h-full`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Icon stored as direct image URL (custom upload / absolute URL)
  if (hasIcon && typeof rawIcon === "string" && looksLikeImageUrl(rawIcon)) {
    return <img src={rawIcon.trim()} alt="" className={`${className} object-contain`} />;
  }

  const iconData = hasIcon ? resolveIconMapEntry(rawIcon) : null;
  if (iconData) {
    if (iconData.type === "component") {
      const IconComponent = iconData.component;
      return <IconComponent className={className} />;
    }
    return <img src={iconData.src} alt={iconData.name} className={`${className} object-contain`} />;
  }

  const imgFromValue = getVariantValueImageSrc(image, apiBase);
  if (imgFromValue) {
    return <img src={imgFromValue} alt="" className={`${className} object-contain`} />;
  }

  if (!hasIcon) return placeholder;
  return placeholder;
};

IconRenderer.propTypes = {
  iconId: PropTypes.string,
  image: PropTypes.shape({
    url: PropTypes.string,
    path: PropTypes.string,
  }),
  apiBase: PropTypes.string,
  className: PropTypes.string,
};

export default function ProductComesWithSelector({ product, setProduct }) {
  const auth = useAuth();
  const [comesWithItems, setComesWithItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load Flaticon CSS for custom icons (align with Product Central product-options page)
  useEffect(() => {
    const flatIconStyles = [
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css",
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css",
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css",
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-straight/css/uicons-regular-straight.css",
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-straight/css/uicons-bold-straight.css",
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-straight/css/uicons-solid-straight.css",
      "https://cdn-uicons.flaticon.com/2.6.0/uicons-brands/css/uicons-brands.css",
    ];

    flatIconStyles.forEach((href) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Fetch "Comes With" items from VariantAttribute API
  useEffect(() => {
    const fetchComesWithItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${auth.ip}get/variant-attributes`);
        if (response.data.status === 200 || response.data.status === 201) {
          const comesWithAttribute = response.data.variantAttributes.find(
            (attr) => attr.slug === "comes_with" || attr.slug === "comes-with"
          );

          if (comesWithAttribute && comesWithAttribute.values) {
            const activeItems = comesWithAttribute.values.filter(
              (item) => item.isActive !== false
            );
            setComesWithItems(activeItems);
          } else {
            setComesWithItems([]);
          }
        }
      } catch (err) {
        console.error("Error fetching comes with items:", err);
        setError("Failed to load accessories. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComesWithItems();
  }, [auth.ip]);

  // Get currently selected items (array of slugs)
  const selectedItems = product?.comesWithItems || [];
  const uniqueProductSlugs = orderedUniqueStrings(selectedItems);

  const resolveCatalogItem = (productSlug) =>
    comesWithItems.find(
      (item) =>
        item.slug === productSlug ||
        normalizeSlugForMatch(item.slug) === normalizeSlugForMatch(productSlug)
    );

  const selectionRows = uniqueProductSlugs.map((productSlug) => ({
    productSlug,
    item: resolveCatalogItem(productSlug),
  }));

  const orphanCount = selectionRows.filter((row) => !row.item).length;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const slugs = product?.comesWithItems || [];
    const uniq = orderedUniqueStrings(slugs);
    console.groupCollapsed("[Admin · Comes With] edit product");
    console.log("product.comesWithItems count:", slugs.length);
    console.log("product.comesWithItems:", [...slugs]);
    console.log("catalog option count (API):", comesWithItems.length);
    console.log("unique slugs on product:", uniq.length);
    uniq.forEach((slug) => {
      const hit = comesWithItems.find(
        (item) =>
          item.slug === slug ||
          normalizeSlugForMatch(item.slug) === normalizeSlugForMatch(slug)
      );
      console.log(slug, "→", hit ? `catalog: ${hit.name}` : "LEGACY (remove from product)");
    });
    console.groupEnd();
  }, [product?.comesWithItems, comesWithItems]);

  // Get available items (not yet selected) and filter by search
  const availableItems = comesWithItems
    .filter(
      (item) =>
        !selectedItems.some(
          (s) => normalizeSlugForMatch(s) === normalizeSlugForMatch(item.slug)
        )
    )
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle item selection
  const handleSelectItem = (slug) => {
    setProduct({
      ...product,
      comesWithItems: [...selectedItems, slug],
    });
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // Remove item from selection
  const handleRemoveItem = (slug) => {
    setProduct({
      ...product,
      comesWithItems: selectedItems.filter((s) => s !== slug),
    });
  };

  return (
    <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-sm">Comes With</h1>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              orphanCount > 0
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "text-gray-400 bg-gray-100"
            }`}
            title={
              orphanCount > 0
                ? `${orphanCount} saved slug(s) are not in the catalog. Remove them so the storefront matches this list.`
                : undefined
            }
          >
            {selectedItems.length}
            {orphanCount > 0 ? ` (${orphanCount} legacy)` : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-3 text-red-500 text-xs">{error}</div>
        ) : comesWithItems.length === 0 ? (
          <div className="text-center py-3 text-gray-500 text-xs">
            No accessories configured. <a href="/admin/variant-attributes" className="text-primary hover:underline">Add here</a>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Compact Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs border rounded-md transition-all ${
                  isDropdownOpen ? "border-primary ring-1 ring-primary/20" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className="text-gray-500">
                  {availableItems.length > 0 ? `Add accessory... (${availableItems.length})` : "All selected"}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                  <div className="p-1.5 border-b border-gray-100">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {availableItems.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center">
                        {searchTerm ? "No match" : "All selected"}
                      </div>
                    ) : (
                      availableItems.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => handleSelectItem(item.slug)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded flex-shrink-0">
                            <IconRenderer iconId={item.icon} image={item.image} apiBase={auth.ip} className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate">{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected items: catalog match + legacy slugs still on the product */}
            {selectionRows.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectionRows.map(({ productSlug, item }) => (
                  <div
                    key={productSlug}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${
                      item ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"
                    }`}
                    title={
                      item
                        ? item.name
                        : `Legacy slug not in catalog: ${productSlug}`
                    }
                  >
                    <IconRenderer
                      iconId={item?.icon}
                      image={item?.image}
                      apiBase={auth.ip}
                      className="h-3.5 w-3.5"
                    />
                    <span className="font-medium text-gray-700 max-w-[80px] truncate">
                      {item ? item.name : productSlug.replace(/[-_]/g, " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(productSlug)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">No accessories</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ProductComesWithSelector.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
