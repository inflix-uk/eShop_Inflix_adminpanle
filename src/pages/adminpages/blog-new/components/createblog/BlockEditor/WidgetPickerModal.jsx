"use client";

import PropTypes from "prop-types";
import {
  X,
  LayoutGrid,
  Mail,
  CircleHelp,
  Video,
  MapPin,
  GalleryHorizontal,
  Boxes,
  MessageSquareQuote,
  Award,
  LayoutPanelTop,
  Tags,
  Megaphone,
  Newspaper,
  Code2,
} from "lucide-react";

const WIDGET_OPTIONS = [
  {
    id: "slider",
    title: "Image slider",
    description: "Carousel of slides with image, heading, and description.",
    Icon: LayoutGrid,
  },
  {
    id: "newsletter",
    title: "Newsletter signup",
    description: "Email field and subscribe button; optional image and copy.",
    Icon: Mail,
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Accordion-style questions and answers.",
    Icon: CircleHelp,
  },
  {
    id: "video",
    title: "Video",
    description: "YouTube, Vimeo, or direct link to .mp4 / .webm / .ogg.",
    Icon: Video,
  },
  {
    id: "map",
    title: "Google Map",
    description: "Paste the embed URL from Google Maps (Share → Embed a map).",
    Icon: MapPin,
  },
  {
    id: "gallery",
    title: "Image gallery",
    description: "Grid of images with captions; click to open a full-screen viewer.",
    Icon: GalleryHorizontal,
  },
  {
    id: "iconBox",
    title: "Icon box",
    description:
      "Lucide icons in a grid (names from lucide.dev/icons, e.g. phone, shield-check).",
    Icon: Boxes,
  },
  {
    id: "testimonials",
    title: "Testimonials",
    description: "Quotes with optional stars, name, role, and avatar image.",
    Icon: MessageSquareQuote,
  },
  {
    id: "trustpilot",
    title: "Trustpilot embed",
    description: "Paste Trustpilot’s widget HTML (includes a trustpilot-widget element).",
    Icon: Award,
  },
  {
    id: "siteBanners",
    title: "Banners",
    description:
      "Create simple or full-featured slides in the editor; carousel on the live site.",
    Icon: LayoutPanelTop,
  },
  {
    id: "categoryCards",
    title: "Category cards",
    description:
      "Category tiles with background image, optional product image, and shop link (same as Category cards admin).",
    Icon: Tags,
  },
  {
    id: "promotionalSections",
    title: "Promotional sections",
    description:
      "Homepage-style promos in one block: a top banner, two cards in a row, then a bottom strip. Edit each part in the order it appears on the page.",
    Icon: Megaphone,
  },
  {
    id: "latestBlogs",
    title: "Latest blogs",
    description:
      "Grid of recent posts (public site uses the same latest-blogs feed). Set heading, how many posts, and optional “view all” link.",
    Icon: Newspaper,
  },
  {
    id: "htmlCss",
    title: "Custom HTML / CSS",
    description:
      "Fragment HTML and CSS in separate tabs; CSS is scoped with @scope on the live site. Markup is server-rendered (visible in page HTML).",
    Icon: Code2,
  },
];

export default function WidgetPickerModal({ isOpen, onClose, onSelectWidgetType }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-5 sm:px-6 sm:py-8 bg-black/40">
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-gray-200 bg-white shadow-xl mx-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="widget-picker-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-3 sm:px-8">
          <h2 id="widget-picker-title" className="text-lg font-semibold text-gray-900">
            Insert widget
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 pb-6 sm:px-8 sm:py-5 sm:pb-8">
          <p className="mb-3 text-sm text-gray-600">
            Choose a widget. Content is stored in this page&apos;s blocks (separate from homepage
            slider settings).
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WIDGET_OPTIONS.map((w) => {
              const Icon = w.Icon;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    onSelectWidgetType(w.id);
                    onClose();
                  }}
                  className="flex h-full min-h-[7.5rem] flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-primary">
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900">{w.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-gray-600 line-clamp-3">
                      {w.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

WidgetPickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectWidgetType: PropTypes.func.isRequired,
};
