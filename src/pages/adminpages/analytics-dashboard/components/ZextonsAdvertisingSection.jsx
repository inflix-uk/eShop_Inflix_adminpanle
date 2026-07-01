import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  downloadAdSpendTemplate,
  importAdSpendCsv,
  saveAdSpendEntry,
} from "../service/analyticsAdSpendService";
import { getUkTodayYmd } from "../utils/analyticsDatePresets";

const METRIC_STYLES = {
  spend: {
    wrap: "border-red-100 bg-red-50",
    label: "text-red-500",
    value: "text-red-700",
  },
  roas: {
    wrap: "border-amber-100 bg-amber-50",
    label: "text-amber-600",
    value: "text-amber-700",
  },
  poas: {
    wrap: "border-emerald-100 bg-emerald-50",
    label: "text-emerald-600",
    value: "text-emerald-700",
  },
  cpa: {
    wrap: "border-red-100 bg-red-50",
    label: "text-red-500",
    value: "text-red-700",
  },
};

function MetricTile({ label, value, styleKey }) {
  const styles = METRIC_STYLES[styleKey] || METRIC_STYLES.spend;
  return (
    <div className={`rounded-lg border px-4 py-4 ${styles.wrap}`}>
      <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${styles.value}`}>{value}</p>
    </div>
  );
}

MetricTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  styleKey: PropTypes.oneOf(["spend", "roas", "poas", "cpa"]).isRequired,
};

function FieldLabel({ children }) {
  return <label className="block text-sm font-medium text-gray-800 mb-1">{children}</label>;
}

FieldLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400";

export default function ZextonsAdvertisingSection({ data, onSpendSaved }) {
  const fileInputRef = useRef(null);
  const [formOpen, setFormOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [form, setForm] = useState({
    spendDate: getUkTodayYmd(),
    amount: "",
    utmSource: "google",
    campaign: "",
    utmMedium: "cpc",
    utmChannel: "google_ads",
    notes: "",
  });

  const [csvDefaults, setCsvDefaults] = useState({
    utmSource: "google",
    utmMedium: "cpc",
    utmChannel: "google_ads",
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCsvDefault = (key, value) => {
    setCsvDefaults((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.campaign.trim()) {
      toast.error("Campaign is required");
      return;
    }
    if (!form.amount || Number(form.amount) < 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      const result = await saveAdSpendEntry({
        spendDate: form.spendDate,
        amount: Number(form.amount),
        campaign: form.campaign.trim(),
        utmSource: form.utmSource.trim(),
        utmMedium: form.utmMedium.trim(),
        utmChannel: form.utmChannel.trim(),
        notes: form.notes.trim() || undefined,
      });

      if (!result?.success) {
        toast.error(result?.message || "Failed to save ad spend");
        return;
      }

      toast.success("Ad spend saved");
      setForm((prev) => ({ ...prev, amount: "", notes: "" }));
      onSpendSaved?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save ad spend");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadAdSpendTemplate();
    } catch (error) {
      toast.error("Could not download template");
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const csv = await file.text();
      const result = await importAdSpendCsv(csv, {
        utmSource: csvDefaults.utmSource,
        utmMedium: csvDefaults.utmMedium,
        utmChannel: csvDefaults.utmChannel,
      });

      if (!result?.success) {
        toast.error(result?.message || "CSV import failed");
        return;
      }

      const skipped = result.skippedDuringParse || 0;
      toast.success(
        `Imported ${result.imported} row(s)${result.failed ? `, ${result.failed} failed` : ""}${
          skipped ? `, ${skipped} skipped` : ""
        }`
      );
      onSpendSaved?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "CSV import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Advertising performance</h2>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-teal-600">
          <button type="button" className="hover:text-teal-700 hover:underline">
            Ad performance report →
          </button>
          <button type="button" className="hover:text-teal-700 hover:underline">
            Google Ads API settings →
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-100 bg-[#faf8f5] p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Record ad spend</h3>
            <p className="mt-1 text-sm text-gray-600">
              Add spend manually or import a CSV (e.g. a full year from Google Ads exports).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="shrink-0 rounded-md border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
          >
            {formOpen ? "Hide form" : "Show form"}
          </button>
        </div>

        {formOpen && (
          <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={handleSave} className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900">Single entry</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Date</FieldLabel>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.spendDate}
                    onChange={(e) => updateForm("spendDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Amount (£)</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={form.amount}
                    onChange={(e) => updateForm("amount", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Source (utm_source)</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.utmSource}
                    onChange={(e) => updateForm("utmSource", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Campaign (utm_campaign)</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.campaign}
                    onChange={(e) => updateForm("campaign", e.target.value)}
                    placeholder="brand-search"
                    required
                  />
                </div>
                <div>
                  <FieldLabel>Medium</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.utmMedium}
                    onChange={(e) => updateForm("utmMedium", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Channel</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.utmChannel}
                    onChange={(e) => updateForm("utmChannel", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Notes</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save ad spend"}
              </button>
            </form>

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900">CSV import</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                CSV must include <strong>spendDate</strong> (or Day/date) and{" "}
                <strong>amount</strong> (or Cost/spend). Optional: utm_source, utm_campaign,
                utm_medium, utm_channel, notes. Google Ads exports (Day, Campaign, Cost) work
                as-is.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <FieldLabel>Default source</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={csvDefaults.utmSource}
                    onChange={(e) => updateCsvDefault("utmSource", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Default medium</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={csvDefaults.utmMedium}
                    onChange={(e) => updateCsvDefault("utmMedium", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Default channel</FieldLabel>
                  <input
                    type="text"
                    className={inputClass}
                    value={csvDefaults.utmChannel}
                    onChange={(e) => updateCsvDefault("utmChannel", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Download template
                </button>
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {importing ? "Uploading…" : "Upload CSV"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Max 15,000 rows per import. Re-importing the same campaign + date updates the
                existing row (no duplicate spend).
              </p>
            </div>
          </div>
        )}
      </div>

      {data.unavailable ? (
        <p className="text-sm text-gray-500">{data.emptyMessage}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Ad spend" value={data.totalSpend} styleKey="spend" />
        <MetricTile label="ROAS" value={data.blendedRoas} styleKey="roas" />
        <MetricTile label="POAS" value={data.poas} styleKey="poas" />
        <MetricTile label="Cost per acquisition" value={data.costPerAcquisition} styleKey="cpa" />
      </div>
    </div>
  );
}

ZextonsAdvertisingSection.propTypes = {
  data: PropTypes.shape({
    unavailable: PropTypes.bool.isRequired,
    emptyMessage: PropTypes.string.isRequired,
    totalSpend: PropTypes.string.isRequired,
    blendedRoas: PropTypes.string.isRequired,
    poas: PropTypes.string.isRequired,
    costPerAcquisition: PropTypes.string.isRequired,
  }).isRequired,
  onSpendSaved: PropTypes.func,
};
