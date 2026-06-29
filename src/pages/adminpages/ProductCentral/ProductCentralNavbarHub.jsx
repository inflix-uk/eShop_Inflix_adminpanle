import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import axios from "axios";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Helmet } from "react-helmet-async";
import {
  FiDownload,
  FiGrid,
  FiHome,
  FiPhone,
  FiSearch,
  FiShoppingCart,
  FiStar,
  FiTag,
  FiUser,
} from "react-icons/fi";
import { GiFlame } from "react-icons/gi";
// import NavbarOrderEditor from "../../../components/ProductCentralComponents/NavbarOrderEditor";
// import HomepageNavLinksEditor from "../../../components/ProductCentralComponents/HomepageNavLinksEditor";
import { useAuth } from "../../../context/Auth";
import { getLogo } from "../logo/service/logoService";
import {
  resolveBackendAssetUrl,
  withCacheBust,
} from "../../../utils/backendAssetUrl";

const TAB_ORDER = "order";
const TAB_LINKS = "links";
const TAB_VARIANTS = "variants";
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
    actionIcon1: "FiShoppingCart",
    actionIcon2: "FiUser",
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
    primaryButtonIcon: "FiDownload",
    primaryButtonColor: "#0e9f6e",
    primaryButtonTextColor: "#ffffff",
    secondaryButtonLabel: "Get started",
    secondaryButtonUrl: "/register",
    secondaryButtonIcon: "FiPhone",
    secondaryButtonColor: "#f97316",
    secondaryButtonTextColor: "#ffffff",
    menuLinkTextColor: "#334155",
    menuLinkHoverColor: "#0f172a",
    links: DEFAULT_NAVBAR_LINKS.map((l) => ({ ...l })),
  };
}

function resolveNavbarIcon(code) {
  const iconMap = {
    FiHome,
    FiGrid,
    FiStar,
    FiTag,
    FiShoppingCart,
    FiUser,
    FiDownload,
    FiPhone,
    FiSearch,
  };
  return iconMap[String(code || "").trim()] || FiGrid;
}

function normalizeTab(raw) {
  const t = String(raw || "").toLowerCase().trim();
  if (t === TAB_VARIANTS) return TAB_VARIANTS;
  /* Navbar order + Storefront nav links tabs temporarily hidden — default here. */
  // if (t === TAB_LINKS) return TAB_LINKS;
  // return TAB_ORDER;
  return TAB_VARIANTS;
}

export default function ProductCentralNavbarHub() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPage, setSelectedPage] = useState("storefront-navbar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() =>
    normalizeTab(searchParams.get("tab"))
  );
  const [selectedPreset, setSelectedPreset] = useState(() => NAVBAR_LAYOUT_PRESETS[0]);
  const [variantConfigs, setVariantConfigs] = useState(() =>
    NAVBAR_LAYOUT_PRESETS.reduce((acc, preset) => {
      acc[presetKey(preset)] = createInitialVariantConfig(preset);
      return acc;
    }, {})
  );
  const [variantSaveMessage, setVariantSaveMessage] = useState("");
  const [variantSaving, setVariantSaving] = useState(false);
  const [draggingLinkId, setDraggingLinkId] = useState(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState("");
  const [storeLogoAlt, setStoreLogoAlt] = useState("");
  const [storeLogoLoading, setStoreLogoLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    setSelectedTab(normalizeTab(searchParams.get("tab")));
  }, [searchParams]);

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

  const syncTabToUrl = useCallback(
    (tab) => {
      const next = normalizeTab(tab);
      setSearchParams(next === TAB_ORDER ? {} : { tab: next }, { replace: true });
    },
    [setSearchParams]
  );

  const tabIndex = 0;
  const selectedPresetId = presetKey(selectedPreset);
  const selectedConfig =
    variantConfigs[selectedPresetId] || createInitialVariantConfig(selectedPreset);
  const previewLogoUrl = storeLogoPreview;
  const previewLogoText =
    selectedConfig.logoText?.trim() || storeLogoAlt || "Brand";

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
  const PreviewPrimaryIcon = resolveNavbarIcon(selectedConfig.primaryButtonIcon);
  const PreviewSecondaryIcon = resolveNavbarIcon(selectedConfig.secondaryButtonIcon);
  const PreviewActionIcon1 = resolveNavbarIcon(selectedConfig.actionIcon1);
  const PreviewActionIcon2 = resolveNavbarIcon(selectedConfig.actionIcon2);
  const previewLinks = selectedConfig.links.slice(0, 5);

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

            <div className="mb-6 flex items-center gap-3">
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
                <h1 className="text-2xl font-semibold text-gray-900">Navbar</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Order storefront categories and manage quick nav links for the public site.
                </p>
              </div>
            </div>

            <Tab.Group
              selectedIndex={tabIndex}
              onChange={() => {
                setSelectedTab(TAB_VARIANTS);
                syncTabToUrl(TAB_VARIANTS);
              }}
            >
              <Tab.List className="mb-6 flex space-x-1 overflow-x-auto rounded-xl bg-gray-100 p-1 max-w-2xl">
                {/*
                <Tab
                  className={({ selected }) =>
                    `rounded-lg py-2.5 px-4 text-sm font-medium leading-5 whitespace-nowrap w-full
                    ${
                      selected
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-primary"
                    }`
                  }
                >
                  Navbar order
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `rounded-lg py-2.5 px-4 text-sm font-medium leading-5 whitespace-nowrap w-full
                    ${
                      selected
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-primary"
                    }`
                  }
                >
                  Storefront nav links
                </Tab>
                */}
                <Tab
                  className={({ selected }) =>
                    `rounded-lg py-2.5 px-4 text-sm font-medium leading-5 whitespace-nowrap w-full
                    ${
                      selected
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-primary"
                    }`
                  }
                >
                  Navbar variants
                </Tab>
              </Tab.List>

              <Tab.Panels>
                {/*
                <Tab.Panel>
                  <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Order navbar categories
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose categories, drag to set order, then save. The storefront navbar uses
                      this order.
                    </p>
                    <NavbarOrderEditor />
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Storefront nav links</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Navbar and homepage quick links for the public site.
                    </p>
                    <HomepageNavLinksEditor />
                  </div>
                </Tab.Panel>
                */}
                <Tab.Panel>
                  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                    <div className="mb-5">
                      <h2 className="text-lg font-medium text-gray-900 mb-1">Navbar variants</h2>
                      <p className="text-sm text-gray-500">
                        Same preset selector style as the navbar widget editor. Pick a preset and
                        preview it here.
                      </p>
                    </div>

                    <div className="rounded-lg border border-cyan-100 bg-cyan-50/40 p-4 space-y-4">
                      <div className="space-y-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-blue-900">
                          <input
                            type="checkbox"
                            checked={selectedConfig.showOnStorefront !== false}
                            onChange={(e) =>
                              updateSelectedVariantConfig({
                                showOnStorefront: e.target.checked,
                              })
                            }
                          />
                          Show overall navbar on storefront
                        </label>
                        <label className="flex flex-wrap items-center gap-2 text-xs font-medium text-blue-900">
                          <input
                            type="checkbox"
                            checked={selectedConfig.stickyNavbar === true}
                            onChange={(e) =>
                              updateSelectedVariantConfig({
                                stickyNavbar: e.target.checked,
                              })
                            }
                          />
                          <span>
                            Sticky navbar (stay pinned to top while scrolling — applies to this
                            preset when it is the active storefront variant)
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Choose navbar preset (preview)
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

                      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Variant title
                            </label>
                            <input
                              type="text"
                              value={selectedConfig.label}
                              onChange={(e) => updateSelectedVariantConfig({ label: e.target.value })}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                              placeholder="Variant name"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              Logo text
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

                        <div className="rounded-md border border-gray-200 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-600">Menu links</p>
                            <button
                              type="button"
                              onClick={addSelectedLink}
                              className="rounded bg-primary px-4 py-2 text-xs font-medium text-white"
                            >
                              Add link
                            </button>
                          </div>
                          <div className="space-y-2">
                            {selectedConfig.links.map((link) => (
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
                                className={`grid grid-cols-12 gap-2 rounded-md p-1 ${
                                  draggingLinkId === link.id ? "bg-gray-100" : ""
                                }`}
                              >
                                <div
                                  className="col-span-1 flex cursor-grab items-center justify-center rounded-md border border-gray-300 bg-gray-50 text-gray-500 active:cursor-grabbing"
                                  title="Drag to reorder"
                                >
                                  ::
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
                                      placeholder="FiHome (react-icons)"
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
                                        ? "FiHome (react-icons)"
                                        : "Label"
                                    }
                                  />
                                )}
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => updateSelectedLink(link.id, { url: e.target.value })}
                                  className={`rounded-md border border-gray-300 px-2 py-1.5 text-xs ${
                                    link.linkType === "icon_label" ? "col-span-4" : "col-span-5"
                                  }`}
                                  placeholder="/path"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSelectedLink(link.id)}
                                  className="col-span-1 rounded-md border border-red-200 text-xs text-red-600"
                                  title="Remove link"
                                >
                                  x
                                </button>
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

                        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                          <p className="mb-2 text-xs font-semibold text-gray-700">
                            Visibility controls
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
                              placeholder="Action icon 1"
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
                              placeholder="Action icon 2"
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
                        <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
                          <p className="text-xs text-blue-800">
                            Need icon names? Use the React Icons Feather list (same library used
                            here).
                          </p>
                          <a
                            href="https://react-icons.github.io/react-icons/icons/fi/"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Open icon library
                          </a>
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
                              placeholder="Primary icon code (e.g. FiDownload)"
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
                              placeholder="Secondary icon code (e.g. FiPhone)"
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

                        <p className="mb-3 text-xs font-medium text-gray-600">
                          Live preview (matches storefront variant style)
                          {selectedConfig.variant === "retail-two-row" ? (
                            <span className="ml-1 block text-[11px] font-normal text-gray-500 sm:inline">
                              Scroll the preview area to test sticky.
                            </span>
                          ) : null}
                        </p>
                        <div className="overflow-x-auto">
                          {selectedConfig.variant === "retail-two-row" ? (
                            <div
                              className="min-w-[920px] max-h-[min(70vh,520px)] overflow-y-auto rounded-xl border bg-gray-50 p-3 shadow-inner"
                              style={{ backgroundColor: selectedConfig.navbarBgColor || "#ffffff" }}
                            >
                              <div className="space-y-3 pb-32">
                                <p className="text-center text-[11px] text-gray-400">
                                  Page content above the navbar (scroll down)
                                </p>
                                <div className="h-16 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200" />
                                <div
                                  className="rounded-xl border p-3 shadow-sm"
                                  style={{ backgroundColor: selectedConfig.navbarBgColor || "#ffffff" }}
                                >
                                  <div
                                    className={`flex items-center justify-between gap-4 ${
                                      selectedConfig.stickyNavbar === true
                                        ? "sticky top-0 z-10 rounded-t-lg border-b border-slate-100 pb-3 shadow-sm"
                                        : "pb-3"
                                    }`}
                                    style={
                                      selectedConfig.stickyNavbar === true
                                        ? { backgroundColor: selectedConfig.navbarBgColor || "#ffffff" }
                                        : undefined
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      {previewLogoUrl ? (
                                        <img src={previewLogoUrl} alt="logo" className="h-10 w-auto rounded-md object-contain" />
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-900">
                                          {previewLogoText}
                                        </span>
                                      )}
                                    </div>
                                    {selectedConfig.showSearch !== false ? (
                                      <div className="flex h-10 w-[42%] items-center rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-400">
                                        Search for products
                                      </div>
                                    ) : (
                                      <div className="min-w-0 flex-1" />
                                    )}
                                    <div className="flex shrink-0 items-center gap-2">
                                      {selectedConfig.showButtons !== false ? (
                                        <>
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                            style={{
                                              backgroundColor: selectedConfig.actionIcon1BgColor || "#0e9f6e",
                                              color: selectedConfig.actionIcon1Color || "#ffffff",
                                            }}>
                                            <PreviewActionIcon1 className="h-4 w-4" />
                                          </span>
                                          <span className="text-[11px] text-slate-600">Basket £0.00</span>
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                            style={{
                                              backgroundColor: selectedConfig.actionIcon2BgColor || "#0e9f6e",
                                              color: selectedConfig.actionIcon2Color || "#ffffff",
                                            }}>
                                            <PreviewActionIcon2 className="h-4 w-4" />
                                          </span>
                                        </>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div
                                    className="rounded-md px-4 py-2"
                                    style={{
                                      backgroundColor:
                                        selectedConfig.classicRightSectionBgColor || "#fdf4df",
                                    }}
                                  >
                                    <div className="flex items-center justify-center gap-8 text-sm">
                                      {previewLinks.map((link) => {
                                        const c = selectedConfig.menuLinkTextColor || "#334155";
                                        if (link.linkType === "icon_label") {
                                          const Cmp = resolveNavbarIcon(link.icon || "FiGrid");
                                          return (
                                            <span key={link.id} className="inline-flex items-center gap-1" style={{ color: c }}>
                                              <Cmp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                              <span>{link.label || "Link"}</span>
                                            </span>
                                          );
                                        }
                                        return (
                                          <span key={link.id} style={{ color: c }}>
                                            {link.linkType === "icon" ? link.icon || "FiGrid" : link.label || "Link"}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-center text-[11px] text-gray-400">
                                  More page content below (keeps scroll going)
                                </p>
                                <div className="h-40 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200" />
                                <div className="h-40 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100" />
                              </div>
                            </div>
                          ) : selectedConfig.variant === "wing-split" ? (
                            <div
                              className="min-w-[860px] overflow-hidden rounded-xl border shadow-sm"
                              style={{
                                backgroundColor:
                                  selectedConfig.navbarBgColor ||
                                  selectedConfig.classicRightSectionBgColor ||
                                  "#f1f5f9",
                              }}
                            >
                              <div className="flex min-h-[52px] w-full items-stretch">
                                <div
                                  className="min-w-0 flex-1"
                                  style={{
                                    backgroundColor:
                                      selectedConfig.navbarBgColor ||
                                      selectedConfig.classicRightSectionBgColor ||
                                      "#f1f5f9",
                                  }}
                                />
                                <div className="flex shrink-0 items-center bg-white px-4">
                                  {previewLogoUrl ? (
                                    <img
                                      src={previewLogoUrl}
                                      alt="logo"
                                      className="h-9 w-auto max-w-[140px] rounded-md object-contain"
                                    />
                                  ) : (
                                    <span className="text-sm font-semibold text-gray-900">
                                      {previewLogoText}
                                    </span>
                                  )}
                                </div>
                                <div
                                  className="flex w-[60%] shrink-0 flex-wrap items-center justify-end gap-3 px-3 py-2"
                                  style={{
                                    backgroundColor:
                                      selectedConfig.navbarBgColor ||
                                      selectedConfig.classicRightSectionBgColor ||
                                      "#f1f5f9",
                                  }}
                                >
                                  <div
                                    className="flex flex-wrap justify-end gap-4 text-sm"
                                    style={{ color: selectedConfig.menuLinkTextColor || "#334155" }}
                                  >
                                    {previewLinks.map((link) => {
                                      if (link.linkType === "icon_label") {
                                        const Cmp = resolveNavbarIcon(link.icon || "FiGrid");
                                        return (
                                          <span key={link.id} className="inline-flex items-center gap-1">
                                            <Cmp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                            <span>{link.label || "Link"}</span>
                                          </span>
                                        );
                                      }
                                      return (
                                        <span key={link.id}>
                                          {link.linkType === "icon" ? link.icon || "FiGrid" : link.label || "Link"}
                                        </span>
                                      );
                                    })}
                                  </div>
                                  {selectedConfig.showSearch !== false ? (
                                    <span className="rounded-md border border-slate-300/80 bg-white/90 px-2 py-1 text-[11px] text-slate-600">
                                      Search
                                    </span>
                                  ) : null}
                                  {selectedConfig.showButtons !== false ? (
                                    <>
                                      <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                        style={{
                                          backgroundColor: selectedConfig.actionIcon1BgColor || "#0e9f6e",
                                          color: selectedConfig.actionIcon1Color || "#ffffff",
                                        }}
                                      >
                                        <PreviewActionIcon1 className="h-4 w-4" />
                                      </span>
                                      <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                        style={{
                                          backgroundColor: selectedConfig.actionIcon2BgColor || "#0e9f6e",
                                          color: selectedConfig.actionIcon2Color || "#ffffff",
                                        }}
                                      >
                                        <PreviewActionIcon2 className="h-4 w-4" />
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ) : selectedConfig.variant === "pill-black" ? (
                            <div className="flex min-w-[720px] justify-center bg-neutral-200/90 py-10">
                              <div
                                className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full px-5 py-2.5 shadow-[0_10px_36px_rgba(0,0,0,0.28)]"
                                style={{
                                  backgroundColor: selectedConfig.navbarBgColor?.trim() || "#000000",
                                }}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10">
                                  {previewLogoUrl ? (
                                    <img
                                      src={previewLogoUrl}
                                      alt=""
                                      className="h-[70%] w-[70%] object-contain"
                                    />
                                  ) : (
                                    <GiFlame className="h-6 w-6 text-[#2563eb]" aria-hidden />
                                  )}
                                </div>
                                <div className="flex min-w-0 flex-1 justify-center gap-7 text-[15px] font-medium text-white">
                                  {previewLinks.map((link) => (
                                    <span key={link.id} className="shrink-0 whitespace-nowrap">
                                      {link.linkType === "icon" ? link.icon || "FiGrid" : link.label || "Link"}
                                    </span>
                                  ))}
                                </div>
                                {selectedConfig.showPrimaryButton !== false ? (
                                  <span className="max-w-[12rem] truncate rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black shadow-sm ring-1 ring-black/10">
                                    {selectedConfig.primaryButtonLabel || "fire@email.com"}
                                  </span>
                                ) : (
                                  <span className="w-10 shrink-0" aria-hidden />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              className="min-w-[860px] rounded-xl border p-3 shadow-sm"
                              style={{ backgroundColor: selectedConfig.navbarBgColor || "#ffffff" }}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {previewLogoUrl ? (
                                    <img src={previewLogoUrl} alt="logo" className="h-9 w-9 rounded-md object-contain" />
                                  ) : (
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-bold text-white">
                                      {(previewLogoText || "NB").slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                  <span className="text-sm font-semibold text-gray-900">
                                    {previewLogoText}
                                  </span>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                  {previewLinks.map((link) => {
                                    const c = selectedConfig.menuLinkTextColor || "#334155";
                                    if (link.linkType === "icon_label") {
                                      const Cmp = resolveNavbarIcon(link.icon || "FiGrid");
                                      return (
                                        <span key={link.id} className="inline-flex items-center gap-1" style={{ color: c }}>
                                          <Cmp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                          <span>{link.label || "Link"}</span>
                                        </span>
                                      );
                                    }
                                    return (
                                      <span key={link.id} style={{ color: c }}>
                                        {link.linkType === "icon" ? link.icon || "FiGrid" : link.label || "Link"}
                                      </span>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedConfig.showSearch !== false ? (
                                    <span className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
                                      Search
                                    </span>
                                  ) : null}
                                  {selectedConfig.showButtons !== false ? (
                                    <>
                                      <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                        style={{
                                          backgroundColor: selectedConfig.actionIcon1BgColor || "#0e9f6e",
                                          color: selectedConfig.actionIcon1Color || "#ffffff",
                                        }}
                                      >
                                        <PreviewActionIcon1 className="h-4 w-4" />
                                      </span>
                                      <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                                        style={{
                                          backgroundColor: selectedConfig.actionIcon2BgColor || "#0e9f6e",
                                          color: selectedConfig.actionIcon2Color || "#ffffff",
                                        }}
                                      >
                                        <PreviewActionIcon2 className="h-4 w-4" />
                                      </span>
                                    </>
                                  ) : null}
                                  {selectedConfig.showPrimaryButton !== false ? (
                                    <span
                                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                                      style={{
                                        backgroundColor:
                                          selectedConfig.primaryButtonColor || "#0e9f6e",
                                        color: selectedConfig.primaryButtonTextColor || "#ffffff",
                                      }}
                                    >
                                      <span className="inline-flex items-center gap-1">
                                        <PreviewPrimaryIcon className="h-3.5 w-3.5" />
                                        {selectedConfig.primaryButtonLabel || "Primary"}
                                      </span>
                                    </span>
                                  ) : null}
                                  {selectedConfig.showSecondaryButton !== false ? (
                                    <span
                                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                                      style={{
                                        backgroundColor:
                                          selectedConfig.secondaryButtonColor || "#f97316",
                                        color: selectedConfig.secondaryButtonTextColor || "#ffffff",
                                      }}
                                    >
                                      <span className="inline-flex items-center gap-1">
                                        <PreviewSecondaryIcon className="h-3.5 w-3.5" />
                                        {selectedConfig.secondaryButtonLabel || "Secondary"}
                                      </span>
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                          Selected preset:{" "}
                          <span className="font-semibold text-gray-800">{selectedConfig.label}</span>{" "}
                          ({selectedConfig.variant}) - {selectedConfig.layoutLabel}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={saveVariantForStorefrontTest}
                            disabled={variantSaving}
                            className="rounded-sm bg-blue-600 px-6 py-3 text-sm font-medium text-white"
                          >
                            {variantSaving
                              ? "Saving..."
                              : "Save"}
                          </button>
                          {variantSaveMessage ? (
                            <span className="text-xs text-green-700">{variantSaveMessage}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </main>
      </div>
    </>
  );
}
