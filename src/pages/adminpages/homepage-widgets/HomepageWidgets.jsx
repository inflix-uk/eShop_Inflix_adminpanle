import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  fetchSiteWidgetSettings,
  putSiteWidgetSettings,
} from "./service/siteWidgetSettingsService";

const AVAILABLE_WIDGETS = [
  {
    id: "slider",
    title: "Image slider",
    description:
      "Carousel with images, headings, and descriptions. Add and edit in Homepage Content, blog posts, or other pages using Add content row → Add Widget.",
    settingKey: "sliderEnabled",
  },
  {
    id: "newsletter",
    title: "Newsletter signup",
    description:
      "Email field and subscribe button (same API as site newsletter forms). Add and edit via Add content row → Add Widget where the block editor is available.",
    settingKey: "newsletterEnabled",
  },
  {
    id: "faq",
    title: "FAQ",
    description:
      "Accordion Q&A blocks. Add and edit via Add content row → Add Widget in the block editor.",
    settingKey: "faqEnabled",
  },
  {
    id: "video",
    title: "Video",
    description:
      "Embedded YouTube, Vimeo, or direct .mp4/.webm/.ogg URL. Add via Add content row → Add Widget.",
    settingKey: "videoEnabled",
  },
  {
    id: "map",
    title: "Google Map",
    description:
      "Embed a map using the iframe URL from Google Maps (Share → Embed). Add via Add content row → Add Widget.",
    settingKey: "mapEnabled",
  },
  {
    id: "gallery",
    title: "Image gallery",
    description:
      "Multi-image grid with lightbox. Add via Add content row → Add Widget in the block editor.",
    settingKey: "galleryEnabled",
  },
  {
    id: "iconBox",
    title: "Icon box",
    description:
      "Grid of Lucide icons with title and text. Add via Add content row → Add Widget; enter icon names from lucide.dev/icons (e.g. phone, truck, shield-check).",
    settingKey: "iconBoxEnabled",
  },
  {
    id: "testimonials",
    title: "Testimonials",
    description:
      "Customer quotes with optional star rating, name, role, and avatar. Add via Add content row → Add Widget.",
    settingKey: "testimonialsEnabled",
  },
  {
    id: "trustpilot",
    title: "Trustpilot embed (block)",
    description:
      "Paste a Trustpilot widget embed snippet in a content block (same as Settings → Trustpilot, but per page). Add via Add content row → Add Widget.",
    settingKey: "trustpilotWidgetEnabled",
  },
  {
    id: "siteBanners",
    title: "Banners (block)",
    description:
      "Banner carousel built inside content blocks (Add Widget → Banners). Add via Add content row → Add Widget.",
    settingKey: "siteBannersEnabled",
  },
  {
    id: "categoryCards",
    title: "Category cards (block)",
    description:
      "Category tiles with images and links (Add Widget → Category cards), same fields as Admin → Category cards.",
    settingKey: "categoryCardsEnabled",
  },
  {
    id: "promotionalSections",
    title: "Promotional sections (block)",
    description:
      "Top banner, two side-by-side cards, and bottom strip — same stack as the homepage promos; add via Add Widget → Promotional sections.",
    settingKey: "promotionalSectionsEnabled",
  },
  {
    id: "latestBlogs",
    title: "Latest blogs (block)",
    description:
      "Shows recent blog posts from the site (same feed as /api/blogs/latest). Add via Add content row → Add Widget.",
    settingKey: "latestBlogsEnabled",
  },
  {
    id: "htmlCss",
    title: "Custom HTML / CSS (block)",
    description:
      "Fragment HTML and CSS; CSS scoped with @scope, markup server-rendered on the public site. Add via Add content row → Add Widget.",
    settingKey: "htmlCssEnabled",
  },
  {
    id: "contactUs",
    title: "Contact form (block)",
    description:
      "Configurable contact form for any page (Add Widget → Contact form) in the block editor.",
    settingKey: "contactUsEnabled",
  },
];

const PLACEHOLDER_WIDGETS = [];

export default function HomepageWidgets() {
  const [selectedPage, setSelectedPage] = useState("widgets-settings");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [flags, setFlags] = useState({
    sliderEnabled: true,
    newsletterEnabled: true,
    faqEnabled: true,
    videoEnabled: true,
    mapEnabled: true,
    galleryEnabled: true,
    iconBoxEnabled: true,
    testimonialsEnabled: true,
    trustpilotWidgetEnabled: true,
    siteBannersEnabled: true,
    categoryCardsEnabled: true,
    promotionalSectionsEnabled: true,
    latestBlogsEnabled: true,
    htmlCssEnabled: true,
    contactUsEnabled: true,
  });
  const [updatedAt, setUpdatedAt] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const data = await fetchSiteWidgetSettings();
    if (data) {
      setFlags({
        sliderEnabled: data.sliderEnabled,
        newsletterEnabled: data.newsletterEnabled,
        faqEnabled: data.faqEnabled,
        videoEnabled: data.videoEnabled,
        mapEnabled: data.mapEnabled,
        galleryEnabled: data.galleryEnabled,
        iconBoxEnabled: data.iconBoxEnabled,
        testimonialsEnabled: data.testimonialsEnabled,
        trustpilotWidgetEnabled: data.trustpilotWidgetEnabled,
        siteBannersEnabled: data.siteBannersEnabled,
        categoryCardsEnabled: data.categoryCardsEnabled,
        promotionalSectionsEnabled: data.promotionalSectionsEnabled,
        latestBlogsEnabled: data.latestBlogsEnabled,
        htmlCssEnabled: data.htmlCssEnabled,
        contactUsEnabled: data.contactUsEnabled,
      });
      setUpdatedAt(data.updatedAt);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = async (settingKey, widgetId) => {
    setSavingKey(widgetId);
    const result = await putSiteWidgetSettings({
      [settingKey]: !flags[settingKey],
    });
    if (result) {
      setFlags({
        sliderEnabled: result.sliderEnabled,
        newsletterEnabled: result.newsletterEnabled,
        faqEnabled: result.faqEnabled,
        videoEnabled: result.videoEnabled,
        mapEnabled: result.mapEnabled,
        galleryEnabled: result.galleryEnabled,
        iconBoxEnabled: result.iconBoxEnabled,
        testimonialsEnabled: result.testimonialsEnabled,
        trustpilotWidgetEnabled: result.trustpilotWidgetEnabled,
        siteBannersEnabled: result.siteBannersEnabled,
        categoryCardsEnabled: result.categoryCardsEnabled,
        promotionalSectionsEnabled: result.promotionalSectionsEnabled,
        latestBlogsEnabled: result.latestBlogsEnabled,
        htmlCssEnabled: result.htmlCssEnabled,
        contactUsEnabled: result.contactUsEnabled,
      });
      setUpdatedAt(result.updatedAt);
    }
    setSavingKey(null);
  };

  return (
    <>
      <Helmet>
        <title>Homepage Widgets - Admin</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="mb-6 sm:mb-8">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Homepage Widgets</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Widget types your team can insert with <strong>Add content row</strong> →{" "}
                <strong>Add Widget</strong>. Use the switches below to show or hide each type on the{" "}
                <strong>public website</strong> (including inside blog posts and homepage content
                blocks). The <strong>Contact form</strong> block uses the same visibility switch as other
                widget types when it is added via the block editor.
              </p>
              {updatedAt && !loading && (
                <p className="mt-1 text-xs text-gray-500">
                  Visibility last saved: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </header>

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Loading…
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {AVAILABLE_WIDGETS.map((w) => {
                  const enabled = flags[w.settingKey];
                  const busy = savingKey === w.id;
                  return (
                    <div
                      key={w.id}
                      className="flex h-full min-h-[160px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold text-gray-900">{w.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">{w.description}</p>
                      </div>
                      <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <span className="text-xs font-medium text-gray-500">Public site</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            disabled={busy}
                            onClick={() => handleToggle(w.settingKey, w.id)}
                            className={`relative inline-flex h-8 w-14 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                              enabled ? "bg-primary" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition ${
                                enabled ? "translate-x-6" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span className="w-8 text-xs font-medium text-gray-600">
                            {enabled ? "On" : "Off"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {PLACEHOLDER_WIDGETS.length > 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-gray-50/80 p-4 sm:p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Coming later
                    </h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {PLACEHOLDER_WIDGETS.map((w) => (
                        <li key={w.id} className="text-sm text-gray-600">
                          <span className="font-medium text-gray-800">{w.title}</span>
                          <span className="text-gray-500"> — {w.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
