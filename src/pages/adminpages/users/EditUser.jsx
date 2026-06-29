/**
 * EditUser Page
 * Edit user details on a dedicated page
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Side from '../nav/Side';
import Top from '../nav/Top';
import {
    getUserById,
    updateUser,
    buildUserUpdatePayload,
    resetUserPassword,
    assignPricingGroupToUser,
    fetchUserOrderHistory,
} from './services/usersService';
import { getAllRoles } from '../roles/services/rolesService';
import { fetchPricingGroups } from '../pricing-groups/api/groupsApi';
import {
    fetchUserPricingProducts,
    fetchUserProductPrices,
    normalizeUserExcludedIds,
    saveUserProductPrice,
    setUserProductInclusion,
} from './services/userPricingService';
import {
    flattenProductsToPricingRows,
    groupPricesRowsToMap,
    priceMapKey,
} from '../pricing-groups/api/productsApi';

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [selectedPage] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userData, setUserData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [pricingGroups, setPricingGroups] = useState([]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [pricingProducts, setPricingProducts] = useState([]);
    const [pricingOverrides, setPricingOverrides] = useState({});
    const [priceInputByProduct, setPriceInputByProduct] = useState({});
    const [pricingLoading, setPricingLoading] = useState(false);
    const [pricingSearch, setPricingSearch] = useState('');
    const [excludedProductIds, setExcludedProductIds] = useState(() => new Set());
    const [togglingProductId, setTogglingProductId] = useState(null);
    const [saveTimers, setSaveTimers] = useState({});
    const saveTimersRef = useRef({});
    const [userOrderHistory, setUserOrderHistory] = useState([]);
    const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);

    // Fetch user and roles on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Fetch roles first
            const rolesResult = await getAllRoles();
            if (!rolesResult.success) {
                toast.error(rolesResult.message);
                setIsLoading(false);
                return;
            }
            setRoles(rolesResult.data);

            try {
                const groups = await fetchPricingGroups(import.meta.env.VITE_BACKEND_URL);
                setPricingGroups(groups);
            } catch {
                setPricingGroups([]);
            }

            // Fetch user
            const userResult = await getUserById(userId);
            if (userResult.success) {
                const user = userResult.data;

                // If user has roleId, find the corresponding role name
                if (user.roleId && rolesResult.data.length > 0) {
                    const matchedRole = rolesResult.data.find(r => r._id === user.roleId);
                    if (matchedRole) {
                        user.userType = matchedRole.name;
                    }
                }

                setUserData(user);
                setExcludedProductIds(new Set(normalizeUserExcludedIds(user)));
            } else {
                toast.error(userResult.message);
                navigate('/admin/users');
                return;
            }

            setIsLoading(false);
        };

        fetchData();
    }, [userId, navigate]);

    const handleInputChange = (field, value) => {
        setUserData(prev => {
            if (field === 'role' && value !== 'admin') {
                // When role is not admin, clear userType
                return {
                    ...prev,
                    role: value,
                    userType: ''
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleAddressChange = (field, value) => {
        setUserData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        const payload = buildUserUpdatePayload(userData, roles);
        const result = await updateUser(userId, payload);

        if (result.success) {
            const assignResult = await assignPricingGroupToUser(
                userId,
                userData.pricingGroup || null
            );
            if (!assignResult.success) {
                toast.error(assignResult.message);
                setIsSaving(false);
                return;
            }
            toast.success(result.message);
            navigate('/admin/users');
        } else {
            toast.error(result.message);
        }

        setIsSaving(false);
    };

    const handleCancel = () => {
        navigate('/admin/users');
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in both password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsResettingPassword(true);

        const result = await resetUserPassword(userId, newPassword, confirmPassword);

        if (result.success) {
            toast.success(result.message);
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast.error(result.message);
        }

        setIsResettingPassword(false);
    };

    saveTimersRef.current = saveTimers;
    useEffect(() => {
        return () => {
            Object.values(saveTimersRef.current).forEach((timerId) => {
                clearTimeout(timerId);
            });
        };
    }, []);

    useEffect(() => {
        const loadPricingData = async () => {
            if (activeTab !== 'pricing' || !userId) return;
            setPricingLoading(true);
            try {
                const [products, overrides] = await Promise.all([
                    fetchUserPricingProducts(),
                    fetchUserProductPrices(userId),
                ]);
                const overrideMap = groupPricesRowsToMap(overrides);
                const inputMap = {};
                Object.entries(overrideMap).forEach(([key, val]) => {
                    inputMap[key] = String(val);
                });
                setPricingProducts(products);
                setPricingOverrides(overrideMap);
                setPriceInputByProduct(inputMap);
            } catch (error) {
                toast.error(error?.response?.data?.message || 'Failed to load user pricing');
            } finally {
                setPricingLoading(false);
            }
        };

        loadPricingData();
    }, [activeTab, userId]);

    useEffect(() => {
        const loadOrderHistory = async () => {
            if (activeTab !== 'orderHistory' || !userId) return;
            setOrderHistoryLoading(true);
            try {
                const result = await fetchUserOrderHistory(userId);
                if (result.success) {
                    setUserOrderHistory(result.orders);
                } else {
                    setUserOrderHistory([]);
                    toast.error(result.message || 'Failed to load order history');
                }
            } catch {
                setUserOrderHistory([]);
                toast.error('Failed to load order history');
            } finally {
                setOrderHistoryLoading(false);
            }
        };
        loadOrderHistory();
    }, [activeTab, userId]);

    const isProductIncluded = (productId) =>
        !excludedProductIds.has(String(productId));

    const clearLocalUserPricesForProduct = (productId) => {
        const pid = String(productId);
        setSaveTimers((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                if (key === pid || key.startsWith(`${pid}::`)) {
                    clearTimeout(next[key]);
                    delete next[key];
                }
            });
            return next;
        });
        setPricingOverrides((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                if (key === pid || key.startsWith(`${pid}::`)) delete next[key];
            });
            return next;
        });
        setPriceInputByProduct((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                if (key === pid || key.startsWith(`${pid}::`)) delete next[key];
            });
            return next;
        });
    };

    const toggleProductInclusion = async (productId, included) => {
        if (!userId) return;
        const pid = String(productId);
        setTogglingProductId(pid);
        const prevExcluded = new Set(excludedProductIds);
        setExcludedProductIds((prev) => {
            const next = new Set(prev);
            if (included) next.delete(pid);
            else next.add(pid);
            return next;
        });
        if (!included) clearLocalUserPricesForProduct(pid);

        try {
            const updated = await setUserProductInclusion(userId, pid, included);
            const nextIds = normalizeUserExcludedIds(updated);
            setExcludedProductIds(new Set(nextIds));
            setUserData((prev) =>
                prev ? { ...prev, excludedProductIds: updated?.excludedProductIds ?? [] } : prev
            );
            toast.success(
                included ? 'Product included for user pricing' : 'Product excluded from user pricing'
            );
        } catch (error) {
            setExcludedProductIds(prevExcluded);
            toast.error(error?.response?.data?.message || 'Failed to update product inclusion');
        } finally {
            setTogglingProductId(null);
        }
    };

    const onPriceInputChange = (productId, variantKey, value) => {
        if (!isProductIncluded(productId)) return;
        const pid = String(productId);
        const vk = variantKey != null ? String(variantKey).trim() : '';
        const rk = priceMapKey(pid, vk);
        setPriceInputByProduct((prev) => ({ ...prev, [rk]: value }));

        setSaveTimers((prev) => {
            const next = { ...prev };
            if (next[rk]) clearTimeout(next[rk]);
            next[rk] = setTimeout(async () => {
                const trimmed = String(value ?? '')
                    .trim()
                    .replace(/£/g, '')
                    .replace(/,/g, '.');
                if (trimmed === '') {
                    try {
                        await saveUserProductPrice(userId, pid, null, vk, { clear: true });
                        setPricingOverrides((curr) => {
                            const c = { ...curr };
                            delete c[rk];
                            return c;
                        });
                        setPriceInputByProduct((curr) => {
                            const c = { ...curr };
                            delete c[rk];
                            return c;
                        });
                        toast.success('Custom price cleared');
                    } catch (error) {
                        toast.error(error?.response?.data?.message || 'Failed to clear custom price');
                    }
                    return;
                }
                const parsed = Number(trimmed);
                if (!Number.isFinite(parsed) || parsed <= 0) return;
                try {
                    await saveUserProductPrice(userId, pid, parsed, vk);
                    setPricingOverrides((curr) => ({ ...curr, [rk]: parsed }));
                    toast.success('Custom price saved');
                } catch (error) {
                    toast.error(error?.response?.data?.message || 'Failed to save custom price');
                }
            }, 450);
            return next;
        });
    };

    const pricingRows = useMemo(() => flattenProductsToPricingRows(pricingProducts), [pricingProducts]);

    const filteredPricingRows = useMemo(() => {
        const term = pricingSearch.trim().toLowerCase();
        if (!term) return pricingRows;
        return pricingRows.filter((r) => {
            return (
                String(r.productName || '').toLowerCase().includes(term) ||
                String(r.variantLabel || '').toLowerCase().includes(term) ||
                String(r.sku || '').toLowerCase().includes(term) ||
                String(r.brand || '').toLowerCase().includes(term) ||
                String(r.category || '').toLowerCase().includes(term)
            );
        });
    }, [pricingRows, pricingSearch]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Edit User - Admin</title>
            </Helmet>

            <Side
                selectedPage={selectedPage}
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
            />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center mb-2">
                                <button
                                    onClick={handleCancel}
                                    className="mr-4 text-gray-600 hover:text-gray-900"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                                        />
                                    </svg>
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                    Edit User Details
                                </h1>
                            </div>
                            <p className="text-sm text-gray-600">
                                Update user information and permissions
                            </p>
                            {userData?.role !== 'admin' && (
                                <Link
                                    to={`/admin/crm/customers/${userId}`}
                                    className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                                >
                                    Open CRM profile
                                </Link>
                            )}
                        </div>

                        <div className="mb-4 flex items-center gap-2 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() => setActiveTab('details')}
                                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                                    activeTab === 'details'
                                        ? 'bg-white text-primary border border-b-white border-gray-200'
                                        : 'text-gray-600'
                                }`}
                            >
                                Details
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('pricing')}
                                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                                    activeTab === 'pricing'
                                        ? 'bg-white text-primary border border-b-white border-gray-200'
                                        : 'text-gray-600'
                                }`}
                            >
                                Pricing
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('orderHistory')}
                                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                                    activeTab === 'orderHistory'
                                        ? 'bg-white text-primary border border-b-white border-gray-200'
                                        : 'text-gray-600'
                                }`}
                            >
                                Order history
                            </button>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {activeTab === 'details' && (
                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* Personal Information */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.firstname || ''}
                                                onChange={(e) => handleInputChange('firstname', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.lastname || ''}
                                                onChange={(e) => handleInputChange('lastname', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.email || ''}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.phoneNumber || ''}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.dateofbirth || ''}
                                                onChange={(e) => handleInputChange('dateofbirth', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.companyname || ''}
                                                onChange={(e) => handleInputChange('companyname', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Address Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.address || ''}
                                                onChange={(e) => handleAddressChange('address', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Apartment
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.apartment || ''}
                                                onChange={(e) => handleAddressChange('apartment', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.city || ''}
                                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.country || ''}
                                                onChange={(e) => handleAddressChange('country', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.address?.postalCode || ''}
                                                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Role & Permissions */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Role & Permissions
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.role || ''}
                                                onChange={(e) => handleInputChange('role', e.target.value)}
                                            >
                                                <option value="">Select Role</option>
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                User Type
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                value={userData.userType || ''}
                                                onChange={(e) => handleInputChange('userType', e.target.value)}
                                                disabled={userData.role !== 'admin'}
                                            >
                                                <option value="">Select User Type</option>
                                                {roles.map((role) => (
                                                    <option key={role._id} value={role.name}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {userData.role !== 'admin' && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Select &rdquo;Admin&rdquo; role to enable User Type
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pricing Group
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                                value={userData.pricingGroup || ''}
                                                onChange={(e) => handleInputChange('pricingGroup', e.target.value)}
                                            >
                                                <option value="">No Group</option>
                                                {pricingGroups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Reset Section */}
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Reset Password
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                >
                                                    {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary focus:border-primary"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                >
                                                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={handleResetPassword}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isResettingPassword || !newPassword || !confirmPassword}
                                            >
                                                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Password must be at least 6 characters long
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                            )}
                            {activeTab === 'pricing' && (
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">User Custom Product Pricing</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        One row per product variation (same as pricing groups). Uncheck a product to
                                        exclude it from this user&apos;s custom prices. For products with variations,
                                        set a custom user price per variation. Precedence per row: user custom &gt; group
                                        custom &gt; base price. Clear the field and pause briefly to remove a custom price.
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={pricingSearch}
                                        onChange={(e) => setPricingSearch(e.target.value)}
                                        placeholder="Search by product, sku, brand, category"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="overflow-x-auto overflow-y-visible rounded-lg border border-gray-200">
                                    <table className="min-w-[800px] w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="w-12 px-3 py-3 text-center text-xs font-semibold uppercase text-gray-600">Include</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Product</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Variation</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">SKU</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Base (£)</th>
                                                <th className="min-w-[10rem] px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Custom user (£)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {pricingLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                                        Loading products...
                                                    </td>
                                                </tr>
                                            ) : filteredPricingRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                                        No products found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                (() => {
                                                    let lastProductId = null;
                                                    return filteredPricingRows.map((row) => {
                                                    const isFirstOfProduct = row.productId !== lastProductId;
                                                    lastProductId = row.productId;
                                                    const included = isProductIncluded(row.productId);
                                                    const rowKey = row.rowKey;
                                                    const currentOverride = pricingOverrides[rowKey];
                                                    const ph =
                                                        row.basePrice != null &&
                                                        Number.isFinite(Number(row.basePrice)) &&
                                                        Number(row.basePrice) > 0
                                                            ? String(Number(row.basePrice).toFixed(2))
                                                            : 'e.g. 99.99';
                                                    return (
                                                        <tr
                                                            key={rowKey}
                                                            className={
                                                                included
                                                                    ? 'hover:bg-gray-50'
                                                                    : 'bg-gray-50/80 opacity-70 hover:bg-gray-100'
                                                            }
                                                        >
                                                            <td className="px-3 py-3 text-center align-top">
                                                                {isFirstOfProduct ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                        checked={included}
                                                                        disabled={togglingProductId === String(row.productId)}
                                                                        onChange={(e) =>
                                                                            toggleProductInclusion(
                                                                                row.productId,
                                                                                e.target.checked
                                                                            )
                                                                        }
                                                                        aria-label={`Include ${row.productName} for user custom pricing`}
                                                                        title={
                                                                            included
                                                                                ? 'Uncheck to exclude this product from user custom prices'
                                                                                : 'Check to include this product for user custom prices'
                                                                        }
                                                                    />
                                                                ) : null}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{row.productName}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{row.variantLabel}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{row.sku || '—'}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                £{Number(row.basePrice || 0).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    disabled={!included}
                                                                    value={priceInputByProduct[rowKey] ?? ''}
                                                                    onChange={(e) =>
                                                                        onPriceInputChange(row.productId, row.variantKey, e.target.value)
                                                                    }
                                                                    placeholder={included ? ph : 'Excluded'}
                                                                    className="w-40 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                                })()
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            )}
                            {activeTab === 'orderHistory' && (
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Order history</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        All orders placed by this user. Select a row to open the order in the admin order detail view.
                                    </p>
                                </div>
                                <div className="overflow-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Order #</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Total</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Email</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600"> </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {orderHistoryLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                                        Loading orders…
                                                    </td>
                                                </tr>
                                            ) : userOrderHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                                        No orders found for this user.
                                                    </td>
                                                </tr>
                                            ) : (
                                                userOrderHistory.map((order, idx) => {
                                                    const oid = order?._id != null ? String(order._id) : '';
                                                    const created = order?.createdAt
                                                        ? new Date(order.createdAt).toLocaleString()
                                                        : '—';
                                                    const total =
                                                        order?.totalOrderValue != null && Number.isFinite(Number(order.totalOrderValue))
                                                            ? `£${Number(order.totalOrderValue).toFixed(2)}`
                                                            : '—';
                                                    const email = order?.contactDetails?.email || '—';
                                                    return (
                                                        <tr
                                                            key={oid || `order-row-${idx}`}
                                                            className="cursor-pointer hover:bg-gray-50"
                                                            onClick={() => oid && navigate(`/admin/orderdetails/${oid}`)}
                                                        >
                                                            <td className="px-4 py-3 text-sm font-medium text-primary">
                                                                {order?.orderNumber || oid || '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{created}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{order?.status || '—'}</td>
                                                            <td className="px-4 py-3 text-right text-sm text-gray-900">{total}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{email}</td>
                                                            <td className="px-4 py-3 text-right text-sm">
                                                                <button
                                                                    type="button"
                                                                    className="font-medium text-primary hover:underline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (oid) navigate(`/admin/orderdetails/${oid}`);
                                                                    }}
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default EditUser;
