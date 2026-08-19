import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getStripeSettings,
  saveStripeSettings,
  testStripeConnection,
} from "./service/stripeSettingsService";

export default function StripeSettings() {
  const [selectedPage, setSelectedPage] = useState("stripe-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form state
  const [secretKey, setSecretKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Password visibility state
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showPublishableKey, setShowPublishableKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Settings info
  const [hasSecretKey, setHasSecretKey] = useState(false);
  const [hasPublishableKey, setHasPublishableKey] = useState(false);
  const [hasWebhookSecret, setHasWebhookSecret] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getStripeSettings();
      if (data) {
        setSecretKey(data.secretKey || "");
        setPublishableKey(data.publishableKey || "");
        setWebhookSecret(data.webhookSecret || "");
        setIsActive(data.isActive !== false);
        setHasSecretKey(data.hasSecretKey || false);
        setHasPublishableKey(data.hasPublishableKey || false);
        setHasWebhookSecret(data.hasWebhookSecret || false);
        setTestMode(Boolean(data.testMode));
        setUpdatedAt(data.updatedAt || null);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);

    try {
      const settings = {
        isActive,
      };

      // Only include keys if they're new values (not masked)
      if (secretKey && !secretKey.startsWith("••••")) {
        settings.secretKey = secretKey;
      }
      if (publishableKey && !publishableKey.startsWith("••••")) {
        settings.publishableKey = publishableKey;
      }
      if (webhookSecret && !webhookSecret.startsWith("••••")) {
        settings.webhookSecret = webhookSecret;
      }

      const result = await saveStripeSettings(settings);

      if (result) {
        // Reload settings to get updated masked values
        await loadSettings();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setProgress(50);

    try {
      await testStripeConnection();
    } catch (error) {
      console.error("Error testing connection:", error);
    } finally {
      setIsTesting(false);
      setProgress(100);
    }
  };

  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );

  return (
    <>
      <Helmet>
        <title>Stripe Settings - Admin</title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

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

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Stripe Settings
              </h1>
              <p className="mt-2 text-gray-600">
                Configure your Stripe API credentials for payment processing
              </p>
            </div>

            {/* Info Card */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Where to find your Stripe keys:
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>
                  Go to your{" "}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Stripe Dashboard API Keys
                  </a>
                </li>
                <li>
                  Copy the <strong>Secret key</strong> (starts with sk_test_ or
                  sk_live_)
                </li>
                <li>
                  Copy the <strong>Publishable key</strong> (starts with
                  pk_test_ or pk_live_)
                </li>
                <li>
                  For webhooks, go to{" "}
                  <a
                    href="https://dashboard.stripe.com/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Webhooks
                  </a>{" "}
                  and copy the <strong>Signing secret</strong> (starts with
                  whsec_)
                </li>
              </ol>
            </div>

            {/* Main Form Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    API Credentials
                  </h2>
                  {updatedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated:{" "}
                      {new Date(updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      testMode
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {testMode ? "Test mode" : "Live mode"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hasSecretKey && hasPublishableKey
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {hasSecretKey && hasPublishableKey
                      ? "Configured"
                      : "Not Configured"}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="space-y-6">
                    <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <input
                        type="checkbox"
                        checked={testMode}
                        readOnly
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">
                          Stripe test mode
                        </span>
                        <span className="block text-sm text-gray-500 mt-1">
                          Controlled by <code>STRIPE_TEST_MODE</code> in backend
                          .env. <strong>true</strong> = test cards.{" "}
                          <strong>false</strong> or unset = live payments.
                        </span>
                      </span>
                    </label>
                    <div>
                      <label
                        htmlFor="secretKey"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Secret Key *
                      </label>
                      <div className="relative">
                        <input
                          type={showSecretKey ? "text" : "password"}
                          id="secretKey"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          placeholder="sk_test_... or sk_live_..."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showSecretKey ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {hasSecretKey
                          ? "Current key is set. Enter a new key to replace it."
                          : "Required for processing payments."}
                      </p>
                    </div>

                    {/* Publishable Key */}
                    <div>
                      <label
                        htmlFor="publishableKey"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Publishable Key *
                      </label>
                      <div className="relative">
                        <input
                          type={showPublishableKey ? "text" : "password"}
                          id="publishableKey"
                          value={publishableKey}
                          onChange={(e) => setPublishableKey(e.target.value)}
                          placeholder="pk_test_... or pk_live_..."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPublishableKey(!showPublishableKey)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showPublishableKey ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {hasPublishableKey
                          ? "Current key is set. Enter a new key to replace it."
                          : "Required for the checkout form."}
                      </p>
                    </div>

                    {/* Webhook Secret */}
                    <div>
                      <label
                        htmlFor="webhookSecret"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Webhook Secret (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type={showWebhookSecret ? "text" : "password"}
                          id="webhookSecret"
                          value={webhookSecret}
                          onChange={(e) => setWebhookSecret(e.target.value)}
                          placeholder="whsec_..."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowWebhookSecret(!showWebhookSecret)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                        >
                          {showWebhookSecret ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {hasWebhookSecret
                          ? "Current secret is set. Enter a new one to replace it."
                          : "Used to verify webhook events from Stripe."}
                      </p>
                    </div>

                    {/* Webhook URL (Read-only) */}
                    <div>
                      <label
                        htmlFor="webhookUrl"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Webhook URL
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="webhookUrl"
                          value={`${import.meta.env.VITE_BACKEND_URL}webhook/stripe`}
                          readOnly
                          className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 pr-20 bg-gray-50 text-gray-600 sm:text-sm font-mono cursor-default"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${import.meta.env.VITE_BACKEND_URL}webhook/stripe`
                            );
                            toast.success("Webhook URL copied to clipboard!");
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Add this URL as a webhook endpoint in your{" "}
                        <a
                          href="https://dashboard.stripe.com/webhooks"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Stripe Webhook settings
                        </a>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting || !hasSecretKey}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTesting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Saving..." : "Save Settings"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Warning Card */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Security Notice:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>
                  Keys stored here will override environment variables
                </li>
                <li>
                  Never share your secret key with anyone
                </li>
                <li>
                  Use test keys (sk_test_/pk_test_) for development
                </li>
                <li>
                  Use live keys (sk_live_/pk_live_) only in production
                </li>
                <li>
                  Changes take effect immediately on all new payments
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
