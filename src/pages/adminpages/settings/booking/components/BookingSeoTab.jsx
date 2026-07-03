import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBookingSeo, patchBookingSeo } from "../service/bookingService";

const DEFAULT_JSON_LD = `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Book an appointment",
  "description": "Online booking for our services",
  "url": "https://yoursite.com/booking"
}`;

function jsonLdFromMetaSchema(metaSchema) {
  if (!Array.isArray(metaSchema) || metaSchema.length === 0) {
    return DEFAULT_JSON_LD;
  }
  const first = metaSchema.find((s) => typeof s === "string" && s.trim());
  return first?.trim() || DEFAULT_JSON_LD;
}

export default function BookingSeoTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [jsonLd, setJsonLd] = useState(DEFAULT_JSON_LD);
  const [seoUpdatedAt, setSeoUpdatedAt] = useState(null);

  useEffect(() => {
    loadSeo();
  }, []);

  const loadSeo = async () => {
    setLoading(true);
    setProgress?.(30);
    const data = await getBookingSeo();
    if (data) {
      setMetaTitle(data.metaTitle || "");
      setMetaDescription(data.metaDescription || "");
      setJsonLd(jsonLdFromMetaSchema(data.metaSchema));
      setSeoUpdatedAt(data.seoUpdatedAt || null);
    }
    setLoading(false);
    setProgress?.(100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = jsonLd.trim();
    if (trimmed) {
      try {
        JSON.parse(trimmed);
      } catch {
        toast.error("Invalid JSON-LD. Check brackets and quotes.");
        return;
      }
    }

    setSaving(true);
    setProgress?.(50);
    const saved = await patchBookingSeo({
      metaTitle,
      metaDescription,
      jsonLd: trimmed,
    });
    setSaving(false);
    setProgress?.(100);

    if (saved) {
      setMetaTitle(saved.metaTitle || "");
      setMetaDescription(saved.metaDescription || "");
      setJsonLd(jsonLdFromMetaSchema(saved.metaSchema));
      setSeoUpdatedAt(saved.seoUpdatedAt || null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {seoUpdatedAt ? (
        <p className="text-sm text-gray-500">
          SEO last updated: {new Date(seoUpdatedAt).toLocaleString()}
        </p>
      ) : null}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Meta tags</h3>
          <p className="text-sm text-gray-500 mt-1">
            Applied to{" "}
            <span className="font-mono text-xs">/booking</span> via Next.js metadata
            (title, description, Open Graph, canonical).
          </p>
        </div>

        <div>
          <label htmlFor="booking-meta-title" className="block text-sm font-medium text-gray-700 mb-2">
            Meta title
          </label>
          <input
            id="booking-meta-title"
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            placeholder="e.g. Book an Appointment | Your Store"
          />
          <p className="mt-1 text-xs text-gray-500">{metaTitle.length} / 60 characters</p>
        </div>

        <div>
          <label
            htmlFor="booking-meta-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Meta description
          </label>
          <textarea
            id="booking-meta-description"
            rows={4}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            placeholder="Short summary shown in search results"
          />
          <p className="mt-1 text-xs text-gray-500">{metaDescription.length} / 160 characters</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">JSON-LD</h3>
          <p className="text-sm text-gray-500 mt-1">
            Structured data injected as{" "}
            <span className="font-mono text-xs">application/ld+json</span> on the booking page.
          </p>
        </div>

        <div>
          <label htmlFor="booking-json-ld" className="block text-sm font-medium text-gray-700 mb-2">
            Schema markup
          </label>
          <textarea
            id="booking-json-ld"
            rows={14}
            value={jsonLd}
            onChange={(e) => setJsonLd(e.target.value)}
            spellCheck={false}
            className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm leading-relaxed focus:ring-primary focus:border-primary"
            placeholder='{ "@context": "https://schema.org", ... }'
          />
          <p className="mt-2 text-xs text-gray-500">
            Valid JSON object or array. Leave empty on save to remove custom schema (storefront uses a default WebPage schema).
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save SEO"}
        </button>
      </div>
    </form>
  );
}
