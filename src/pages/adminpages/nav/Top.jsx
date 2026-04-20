import {  useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../../context/Auth";
import { Link, useNavigate } from "react-router-dom";
import Side from "./Side";

const generateImageFromInitial = (initial) => {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '50px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL();
};

export default function Top({ toggleSidebar, isSidebarOpen, selectedPage = 'dashboard', setSelectedPage = () => {} }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const firstName = auth?.user?.firstname || '';
  const imageUrl = firstName ? generateImageFromInitial(firstName.charAt(0).toUpperCase()) : '';

  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSitemapModal, setShowSitemapModal] = useState(false);
  const [sitemapCount, setSitemapCount] = useState(null);
  const [sitemapUrl, setSitemapUrl] = useState('');

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  const handleGenerateSitemap = async () => {
    const siteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || 'https://zextons.co.uk').replace(/\/$/, '');
    
    try {
      setIsGenerating(true);
      setSitemapCount(null);
      setSitemapUrl(`${siteUrl}/sitemap.xml`);
      
      try {
        const res = await fetch(`${siteUrl}/api/generate-sitemap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));
        if (data && typeof data.count === 'number') {
          setSitemapCount(data.count);
        }
        setShowSitemapModal(true);
      } catch (corsErr) {
        // Likely a CORS/preflight issue in local dev. Fallback to a no-cors request.
        await fetch(`${siteUrl}/api/generate-sitemap`, {
          method: 'GET',
          mode: 'no-cors',
        });
        // We cannot read the response (opaque), but the server will process it.
        setShowSitemapModal(true);
      }
    } catch (err) {
      console.error('Generate sitemap error:', err);
      alert('Failed to generate sitemap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={toggleSidebar}>
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-primary"
            >
              <span className="sr-only">View notifications</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleGenerateSitemap}
              disabled={isGenerating}
              className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate sitemap"
            >
              {isGenerating ? 'Generating…' : 'Generate Sitemap'}
            </button>

            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true"></div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="-m-1.5 flex items-center p-1.5"
                id="user-menu-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src={imageUrl}
                  alt=""
                />
                <span className="hidden lg:flex lg:items-center">
                  <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                    {auth?.user?.username}
                  </span>
                  <svg
                    className={`ml-2 h-5 w-5 ${isOpen ? "transform rotate-180" : ""} text-gray-400`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex="-1"
                >
                  <Link
                    to="/admin/profile"
                    className="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-primary hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-0"
                  >
                    Your profile
                  </Link>
                  <Link
                    onClick={handleLogout}
                    className="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-primary hover:text-white"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-1"
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {isSidebarOpen && <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} />}
      </div>

      {/* Loader overlay while generating */}
      {isGenerating && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-md shadow px-5 py-4 flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-sm font-medium text-gray-700">Generating sitemap…</span>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSitemapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSitemapModal(false)}></div>
          <div className="relative z-50 w-full max-w-sm rounded-lg bg-white shadow-lg p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-900">Sitemap generated</h3>
            <p className="mt-2 text-sm text-gray-600">Your sitemap has been generated successfully.</p>
            {sitemapCount !== null && (
              <p className="mt-1 text-sm text-gray-700">Total URLs: {Number(sitemapCount).toLocaleString()}</p>
            )}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowSitemapModal(false)}
              >
                Close
              </button>
              <a
                href={sitemapUrl || `${(import.meta.env.VITE_PUBLIC_SITE_URL || 'https://zextons.co.uk').replace(/\/$/, '')}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:opacity-90"
                onClick={() => setShowSitemapModal(false)}
              >
                Open Sitemap
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Top.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  selectedPage: PropTypes.string,
  setSelectedPage: PropTypes.func,
};

