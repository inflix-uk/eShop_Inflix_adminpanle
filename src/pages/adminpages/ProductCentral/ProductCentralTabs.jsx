import React from "react";
import { Link, useNavigate } from "react-router-dom";
export default function ProductCentralTabs({ selectedTab, setSelectedTab }) {
    const navigate = useNavigate(); // Use navigate to programmatically change route

    const tabs = [
        {
            name: "Product Central",
            link: "/admin/product-central",
            current: selectedTab === "product-central",
        },
        {
            name: "Variant Attributes",
            link: "/admin/variant-attributes",
            current: selectedTab === "variant-attributes",
        },
        {
            name: "Product Options",
            link: "/admin/product-options",
            current: selectedTab === "product-options",
        },
        {
            name: "Card Design",
            link: "/admin/product-central/card-design",
            current: selectedTab === "card-design",
        },
    ];

    const handleTabChange = (event) => {
        const selectedTab = tabs.find((tab) => tab.name === event.target.value);
        if (selectedTab) {
            navigate(selectedTab.link); // Navigate to the selected tab's link
        }
    };
  return (
      <div>
          <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">Select a tab</label>
              {/* Handle the onChange event to redirect the user to the selected tab URL */}
              <select
                  id="tabs"
                  name="tabs"
                  className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  defaultValue={tabs.find((tab) => tab.current)?.name} // Set the default value based on the current tab
                  onChange={handleTabChange} // Listen for the selection change
              >
                  {tabs.map((tab) => (
                      <option key={tab.name} value={tab.name}>
                          {tab.name}
                      </option>
                  ))}
              </select>
          </div>

          {/* Tab navigation for larger screens */}
          <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                  <nav className="-mb-px flex justify-around items-center" aria-label="Tabs">
                      {tabs.map((tab) => (
                          <Link
                              key={tab.name}
                              to={tab.link}
                              className={`${tab.current
                                  ? "border-primary text-primary"
                                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                  }
                    w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium
                  `}
                              aria-current={tab.current ? "page" : undefined}
                          >
                              {tab.name}
                          </Link>
                      ))}
                  </nav>
              </div>
          </div>
      </div>
  )
}
