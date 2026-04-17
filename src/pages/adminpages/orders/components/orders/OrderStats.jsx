import PropTypes from 'prop-types';

const getStatColors = (statName) => {
  switch (statName) {
    case "All":
      return {
        bgColor: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        textColor: "text-blue-700",
        labelColor: "text-blue-600",
        borderColor: "border-blue-500"
      };
    case "Pending":
      return {
        bgColor: "bg-yellow-50",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-700",
        labelColor: "text-yellow-600",
        borderColor: "border-yellow-500"
      };
    case "Approved":
      return {
        bgColor: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        textColor: "text-blue-700",
        labelColor: "text-blue-600",
        borderColor: "border-blue-500"
      };
    case "Shipped":
      return {
        bgColor: "bg-indigo-50",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        textColor: "text-indigo-700",
        labelColor: "text-indigo-600",
        borderColor: "border-indigo-500"
      };
    default:
      return {
        bgColor: "bg-gray-50",
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        textColor: "text-gray-700",
        labelColor: "text-gray-600",
        borderColor: "border-gray-500"
      };
  }
};

const icons = {
  "All": (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 15.75v-4.875m0 0l3 3m-3-3l-3 3M9.75 8.25h.008v.008H9.75V8.25z" />
    </svg>
  ),
  "Pending": (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Approved": (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "Shipped": (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  )
};

const OrderStats = ({ stats, filter, setFilter }) => {
  const displayStats = [
    { id: 1, name: "All", value: stats.totalOrders || 0, filterValue: "all" },
    { id: 2, name: "Pending", value: stats.pendingOrders || 0, filterValue: "pending" },
    { id: 3, name: "Approved", value: stats.approvedOrders || 0, filterValue: "approved" },
    { id: 4, name: "Shipped", value: stats.shippedOrders || 0, filterValue: "shipped" },
  ];

  const getFilterValue = (statName) => {
    switch (statName) {
      case "All": return "all";
      case "Pending": return "pending";
      case "Approved": return "approved";
      case "Shipped": return "shipped";
      default: return "all";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
      {displayStats.map((stat) => {
        const isActive = filter === getFilterValue(stat.name) || 
                        (filter === 'all' && stat.name === "All");
        const colors = getStatColors(stat.name);

        const handleClick = () => {
          setFilter(getFilterValue(stat.name));
        };

        return (
          <div
            key={stat.id}
            className={`shadow hover:shadow-lg py-4 px-4 duration-300 cursor-pointer rounded-lg border transition-all ${
              isActive
                ? `${colors.bgColor} border-2 ${colors.borderColor}`
                : `${colors.bgColor} border border-transparent hover:border-opacity-50`
            }`}
            onClick={handleClick}
          >
            <div className="flex justify-between items-center">
              <div className={`inline-flex items-center justify-center p-2.5 rounded-full ${
                isActive ? colors.iconBg : colors.iconBg
              }`}>
                <span className={colors.iconColor}>
                  {icons[stat.name]}
                </span>
              </div>
              <p className={`flex items-center text-sm ${colors.iconColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 ms-1">
                  <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                </svg>
              </p>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="flex justify-between items-center w-full">
                <p className={`text-lg font-semibold ${
                  isActive ? colors.textColor : colors.textColor
                }`}>{stat.value}</p>
                <p className={`text-xs font-medium ${
                  isActive
                    ? `${colors.labelColor} font-semibold`
                    : `${colors.labelColor} opacity-80`
                }`}>{stat.name}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

OrderStats.propTypes = {
  stats: PropTypes.shape({
    totalOrders: PropTypes.number,
    pendingOrders: PropTypes.number,
    approvedOrders: PropTypes.number,
    shippedOrders: PropTypes.number,
  }).isRequired,
  filter: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
};

export default OrderStats;