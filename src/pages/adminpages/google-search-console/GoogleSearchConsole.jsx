import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  getGoogleSearchConsoleVerification,
  updateGoogleSearchConsoleVerification,
  deleteGoogleSearchConsoleVerification,
} from "./service/googleSearchConsoleService";

export default function GoogleSearchConsole() {
  const [selectedPage, setSelectedPage] = useState("google-search-console");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form state
  const [verificationCode, setVerificationCode] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch verification code on component mount
  useEffect(() => {
    loadVerificationCode();
  }, []);

  const loadVerificationCode = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getGoogleSearchConsoleVerification();
      setVerificationCode(data.verificationCode || "");
      setIsActive(data.isActive || false);
    } catch (error) {
      console.error("Error loading verification code:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);

    try {
      if (!verificationCode.trim()) {
        toast.error("Please enter a verification code");
        setProgress(100);
        setIsSubmitting(false);
        return;
      }

      const result = await updateGoogleSearchConsoleVerification(
        verificationCode.trim()
      );

      if (result) {
        setIsActive(true);
        await loadVerificationCode();
      }
    } catch (error) {
      console.error("Error saving verification code:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove the Google Search Console verification code?"
      )
    ) {
      return;
    }

    setProgress(50);
    try {
      const result = await deleteGoogleSearchConsoleVerification();
      if (result) {
        setVerificationCode("");
        setIsActive(false);
        await loadVerificationCode();
      }
    } catch (error) {
      console.error("Error deleting verification code:", error);
    } finally {
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Google Search Console - Admin</title>
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
                Google Search Console
              </h1>
              <p className="mt-2 text-gray-600">
                Manage Google Search Console verification meta tag for your
                website
              </p>
            </div>

            {/* Instructions Card */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                How to get your verification code:
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Go to Google Search Console (search.google.com/search-console)</li>
                <li>Add your property (website URL) if not already added</li>
                <li>Choose "HTML tag" as the verification method</li>
                <li>Copy the content value from the meta tag</li>
                <li>
                  Example: If the tag is{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    &lt;meta name="google-site-verification"
                    content="abc123xyz" /&gt;
                  </code>
                  , copy <code className="bg-blue-100 px-1 rounded">abc123xyz</code>
                </li>
                <li>Paste the code in the field below and save</li>
              </ol>
            </div>

            {/* Main Form Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Verification Code
                </h2>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="space-y-6">
                    {/* Verification Code Input */}
                    <div>
                      <label
                        htmlFor="verificationCode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Google Search Console Verification Code *
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter your verification code from Google Search Console"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        This is the content value from the meta tag provided by
                        Google Search Console
                      </p>
                    </div>

                    {/* Status Indicator */}
                    {isActive && verificationCode && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-blue-400 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">
                            Verification code is active
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Preview Section */}
                    {verificationCode && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview (Meta tag that will be added to your website):
                        </label>
                        <code className="block text-sm text-gray-800 bg-white p-3 rounded border border-gray-300 font-mono break-all">
                          &lt;meta name="google-site-verification"
                          content="{verificationCode}" /&gt;
                        </code>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        {isActive && verificationCode && (
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove Verification Code
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !verificationCode.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                Important Notes:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>
                  The meta tag will be automatically added to your website's HTML
                  head section
                </li>
                <li>
                  After saving, verify in Google Search Console that the
                  verification is successful
                </li>
                <li>
                  The verification code is unique to your Google Search Console
                  property
                </li>
                <li>
                  Removing the verification code will remove the meta tag from
                  your website
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
