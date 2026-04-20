"use client";

import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { nanoid } from "nanoid";
import {
  Grip,
  Trash2,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Images,
  Mail,
  CircleHelp,
  Video,
  MapPin,
  GalleryHorizontal,
  Boxes,
  CircleDashed,
  MessageSquareQuote,
  Award,
  LayoutPanelTop,
  Tags,
  Megaphone,
  Newspaper,
  Code2,
  Percent,
  Gift,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { API_BASE_URL } from "../../../service/blogService";
import InlineBannerItemEditor from "./InlineBannerItemEditor";
import InlineCategoryCardItemEditor from "./InlineCategoryCardItemEditor";
import InlinePromotionalSectionsEditor from "./InlinePromotionalSectionsEditor";
import { createBannerWidgetItem } from "./bannerWidgetDefaults";
import {
  createCategoryCardWidgetItem,
  DEFAULT_CATEGORY_CARDS_SECTION,
} from "./categoryCardWidgetDefaults";

const MAX_SLIDES = 10;
const MAX_SITE_BANNER_ITEMS = 8;
const MAX_CATEGORY_CARD_ITEMS = 12;
const MAX_FAQ_ITEMS = 30;
const MAX_GALLERY_ITEMS = 24;
const MAX_ICON_BOX_ITEMS = 12;
const MAX_TESTIMONIAL_ITEMS = 12;
const MAX_DEALS_DISCOUNT_ITEMS = 24;

const BLOCKED_NEWSLETTER_PLACEHOLDERS = new Set(["malikoffical32@gmail.com"]);

function normalizeNewsletterPlaceholder(raw) {
  const s = raw == null ? "" : String(raw).trim();
  if (!s) return "";
  if (BLOCKED_NEWSLETTER_PLACEHOLDERS.has(s.toLowerCase())) {
    return "Enter your email";
  }
  return s;
}

function getSlideImageSrc(imagePath) {
  if (!imagePath) return "";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const base = (API_BASE_URL || "").replace(/\/$/, "");
  if (imagePath.startsWith("/")) return `${base}${imagePath}`;
  return `${base}/uploads/${imagePath}`;
}

function createSlide() {
  return { id: nanoid(), heading: "", description: "", imageUrl: "" };
}

function createFaqItem() {
  return { id: nanoid(), question: "", answer: "" };
}

function createGalleryItem() {
  return { id: nanoid(), imageUrl: "", caption: "", alt: "" };
}

function createIconBoxItem() {
  return { id: nanoid(), iconCode: "", title: "", description: "" };
}

function createTestimonialItem() {
  return {
    id: nanoid(),
    quote: "",
    authorName: "",
    authorRole: "",
    rating: 5,
    avatarUrl: "",
  };
}

function createDealsDiscountCardItem() {
  return {
    id: nanoid(),
    emoji: "🎁",
    title: "",
    desc: "",
    type: "Deal",
    hasExpiry: true,
    startDate: "",
    expiryDate: "",
    isExpired: false,
    couponCode: "",
    buttonText: "Shop now",
    buttonUrl: "",
  };
}

/** `<input type="date">` only accepts yyyy-MM-dd; map legacy ISO / dd/mm/yyyy when possible. */
function dealsCardDateToInputValue(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  const m2 = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m2) {
    const dd = m2[1].padStart(2, "0");
    const mm = m2[2].padStart(2, "0");
    const yyyy = m2[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

function normalizeLucideIconCodeForPreview(code) {
  const t = String(code || "").trim().replace(/\s+/g, "-");
  if (!t) return null;
  let s = t;
  if (/[A-Z]/.test(t)) {
    s = t.replace(/([a-z0-9])([A-Z])/g, "$1-$2");
  }
  s = s.toLowerCase();
  if (!/^[a-z0-9-]+$/.test(s) || s.length > 64) return null;
  return s;
}

function IconBoxLucidePreview({ code }) {
  const name = normalizeLucideIconCodeForPreview(code);
  if (!name) {
    return <CircleDashed className="h-6 w-6 text-gray-300" strokeWidth={1.5} aria-hidden />;
  }
  return (
    <DynamicIcon
      name={name}
      size={22}
      strokeWidth={2}
      className="text-sky-700"
      fallback={() => (
        <CircleDashed className="h-6 w-6 text-gray-300" strokeWidth={1.5} aria-hidden />
      )}
    />
  );
}

export default function WidgetBlock({
  id,
  content,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const [htmlCssTab, setHtmlCssTab] = useState("html");
  const widgetType = content?.widgetType || "slider";

  if (widgetType === "newsletter") {
    const heading = content?.heading ?? "";
    const description = content?.description ?? "";
    const placeholder =
      normalizeNewsletterPlaceholder(content?.placeholder ?? "Enter your email") ||
      "Enter your email";
    const buttonLabel = content?.buttonLabel ?? "Subscribe";
    const imageUrl = content?.imageUrl ?? "";

    const patchNewsletter = (partial) =>
      onChange(id, {
        widgetType: "newsletter",
        heading,
        description,
        placeholder,
        buttonLabel,
        imageUrl,
        ...partial,
      });

    const handleNewsletterImagePick = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        patchNewsletter({ imageUrl: ev.target?.result || "" });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    return (
      <div className="border-2 border-emerald-200 rounded-lg p-3 mb-4 bg-emerald-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <Grip className="text-emerald-600" size={18} />
            <Mail className="text-emerald-700" size={18} />
            <span className="text-sm font-semibold text-emerald-900">Newsletter signup</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Optional image
            </label>
            {imageUrl ? (
              <div className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-50 aspect-video max-h-36">
                <img
                  src={getSlideImageSrc(imageUrl)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => patchNewsletter({ imageUrl: "" })}
                  className="absolute top-1 right-1 rounded bg-white/90 px-2 py-0.5 text-xs shadow"
                >
                  Clear
                </button>
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={handleNewsletterImagePick}
              className="text-xs w-full mt-2"
            />
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => patchNewsletter({ heading: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                placeholder="Subscribe to our newsletter"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => patchNewsletter({ description: e.target.value })}
                rows={3}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                placeholder="Short supporting text"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email placeholder
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => patchNewsletter({ placeholder: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Button label</label>
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => patchNewsletter({ buttonLabel: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (widgetType === "faq") {
    const sectionHeading = content?.sectionHeading ?? "";
    const items = Array.isArray(content?.items) ? content.items : [];

    const patchFaq = (partial) =>
      onChange(id, {
        widgetType: "faq",
        sectionHeading,
        items,
        ...partial,
      });

    const updateItem = (itemId, patch) => {
      patchFaq({
        items: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      });
    };

    const addItem = () => {
      if (items.length >= MAX_FAQ_ITEMS) return;
      patchFaq({ items: [...items, createFaqItem()] });
    };

    const removeItem = (itemId) => {
      if (items.length <= 1) return;
      patchFaq({ items: items.filter((it) => it.id !== itemId) });
    };

    if (items.length === 0) {
      return (
        <div className="border-2 border-sky-200 rounded-lg p-4 mb-4 bg-sky-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grip className="text-sky-600" size={18} />
              <CircleHelp className="text-sky-700" size={18} />
              <span className="text-sm font-semibold text-sky-900">FAQ widget</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move down"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                title="Remove widget"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => patchFaq({ items: [createFaqItem()] })}
            className="mt-3 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
          >
            Add first FAQ item
          </button>
        </div>
      );
    }

    return (
      <div className="border-2 border-sky-200 rounded-lg p-3 mb-4 bg-sky-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <Grip className="text-sky-600" size={18} />
            <CircleHelp className="text-sky-700" size={18} />
            <span className="text-sm font-semibold text-sky-900">FAQ</span>
            <span className="text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Section heading (optional)
          </label>
          <input
            type="text"
            value={sectionHeading}
            onChange={(e) => patchFaq({ sectionHeading: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="Frequently asked questions"
          />
        </div>

        <div className="space-y-3 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-sky-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sky-800">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => updateItem(item.id, { question: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    placeholder="Question text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                  <textarea
                    value={item.answer}
                    onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                    rows={4}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-mono text-sm"
                    placeholder="HTML or plain text"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= MAX_FAQ_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-sky-300 rounded-md text-sky-800 text-sm flex items-center justify-center gap-1 hover:bg-sky-50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add FAQ item ({items.length}/{MAX_FAQ_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "video") {
    const videoUrl = content?.videoUrl ?? "";
    const heading = content?.heading ?? "";
    const caption = content?.caption ?? "";

    const patchVideo = (partial) =>
      onChange(id, {
        widgetType: "video",
        videoUrl,
        heading,
        caption,
        ...partial,
      });

    const handleVideoFilePick = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        patchVideo({ videoUrl: ev.target?.result || "" });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    return (
      <div className="border-2 border-orange-200 rounded-lg p-3 mb-4 bg-orange-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <Grip className="text-orange-600" size={18} />
            <Video className="text-orange-700" size={18} />
            <span className="text-sm font-semibold text-orange-900">Video</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Video URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={videoUrl.startsWith("data:") ? "" : videoUrl}
              onChange={(e) => patchVideo({ videoUrl: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
              placeholder="https://www.youtube.com/watch?v=… or Vimeo / .mp4 URL"
            />
            <p className="mt-1 text-xs text-gray-500">
              Or upload a file (saved to your server when you publish). YouTube, Vimeo, or direct
              .mp4 / .webm / .ogg links also work.
            </p>
            {videoUrl.startsWith("data:") ? (
              <p className="mt-1 text-xs font-medium text-orange-800">
                Uploaded video ready — will upload on save.{" "}
                <button
                  type="button"
                  className="text-red-600 underline"
                  onClick={() => patchVideo({ videoUrl: "" })}
                >
                  Remove file
                </button>
              </p>
            ) : null}
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
              onChange={handleVideoFilePick}
              className="text-xs w-full mt-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Heading (optional)</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => patchVideo({ heading: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Title above the player"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Caption (optional)</label>
            <textarea
              value={caption}
              onChange={(e) => patchVideo({ caption: e.target.value })}
              rows={2}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Short text below the video"
            />
          </div>
        </div>
      </div>
    );
  }

  if (widgetType === "map") {
    const embedUrl = content?.embedUrl ?? "";
    const heading = content?.heading ?? "";
    const rawH = Number(content?.heightPx);
    const heightPx = Number.isFinite(rawH) ? Math.min(800, Math.max(200, Math.round(rawH))) : 400;

    const patchMap = (partial) =>
      onChange(id, {
        widgetType: "map",
        embedUrl,
        heading,
        heightPx,
        ...partial,
      });

    return (
      <div className="border-2 border-teal-200 rounded-lg p-3 mb-4 bg-teal-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-teal-200">
          <div className="flex items-center gap-2">
            <Grip className="text-teal-600" size={18} />
            <MapPin className="text-teal-700" size={18} />
            <span className="text-sm font-semibold text-teal-900">Google Map</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Embed URL <span className="text-red-500">*</span>
            </label>
            <textarea
              value={embedUrl}
              onChange={(e) => patchMap({ embedUrl: e.target.value })}
              rows={3}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
              placeholder="https://www.google.com/maps/embed?pb=…"
            />
            <p className="mt-1 text-xs text-gray-500">
              Google Maps → Share → <strong>Embed a map</strong> → copy only the <code className="text-[11px]">src</code>{" "}
              URL from the iframe (must start with https and include /maps/embed).
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Heading (optional)</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => patchMap({ heading: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Title above the map"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Height (px, 200–800)
            </label>
            <input
              type="number"
              min={200}
              max={800}
              step={10}
              value={heightPx}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                patchMap({
                  heightPx: Number.isFinite(n) ? Math.min(800, Math.max(200, n)) : 400,
                });
              }}
              className="w-full max-w-[200px] rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  if (widgetType === "gallery") {
    const heading = content?.heading ?? "";
    const items = Array.isArray(content?.items) ? content.items : [];

    const patchGallery = (partial) =>
      onChange(id, {
        widgetType: "gallery",
        heading,
        items,
        ...partial,
      });

    const updateGalleryItem = (itemId, patch) => {
      patchGallery({
        items: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      });
    };

    const addGalleryItem = () => {
      if (items.length >= MAX_GALLERY_ITEMS) return;
      patchGallery({ items: [...items, createGalleryItem()] });
    };

    const removeGalleryItem = (itemId) => {
      if (items.length <= 1) return;
      patchGallery({ items: items.filter((it) => it.id !== itemId) });
    };

    const handleGalleryImagePick = (itemId, e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateGalleryItem(itemId, { imageUrl: ev.target?.result || "" });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    if (items.length === 0) {
      return (
        <div className="border-2 border-indigo-200 rounded-lg p-4 mb-4 bg-indigo-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grip className="text-indigo-600" size={18} />
              <GalleryHorizontal className="text-indigo-700" size={18} />
              <span className="text-sm font-semibold text-indigo-900">Image gallery</span>
            </div>
            <button
              type="button"
              onClick={() =>
                patchGallery({ items: [createGalleryItem()] })
              }
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              Add first image
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="border-2 border-indigo-200 rounded-lg p-3 mb-4 bg-indigo-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-200">
          <div className="flex items-center gap-2">
            <Grip className="text-indigo-600" size={18} />
            <GalleryHorizontal className="text-indigo-700" size={18} />
            <span className="text-sm font-semibold text-indigo-900">Image gallery</span>
            <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              {items.length} image{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Section heading (optional)</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => patchGallery({ heading: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="Gallery title"
          />
        </div>

        <div className="space-y-3 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-indigo-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-800">Image {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeGalleryItem(item.id)}
                  disabled={items.length <= 1}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                  {item.imageUrl ? (
                    <div className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-50 aspect-square max-h-32">
                      <img
                        src={getSlideImageSrc(item.imageUrl)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => updateGalleryItem(item.id, { imageUrl: "" })}
                        className="absolute top-1 right-1 rounded bg-white/90 px-2 py-0.5 text-xs shadow"
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryImagePick(item.id, e)}
                    className="text-xs w-full mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Caption (optional)</label>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => updateGalleryItem(item.id, { caption: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Shown on thumbnail / lightbox"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alt text (optional)</label>
                    <input
                      type="text"
                      value={item.alt}
                      onChange={(e) => updateGalleryItem(item.id, { alt: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Accessibility description"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addGalleryItem}
          disabled={items.length >= MAX_GALLERY_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-indigo-300 rounded-md text-indigo-800 text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add image ({items.length}/{MAX_GALLERY_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "iconBox") {
    const heading = content?.heading ?? "";
    const items = Array.isArray(content?.items) ? content.items : [];

    const patchIconBox = (partial) =>
      onChange(id, {
        widgetType: "iconBox",
        heading,
        items,
        ...partial,
      });

    const updateIconBoxItem = (itemId, patch) => {
      patchIconBox({
        items: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      });
    };

    const addIconBoxItem = () => {
      if (items.length >= MAX_ICON_BOX_ITEMS) return;
      patchIconBox({ items: [...items, createIconBoxItem()] });
    };

    const removeIconBoxItem = (itemId) => {
      if (items.length <= 1) return;
      patchIconBox({ items: items.filter((it) => it.id !== itemId) });
    };

    if (items.length === 0) {
      return (
        <div className="border-2 border-sky-200 rounded-lg p-4 mb-4 bg-sky-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grip className="text-sky-600" size={18} />
              <Boxes className="text-sky-700" size={18} />
              <span className="text-sm font-semibold text-sky-900">Icon box</span>
            </div>
            <button
              type="button"
              onClick={() => patchIconBox({ items: [createIconBoxItem()] })}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
            >
              Add first row
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="border-2 border-sky-200 rounded-lg p-3 mb-4 bg-sky-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-sky-200">
          <div className="flex items-center gap-2">
            <Grip className="text-sky-600" size={18} />
            <Boxes className="text-sky-700" size={18} />
            <span className="text-sm font-semibold text-sky-900">Icon box</span>
            <span className="text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Section heading (optional)</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => patchIconBox({ heading: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="Why choose us"
          />
        </div>

        <p className="mb-3 text-xs text-gray-600">
          Icon names use the same keys as{" "}
          <a
            href="https://lucide.dev/icons"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-700 underline font-medium"
          >
            Lucide
          </a>{" "}
          (kebab-case), e.g. <code className="text-[11px]">phone</code>,{" "}
          <code className="text-[11px]">truck</code>, <code className="text-[11px]">shield-check</code>.{" "}
          PascalCase like <code className="text-[11px]">ShieldCheck</code> is converted automatically.
        </p>

        <div className="space-y-3 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-sky-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sky-800">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeIconBoxItem(item.id)}
                  disabled={items.length <= 1}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-sky-50">
                  <IconBoxLucidePreview code={item.iconCode} />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Icon code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.iconCode}
                      onChange={(e) => updateIconBoxItem(item.id, { iconCode: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
                      placeholder="e.g. phone or shield-check"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateIconBoxItem(item.id, { title: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Short headline"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateIconBoxItem(item.id, { description: e.target.value })}
                      rows={2}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Supporting text"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIconBoxItem}
          disabled={items.length >= MAX_ICON_BOX_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-sky-300 rounded-md text-sky-800 text-sm flex items-center justify-center gap-1 hover:bg-sky-50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add item ({items.length}/{MAX_ICON_BOX_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "testimonials") {
    const heading = content?.heading ?? "";
    const description = content?.description ?? "";
    const items = Array.isArray(content?.items) ? content.items : [];

    const patchTestimonials = (partial) =>
      onChange(id, {
        widgetType: "testimonials",
        heading,
        description,
        items,
        ...partial,
      });

    const updateTestimonialItem = (itemId, patch) => {
      patchTestimonials({
        items: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      });
    };

    const addTestimonialItem = () => {
      if (items.length >= MAX_TESTIMONIAL_ITEMS) return;
      patchTestimonials({ items: [...items, createTestimonialItem()] });
    };

    const removeTestimonialItem = (itemId) => {
      if (items.length <= 1) return;
      patchTestimonials({ items: items.filter((it) => it.id !== itemId) });
    };

    const handleTestimonialAvatarPick = (itemId, e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateTestimonialItem(itemId, { avatarUrl: ev.target?.result || "" });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    if (items.length === 0) {
      return (
        <div className="border-2 border-rose-200 rounded-lg p-4 mb-4 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grip className="text-rose-600" size={18} />
              <MessageSquareQuote className="text-rose-700" size={18} />
              <span className="text-sm font-semibold text-rose-900">Testimonials</span>
            </div>
            <button
              type="button"
              onClick={() => patchTestimonials({ items: [createTestimonialItem()] })}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
            >
              Add first testimonial
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="border-2 border-rose-200 rounded-lg p-3 mb-4 bg-rose-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <Grip className="text-rose-600" size={18} />
            <MessageSquareQuote className="text-rose-700" size={18} />
            <span className="text-sm font-semibold text-rose-900">Testimonials</span>
            <span className="text-xs text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              {items.length} testimonial{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Section heading (optional)</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => patchTestimonials({ heading: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="What our customers say"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Section description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => patchTestimonials({ description: e.target.value })}
              rows={3}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Short intro shown under the heading on the live site"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[min(480px,60vh)] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-rose-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-rose-800">Testimonial {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestimonialItem(item.id)}
                  disabled={items.length <= 1}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Quote <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={item.quote}
                    onChange={(e) => updateTestimonialItem(item.id, { quote: e.target.value })}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    placeholder="Customer quote"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name (optional)</label>
                    <input
                      type="text"
                      value={item.authorName}
                      onChange={(e) => updateTestimonialItem(item.id, { authorName: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Jane D."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Role / company (optional)</label>
                    <input
                      type="text"
                      value={item.authorRole}
                      onChange={(e) => updateTestimonialItem(item.id, { authorRole: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Verified buyer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Star rating (0–5, 0 = hide)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={1}
                    value={item.rating ?? 5}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      updateTestimonialItem(item.id, {
                        rating: Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0,
                      });
                    }}
                    className="w-full max-w-[120px] rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Avatar (optional)</label>
                  <div className="flex flex-col gap-2">
                    {item.avatarUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                        <img
                          src={getSlideImageSrc(item.avatarUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => updateTestimonialItem(item.id, { avatarUrl: "" })}
                          className="absolute top-0.5 right-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] shadow"
                        >
                          Clear
                        </button>
                      </div>
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleTestimonialAvatarPick(item.id, e)}
                      className="text-xs w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTestimonialItem}
          disabled={items.length >= MAX_TESTIMONIAL_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-rose-300 rounded-md text-rose-800 text-sm flex items-center justify-center gap-1 hover:bg-rose-50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add testimonial ({items.length}/{MAX_TESTIMONIAL_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "htmlCss") {
    const html = content?.html ?? "";
    const css = content?.css ?? "";

    const patchHtmlCss = (partial) =>
      onChange(id, {
        widgetType: "htmlCss",
        html,
        css,
        ...partial,
      });

    return (
      <div className="border-2 border-violet-200 rounded-lg p-3 mb-4 bg-violet-50/40">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-violet-200">
          <div className="flex items-center gap-2">
            <Grip className="text-violet-600" size={18} />
            <Code2 className="text-violet-700" size={18} />
            <span className="text-sm font-semibold text-violet-900">Custom HTML / CSS</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <p className="mb-3 text-xs text-gray-600">
          Use <strong>HTML</strong> for tags only (sections, divs, headings, etc.). Do not paste{" "}
          <code className="text-[11px]">&lt;!DOCTYPE&gt;</code>,{" "}
          <code className="text-[11px]">&lt;html&gt;</code>,{" "}
          <code className="text-[11px]">&lt;head&gt;</code>, or{" "}
          <code className="text-[11px]">&lt;body&gt;</code>. Put all rules in the{" "}
          <strong>CSS</strong> tab — on the public site they are wrapped with CSS{" "}
          <strong>@scope</strong> so rules stay limited to this widget (same HTML is also server-rendered
          for view-source / crawlers).
        </p>

        <div
          className="mb-2 inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 gap-0.5"
          role="tablist"
          aria-label="Editor mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={htmlCssTab === "html"}
            onClick={() => setHtmlCssTab("html")}
            className={`min-w-[4.5rem] rounded-md px-3 py-2 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 ${
              htmlCssTab === "html"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/90"
                : "bg-transparent text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
            }`}
          >
            HTML
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={htmlCssTab === "css"}
            onClick={() => setHtmlCssTab("css")}
            className={`min-w-[4.5rem] rounded-md px-3 py-2 text-center text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 ${
              htmlCssTab === "css"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/90"
                : "bg-transparent text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
            }`}
          >
            CSS
          </button>
        </div>

        {htmlCssTab === "html" ? (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">HTML fragment</label>
            <textarea
              value={html}
              onChange={(e) => patchHtmlCss({ html: e.target.value })}
              rows={12}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs font-mono"
              placeholder={'e.g. <section class="my-block"><h2 class="title">Hello</h2></section>'}
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              CSS (scoped to this widget on the live site)
            </label>
            <textarea
              value={css}
              onChange={(e) => patchHtmlCss({ css: e.target.value })}
              rows={12}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs font-mono"
              placeholder={".my-block { padding: 1rem; }\n.my-block .title { color: #1e293b; }"}
            />
          </div>
        )}
      </div>
    );
  }

  if (widgetType === "trustpilot") {
    const embedScript = content?.embedScript ?? "";

    const patchTrustpilot = (partial) =>
      onChange(id, {
        widgetType: "trustpilot",
        embedScript,
        ...partial,
      });

    return (
      <div className="border-2 border-slate-300 rounded-lg p-3 mb-4 bg-slate-50/60">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Grip className="text-slate-600" size={18} />
            <Award className="text-slate-700" size={18} />
            <span className="text-sm font-semibold text-slate-900">Trustpilot embed</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Trustpilot widget HTML <span className="text-red-500">*</span>
          </label>
          <textarea
            value={embedScript}
            onChange={(e) => patchTrustpilot({ embedScript: e.target.value })}
            rows={8}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs font-mono"
            placeholder={'Paste the embed from Trustpilot (must include class="trustpilot-widget" or className in JSX converted to class).'}
          />
          <p className="mt-2 text-xs text-gray-600">
            Copy the snippet from your{" "}
            <strong>Trustpilot Business</strong> account (Integrations → Widgets). The public site
            loads Trustpilot&apos;s script and calls <code className="text-[11px]">loadFromElement</code>{" "}
            like the homepage Trustpilot settings.
          </p>
        </div>
      </div>
    );
  }

  if (widgetType === "siteBanners") {
    const rawItems = Array.isArray(content?.items) ? content.items : [];

    const pushBanners = (nextItems) => {
      onChange(id, { widgetType: "siteBanners", items: nextItems });
    };

    const updateBannerItem = (itemId, partial) => {
      pushBanners(
        items.map((it) => (it.id === itemId ? { ...it, ...partial } : it))
      );
    };

    const addBannerItem = () => {
      if (items.length >= MAX_SITE_BANNER_ITEMS) return;
      const next = createBannerWidgetItem();
      next.order = items.length;
      pushBanners([...items, next]);
    };

    const removeBannerItem = (itemId) => {
      if (rawItems.length <= 1) return;
      pushBanners(rawItems.filter((it) => it.id !== itemId));
    };

    if (rawItems.length === 0) {
      return (
        <div className="border-2 border-orange-200 rounded-lg p-3 mb-4 bg-orange-50/60">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-orange-200">
            <div className="flex items-center gap-2">
              <Grip className="text-orange-700" size={18} />
              <LayoutPanelTop className="text-orange-800" size={18} />
              <span className="text-sm font-semibold text-orange-950">Banners</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move down"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                title="Remove widget"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange(id, {
                widgetType: "siteBanners",
                items: [createBannerWidgetItem()],
              })
            }
            className="w-full rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Add first banner
          </button>
        </div>
      );
    }

    const items = rawItems;

    return (
      <div className="border-2 border-orange-200 rounded-lg p-3 mb-4 bg-orange-50/60">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <Grip className="text-orange-700" size={18} />
            <LayoutPanelTop className="text-orange-800" size={18} />
            <span className="text-sm font-semibold text-orange-950">Banners</span>
            <span className="text-xs text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
              {items.length}/{MAX_SITE_BANNER_ITEMS}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Build one or more slides here (same options as{" "}
          <a
            href="/admin/banners"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline hover:no-underline"
          >
            Admin → Banners
          </a>
          ). They are saved in this page&apos;s blocks and shown as a carousel on the live site.
        </p>
        <div className="space-y-3 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
          {items.map((it, index) => (
            <div key={it.id} className="relative">
              <InlineBannerItemEditor
                item={it}
                index={index}
                onUpdateItem={(partial) => updateBannerItem(it.id, partial)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBannerItem(it.id)}
                  className="mt-2 w-full py-1.5 text-xs text-red-600 border border-dashed border-red-200 rounded-md hover:bg-red-50"
                >
                  Remove this banner
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBannerItem}
          disabled={items.length >= MAX_SITE_BANNER_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-orange-300 rounded-md text-orange-900 text-sm flex items-center justify-center gap-1 hover:bg-orange-100/50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add banner ({items.length}/{MAX_SITE_BANNER_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "categoryCards") {
    const rawItems = Array.isArray(content?.items) ? content.items : [];

    const mergeCategoryCards = (patch) => {
      onChange(id, {
        widgetType: "categoryCards",
        headingText:
          patch.headingText !== undefined
            ? patch.headingText
            : content?.headingText ?? DEFAULT_CATEGORY_CARDS_SECTION.headingText,
        headingColor:
          patch.headingColor !== undefined
            ? patch.headingColor
            : content?.headingColor ?? DEFAULT_CATEGORY_CARDS_SECTION.headingColor,
        dividerColor:
          patch.dividerColor !== undefined
            ? patch.dividerColor
            : content?.dividerColor ?? DEFAULT_CATEGORY_CARDS_SECTION.dividerColor,
        sectionBackgroundColor:
          patch.sectionBackgroundColor !== undefined
            ? patch.sectionBackgroundColor
            : content?.sectionBackgroundColor ??
              DEFAULT_CATEGORY_CARDS_SECTION.sectionBackgroundColor,
        items:
          patch.items !== undefined
            ? patch.items
            : Array.isArray(content?.items)
              ? content.items
              : [],
      });
    };

    const updateCardItem = (itemId, partial) => {
      mergeCategoryCards({
        items: rawItems.map((it) => (it.id === itemId ? { ...it, ...partial } : it)),
      });
    };

    const addCardItem = () => {
      if (rawItems.length >= MAX_CATEGORY_CARD_ITEMS) return;
      const next = createCategoryCardWidgetItem();
      next.order = rawItems.length;
      mergeCategoryCards({ items: [...rawItems, next] });
    };

    const removeCardItem = (itemId) => {
      if (rawItems.length <= 1) return;
      mergeCategoryCards({ items: rawItems.filter((it) => it.id !== itemId) });
    };

    if (rawItems.length === 0) {
      return (
        <div className="border-2 border-teal-200 rounded-lg p-3 mb-4 bg-teal-50/50">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-teal-200">
            <div className="flex items-center gap-2">
              <Grip className="text-teal-700" size={18} />
              <Tags className="text-teal-800" size={18} />
              <span className="text-sm font-semibold text-teal-950">Category cards</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move down"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                title="Remove widget"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              mergeCategoryCards({
                items: [createCategoryCardWidgetItem()],
              })
            }
            className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Add first category card
          </button>
        </div>
      );
    }

    const items = rawItems;
    const headingText =
      content?.headingText ?? DEFAULT_CATEGORY_CARDS_SECTION.headingText;
    const headingColor =
      content?.headingColor ?? DEFAULT_CATEGORY_CARDS_SECTION.headingColor;
    const dividerColor =
      content?.dividerColor ?? DEFAULT_CATEGORY_CARDS_SECTION.dividerColor;
    const sectionBackgroundColor =
      content?.sectionBackgroundColor ??
      DEFAULT_CATEGORY_CARDS_SECTION.sectionBackgroundColor;

    return (
      <div className="border-2 border-teal-200 rounded-lg p-3 mb-4 bg-teal-50/50">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-teal-200">
          <div className="flex items-center gap-2">
            <Grip className="text-teal-700" size={18} />
            <Tags className="text-teal-800" size={18} />
            <span className="text-sm font-semibold text-teal-950">Category cards</span>
            <span className="text-xs text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
              {items.length}/{MAX_CATEGORY_CARD_ITEMS}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Same fields as{" "}
          <a
            href="/admin/category-cards"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline hover:no-underline"
          >
            Admin → Category cards
          </a>
          . Saved in this page&apos;s blocks and shown as a carousel on the live site.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Section heading</label>
            <input
              type="text"
              value={headingText}
              onChange={(e) => mergeCategoryCards({ headingText: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Section background (optional)</label>
            <input
              type="text"
              value={sectionBackgroundColor}
              onChange={(e) =>
                mergeCategoryCards({ sectionBackgroundColor: e.target.value })
              }
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="e.g. #f9fafb or leave empty"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Heading color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/i.test(headingColor) ? headingColor : "#000000"}
                onChange={(e) => mergeCategoryCards({ headingColor: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-gray-300 p-1"
              />
              <input
                type="text"
                value={headingColor}
                onChange={(e) => mergeCategoryCards({ headingColor: e.target.value })}
                className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Divider color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/i.test(dividerColor) ? dividerColor : "#000000"}
                onChange={(e) => mergeCategoryCards({ dividerColor: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-gray-300 p-1"
              />
              <input
                type="text"
                value={dividerColor}
                onChange={(e) => mergeCategoryCards({ dividerColor: e.target.value })}
                className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
          {items.map((it, index) => (
            <div key={it.id} className="relative">
              <InlineCategoryCardItemEditor
                item={it}
                index={index}
                onUpdateItem={(partial) => updateCardItem(it.id, partial)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCardItem(it.id)}
                  className="mt-2 w-full py-1.5 text-xs text-red-600 border border-dashed border-red-200 rounded-md hover:bg-red-50"
                >
                  Remove this card
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCardItem}
          disabled={items.length >= MAX_CATEGORY_CARD_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-teal-300 rounded-md text-teal-900 text-sm flex items-center justify-center gap-1 hover:bg-teal-100/50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add card ({items.length}/{MAX_CATEGORY_CARD_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "promotionalSections") {
    return (
      <div className="border-2 border-indigo-200 rounded-lg p-3 mb-4 bg-indigo-50/60">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-200">
          <div className="flex items-center gap-2">
            <Grip className="text-indigo-700" size={18} />
            <Megaphone className="text-indigo-800" size={18} />
            <span className="text-sm font-semibold text-indigo-950">Promotional sections</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div className="mb-3 rounded-md border border-indigo-100 bg-white/80 px-3 py-2.5 text-xs text-gray-700 leading-relaxed">
          <p className="font-medium text-indigo-950">How this looks on the site</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-gray-600">
            <li>
              <span className="font-medium text-gray-800">Top banner</span> — full-width strip with
              heading, text, background, optional payment logos.
            </li>
            <li>
              <span className="font-medium text-gray-800">Two cards</span> — side by side on large
              screens (first card left, second card right); stacked on phones.
            </li>
            <li>
              <span className="font-medium text-gray-800">Bottom strip</span> — full-width promo with
              text, button, and images.
            </li>
          </ul>
          <p className="mt-2 text-gray-600">
            You only need to finish <strong>one</strong> of the three blocks above to publish (fill its
            required fields and images).
          </p>
        </div>
        <InlinePromotionalSectionsEditor content={content} blockId={id} onChange={onChange} />
      </div>
    );
  }

  if (widgetType === "latestBlogs") {
    const sectionHeading = content?.sectionHeading ?? "";
    const maxPosts =
      typeof content?.maxPosts === "number" && Number.isFinite(content.maxPosts)
        ? Math.min(12, Math.max(1, Math.floor(content.maxPosts)))
        : 6;
    const viewAllLabel = content?.viewAllLabel ?? "View all blogs";

    const patchLatest = (partial) =>
      onChange(id, {
        widgetType: "latestBlogs",
        sectionHeading,
        maxPosts,
        viewAllLabel,
        ...partial,
      });

    return (
      <div className="border-2 border-cyan-200 rounded-lg p-3 mb-4 bg-cyan-50/60">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-cyan-200">
          <div className="flex items-center gap-2">
            <Grip className="text-cyan-700" size={18} />
            <Newspaper className="text-cyan-800" size={18} />
            <span className="text-sm font-semibold text-cyan-950">Latest blogs</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Section heading <span className="text-gray-400 font-normal">(public)</span>
            </label>
            <input
              type="text"
              value={sectionHeading}
              onChange={(e) => patchLatest({ sectionHeading: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Latest blogs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Number of posts <span className="text-gray-400 font-normal">(1–12)</span>
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={maxPosts}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                patchLatest({
                  maxPosts: Number.isFinite(v) ? Math.min(12, Math.max(1, v)) : 6,
                });
              }}
              className="w-full max-w-[120px] rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              “View all” link label <span className="text-gray-400 font-normal">(links to /blogs)</span>
            </label>
            <input
              type="text"
              value={viewAllLabel}
              onChange={(e) => patchLatest({ viewAllLabel: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="View all blogs"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to hide the link. The public site loads posts from the latest-blogs API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (widgetType === "dealsDiscountCards") {
    const sectionHeading = content?.sectionHeading ?? "";
    const items = Array.isArray(content?.items) ? content.items : [];

    const patchDeals = (partial) =>
      onChange(id, {
        widgetType: "dealsDiscountCards",
        sectionHeading,
        items,
        ...partial,
      });

    const updateItem = (itemId, patch) => {
      patchDeals({
        items: items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
      });
    };

    const addItem = () => {
      if (items.length >= MAX_DEALS_DISCOUNT_ITEMS) return;
      patchDeals({ items: [...items, createDealsDiscountCardItem()] });
    };

    const removeItem = (itemId) => {
      if (items.length <= 1) return;
      patchDeals({ items: items.filter((it) => it.id !== itemId) });
    };

    if (items.length === 0) {
      return (
        <div className="border-2 border-lime-200 rounded-lg p-4 mb-4 bg-lime-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grip className="text-lime-700" size={18} />
              <Gift className="text-lime-800" size={18} />
              <span className="text-sm font-semibold text-lime-950">Deals &amp; discount cards</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onMoveUp}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                className="p-1.5 text-gray-600 hover:bg-white rounded-full"
                title="Move down"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                title="Remove widget"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => patchDeals({ items: [createDealsDiscountCardItem()] })}
            className="mt-3 rounded-md bg-lime-700 px-3 py-1.5 text-sm text-white hover:bg-lime-800"
          >
            Add first card
          </button>
        </div>
      );
    }

    return (
      <div className="border-2 border-lime-200 rounded-lg p-3 mb-4 bg-lime-50/50">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-lime-200">
          <div className="flex items-center gap-2">
            <Grip className="text-lime-700" size={18} />
            <Gift className="text-lime-800" size={18} />
            <span className="text-sm font-semibold text-lime-950">Deals &amp; discount cards</span>
            <span className="text-xs text-lime-800 bg-lime-100 px-2 py-0.5 rounded-full">
              {items.length} card{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Section heading <span className="text-gray-400 font-normal">(optional, above filters)</span>
          </label>
          <input
            type="text"
            value={sectionHeading}
            onChange={(e) => patchDeals({ sectionHeading: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="e.g. Next discount code, coupons, and promo codes"
          />
        </div>

        <div className="space-y-3 max-h-[min(520px,60vh)] overflow-y-auto pr-1">
          {items.map((it, index) => {
            const dealType = it.type === "Coupon" ? "Coupon" : "Deal";
            const hasExpiry = it.hasExpiry !== false;
            return (
              <div
                key={it.id}
                className="rounded-lg border border-lime-100 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-lime-900">Card {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    disabled={items.length <= 1}
                    className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
                  >
                    Remove card
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Emoji</label>
                    <input
                      type="text"
                      value={it.emoji ?? ""}
                      onChange={(e) => updateItem(it.id, { emoji: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="🎁"
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select
                      value={dealType}
                      onChange={(e) =>
                        updateItem(it.id, {
                          type: e.target.value === "Coupon" ? "Coupon" : "Deal",
                        })
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      <option value="Deal">Deal</option>
                      <option value="Coupon">Coupon</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={it.title ?? ""}
                      onChange={(e) => updateItem(it.id, { title: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Offer headline"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      value={it.desc ?? ""}
                      onChange={(e) => updateItem(it.id, { desc: e.target.value })}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                      placeholder="Offer details"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={hasExpiry}
                        onChange={(e) => updateItem(it.id, { hasExpiry: e.target.checked })}
                      />
                      Has start / expiry dates
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!it.isExpired}
                        onChange={(e) => updateItem(it.id, { isExpired: e.target.checked })}
                      />
                      Show as expired (grey button)
                    </label>
                  </div>
                  {hasExpiry ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Start date
                        </label>
                        <input
                          type="date"
                          value={dealsCardDateToInputValue(it.startDate)}
                          onChange={(e) =>
                            updateItem(it.id, { startDate: e.target.value || "" })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        />
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Browser calendar; saved as YYYY-MM-DD for the live site.
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Expiry date
                        </label>
                        <input
                          type="date"
                          value={dealsCardDateToInputValue(it.expiryDate)}
                          min={dealsCardDateToInputValue(it.startDate) || undefined}
                          onChange={(e) =>
                            updateItem(it.id, { expiryDate: e.target.value || "" })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        />
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Optional minimum is the start date when both are set.
                        </p>
                      </div>
                    </>
                  ) : null}
                  {dealType === "Coupon" ? (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Coupon code <span className="text-gray-400">(tap-to-copy on site)</span>
                      </label>
                      <input
                        type="text"
                        value={it.couponCode ?? ""}
                        onChange={(e) => updateItem(it.id, { couponCode: e.target.value })}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm font-mono"
                        placeholder="XMAS2026"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Button text
                        </label>
                        <input
                          type="text"
                          value={it.buttonText ?? ""}
                          onChange={(e) => updateItem(it.id, { buttonText: e.target.value })}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          placeholder="Shop now"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Button URL
                        </label>
                        <input
                          type="text"
                          value={it.buttonUrl ?? ""}
                          onChange={(e) => updateItem(it.id, { buttonUrl: e.target.value })}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          placeholder="https://… or /path"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= MAX_DEALS_DISCOUNT_ITEMS}
          className="mt-3 w-full py-2 border border-dashed border-lime-300 rounded-md text-lime-900 text-sm flex items-center justify-center gap-1 hover:bg-lime-100/50 disabled:opacity-50"
        >
          <PlusCircle size={16} />
          Add card ({items.length}/{MAX_DEALS_DISCOUNT_ITEMS})
        </button>
      </div>
    );
  }

  if (widgetType === "activeDeals") {
    return (
      <div className="border-2 border-emerald-200 rounded-lg p-3 mb-4 bg-emerald-50/60">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <Grip className="text-emerald-700" size={18} />
            <Percent className="text-emerald-800" size={18} />
            <span className="text-sm font-semibold text-emerald-950">
              Active deals &amp; coupons
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move up"
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1.5 text-gray-600 hover:bg-white rounded-full"
              title="Move down"
            >
              <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove widget"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          On the live site this block loads <strong>active deals</strong> from the same API as the old
          Deals &amp; Discounts page (filters: All / Deal / Coupon / Expired). No extra settings here.
        </p>
      </div>
    );
  }

  const slides = Array.isArray(content?.slides) ? content.slides : [];

  const pushContent = useCallback(
    (nextSlides) => {
      onChange(id, {
        widgetType: "slider",
        slides: nextSlides,
        sectionHeading: content?.sectionHeading ?? "",
        sectionDescription: content?.sectionDescription ?? "",
      });
    },
    [id, onChange, content?.sectionHeading, content?.sectionDescription]
  );

  const updateSliderSection = (patch) => {
    onChange(id, {
      widgetType: "slider",
      slides,
      sectionHeading: content?.sectionHeading ?? "",
      sectionDescription: content?.sectionDescription ?? "",
      ...patch,
    });
  };

  const updateSlide = (slideId, patch) => {
    pushContent(slides.map((s) => (s.id === slideId ? { ...s, ...patch } : s)));
  };

  const addSlide = () => {
    if (slides.length >= MAX_SLIDES) return;
    pushContent([...slides, createSlide()]);
  };

  const removeSlide = (slideId) => {
    if (slides.length <= 1) return;
    pushContent(slides.filter((s) => s.id !== slideId));
  };

  const handleImagePick = (slideId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateSlide(slideId, { imageUrl: ev.target?.result || "" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (widgetType !== "slider") {
    return (
      <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
        Unknown widget type: {widgetType}
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="border-2 border-violet-200 rounded-lg p-4 mb-4 bg-violet-50/40">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-violet-900">Image slider widget</span>
          <button
            type="button"
            onClick={() =>
              onChange(id, {
                widgetType: "slider",
                sectionHeading: "",
                sectionDescription: "",
                slides: [createSlide()],
              })
            }
            className="rounded-md bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700"
          >
            Add first slide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-violet-200 rounded-lg p-3 mb-4 bg-violet-50/40">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-violet-200">
        <div className="flex items-center gap-2">
          <Grip className="text-violet-500" size={18} />
          <Images className="text-violet-600" size={18} />
          <span className="text-sm font-semibold text-violet-900">Image slider widget</span>
          <span className="text-xs text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
            {slides.length} slide{slides.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            className="p-1.5 text-gray-600 hover:bg-white rounded-full"
            title="Move up"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            className="p-1.5 text-gray-600 hover:bg-white rounded-full"
            title="Move down"
          >
            <ChevronDown size={18} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
            title="Remove widget"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 rounded-lg border border-violet-100 bg-white/80 p-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Widget heading <span className="text-gray-400 font-normal">(public)</span>
          </label>
          <input
            type="text"
            value={content?.sectionHeading ?? ""}
            onChange={(e) => updateSliderSection({ sectionHeading: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="e.g. Featured products"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Widget description <span className="text-gray-400 font-normal">(public)</span>
          </label>
          <textarea
            value={content?.sectionDescription ?? ""}
            onChange={(e) => updateSliderSection({ sectionDescription: e.target.value })}
            rows={2}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            placeholder="Short intro shown under the heading"
          />
        </div>
      </div>

      <div className="space-y-3 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="rounded-lg border border-violet-100 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-violet-800">Slide {index + 1}</span>
              <button
                type="button"
                onClick={() => removeSlide(slide.id)}
                disabled={slides.length <= 1}
                className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Remove slide
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                <div className="flex flex-col gap-2">
                  {slide.imageUrl ? (
                    <div className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-50 aspect-video max-h-32">
                      <img
                        src={getSlideImageSrc(slide.imageUrl)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => updateSlide(slide.id, { imageUrl: "" })}
                        className="absolute top-1 right-1 rounded bg-white/90 px-2 py-0.5 text-xs shadow"
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagePick(slide.id, e)}
                    className="text-xs w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Heading</label>
                  <input
                    type="text"
                    value={slide.heading}
                    onChange={(e) => updateSlide(slide.id, { heading: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    placeholder="Slide headline"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => updateSlide(slide.id, { description: e.target.value })}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    placeholder="Supporting text"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSlide}
        disabled={slides.length >= MAX_SLIDES}
        className="mt-3 w-full py-2 border border-dashed border-violet-300 rounded-md text-violet-700 text-sm flex items-center justify-center gap-1 hover:bg-violet-50 disabled:opacity-50"
      >
        <PlusCircle size={16} />
        Add slide ({slides.length}/{MAX_SLIDES})
      </button>
    </div>
  );
}

WidgetBlock.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.shape({
    widgetType: PropTypes.string,
    slides: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        heading: PropTypes.string,
        description: PropTypes.string,
        imageUrl: PropTypes.string,
      })
    ),
    heading: PropTypes.string,
    description: PropTypes.string,
    placeholder: PropTypes.string,
    buttonLabel: PropTypes.string,
    imageUrl: PropTypes.string,
    sectionHeading: PropTypes.string,
    sectionDescription: PropTypes.string,
    videoUrl: PropTypes.string,
    caption: PropTypes.string,
    embedUrl: PropTypes.string,
    heightPx: PropTypes.number,
    embedScript: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        question: PropTypes.string,
        answer: PropTypes.string,
        imageUrl: PropTypes.string,
        caption: PropTypes.string,
        alt: PropTypes.string,
        iconCode: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        quote: PropTypes.string,
        authorName: PropTypes.string,
        authorRole: PropTypes.string,
        rating: PropTypes.number,
        avatarUrl: PropTypes.string,
      })
    ),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
};
