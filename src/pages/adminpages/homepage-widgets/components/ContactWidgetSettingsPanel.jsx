import { useState, useEffect, useCallback, useRef } from "react";
import ContactWidgetEditor from "./ContactWidgetEditor";
import { fetchContactUsWidget, saveContactUsWidget } from "../service/contactUsWidgetService";

const SAVE_DEBOUNCE_MS = 600;

/**
 * Contact Us page (/contact-us) — schema editor embedded in Homepage Widgets.
 */
export default function ContactWidgetSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [widgetData, setWidgetData] = useState(null);
  const saveTimerRef = useRef(null);
  const pendingBodyRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchContactUsWidget();
    if (res?.data) setWidgetData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flushSave = useCallback(async () => {
    const body = pendingBodyRef.current;
    if (!body) return;
    setSaving(true);
    const saved = await saveContactUsWidget(body);
    if (saved) setWidgetData(saved);
    setSaving(false);
    pendingBodyRef.current = null;
  }, []);

  const handleEditorChange = useCallback(
    (body) => {
      setWidgetData((prev) => ({ ...(prev || {}), ...body }));
      pendingBodyRef.current = body;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        flushSave();
      }, SAVE_DEBOUNCE_MS);
    },
    [flushSave]
  );

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    []
  );

  return (
    <section className="col-span-full mt-10 rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Contact Us page widget</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Dynamic form for the public <strong>/contact-us</strong> route. Same pattern as other widget editors
          (saved to MongoDB, rendered on the site). Submissions use your{" "}
          <strong className="font-medium text-gray-800">SMTP</strong> settings and are stored in the database.
        </p>
      </header>
      {loading && !widgetData ? (
        <p className="text-sm text-gray-600">Loading contact widget…</p>
      ) : widgetData ? (
        <ContactWidgetEditor
          key={widgetData._id || "contact-widget-draft"}
          initialData={widgetData}
          onSave={handleEditorChange}
          loading={false}
          saving={saving}
        />
      ) : (
        <p className="text-sm text-gray-600">Could not load contact widget.</p>
      )}
    </section>
  );
}
