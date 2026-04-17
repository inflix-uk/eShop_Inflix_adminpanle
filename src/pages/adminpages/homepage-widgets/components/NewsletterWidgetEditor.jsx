import { useState, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import { Mail } from "lucide-react";
import {
  fetchHomepageNewsletterWidget,
  saveHomepageNewsletterWidget,
  resolveNewsletterImageUrl,
} from "../service/homepageNewsletterWidgetService";

const BLOCKED_NEWSLETTER_PLACEHOLDERS = new Set(["malikoffical32@gmail.com"]);

function normalizeNewsletterPlaceholder(raw) {
  const s = raw == null ? "" : String(raw).trim();
  if (!s) return "";
  if (BLOCKED_NEWSLETTER_PLACEHOLDERS.has(s.toLowerCase())) {
    return "Enter your email";
  }
  return s;
}

function formatSavedAt(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return null;
  }
}

export default function NewsletterWidgetEditor() {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [placeholder, setPlaceholder] = useState("Enter your email");
  const [buttonLabel, setButtonLabel] = useState("Subscribe");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const blobRef = useRef(null);

  useEffect(() => {
    return () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProgress(25);
      const data = await fetchHomepageNewsletterWidget();
      if (cancelled) return;
      setProgress(100);
      if (data) {
        setHeading(data.heading);
        setDescription(data.description);
        setPlaceholder(
          normalizeNewsletterPlaceholder(data.placeholder) || "Enter your email"
        );
        setButtonLabel(data.buttonLabel || "Subscribe");
        setImageUrl(data.imageUrl || "");
        if (data.updatedAt) setLastSavedAt(data.updatedAt);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displaySrc =
    imagePreview || (imageUrl ? resolveNewsletterImageUrl(imageUrl) : "");

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    blobRef.current = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(blobRef.current);
    e.target.value = "";
  };

  const clearImage = () => {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    setProgress(40);
    const result = await saveHomepageNewsletterWidget(
      {
        heading,
        description,
        placeholder,
        buttonLabel,
        imageUrl,
      },
      imageFile
    );
    setProgress(100);
    if (result) {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
      setImageFile(null);
      setImagePreview(null);
      setHeading(result.heading);
      setDescription(result.description);
      setPlaceholder(result.placeholder);
      setButtonLabel(result.buttonLabel);
      setImageUrl(result.imageUrl || "");
      if (result.updatedAt) setLastSavedAt(result.updatedAt);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
        Loading newsletter widget…
      </div>
    );
  }

  const savedLabel = formatSavedAt(lastSavedAt);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-emerald-600" aria-hidden />
          <h2 className="text-base font-bold text-gray-900">Newsletter signup</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {savedLabel && (
            <span className="text-[10px] text-gray-500">Saved {savedLabel}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-secondary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save newsletter"}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="mb-4 text-xs text-gray-600">
          Uses the same newsletter subscribers API as blogs and the main site signup forms.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Optional image</label>
            {displaySrc ? (
              <div className="relative max-h-40 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={displaySrc}
                  alt=""
                  className="max-h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded bg-white/90 px-2 py-0.5 text-xs shadow"
                >
                  Clear
                </button>
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              className="mt-2 w-full text-xs"
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Heading</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Subscribe to our newsletter"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Short supporting text"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Email placeholder</label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Button label</label>
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
