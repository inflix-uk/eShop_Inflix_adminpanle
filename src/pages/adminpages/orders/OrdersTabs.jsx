import { Link, useNavigate, useLocation } from "react-router-dom";

export default function OrdersTab() {
  const navigate = useNavigate(); // Use navigate to programmatically change route
  const location = useLocation(); // Get current location to determine active tab

  const tabs = [
    {
      name: "Orders",
      link: "/admin/orders",
    },
    {
      name: "Deleted Orders",
      link: "/admin/delete-orders",
    },
  ];

  // Determine current tab based on location
  const currentTab = tabs.find((tab) => location.pathname === tab.link);

  const handleTabChange = (event) => {
    const selectedTab = tabs.find((tab) => tab.name === event.target.value);
    if (selectedTab) {
      navigate(selectedTab.link); // Navigate to the selected tab's link
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
      {/* Mobile Dropdown */}
      <div className="sm:hidden p-3">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full text-xs rounded-md border-blue-500 shadow-sm py-2 px-3 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
          value={currentTab?.name || tabs[0].name}
          onChange={handleTabChange}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden sm:block">
        <nav className="flex" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.link;
            return (
              <Link
                key={tab.name}
                to={tab.link}
                className={`
                  flex-1 px-4 py-3 text-center text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? "bg-blue-50 text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
