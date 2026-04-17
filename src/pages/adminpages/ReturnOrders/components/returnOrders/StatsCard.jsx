import PropTypes from 'prop-types';

const getStatColors = (statName) => {
    switch (statName) {
        case "Total Returns":
            return {
                bgColor: "bg-blue-50",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                textColor: "text-blue-700",
                labelColor: "text-blue-600",
                borderColor: "border-blue-500"
            };
        case "Pending Returns":
            return {
                bgColor: "bg-yellow-50",
                iconBg: "bg-yellow-100",
                iconColor: "text-yellow-600",
                textColor: "text-yellow-700",
                labelColor: "text-yellow-600",
                borderColor: "border-yellow-500"
            };
        case "Refunded":
            return {
                bgColor: "bg-blue-50",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                textColor: "text-blue-700",
                labelColor: "text-blue-600",
                borderColor: "border-blue-500"
            };
        case "Return Sent":
            return {
                bgColor: "bg-indigo-50",
                iconBg: "bg-indigo-100",
                iconColor: "text-indigo-600",
                textColor: "text-indigo-700",
                labelColor: "text-indigo-600",
                borderColor: "border-indigo-500"
            };
        case "Waiting For Customer":
            return {
                bgColor: "bg-orange-50",
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
                textColor: "text-orange-700",
                labelColor: "text-orange-600",
                borderColor: "border-orange-500"
            };
        case "Waiting For Delivery":
            return {
                bgColor: "bg-cyan-50",
                iconBg: "bg-cyan-100",
                iconColor: "text-cyan-600",
                textColor: "text-cyan-700",
                labelColor: "text-cyan-600",
                borderColor: "border-cyan-500"
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
    "Total Returns": (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0-6.75h-3.75m3.75 0h3.75M9 21h6m-6-9h6m-6 6h6m-3-3h3M6 3h12M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
        </svg>
    ),
    "Pending Returns": (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    "Refunded": (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
    ),
    "Return Sent": (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    ),
    "Waiting For Customer": (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    "Waiting For Delivery": (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    )
};

const StatsCard = ({ stat, filter, setFilter }) => {
    const getFilterValue = (statName) => {
        switch (statName) {
            case "Total Returns": return "all";
            case "Pending Returns": return "pending";
            case "Refunded": return "refunded";
            case "Return Sent": return "returnsent";
            case "Waiting For Customer": return "waitingforcustomer";
            case "Waiting For Delivery": return "waitingfordelivery";
            default: return "all";
        }
    };

    const handleClick = () => {
        setFilter(getFilterValue(stat.name));
    };

    const isActive = filter === getFilterValue(stat.name) || 
                    (filter === 'all' && stat.name === "Total Returns");

    const colors = getStatColors(stat.name);

    return (
        <div
            className={`shadow hover:shadow-2xl py-6 px-7 duration-500 cursor-pointer rounded-lg border transition-all ${
                isActive
                    ? `${colors.bgColor} border-2 ${colors.borderColor}`
                    : `${colors.bgColor} border border-transparent hover:border-opacity-30`
            }`}
            onClick={handleClick}
        >
            <div className="flex justify-between items-center">
                <div className={`inline-flex items-center justify-center p-3 rounded-full ${
                    isActive ? colors.iconBg : colors.iconBg
                }`}>
                    <span className={colors.iconColor}>
                        {icons[stat.name]}
                    </span>
                </div>
                <p className={`flex items-center text-lg ${colors.iconColor}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 ms-1">
                        <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                    </svg>
                </p>
            </div>
            <div className="flex justify-between items-end mt-5">
                <div className="flex justify-between items-center w-full">
                    <p className={`text-xl font-semibold lg:ps-4 ${
                        isActive ? colors.textColor : colors.textColor
                    }`}>{stat.value}</p>
                    <p className={`text-sm font-medium ${
                        isActive
                            ? `${colors.labelColor} font-semibold`
                            : `${colors.labelColor} opacity-80`
                    }`}>{stat.name}</p>
                </div>
            </div>
        </div>
    );
};

StatsCard.propTypes = {
    stat: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    }).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired
};

export default StatsCard;