import PropTypes from "prop-types";

/**
 * Return Requests Statistics Component
 * Displays statistics cards for return requests
 */
const ReturnRequestsStats = ({ stats }) => {
  const displayStats = [
    {
      id: 1,
      name: "Total Requests",
      value: stats.totalRequestOrders,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      labelColor: "text-blue-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
          />
        </svg>
      ),
    },
    {
      id: 2,
      name: "Pending",
      value: stats.TotalPendingRequestOrders,
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-700",
      labelColor: "text-yellow-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 text-yellow-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      name: "Accepted",
      value: stats.TotalAcceptedRequestOrders,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      labelColor: "text-blue-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 text-blue-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
    },
    {
      id: 4,
      name: "Rejected",
      value: stats.TotalRejectedRequestOrders,
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-700",
      labelColor: "text-red-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 text-red-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 my-5">
      {displayStats.map((stat) => (
        <div
          key={stat.id}
          className={`shadow hover:shadow-2xl py-6 px-7 duration-500 cursor-pointer ${stat.bgColor} rounded-lg border border-transparent hover:border-opacity-30 transition-all`}
        >
          <div className="flex justify-between items-center">
            <div
              className={`inline-flex items-center justify-center p-3 ${stat.iconBg} rounded-full`}
            >
              {stat.icon}
            </div>
          </div>
          <div className="flex justify-between items-end mt-5">
            <div className="flex justify-between items-center w-full">
              <p className={`text-xl font-semibold lg:ps-4 ${stat.textColor}`}>
                {stat.value}
              </p>
              <p
                className={`text-sm font-medium ${stat.labelColor} opacity-80`}
              >
                {stat.name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

ReturnRequestsStats.propTypes = {
  stats: PropTypes.shape({
    totalRequestOrders: PropTypes.number,
    TotalPendingRequestOrders: PropTypes.number,
    TotalAcceptedRequestOrders: PropTypes.number,
    TotalRejectedRequestOrders: PropTypes.number,
  }).isRequired,
};

export default ReturnRequestsStats;
