import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Helmet } from "react-helmet-async";
import NavbarOrderEditor from "../../../components/ProductCentralComponents/NavbarOrderEditor";
import HomepageNavLinksEditor from "../../../components/ProductCentralComponents/HomepageNavLinksEditor";

const TAB_ORDER = "order";
const TAB_LINKS = "links";

function normalizeTab(raw) {
  const t = String(raw || "").toLowerCase().trim();
  if (t === TAB_LINKS) return TAB_LINKS;
  return TAB_ORDER;
}

export default function ProductCentralNavbarHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPage, setSelectedPage] = useState("storefront-navbar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(() =>
    normalizeTab(searchParams.get("tab"))
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    setSelectedTab(normalizeTab(searchParams.get("tab")));
  }, [searchParams]);

  const syncTabToUrl = useCallback(
    (tab) => {
      const next = normalizeTab(tab);
      setSearchParams(next === TAB_ORDER ? {} : { tab: next }, { replace: true });
    },
    [setSearchParams]
  );

  const tabIndex = selectedTab === TAB_LINKS ? 1 : 0;

  return (
    <>
      <Helmet>
        <title>Navbar - Content</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gray-50/50 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <span className="text-sm font-medium text-gray-500">Content</span>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-primary md:ml-2">
                      Navbar
                    </span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Navbar</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Order storefront categories and manage quick nav links for the public site.
                </p>
              </div>
            </div>

            <Tab.Group
              selectedIndex={tabIndex}
              onChange={(index) => {
                const next = index === 1 ? TAB_LINKS : TAB_ORDER;
                setSelectedTab(next);
                syncTabToUrl(next);
              }}
            >
              <Tab.List className="mb-6 flex space-x-1 overflow-x-auto rounded-xl bg-gray-100 p-1 max-w-xl">
                <Tab
                  className={({ selected }) =>
                    `rounded-lg py-2.5 px-4 text-sm font-medium leading-5 whitespace-nowrap w-1/2
                    ${
                      selected
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-primary"
                    }`
                  }
                >
                  Navbar order
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `rounded-lg py-2.5 px-4 text-sm font-medium leading-5 whitespace-nowrap w-1/2
                    ${
                      selected
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-primary"
                    }`
                  }
                >
                  Storefront nav links
                </Tab>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Order navbar categories
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Choose categories, drag to set order, then save. The storefront navbar uses
                      this order.
                    </p>
                    <NavbarOrderEditor />
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Storefront nav links</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Navbar and homepage quick links for the public site.
                    </p>
                    <HomepageNavLinksEditor />
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </main>
      </div>
    </>
  );
}
