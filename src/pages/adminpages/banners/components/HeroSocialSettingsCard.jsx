import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  fetchHeroSocialSettings,
  saveHeroSocialSettings,
} from "../service/bannersService";

const emptyForm = () => ({
  followHeading: "",
  facebookUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  instagramUrl: "",
});

export default function HeroSocialSettingsCard({ onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchHeroSocialSettings();
      if (!cancelled && data) {
        setForm({
          followHeading: data.followHeading || "",
          facebookUrl: data.facebookUrl || "",
          twitterUrl: data.twitterUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          instagramUrl: data.instagramUrl || "",
        });
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await saveHeroSocialSettings(form);
      if (result && typeof onSaved === "function") onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
      <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Hero — Follow us (social links)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Shown at the top-right of the homepage hero carousel (desktop). Leave a
          URL blank to hide that icon. Heading is optional.
        </p>
      </div>
      {loading ? (
        <div className="px-4 py-8 text-sm text-gray-500 sm:px-6">Loading…</div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-4">
          <div>
            <label
              htmlFor="followHeading"
              className="block text-sm font-medium text-gray-700"
            >
              Heading (optional)
            </label>
            <input
              type="text"
              id="followHeading"
              name="followHeading"
              value={form.followHeading}
              onChange={handleChange}
              maxLength={120}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-primary focus:border-primary"
              placeholder="e.g. Follow Us Now"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="facebookUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Facebook URL
              </label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                value={form.facebookUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-primary focus:border-primary"
                placeholder="https://www.facebook.com/…"
              />
            </div>
            <div>
              <label
                htmlFor="twitterUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Twitter / X URL
              </label>
              <input
                type="url"
                id="twitterUrl"
                name="twitterUrl"
                value={form.twitterUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-primary focus:border-primary"
                placeholder="https://twitter.com/…"
              />
            </div>
            <div>
              <label
                htmlFor="youtubeUrl"
                className="block text-sm font-medium text-gray-700"
              >
                YouTube URL
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                value={form.youtubeUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-primary focus:border-primary"
                placeholder="https://www.youtube.com/…"
              />
            </div>
            <div>
              <label
                htmlFor="instagramUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Instagram URL
              </label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                value={form.instagramUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm focus:ring-primary focus:border-primary"
                placeholder="https://www.instagram.com/…"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save social links"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

HeroSocialSettingsCard.propTypes = {
  onSaved: PropTypes.func,
};
