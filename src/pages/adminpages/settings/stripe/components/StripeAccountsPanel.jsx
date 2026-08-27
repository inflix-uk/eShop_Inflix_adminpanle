import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Pencil, Plus, Trash2, Zap } from "lucide-react";
import {
  createStripeAccount,
  deleteStripeAccount,
  getStripeAccounts,
  testStripeAccount,
  updateStripeAccount,
} from "../service/stripeSettingsService";

/**
 * Additional Stripe accounts. A booking package can point at one of these to
 * take its money into a different Stripe account than the platform default.
 */

const EMPTY_FORM = {
  label: "",
  secretKey: "",
  publishableKey: "",
  webhookSecret: "",
  isActive: true,
};

export default function StripeAccountsPanel({ webhookUrl }) {
  const [accounts, setAccounts] = useState([]);
  const [activeMode, setActiveMode] = useState("live");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  /** null = closed, "new" = create, otherwise the account id being edited. */
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getStripeAccounts();
    if (data?.data) {
      setAccounts(data.data);
      setActiveMode(data.activeMode || "live");
    }
    setLoading(false);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };

  const openEdit = (account) => {
    setForm({
      label: account.label || "",
      secretKey: account.secretKey || "",
      publishableKey: account.publishableKey || "",
      webhookSecret: account.webhookSecret || "",
      isActive: account.isActive !== false,
    });
    setEditing(account._id);
  };

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = { label: form.label, isActive: form.isActive };
    // Masked values mean "unchanged" — never send them back as new keys.
    if (form.secretKey && !form.secretKey.startsWith("••••")) {
      payload.secretKey = form.secretKey;
    }
    if (form.publishableKey && !form.publishableKey.startsWith("••••")) {
      payload.publishableKey = form.publishableKey;
    }
    if (form.webhookSecret !== undefined && !form.webhookSecret.startsWith("••••")) {
      payload.webhookSecret = form.webhookSecret;
    }

    const result =
      editing === "new"
        ? await createStripeAccount(payload)
        : await updateStripeAccount(editing, payload);

    setSaving(false);
    if (result) {
      setEditing(null);
      setForm(EMPTY_FORM);
      load();
    }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    await testStripeAccount(id);
    setTestingId(null);
    load();
  };

  const handleDelete = async (id) => {
    const ok = await deleteStripeAccount(id);
    setDeleteId(null);
    if (ok) load();
  };

  return (
    <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Additional Stripe accounts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Assign one to a booking package so its payments land in that account. Packages
            with no account use the platform default above.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
        >
          <Plus size={16} />
          Add account
        </button>
      </div>

      <div className="px-6 py-5">
        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm text-gray-600">
              No additional accounts. Every booking package currently charges the platform
              default account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="rounded-lg border border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{account.label}</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        account.keyMode === "test"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {account.keyMode === "test" ? "Test keys" : "Live keys"}
                    </span>
                    {!account.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Inactive
                      </span>
                    ) : null}
                    {account.packageCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {account.packageCount} package
                        {account.packageCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                    {account.publishableKey || "no publishable key"}
                    {account.stripeAccountRef ? ` · ${account.stripeAccountRef}` : ""}
                  </p>

                  {!account.usableInActiveMode ? (
                    <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      Keys are {account.keyMode}, backend is in {activeMode} mode — packages
                      using this account fall back to the platform default.
                    </p>
                  ) : !account.hasWebhookSecret ? (
                    <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0" />
                      No webhook secret — bookings paid through this account will not
                      auto-confirm.
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-green-700 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="shrink-0" />
                      Ready
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTest(account._id)}
                    disabled={testingId === account._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Zap size={14} />
                    {testingId === account._id ? "Testing…" : "Test"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(account)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(account._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {webhookUrl ? (
          <p className="mt-4 text-xs text-gray-500">
            Each account needs its own webhook endpoint in its Stripe dashboard pointing at{" "}
            <code className="font-mono">{webhookUrl}</code> — paste that endpoint&apos;s
            signing secret above.
          </p>
        ) : null}
      </div>

      {/* Add / edit modal */}
      {editing ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setEditing(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editing === "new" ? "Add Stripe account" : "Edit Stripe account"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account name *
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setField("label", e.target.value)}
                    placeholder="e.g. Studio Ltd"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Shown in the package dropdown. Not sent to Stripe.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret key {editing === "new" ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    value={form.secretKey}
                    onChange={(e) => setField("secretKey", e.target.value)}
                    placeholder="sk_test_... or sk_live_..."
                    required={editing === "new"}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publishable key {editing === "new" ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    value={form.publishableKey}
                    onChange={(e) => setField("publishableKey", e.target.value)}
                    placeholder="pk_test_... or pk_live_..."
                    required={editing === "new"}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-primary focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be from the same account and mode as the secret key.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook signing secret
                  </label>
                  <input
                    type="text"
                    value={form.webhookSecret}
                    onChange={(e) => setField("webhookSecret", e.target.value)}
                    placeholder="whsec_..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-primary focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Required for bookings on this account to auto-confirm after payment.
                  </p>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                  <span className="text-sm text-gray-700">
                    Active (selectable by packages)
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    {saving ? "Saving…" : editing === "new" ? "Add account" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete confirm */}
      {deleteId ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Remove account</h3>
              <p className="text-sm text-gray-500 mb-6">
                Remove this Stripe account? Packages must be moved off it first. Bookings
                already paid through it keep working.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
