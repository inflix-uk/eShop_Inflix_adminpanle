import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Side from '../nav/Side';
import Top from '../nav/Top';
import { TableSkeleton } from '../shared/Skeletons';
import { listCustomers } from './services/crmService';

const formatMoney = (value) => {
  if (value == null) return '—';
  return `£${Number(value).toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const CustomersList = () => {
  const [selectedPage] = useState('crm-customers');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await listCustomers({ page, limit: 20, search });
      if (response.status === 200) {
        setCustomers(response.customers || []);
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      } else {
        toast.error(response.message || 'Failed to load customers');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCustomers(1);
  }, [loadCustomers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadCustomers(newPage);
    }
  };

  return (
    <>
      <Helmet>
        <title>CRM Customers | Admin</title>
      </Helmet>
      <div className="flex min-h-screen bg-gray-50">
        <Side
          selectedPage={selectedPage}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((v) => !v)}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col lg:pl-72">
          <Top toggleSidebar={() => setIsSidebarOpen((v) => !v)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Storefront customers with order stats — open a profile for full Customer 360.
                </p>
              </div>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    <th className="px-4 py-3 font-bold">Phone</th>
                    <th className="px-4 py-3 font-bold">Orders</th>
                    <th className="px-4 py-3 font-bold">Total spend</th>
                    <th className="px-4 py-3 font-bold">Last order</th>
                    <th className="px-4 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <TableSkeleton rows={8} columns={7} showHeader={false} />
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{customer.name || '—'}</td>
                        <td className="px-4 py-3">{customer.email || '—'}</td>
                        <td className="px-4 py-3">{customer.phone || '—'}</td>
                        <td className="px-4 py-3">{customer.totalOrders ?? 0}</td>
                        <td className="px-4 py-3 font-medium">{formatMoney(customer.totalSpend)}</td>
                        <td className="px-4 py-3">{formatDate(customer.lastOrderAt)}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/crm/customers/${customer._id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            View 360
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <p>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} customers)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded border border-gray-300 px-3 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default CustomersList;
