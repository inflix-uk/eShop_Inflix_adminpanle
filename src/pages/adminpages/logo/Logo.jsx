import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  getLogo,
  updateLogo,
  deleteLogo,
  updateFavicon,
  deleteFavicon,
} from "./service/logoService";
import ImageUploader from "../banners/components/ImageUploader";
import MediaLibraryPicker from "../media/components/media/MediaLibraryPicker";
import {
  resolveBackendAssetUrl,
  withCacheBust,
} from "../../../utils/backendAssetUrl";
import { setFavicon, clearFavicon } from "../../../utils/faviconManager";

function verifyImageDimensionsFromUrl(url, width, height) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve(img.naturalWidth === width && img.naturalHeight === height);
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export default function Logo() {
  const [selectedPage, setSelectedPage] = useState("logo");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form state
  const [logoFile, setLogoFile] = useState(null);
  const [logoLibraryUrl, setLogoLibraryUrl] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [altText, setAltText] = useState("Logo");
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconLibraryUrl, setFaviconLibraryUrl] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaviconSubmitting, setIsFaviconSubmitting] = useState(false);
  /** API `faviconVersion` (ms) or fallback for preview cache-bust */
  const [assetUpdatedAt, setAssetUpdatedAt] = useState(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null); // null | 'logo' | 'favicon'

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch logo on component mount
  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getLogo();
      const version =
        data.faviconVersion ??
        (data.updatedAt ? new Date(data.updatedAt).getTime() : null);
      setAssetUpdatedAt(version ?? null);

      if (data.logoUrl) {
        setCurrentLogoUrl(data.logoUrl);
        const resolved = resolveBackendAssetUrl(data.logoUrl);
        setLogoPreview(version ? withCacheBust(resolved, version) : resolved);
      } else {
        setCurrentLogoUrl("");
        setLogoPreview(null);
      }
      setAltText(data.altText || "Logo");
      if (data.faviconUrl) {
        setCurrentFaviconUrl(data.faviconUrl);
        const resolved = resolveBackendAssetUrl(data.faviconUrl);
        setFaviconPreview(version ? withCacheBust(resolved, version) : resolved);
        setFavicon(data.faviconUrl);
      } else {
        setCurrentFaviconUrl("");
        setFaviconPreview(null);
        clearFavicon();
      }
      setFaviconFile(null);
      setFaviconLibraryUrl(null);
    } catch (error) {
      console.error("Error loading logo:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleFileChange = (file) => {
    setLogoFile(file);
    setLogoLibraryUrl(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      if (!currentLogoUrl) {
        setLogoPreview(null);
      } else {
        const resolved = resolveBackendAssetUrl(currentLogoUrl);
        setLogoPreview(
          assetUpdatedAt ? withCacheBust(resolved, assetUpdatedAt) : resolved
        );
      }
    }
  };

  const handleFaviconFileChange = (file) => {
    setFaviconFile(file);
    setFaviconLibraryUrl(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      if (!currentFaviconUrl) {
        setFaviconPreview(null);
      } else {
        const resolved = resolveBackendAssetUrl(currentFaviconUrl);
        setFaviconPreview(
          assetUpdatedAt ? withCacheBust(resolved, assetUpdatedAt) : resolved
        );
      }
    }
  };

  const handleMediaLibrarySelect = async (url) => {
    if (mediaPickerTarget === "logo") {
      setLogoFile(null);
      setLogoLibraryUrl(url);
      setLogoPreview(url);
    } else if (mediaPickerTarget === "favicon") {
      const ok = await verifyImageDimensionsFromUrl(url, 512, 512);
      if (!ok) {
        toast.error("Favicon must be exactly 512×512 pixels");
        setMediaPickerTarget(null);
        return;
      }
      setFaviconFile(null);
      setFaviconLibraryUrl(url);
      setFaviconPreview(url);
    }
    setMediaPickerTarget(null);
  };

  const handleFaviconSubmit = async (e) => {
    e.preventDefault();
    if (!faviconFile && !faviconLibraryUrl) {
      toast.error("Please choose a favicon from PC or Media Library (PNG or ICO, 512×512)");
      return;
    }
    setIsFaviconSubmitting(true);
    setProgress(50);
    try {
      const payload = await updateFavicon(faviconFile, faviconLibraryUrl);
      if (payload?.faviconUrl) {
        setFavicon(payload.faviconUrl);
        setFaviconFile(null);
        setFaviconLibraryUrl(null);
        await loadLogo();
      }
    } finally {
      setIsFaviconSubmitting(false);
      setProgress(100);
    }
  };

  const handleFaviconDelete = async () => {
    if (
      !window.confirm(
        "Remove the custom favicon? Browsers may fall back to the default site icon."
      )
    ) {
      return;
    }
    setProgress(50);
    try {
      const ok = await deleteFavicon();
      if (ok) {
        clearFavicon();
        setCurrentFaviconUrl("");
        setFaviconPreview(null);
        setFaviconFile(null);
        setFaviconLibraryUrl(null);
        setAssetUpdatedAt(null);
        await loadLogo();
      }
    } finally {
      setProgress(100);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);

    try {
      if (!logoFile && !logoLibraryUrl && !currentLogoUrl) {
        toast.error("Please upload a logo image or select from Media Library");
        setIsSubmitting(false);
        setProgress(100);
        return;
      }

      const result = await updateLogo(logoFile, altText.trim(), logoLibraryUrl);

      if (result) {
        // Clear the file preview and reload from API
        setLogoFile(null);
        setLogoLibraryUrl(null);
        setLogoPreview(null);
        await loadLogo();
      }
    } catch (error) {
      console.error("Error saving logo:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove the logo? This will remove it from your website."
      )
    ) {
      return;
    }

    setProgress(50);
    try {
      const result = await deleteLogo();
      if (result) {
        setCurrentLogoUrl("");
        setLogoPreview(null);
        setLogoFile(null);
        setLogoLibraryUrl(null);
        await loadLogo();
      }
    } catch (error) {
      console.error("Error deleting logo:", error);
    } finally {
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Logo Management - Admin</title>
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
                Logo Management
              </h1>
              <p className="mt-2 text-gray-600">
                Upload and manage your website logo and browser favicon
              </p>
            </div>

            {/* Instructions Card */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Logo guidelines
              </h2>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>Recommended format: PNG or SVG with transparent background</li>
                <li>Recommended size: 160x70 pixels (or maintain aspect ratio)</li>
                <li>Maximum file size: 5MB</li>
                <li>The logo will be displayed in the website header/navbar</li>
                <li>Make sure the logo is clear and readable at different sizes</li>
              </ul>
            </div>

            {/* Main Form Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Current Logo
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
                    {/* Logo Preview */}
                    {(logoPreview || currentLogoUrl) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Preview:
                        </label>
                        <div className="flex items-center justify-center bg-white p-3 rounded border border-gray-300">
                          <img
                            key={logoPreview || currentLogoUrl || "logo"}
                            src={
                              logoPreview ||
                              (currentLogoUrl
                                ? withCacheBust(
                                    resolveBackendAssetUrl(currentLogoUrl),
                                    assetUpdatedAt
                                  )
                                : "")
                            }
                            alt={altText}
                            className="max-w-[200px] max-h-20 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Logo Upload */}
                    <div>
                      <ImageUploader
                        label="Upload Logo *"
                        helperText="Upload from PC or choose from Media Library (max 5MB)."
                        value={logoPreview}
                        onChange={handleFileChange}
                        onSelectFromLibrary={() => setMediaPickerTarget("logo")}
                        required={!currentLogoUrl}
                        accept="image/*"
                        maxSizeMB={5}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Select a new logo image to replace the current one
                      </p>
                    </div>

                    {/* Alt Text Input */}
                    <div>
                      <label
                        htmlFor="altText"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Alt Text
                      </label>
                      <input
                        type="text"
                        id="altText"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Enter alt text for the logo"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Alt text helps with SEO and accessibility
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        {currentLogoUrl && (
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          (!logoFile && !logoLibraryUrl && !currentLogoUrl)
                        }
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Favicon card */}
            <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Favicon (site icon)
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Shown in browser tabs and bookmarks. Must be exactly 512×512
                  pixels, PNG or ICO, up to 2MB.
                </p>
              </div>

              {!loading && (
                <form onSubmit={handleFaviconSubmit} className="px-6 py-6">
                  <div className="space-y-6">
                    {(faviconPreview || currentFaviconUrl) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Favicon preview
                        </label>
                        <div className="flex items-center justify-center bg-white p-3 rounded border border-gray-300">
                          <img
                            key={faviconPreview || currentFaviconUrl || "favicon"}
                            src={
                              faviconPreview ||
                              (currentFaviconUrl
                                ? withCacheBust(
                                    resolveBackendAssetUrl(currentFaviconUrl),
                                    assetUpdatedAt
                                  )
                                : "")
                            }
                            alt="Favicon preview"
                            className="max-w-[64px] max-h-[64px] w-16 h-16 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <ImageUploader
                        label="Upload favicon"
                        helperText="Upload from PC or choose from Media Library. Must be exactly 512×512."
                        value={faviconPreview}
                        onChange={handleFaviconFileChange}
                        onSelectFromLibrary={() => setMediaPickerTarget("favicon")}
                        required={false}
                        accept=".png,.ico,image/png,image/x-icon,image/vnd.microsoft.icon"
                        maxSizeMB={2}
                        dimensionCheck={{ width: 512, height: 512 }}
                        dimensionCheckSkipExtensions={[".ico"]}
                        fileTypeHint="PNG or ICO, exactly 512×512 px, up to 2MB"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        ICO files are checked for size on the server. PNG files
                        are also checked in your browser before upload.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        {currentFaviconUrl && (
                          <button
                            type="button"
                            onClick={handleFaviconDelete}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove favicon
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={
                          isFaviconSubmitting ||
                          (!faviconFile && !faviconLibraryUrl)
                        }
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isFaviconSubmitting
                          ? "Saving…"
                          : "Save favicon"}
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
                  The logo will be automatically updated on your website after saving
                </li>
                <li>
                  Make sure to test the logo appearance on different screen sizes
                </li>
                <li>
                  Removing the logo will remove it from your website header
                </li>
                <li>
                  For best results, use a high-quality image with transparent background
                </li>
                <li>
                  Favicon previews use the server file version so re-uploads show
                  immediately without a stale cached image
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      <MediaLibraryPicker
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaLibrarySelect}
      />
    </>
  );
}
