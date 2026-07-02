import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Helmet } from "react-helmet-async";
import { useFlaticonStylesheets } from "../../../utils/navbarFlaticonIcon";
// import NavbarOrderEditor from "../../../components/ProductCentralComponents/NavbarOrderEditor";
// import HomepageNavLinksEditor from "../../../components/ProductCentralComponents/HomepageNavLinksEditor";
import { useAuth } from "../../../context/Auth";
import { getLogo } from "../logo/service/logoService";
import {
  resolveBackendAssetUrl,
  withCacheBust,
} from "../../../utils/backendAssetUrl";


const NAVBAR_LAYOUT_PRESETS = [
  {
    id: "classic",
    variant: "modern",
    label: "Classic left nav",
    preview: "Logo | Links | Search + Buttons",
  },
  {
    id: "centered",
    variant: "minimalist",
    label: "Centered links",
    preview: "Logo | Links | Icon actions",
  },
  {
    id: "split",
    variant: "dark-sidebar",
    label: "Split actions",
    preview: "Logo + Links | Search | Icons",
  },
  {
    id: "minimal",
    variant: "developer",
    label: "Minimal",
    preview: "Logo + Links | Search + Profile",
  },
  {
    id: "business",
    variant: "business",
    label: "Business",
    preview: "Logo + Links | Wide search | Icons",
  },
  {
    id: "bold-left",
    variant: "bold-left",
    label: "Bold left",
    preview: "Logo | Center search | Icons",
  },
  {
    id: "classic",
    variant: "retail-two-row",
    label: "Retail two row",
    preview: "Top search + contact/icons | Bottom links bar",
  },
  {
    id: "split",
    variant: "wing-split",
    label: "Wing split bar",
    preview: "Colored wing | Logo | 60% links strip (same bg)",
  },
  {
    id: "centered",
    variant: "pill-black",
    label: "Black pill bar",
    preview: "Black pill | White logo disc | Center links | White CTA pill",
  },
];
const DEFAULT_NAVBAR_LINKS = [
  { id: "lnk-1", label: "Home", url: "/", icon: "", linkType: "label", children: [] },
  {
    id: "lnk-2",
    label: "Products",
    url: "/products",
    icon: "",
    linkType: "label",
    children: [],
  },
  {
    id: "lnk-3",
    label: "Features",
    url: "/features",
    icon: "",
    linkType: "label",
    children: [],
  },
  {
    id: "lnk-4",
    label: "Pricing",
    url: "/pricing",
    icon: "",
    linkType: "label",
    children: [],
  },
];

function presetKey(preset) {
  return `${preset.id}::${preset.variant}`;
}

/** Navbar logo always comes from Logo Management — never persist a local override. */
function withoutNavbarLogoOverride(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) return config;
  return { ...config, logoUrl: "" };
}

/** Merge saved per-preset snapshots + active storefront `config` into hub state. */
function mergeVariantConfigsFromApi(cfg, presets) {
  const presetMap =
    presets && typeof presets === "object" && !Array.isArray(presets) ? presets : {};
  const next = {};
  NAVBAR_LAYOUT_PRESETS.forEach((preset) => {
    const k = presetKey(preset);
    const fromPresets = presetMap[k] && typeof presetMap[k] === "object" && !Array.isArray(presetMap[k]);
    next[k] = withoutNavbarLogoOverride({
      ...createInitialVariantConfig(preset),
      ...(fromPresets ? presetMap[k] : {}),
    });
  });
  if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
    const matched =
      NAVBAR_LAYOUT_PRESETS.find((p) => p.id === cfg.id && p.variant === cfg.variant) ||
      NAVBAR_LAYOUT_PRESETS[0];
    const mk = presetKey(matched);
    next[mk] = withoutNavbarLogoOverride({
      ...createInitialVariantConfig(matched),
      ...cfg,
    });
  }
  return next;
}

function createInitialVariantConfig(preset) {
  return {
    id: preset.id,
    variant: preset.variant,
    label: preset.label,
    layoutLabel: preset.preview,
    navbarBgColor: "#ffffff",
    classicRightSectionBgColor: "#DEE3DE",
    logoText: "Brand",
    logoUrl: "",
    showSearch: true,
    showOnStorefront: true,
    stickyNavbar: false,
    showButtons: true,
    showPrimaryButton: true,
    showSecondaryButton: true,
    actionIcon1: "fi-rr-shopping-cart",
    actionIcon2: "fi-rr-user",
    actionIcon1Url: "/cart",
    actionIcon2Url: "/account",
    actionIcon1OpenCart: false,
    actionIcon2OpenCart: false,
    actionIcon1BgColor: "#0e9f6e",
    actionIcon1Color: "#ffffff",
    actionIcon2BgColor: "#0e9f6e",
    actionIcon2Color: "#ffffff",
    primaryButtonLabel: "Sign in",
    primaryButtonUrl: "/login",
    primaryButtonIcon: "fi-rr-download",
    primaryButtonColor: "#0e9f6e",
    primaryButtonTextColor: "#ffffff",
    secondaryButtonLabel: "Get started",
    secondaryButtonUrl: "/register",
    secondaryButtonIcon: "fi-rr-phone-call",
    secondaryButtonColor: "#f97316",
    secondaryButtonTextColor: "#ffffff",
    menuLinkTextColor: "#334155",
    menuLinkHoverColor: "#0f172a",
    links: DEFAULT_NAVBAR_LINKS.map((l) => ({ ...l })),
  };
}

function getPublicStoreBaseUrl() {
  const fromEnv =
    import.meta.env.VITE_FRONTEND_URL ||
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    import.meta.env.VITE_STOREFRONT_URL ||
    "";
  const fallback = import.meta.env.DEV ? "http://localhost:3000" : "https://www.aromadesire.com";
  return String(fromEnv || fallback).replace(/\/$/, "");
}

/** When admin runs on localhost, preview the local Next storefront — not VITE_PUBLIC_SITE_URL prod URL. */
function getNavbarPreviewStoreUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      const local =
        import.meta.env.VITE_LOCAL_STOREFRONT_URL ||
        import.meta.env.VITE_DEV_STOREFRONT_URL ||
        "http://localhost:3000";
      return String(local).replace(/\/$/, "");
    }
  }
  return getPublicStoreBaseUrl();
}

function SectionTitle({ step, title, description }) {
  return (
    <div className="border-b border-gray-100 pb-3 mb-4">
      <div className="flex items-center gap-2">
        {step ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {step}
          </span>
        ) : null}
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}

export default function ProductCentralNavbarHub() {
  useFlaticonStylesheets();
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("storefront-navbar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(() => NAVBAR_LAYOUT_PRESETS[0]);
  const [variantConfigs, setVariantConfigs] = useState(() =>
    NAVBAR_LAYOUT_PRESETS.reduce((acc, preset) => {
      acc[presetKey(preset)] = createInitialVariantConfig(preset);
      return acc;
    }, {})
  );
  const [variantSaveMessage, setVariantSaveMessage] = useState("");
  const [variantSaving, setVariantSaving] = useState(false);
  const [previewOpening, setPreviewOpening] = useState(false);
  const [draggingLinkId, setDraggingLinkId] = useState(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState("");
  const [storeLogoAlt, setStoreLogoAlt] = useState("");
  const [storeLogoLoading, setStoreLogoLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadStoreLogo = useCallback(async () => {
    setStoreLogoLoading(true);
    try {
      const data = await getLogo();
      const resolved = data.logoUrl ? resolveBackendAssetUrl(data.logoUrl) : "";
      const version =
        data.faviconVersion ??
        (data.updatedAt ? new Date(data.updatedAt).getTime() : null);
      setStoreLogoPreview(
        resolved && version != null ? withCacheBust(resolved, version) : resolved
      );
      setStoreLogoAlt(data.altText?.trim() || "");
    } finally {
      setStoreLogoLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStoreLogo();
  }, [loadStoreLogo]);

  useEffect(() => {
    let cancelled = false;
    const base = (auth.ip || "").endsWith("/") ? auth.ip : `${auth.ip || ""}/`;
    if (!auth.ip) return;
    axios
      .get(`${base}navbar-variant-test`, { headers: { "x-user-role": "admin" } })
      .then((res) => {
        if (cancelled) return;
        const cfg = res.data?.data?.config;
        const presets = res.data?.data?.presets;
        if (!cfg && (!presets || typeof presets !== "object")) return;
        setVariantConfigs(mergeVariantConfigsFromApi(cfg, presets));
        if (cfg && typeof cfg === "object") {
          const matchedPreset =
            NAVBAR_LAYOUT_PRESETS.find(
              (p) => p.id === cfg.id && p.variant === cfg.variant
            ) || NAVBAR_LAYOUT_PRESETS[0];
          setSelectedPreset(matchedPreset);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load saved navbar variants");
      });
    return () => {
      cancelled = true;
    };
  }, [auth.ip]);


  const selectedPresetId = presetKey(selectedPreset);
  const selectedConfig =
    variantConfigs[selectedPresetId] || createInitialVariantConfig(selectedPreset);
  const previewLogoUrl = storeLogoPreview;

  const openStorefrontPreview = async () => {
    const base = (auth.ip || "").endsWith("/") ? auth.ip : `${auth.ip || ""}/`;
    if (!auth.ip) {
      toast.error("API base URL is missing");
      return;
    }

    // Open tab synchronously on click — async window.open() is blocked by most browsers.
    const previewWindow = window.open("about:blank", "_blank");
    if (previewWindow) {
      try {
        previewWindow.document.title = "Navbar preview";
        previewWindow.document.body.innerHTML =
          '<div style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#555">Loading navbar preview…</div>';
      } catch {
        // ignore if document is not writable
      }
    }

    setPreviewOpening(true);
    try {
      const draftConfig = {
        ...selectedConfig,
        logoUrl: previewLogoUrl || selectedConfig.logoUrl || "",
        logoText: selectedConfig.logoText?.trim() || storeLogoAlt || selectedConfig.logoText || "",
      };
      const res = await axios.put(
        `${base}navbar-variant-test/preview-draft`,
        { config: draftConfig },
        { headers: { "x-user-role": "admin", "Content-Type": "application/json" } }
      );
      const token = res.data?.data?.previewToken;
      if (!res.data?.success || !token) {
        previewWindow?.close();
        toast.error(res.data?.message || "Could not create preview");
        return;
      }
      const url = `${getNavbarPreviewStoreUrl()}/navbar-preview/?token=${encodeURIComponent(token)}`;
      if (previewWindow) {
        previewWindow.location.href = url;
        previewWindow.opener = null;
        return;
      }

      toast.error(
        "Popup blocked. Allow popups for this admin site, then try Preview again."
      );
      try {
        await navigator.clipboard.writeText(url);
        toast.info("Preview link copied — paste it in a new tab.", { autoClose: 8000 });
      } catch {
        toast.info(`Open manually: ${url}`, { autoClose: 12000 });
      }
    } catch (err) {
      previewWindow?.close();
      toast.error(err.response?.data?.message || "Could not open preview");
    } finally {
      setPreviewOpening(false);
    }
  };

  const previewStoreUrl = getNavbarPreviewStoreUrl();
  const isLocalPreview =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const updateSelectedVariantConfig = (patch) => {
    setVariantConfigs((prev) => ({
      ...prev,
      [selectedPresetId]: {
        ...(prev[selectedPresetId] || createInitialVariantConfig(selectedPreset)),
        ...patch,
      },
    }));
  };

  const updateSelectedLink = (linkId, patch) => {
    updateSelectedVariantConfig({
      links: selectedConfig.links.map((link) =>
        link.id === linkId ? { ...link, ...patch } : link
      ),
    });
  };

  const addSelectedLink = () => {
    updateSelectedVariantConfig({
      links: [
        ...selectedConfig.links,
        {
          id: `lnk-${Date.now()}`,
          label: "",
          url: "",
          icon: "",
          linkType: "label",
          children: [],
        },
      ],
    });
  };

  const removeSelectedLink = (linkId) => {
    updateSelectedVariantConfig({
      links: selectedConfig.links.filter((link) => link.id !== linkId),
    });
  };

  const addDropdownChild = (linkId) => {
    updateSelectedVariantConfig({
      links: selectedConfig.links.map((link) =>
        link.id === linkId
          ? {
              ...link,
              children: [
                ...(Array.isArray(link.children) ? link.children : []),
                { id: `sub-${Date.now()}`, label: "", url: "" },
              ],
            }
          : link
      ),
    });
  };

  const updateDropdownChild = (linkId, childId, patch) => {
    updateSelectedVariantConfig({
      links: selectedConfig.links.map((link) =>
        link.id === linkId
          ? {
              ...link,
              children: (Array.isArray(link.children) ? link.children : []).map((child) =>
                child.id === childId ? { ...child, ...patch } : child
              ),
            }
          : link
      ),
    });
  };

  const removeDropdownChild = (linkId, childId) => {
    updateSelectedVariantConfig({
      links: selectedConfig.links.map((link) =>
        link.id === linkId
          ? {
              ...link,
              children: (Array.isArray(link.children) ? link.children : []).filter(
                (child) => child.id !== childId
              ),
            }
          : link
      ),
    });
  };

  const moveSelectedLink = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    const links = Array.isArray(selectedConfig.links) ? [...selectedConfig.links] : [];
    const fromIndex = links.findIndex((l) => l.id === fromId);
    const toIndex = links.findIndex((l) => l.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = links.splice(fromIndex, 1);
    links.splice(toIndex, 0, moved);
    updateSelectedVariantConfig({ links });
  };

  const saveVariantForStorefrontTest = () => {
    const base = (auth.ip || "").endsWith("/") ? auth.ip : `${auth.ip || ""}/`;
    if (!auth.ip) {
      toast.error("API base URL is missing");
      return;
    }
    setVariantSaving(true);
    axios
      .put(
        `${base}navbar-variant-test`,
        { config: withoutNavbarLogoOverride(selectedConfig) },
        { headers: { "x-user-role": "admin", "Content-Type": "application/json" } }
      )
      .then((res) => {
        if (res.data?.success) {
          const cfg = res.data?.data?.config;
          const presets = res.data?.data?.presets;
          if (presets && typeof presets === "object") {
            setVariantConfigs(mergeVariantConfigsFromApi(cfg, presets));
          }
          setVariantSaveMessage("Saved successfully.");
          toast.success("Saved successfully.");
        } else {
          toast.error(res.data?.message || "Failed to save variant");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to save variant");
      })
      .finally(() => setVariantSaving(false));
  };

  return (
    <>
      <Helmet>
        <title>Navbar - Content</title>
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
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <span className="text-sm font-medium text-gray-500">Content</span>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-primary md:ml-2">
                      Navbar
                    </span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Storefront Navbar</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Pick a layout, edit menu links, then save — changes appear on your live site header.
                  </p>
                </div>
              </div>
              <a
                href="https://www.flaticon.com/uicons/interface-icons"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Flaticon icon library
              </a>
            </div>

            <div className="mx-auto max-w-4xl space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                      <SectionTitle
                        step="1"
                        title="Layout style"
                        description="Choose how the navbar looks on your storefront."
                      />
                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedConfig.showOnStorefront !== false}
                            onChange={(e) =>
                              updateSelectedVariantConfig({
                                showOnStorefront: e.target.checked,
                              })
                            }
                          />
                          Show on storefront
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedConfig.stickyNavbar === true}
                            onChange={(e) =>
                              updateSelectedVariantConfig({
                                stickyNavbar: e.target.checked,
                              })
                            }
                          />
                          Stick to top when scrolling
                        </label>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Pick a layout
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {NAVBAR_LAYOUT_PRESETS.map((preset) => {
                            const active =
                              selectedPreset.id === preset.id &&
                              selectedPreset.variant === preset.variant;
                            return (
                              <button
                                key={`${preset.id}-${preset.variant}`}
                                type="button"
                                onClick={() => setSelectedPreset(preset)}
                                className={`rounded-md border px-3 py-2 text-left transition ${
                                  active
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                              >
                                <p className="text-xs font-semibold text-gray-900">{preset.label}</p>
                                <p className="text-[11px] text-gray-600 mt-1">{preset.preview}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                      <SectionTitle
                        step="2"
                        title="Logo & branding"
                        description="Logo image is managed in Logo Management. Set fallback text and colors here."
                      />
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Logo text (if no image)
                          </label>
                            <input
                              type="text"
                              value={selectedConfig.logoText}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ logoText: e.target.value })
                              }
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                              placeholder={storeLogoAlt || "Brand"}
                            />
                            <p className="mt-1 text-[11px] text-gray-500">
                              Fallback label when no logo image is set in Logo Management.
                            </p>
                          </div>
                          {selectedConfig.id !== "classic" ? (
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">
                                Navbar background color
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={
                                    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                                      String(selectedConfig.navbarBgColor || "")
                                    )
                                      ? selectedConfig.navbarBgColor
                                      : "#ffffff"
                                  }
                                  onChange={(e) =>
                                    updateSelectedVariantConfig({ navbarBgColor: e.target.value })
                                  }
                                  className="h-8 w-16 rounded border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateSelectedVariantConfig({ navbarBgColor: "transparent" });
                                    setVariantSaveMessage("Navbar background removed successfully.");
                                    toast.success("Navbar background removed successfully.");
                                  }}
                                  className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                                >
                                  Remove bg
                                </button>
                              </div>
                            </div>
                          ) : null}
                          {selectedConfig.id === "classic" ? (
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">
                                Classic right section background
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={
                                    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                                      String(selectedConfig.classicRightSectionBgColor || "")
                                    )
                                      ? selectedConfig.classicRightSectionBgColor
                                      : "#DEE3DE"
                                  }
                                  onChange={(e) =>
                                    updateSelectedVariantConfig({
                                      classicRightSectionBgColor: e.target.value,
                                    })
                                  }
                                  className="h-8 w-16 rounded border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateSelectedVariantConfig({
                                      classicRightSectionBgColor: "transparent",
                                    });
                                    setVariantSaveMessage(
                                      "Classic right section background removed successfully."
                                    );
                                    toast.success(
                                      "Classic right section background removed successfully."
                                    );
                                  }}
                                  className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                                >
                                  Remove bg
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-blue-900">Store logo</p>
                            <Link
                              to="/admin/logo"
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Manage in Logo Management →
                            </Link>
                          </div>
                          <p className="mb-3 text-[11px] leading-relaxed text-blue-800">
                            The navbar uses the logo uploaded in Logo Management (recommended
                            160×70 px or 320×140 px PNG/SVG). Update it once and it applies to
                            the homepage navbar and site header.
                          </p>
                          {storeLogoLoading ? (
                            <div className="flex h-16 items-center justify-center rounded border border-blue-200 bg-white text-xs text-gray-500">
                              Loading logo…
                            </div>
                          ) : previewLogoUrl ? (
                            <div className="flex items-center justify-center rounded border border-blue-200 bg-white p-3">
                              <img
                                src={previewLogoUrl}
                                alt={storeLogoAlt || "Store logo preview"}
                                className="max-h-16 max-w-[220px] object-contain"
                              />
                            </div>
                          ) : (
                            <div className="rounded border border-dashed border-blue-200 bg-white px-3 py-4 text-center text-xs text-gray-600">
                              No logo uploaded yet.{" "}
                              <Link to="/admin/logo" className="font-medium text-primary hover:underline">
                                Upload in Logo Management
                              </Link>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => void loadStoreLogo()}
                            className="mt-2 text-[11px] text-gray-600 hover:text-gray-900"
                          >
                            Refresh preview
                          </button>
                        </div>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                      <SectionTitle
                        step="3"
                        title="Menu links"
                        description="Main navigation items. Drag ⋮⋮ to reorder. Each link can have a dropdown submenu."
                      />
                          <div className="mb-3 flex justify-end">
                            <button
                              type="button"
                              onClick={addSelectedLink}
                              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                            >
                              + Add link
                            </button>
                          </div>
                          <div className="space-y-3">
                            {selectedConfig.links.map((link, linkIndex) => (
                              <div
                                key={link.id}
                                draggable
                                onDragStart={() => setDraggingLinkId(link.id)}
                                onDragEnd={() => setDraggingLinkId(null)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  moveSelectedLink(draggingLinkId, link.id);
                                  setDraggingLinkId(null);
                                }}
                                className={`rounded-lg border border-gray-200 bg-gray-50/80 p-3 ${
                                  draggingLinkId === link.id ? "ring-2 ring-primary/30" : ""
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-800">
                                    Link {linkIndex + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeSelectedLink(link.id)}
                                    className="text-xs text-red-600 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-12 gap-2">
                                <div
                                  className="col-span-1 flex cursor-grab items-center justify-center rounded-md border border-gray-300 bg-white text-gray-400 active:cursor-grabbing"
                                  title="Drag to reorder"
                                >
                                  ⋮⋮
                                </div>
                                <select
                                  value={
                                    link.linkType === "icon"
                                      ? "icon"
                                      : link.linkType === "icon_label"
                                        ? "icon_label"
                                        : "label"
                                  }
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    updateSelectedLink(link.id, {
                                      linkType:
                                        v === "icon"
                                          ? "icon"
                                          : v === "icon_label"
                                            ? "icon_label"
                                            : "label",
                                    });
                                  }}
                                  className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                                >
                                  <option value="label">Label only</option>
                                  <option value="icon">Icon only</option>
                                  <option value="icon_label">Icon + label</option>
                                </select>
                                {link.linkType === "icon_label" ? (
                                  <>
                                    <input
                                      type="text"
                                      value={link.icon || ""}
                                      onChange={(e) =>
                                        updateSelectedLink(link.id, { icon: e.target.value })
                                      }
                                      className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                                      placeholder='fi-rr-home or <i class="fi fi-rr-home"></i>'
                                    />
                                    <input
                                      type="text"
                                      value={link.label || ""}
                                      onChange={(e) =>
                                        updateSelectedLink(link.id, { label: e.target.value })
                                      }
                                      className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                                      placeholder="Visible label"
                                    />
                                  </>
                                ) : (
                                  <input
                                    type="text"
                                    value={link.linkType === "icon" ? link.icon || "" : link.label || ""}
                                    onChange={(e) =>
                                      updateSelectedLink(
                                        link.id,
                                        link.linkType === "icon"
                                          ? { icon: e.target.value }
                                          : { label: e.target.value }
                                      )
                                    }
                                    className="col-span-3 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                                    placeholder={
                                      link.linkType === "icon"
                                        ? 'fi-rr-home or <i class="fi fi-rr-home"></i>'
                                        : "Label"
                                    }
                                  />
                                )}
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => updateSelectedLink(link.id, { url: e.target.value })}
                                  className={`rounded-md border border-gray-300 px-2 py-1.5 text-xs ${
                                    link.linkType === "icon_label" ? "col-span-5" : "col-span-6"
                                  }`}
                                  placeholder="URL e.g. /products"
                                />
                                <div className="col-span-12 rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                                  <div className="mb-2 flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-gray-700">
                                      Dropdown items (optional)
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => addDropdownChild(link.id)}
                                      className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                                    >
                                      Add dropdown link
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {(Array.isArray(link.children) ? link.children : []).map((child) => (
                                      <div key={child.id} className="grid grid-cols-12 gap-2">
                                        <input
                                          type="text"
                                          value={child.label || ""}
                                          onChange={(e) =>
                                            updateDropdownChild(link.id, child.id, {
                                              label: e.target.value,
                                            })
                                          }
                                          className="col-span-5 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                                          placeholder="Dropdown label"
                                        />
                                        <input
                                          type="text"
                                          value={child.url || ""}
                                          onChange={(e) =>
                                            updateDropdownChild(link.id, child.id, {
                                              url: e.target.value,
                                            })
                                          }
                                          className="col-span-6 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                                          placeholder="/path"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeDropdownChild(link.id, child.id)}
                                          className="col-span-1 rounded-md border border-red-200 text-xs text-red-600"
                                          title="Remove dropdown link"
                                        >
                                          x
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="text-xs text-gray-700">
                              <p>Link text color</p>
                              <input
                                type="color"
                                value={selectedConfig.menuLinkTextColor || "#334155"}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({
                                    menuLinkTextColor: e.target.value,
                                  })
                                }
                                className="mt-2 h-8 w-16 cursor-pointer rounded border border-gray-300"
                              />
                            </div>
                            <div className="text-xs text-gray-700">
                              <p>Link hover color</p>
                              <input
                                type="color"
                                value={selectedConfig.menuLinkHoverColor || "#0f172a"}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({
                                    menuLinkHoverColor: e.target.value,
                                  })
                                }
                                className="mt-2 h-8 w-16 cursor-pointer rounded border border-gray-300"
                              />
                            </div>
                          </div>

                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                      <SectionTitle
                        step="4"
                        title="Search, icons & buttons"
                        description="Toggle what appears on the right side of the navbar."
                      />
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <p className="mb-2 text-sm font-medium text-gray-700">
                            What to show
                          </p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedConfig.showSearch}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({ showSearch: e.target.checked })
                                }
                              />
                              Show search
                            </label>
                            <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedConfig.showButtons}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({ showButtons: e.target.checked })
                                }
                              />
                              Show icons
                            </label>
                            <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedConfig.showPrimaryButton !== false}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({
                                    showPrimaryButton: e.target.checked,
                                  })
                                }
                              />
                              Show primary button
                            </label>
                            <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedConfig.showSecondaryButton !== false}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({
                                    showSecondaryButton: e.target.checked,
                                  })
                                }
                              />
                              Show secondary button
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-gray-200 p-3">
                            <p className="mb-2 text-xs font-medium text-gray-600">Action icon 1</p>
                            <input
                              type="text"
                              value={selectedConfig.actionIcon1}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ actionIcon1: e.target.value })
                              }
                              className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Action icon 1 (e.g. fi-rr-shopping-cart)"
                            />
                            <input
                              type="text"
                              value={selectedConfig.actionIcon1Url || ""}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ actionIcon1Url: e.target.value })
                              }
                              className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Action icon 1 path (e.g. /cart)"
                            />
                            <label className="mb-2 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedConfig.actionIcon1OpenCart === true}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({
                                    actionIcon1OpenCart: e.target.checked,
                                  })
                                }
                              />
                              Open sidebar cart on click (ignore path)
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-gray-600">Bg color</label>
                                <div className="mt-1 flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={
                                      /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                                        String(selectedConfig.actionIcon1BgColor || "")
                                      )
                                        ? selectedConfig.actionIcon1BgColor
                                        : "#0e9f6e"
                                    }
                                    onChange={(e) =>
                                      updateSelectedVariantConfig({
                                        actionIcon1BgColor: e.target.value,
                                      })
                                    }
                                    className="h-8 w-16 rounded border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateSelectedVariantConfig({
                                        actionIcon1BgColor: "transparent",
                                      });
                                      setVariantSaveMessage(
                                        "Action icon 1 background removed successfully."
                                      );
                                      toast.success(
                                        "Action icon 1 background removed successfully."
                                      );
                                    }}
                                    className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                                  >
                                    Remove bg
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-600">Icon color</label>
                                <input
                                  type="color"
                                  value={selectedConfig.actionIcon1Color || "#ffffff"}
                                  onChange={(e) =>
                                    updateSelectedVariantConfig({
                                      actionIcon1Color: e.target.value,
                                    })
                                  }
                                  className="mt-1 h-8 w-16 rounded border border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="rounded-md border border-gray-200 p-3">
                            <p className="mb-2 text-xs font-medium text-gray-600">Action icon 2</p>
                            <input
                              type="text"
                              value={selectedConfig.actionIcon2}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ actionIcon2: e.target.value })
                              }
                              className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Action icon 2 (e.g. fi-rr-user)"
                            />
                            <input
                              type="text"
                              value={selectedConfig.actionIcon2Url || ""}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ actionIcon2Url: e.target.value })
                              }
                              className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Action icon 2 path (e.g. /account)"
                            />
                            <label className="mb-2 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedConfig.actionIcon2OpenCart === true}
                                onChange={(e) =>
                                  updateSelectedVariantConfig({
                                    actionIcon2OpenCart: e.target.checked,
                                  })
                                }
                              />
                              Open sidebar cart on click (ignore path)
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-gray-600">Bg color</label>
                                <div className="mt-1 flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={
                                      /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                                        String(selectedConfig.actionIcon2BgColor || "")
                                      )
                                        ? selectedConfig.actionIcon2BgColor
                                        : "#0e9f6e"
                                    }
                                    onChange={(e) =>
                                      updateSelectedVariantConfig({
                                        actionIcon2BgColor: e.target.value,
                                      })
                                    }
                                    className="h-8 w-16 rounded border border-gray-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateSelectedVariantConfig({
                                        actionIcon2BgColor: "transparent",
                                      });
                                      setVariantSaveMessage(
                                        "Action icon 2 background removed successfully."
                                      );
                                      toast.success(
                                        "Action icon 2 background removed successfully."
                                      );
                                    }}
                                    className="rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                                  >
                                    Remove bg
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-600">Icon color</label>
                                <input
                                  type="color"
                                  value={selectedConfig.actionIcon2Color || "#ffffff"}
                                  onChange={(e) =>
                                    updateSelectedVariantConfig({
                                      actionIcon2Color: e.target.value,
                                    })
                                  }
                                  className="mt-1 h-8 w-16 rounded border border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-gray-200 p-3">
                            <p className="mb-2 text-xs font-medium text-gray-600">
                              Primary button
                            </p>
                            <input
                              type="text"
                              value={selectedConfig.primaryButtonLabel}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  primaryButtonLabel: e.target.value,
                                })
                              }
                              className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Label"
                            />
                            <input
                              type="text"
                              value={selectedConfig.primaryButtonUrl}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ primaryButtonUrl: e.target.value })
                              }
                              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="/login"
                            />
                            <input
                              type="text"
                              value={selectedConfig.primaryButtonIcon || ""}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  primaryButtonIcon: e.target.value,
                                })
                              }
                              className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Primary icon (e.g. fi-rr-download)"
                            />
                            <label className="mt-2 block text-xs font-medium text-gray-600">
                              Primary color
                            </label>
                            <input
                              type="color"
                              value={selectedConfig.primaryButtonColor || "#0e9f6e"}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  primaryButtonColor: e.target.value,
                                })
                              }
                              className="mt-1 h-8 w-16 rounded border border-gray-300"
                            />
                            <label className="mt-2 block text-xs font-medium text-gray-600">
                              Primary text color
                            </label>
                            <input
                              type="color"
                              value={selectedConfig.primaryButtonTextColor || "#ffffff"}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  primaryButtonTextColor: e.target.value,
                                })
                              }
                              className="mt-1 h-8 w-16 rounded border border-gray-300"
                            />
                          </div>
                          <div className="rounded-md border border-gray-200 p-3">
                            <p className="mb-2 text-xs font-medium text-gray-600">
                              Secondary button
                            </p>
                            <input
                              type="text"
                              value={selectedConfig.secondaryButtonLabel}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  secondaryButtonLabel: e.target.value,
                                })
                              }
                              className="mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Label"
                            />
                            <input
                              type="text"
                              value={selectedConfig.secondaryButtonUrl}
                              onChange={(e) =>
                                updateSelectedVariantConfig({ secondaryButtonUrl: e.target.value })
                              }
                              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="/register"
                            />
                            <input
                              type="text"
                              value={selectedConfig.secondaryButtonIcon || ""}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  secondaryButtonIcon: e.target.value,
                                })
                              }
                              className="mt-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                              placeholder="Secondary icon (e.g. fi-rr-phone-call)"
                            />
                            <label className="mt-2 block text-xs font-medium text-gray-600">
                              Secondary color
                            </label>
                            <input
                              type="color"
                              value={selectedConfig.secondaryButtonColor || "#f97316"}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  secondaryButtonColor: e.target.value,
                                })
                              }
                              className="mt-1 h-8 w-16 rounded border border-gray-300"
                            />
                            <label className="mt-2 block text-xs font-medium text-gray-600">
                              Secondary text color
                            </label>
                            <input
                              type="color"
                              value={selectedConfig.secondaryButtonTextColor || "#ffffff"}
                              onChange={(e) =>
                                updateSelectedVariantConfig({
                                  secondaryButtonTextColor: e.target.value,
                                })
                              }
                              className="mt-1 h-8 w-16 rounded border border-gray-300"
                            />
                          </div>
                        </div>
                </div>
            </div>

            <div className="mx-auto mt-8 max-w-4xl border-t border-gray-200 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-800">Preview draft</span> shows your current
                  edits in a new tab — no need to save first. Use Save when you want it live.
                  {isLocalPreview ? (
                    <span className="mt-1 block text-xs text-gray-400">{previewStoreUrl}/navbar-preview/</span>
                  ) : null}
                  {variantSaveMessage ? (
                    <span className="mt-1 block text-green-700">{variantSaveMessage}</span>
                  ) : null}
                </div>
                <div className="flex flex-row flex-nowrap items-center justify-end gap-3 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => void openStorefrontPreview()}
                    disabled={previewOpening}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {previewOpening ? "Opening preview…" : "Preview draft (new tab)"}
                  </button>
                  <button
                    type="button"
                    onClick={saveVariantForStorefrontTest}
                    disabled={variantSaving}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {variantSaving ? "Saving…" : "Save to storefront"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
