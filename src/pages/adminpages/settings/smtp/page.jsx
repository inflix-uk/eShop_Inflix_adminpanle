import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getSmtpSettings,
  saveSmtpSettings,
  testSmtpConnection,
} from "./service/smtpSettingsService";

function IconServer({ className = "h-4 w-4 text-gray-500" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function IconUser({ className = "h-4 w-4 text-gray-500" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconLock({ className = "h-4 w-4 text-gray-500" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IconEnvelope({ className = "h-4 w-4 text-gray-500" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconMailHeader({ className = "h-8 w-8 text-gray-700" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconEye({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEyeOff({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function IconBolt({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

export default function SmtpSettings() {
  const [selectedPage, setSelectedPage] = useState("smtp-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [orderNotifyEmail, setOrderNotifyEmail] = useState("");
  const [orderConfirmationCc, setOrderConfirmationCc] = useState("");
  const [orderConfirmationBcc, setOrderConfirmationBcc] = useState("");
  const [useSsl, setUseSsl] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  /** After user edits the password field, save sends `password` (empty string clears on server). */
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const isConfigured = useMemo(
    () =>
      smtpHost.trim().length > 0 &&
      smtpPort.trim().length > 0 &&
      username.trim().length > 0 &&
      (password.trim().length > 0 || hasPassword),
    [smtpHost, smtpPort, username, password, hasPassword]
  );

  const toggleSidebar = () => setIsSidebarOpen((o) => !o);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadSettings = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getSmtpSettings();
      if (data) {
        setSmtpHost(data.host || "");
        setSmtpPort(data.port != null ? String(data.port) : "");
        setUsername(data.username || "");
        // Never put API mask (•••• + last4) in the field — it looks "hardcoded" and cannot be cleared meaningfully.
        setPassword("");
        setPasswordTouched(false);
        setFromEmail(data.fromEmail || "");
        setFromName(data.fromName || "");
        setOrderNotifyEmail(data.orderNotifyEmail || "");
        setOrderConfirmationCc(data.orderConfirmationCc || "");
        setOrderConfirmationBcc(data.orderConfirmationBcc || "");
        const loadedPort = parseInt(String(data.port ?? "").trim(), 10);
        if (loadedPort === 587) setUseSsl(false);
        else if (loadedPort === 465) setUseSsl(true);
        else setUseSsl(data.secure !== false);
        setHasPassword(!!data.hasPassword);
        setUpdatedAt(data.updatedAt || null);
      }
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const buildPayload = (includePassword) => {
    const portNum = parseInt(String(smtpPort).trim(), 10);
    const payload = {
      host: smtpHost.trim(),
      port: Number.isFinite(portNum) ? portNum : 465,
      secure: useSsl,
      username: username.trim(),
      fromEmail: fromEmail.trim(),
      fromName: fromName.trim(),
      orderNotifyEmail: orderNotifyEmail.trim(),
      orderConfirmationCc: orderConfirmationCc.trim(),
      orderConfirmationBcc: orderConfirmationBcc.trim(),
    };
    if (!includePassword) return payload;
    /** User cleared the password field after load — save removes stored secret; test still uses DB password. */
    const wantsRemoveStoredPassword =
      passwordTouched && password.trim() === "" && hasPassword;
    if (wantsRemoveStoredPassword) {
      payload.removePassword = true;
      return payload;
    }
    const trimmed = password.trim();
    if (trimmed && !trimmed.startsWith("••••")) {
      payload.password = trimmed;
    }
    return payload;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(40);
    try {
      const payload = buildPayload(true);
      const result = await saveSmtpSettings(payload);
      if (result) {
        await loadSettings();
      }
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleTestConnection = async () => {
    if (!isConfigured) {
      toast.error(
        "Enter the SMTP password in the field (or save settings first if a password is already stored). Host, port, username, and password are all required to test."
      );
      return;
    }
    setIsTesting(true);
    setProgress(40);
    try {
      await testSmtpConnection(buildPayload(true));
    } finally {
      setIsTesting(false);
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>SMTP Configuration - Admin</title>
      </Helmet>

      <LoadingBar color="#2563EB" progress={progress} onLoaderFinished={() => setProgress(0)} />

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
          <div className="px-4 sm:px-6 lg:px-8 w-full">
            <div className="mb-6 flex items-start gap-3">
              <IconMailHeader className="h-6 w-6 text-primary shrink-0 mt-1.5" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  SMTP Configuration
                </h1>
                <p className="mt-1.5 text-gray-600 text-sm sm:text-base leading-relaxed">
                  Configure email server settings for sending transactional emails (orders, bookings, newsletter, messages).
                </p>
                {updatedAt && !loading && (
                  <p className="mt-1 text-xs text-gray-500">
                    Last updated: {new Date(updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {!isConfigured && !loading && (
              <div
                className="mb-6 flex gap-3 rounded-lg border border-amber-200/90 bg-amber-50 px-4 py-3.5 text-amber-950 shadow-sm"
                role="status"
              >
                <div>
                  <p className="font-semibold text-amber-950">SMTP Not Configured</p>
                  <p className="text-sm text-amber-900/85 mt-0.5">
                    Enter host, port, username, and password, then save. You can also set EMAIL_* environment variables on the server as a fallback.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-7 sm:px-8">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-start">
                    {/* Column 1 — server & sender (one field per row) */}
                    <div className="flex flex-col gap-6 min-w-0">
                    <div>
                      <label htmlFor="smtpHost" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconServer />
                        SMTP Host
                      </label>
                      <input
                        id="smtpHost"
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.example.com"
                        disabled={loading}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="smtpPort" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconServer />
                        SMTP Port
                      </label>
                      <input
                        id="smtpPort"
                        type="text"
                        inputMode="numeric"
                        value={smtpPort}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSmtpPort(v);
                          const n = parseInt(String(v).trim(), 10);
                          if (n === 587) setUseSsl(false);
                          else if (n === 465) setUseSsl(true);
                        }}
                        placeholder="587"
                        disabled={loading}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="smtpUser" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconUser />
                        Username
                      </label>
                      <input
                        id="smtpUser"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="SMTP username from your provider"
                        disabled={loading}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="smtpPass" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconLock />
                        Password
                      </label>
                      {hasPassword ? (
                        <p className="text-xs text-gray-500 mb-1.5">
                          A password is stored (not shown). Edit this field to set a new password or clear it, then save.
                        </p>
                      ) : (
                        <p className="text-xs text-amber-800/90 mb-1.5">
                          Enter your SMTP password here to test or save. It is not loaded from the server for security.
                        </p>
                      )}
                      <div className="relative">
                        <input
                          id="smtpPass"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordTouched(true);
                          }}
                          disabled={loading}
                          autoComplete="new-password"
                          className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="fromEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconEnvelope />
                        From Email
                      </label>
                      <input
                        id="fromEmail"
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        placeholder="noreply@example.com"
                        disabled={loading}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="fromName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconUser />
                        From Name
                      </label>
                      <input
                        id="fromName"
                        type="text"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        placeholder="Your store name"
                        disabled={loading}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="orderNotifyEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                        <IconEnvelope />
                        New order & booking notifications (admin)
                      </label>
                      <input
                        id="orderNotifyEmail"
                        type="email"
                        value={orderNotifyEmail}
                        onChange={(e) => setOrderNotifyEmail(e.target.value)}
                        placeholder="you@example.com — receives new order & booking emails (not the customer receipt)"
                        disabled={loading}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      />
                      <p className="mt-1.5 text-xs text-gray-500">
                        Internal alert when a new order or booking is created.
                      </p>
                    </div>
                    </div>

                    {/* Column 2 — customer order confirmation only */}
                    <div className="rounded-xl px-4 py-5 sm:px-5 sm:py-6 space-y-5 lg:sticky lg:top-6 shadow-sm min-w-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Customer order confirmation</p>
                        <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                          Optional CC/BCC on the email sent to the customer after checkout.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="orderConfirmationCc" className="block text-sm font-medium text-gray-700 mb-1">
                          CC — carbon copy (optional)
                        </label>
                        <input
                          id="orderConfirmationCc"
                          type="text"
                          value={orderConfirmationCc}
                          onChange={(e) => setOrderConfirmationCc(e.target.value)}
                          placeholder="ops@store.com, finance@store.com"
                          disabled={loading}
                          autoComplete="off"
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          One or more addresses, separated by commas. Visible to the customer on most mail clients.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="orderConfirmationBcc" className="block text-sm font-medium text-gray-700 mb-1">
                          BCC — blind carbon copy (optional)
                        </label>
                        <input
                          id="orderConfirmationBcc"
                          type="text"
                          value={orderConfirmationBcc}
                          onChange={(e) => setOrderConfirmationBcc(e.target.value)}
                          placeholder="Trustpilot AFS, archiving, or internal inbox"
                          disabled={loading}
                          autoComplete="off"
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:px-8">
                  <div className="text-start max-w-xl">
                    <p className="text-sm font-semibold text-gray-900">Use SSL/TLS</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Port <strong className="font-medium text-gray-700">465</strong>: keep on (implicit SSL). Port{" "}
                      <strong className="font-medium text-gray-700">587</strong>: turn off (STARTTLS); the server upgrades the connection after connect.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useSsl}
                    onClick={() => setUseSsl((v) => !v)}
                    disabled={loading}
                    className={`relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      useSsl ? "bg-green-500" : "bg-gray-300"
                    } disabled:opacity-50`}
                  >
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-out ${
                        useSsl ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-8">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={loading || isTesting || isSubmitting || !isConfigured}
                    title={
                      !isConfigured
                        ? "Fill host, port, username, and password (or load saved settings with a stored password)"
                        : undefined
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <IconBolt className="text-gray-800" />
                    {isTesting ? "Testing…" : "Test Connection"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting || isTesting}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving…" : "Save Settings"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
