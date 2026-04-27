import React, { useState, useEffect } from 'react';
import Top from "../nav/Top.jsx";
import Side from "../nav/Side.jsx";
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../../context/Auth.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getOrderLineItemImageUrl } from '../orders/utils/orderItemImageUrl';


const Dash2 = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const [selectedPage, setSelectedPage] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Stats state for dashboard summary cards
    const [stats, setStats] = useState({
        TotalpendingOrders: 0,
        TotalPendingreturnOrders: 0,
        TotalreturnRequests: 0,
    });

    // State for unread messages count
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    // State to hold top selling products
    const [topProducts, setTopProducts] = useState([]);

    // Array to render stat cards
    const displayStats = [
        { id: 1, name: "Pending Orders", value: stats.TotalpendingOrders },
        { id: 2, name: "Pending Return Orders", value: stats.TotalPendingreturnOrders },
        { id: 3, name: "Pending Return Requests", value: stats.TotalreturnRequests },
        { id: 4, name: "New Messages", value: unreadMessagesCount },
    ];

    // Fetch the stats data
    useEffect(() => {
        axios
            .get(`${auth.ip}get/stats`)
            .then((response) => {
                setStats({
                    TotalpendingOrders: response.data.stats.pendingOrders,
                    TotalPendingreturnOrders: response.data.stats.TotalPendingreturnOrders,
                    TotalreturnRequests: response.data.stats.TotalPendingRequestOrders,
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }, [auth.ip]);

    // Fetch unread messages count
    useEffect(() => {
        axios
            .get(`${auth.ip}get/total/messages/count`)
            .then((response) => {
                if (response.data.success) {
                    setUnreadMessagesCount(response.data.unreadMessagesCount || 0);
                }
            })
            .catch((error) => {
                console.log("Error fetching unread messages count:", error);
            });
    }, [auth.ip]);

    // Fetch the top selling products data
    useEffect(() => {
        axios.get(`${auth.ip}top/product/sold`)
            .then((response) => {
                console.log("Top selling products:", response);
                setTopProducts(response.data.topProducts);
            })
            .catch((error) => {
                console.log("Error fetching top selling products:", error);
            });
    }, [auth.ip]);
    const icons = [
        // Pending Orders icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>,
        // Pending Return Orders icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>,
        // Pending Return Requests icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        // New Messages icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>,
    ];
    const parseVariantName = (variantName) => {
        // If variant is 'single' or doesn't follow the expected pattern, return default values.
        if (variantName === 'single' || !variantName.includes('-')) {
            return { condition: '', color: variantName, storage: '' };
        }

        const parts = variantName.split('-');

        // Trim each part to remove any extra whitespace.
        const condition = parts[0].trim();

        // Find and extract storage information
        const storageRegex = /(\d+\s*(?:GB|TB|gb|tb))/i;
        const storageMatch = variantName.match(storageRegex);
        const storage = storageMatch ? storageMatch[0].trim() : '';

        // Extract the color by removing storage and condition
        let color = variantName
            .replace(condition, '')
            .replace(storage, '')
            .replace(/[-]/g, '')
            .replace(/\s*\(.*?\)/, '') // Remove any parentheses and their contents
            .trim();

        // Remove any leading or trailing hyphens
        color = color.replace(/^-+|-+$/g, '').trim().split(/\s+/).join('-');

        return { condition, color, storage };
    };
    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>
            <Side selectedPage={selectedPage} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Stats Cards Section */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 my-5">
                            {displayStats.map((stat, index) => (
                                <div
                                    key={stat.id}
                                    className="shadow hover:shadow-2xl py-6 px-7 duration-500 cursor-pointer rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                    onClick={() => {
                                        const routeMap = {
                                            "Pending Orders": { path: '/admin/orders', state: { filterStatus: 'pending' } },
                                            "Pending Return Orders": { path: '/admin/return-orders', state: { filterStatus: 'pending' } },
                                            "Pending Return Requests": { path: '/admin/return-requests', state: { filterStatus: 'pending' } },
                                            "New Messages": { path: '/admin/order-messages', state: { filterStatus: 'new' } }
                                        };

                                        const route = routeMap[stat.name];
                                        if (route) {
                                            navigate(route.path, { state: route.state });
                                        }
                                    }}                                >
                                    <div className="flex justify-between items-center">
                                        <div className="inline-flex items-center justify-center p-3 bg-gray-200 rounded-full">
                                            {icons[index]}
                                        </div>
                                        <p className="flex items-center text-lg text-blue-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 ms-1">
                                                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                                            </svg>
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end mt-5">
                                        <div className="flex justify-between items-center w-full">
                                            <p className="text-xl font-semibold lg:ps-4">{stat.value}</p>
                                            <p className="text-sm text-gray-500">{stat.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Top Selling Products Section */}
                        <section className="mt-10">
                            <div className="flex items-center gap-2 mb-6">

                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-800">Top Selling Products</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topProducts && topProducts.length > 0 ? (
                                    topProducts.map((product) => {
                                        const topProductImageUrl = getOrderLineItemImageUrl(product, auth.ip);
                                        return (
                                        <div key={product._id}
                                            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 h-full"
                                        >
                                            <div className="p-3 flex flex-col h-full">
                                                <div className='flex items-center  border-2 border-gray-100 rounded-md p-1'>
                                                    {/* Product Image Section — same resolution as order line items (url, path, string thumbnail) */}
                                                    <div className="h-28 w-28 relative overflow-hidden rounded-lg mb-4">
                                                        {topProductImageUrl ? (
                                                            <img
                                                                src={topProductImageUrl}
                                                                alt={product.productName}
                                                                className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Name Section */}
                                                    <div className="pb-3 mb-4">
                                                        <h3 className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                                            {product.productName}
                                                        </h3>
                                                    </div>

                                                </div>
                                                {/* Variants Section */}
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex-grow">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z" clipRule="evenodd" />
                                                        </svg>
                                                        <h4 className="text-md font-semibold text-gray-700">Variants Sold:</h4>
                                                    </div>
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-gray-50">
                                                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Variant</th>
                                                                <th className="text-right p-3 text-sm font-semibold text-gray-700">Sold</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.entries(
                                                                product.nameCounts.reduce((acc, variant) => {
                                                                    const variantDetails = parseVariantName(variant.name);
                                                                    const { condition } = variantDetails;
                                                                    if (!acc[condition]) {
                                                                        acc[condition] = [];
                                                                    }
                                                                    acc[condition].push(variant);
                                                                    return acc;
                                                                }, {})
                                                            ).map(([condition, variants], groupIndex) => (
                                                                <React.Fragment key={groupIndex}>
                                                                    <tr className="bg-gray-100">
                                                                        <td colSpan="2" className="p-2 text-sm font-medium text-indigo-600">
                                                                            {condition}
                                                                        </td>
                                                                    </tr>
                                                                    {variants.map((variant, index) => {
                                                                        const variantDetails = parseVariantName(variant.name);
                                                                        const { color, storage } = variantDetails;
                                                                        return (
                                                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                                                <td className="p-3 text-sm">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {color && <span className="text-gray-600">{color}</span>}
                                                                                        {storage && (
                                                                                            <>
                                                                                                <span className="text-gray-400">•</span>
                                                                                                <span className="text-gray-600">{storage}</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-3 text-right">
                                                                                    <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                                                                                        {variant.count} Sold
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Most Sold Variant Section */}
                                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-sm text-blue-800 font-medium flex flex-col">
                                                            Most Popular: {
                                                                (() => {
                                                                    const details = parseVariantName(product.mostSoldName)
                                                                    return [
                                                                        details.condition,
                                                                        details.color,
                                                                        details.storage
                                                                    ].filter(Boolean).join(' • ')
                                                                })()
                                                            }
                                                        </p>
                                                        <p className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold ml-2 w-16 text-center">
                                                            {product.mostSoldCount} Sold
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Total Sales Section */}
                                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                                                        </svg>
                                                        <span className="text-lg font-semibold text-blue-700">Total Sales</span>
                                                    </div>
                                                    <span className="bg-blue-200 text-blue-800 px-4 py-2 rounded-full text-lg font-bold">
                                                        {product.totalQuantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                    })
                                ) : (
                                    <div className="col-span-full bg-white rounded-xl shadow-lg p-12">
                                        <div className="flex flex-col items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-6 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-2xl text-gray-600 font-medium">No top selling products found</p>
                                            <p className="text-gray-400 mt-2">Products will appear here once sales are made</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </>
    );
};

export default Dash2;
