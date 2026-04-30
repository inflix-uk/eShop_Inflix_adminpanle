import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/Auth";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  assignUserPricingGroup,
  fetchPricingGroupUsers,
  removeUserFromPricingGroup,
} from "./api/customerApi";

export default function PricingGroupCustomers() {
  const { groupId } = useParams();
  const auth = useAuth();
  const [selectedPage] = useState("pricing-groups");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (!auth?.ip) return;
    let cancelled = false;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        if (!cancelled) {
          const rows = await fetchPricingGroupUsers(auth.ip);
          setUsers(rows);
          setGroupUsers(
            rows.filter((u) => String(u.pricingGroup || "") === String(groupId))
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (!cancelled) {
          toast.error("Failed to fetch users");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [auth?.ip]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return users.filter((user) => {
      const alreadyAdded = groupUsers.some((item) => item.id === user.id);
      if (alreadyAdded) return false;
      return (
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      );
    });
  }, [users, search, groupUsers]);

  const addUser = async (user) => {
    if (!auth?.ip || !groupId) return;
    try {
      await assignUserPricingGroup(auth.ip, user.id, groupId);
      const next = users.map((u) =>
        u.id === user.id ? { ...u, pricingGroup: groupId } : u
      );
      setUsers(next);
      setGroupUsers(next.filter((u) => String(u.pricingGroup || "") === String(groupId)));
    } catch (error) {
      console.error("Failed to assign user group:", error);
      toast.error("Failed to assign user to group");
    }
  };

  const removeUser = async (userId) => {
    if (!auth?.ip) return;
    try {
      await removeUserFromPricingGroup(auth.ip, userId);
      const next = users.map((u) =>
        u.id === userId ? { ...u, pricingGroup: null } : u
      );
      setUsers(next);
      setGroupUsers(next.filter((u) => String(u.pricingGroup || "") === String(groupId)));
      toast.success("Customer removed from this group");
    } catch (error) {
      console.error("Failed to remove user group:", error);
      toast.error("Failed to remove user from group");
    }
  };

  return (
    <>
      <Helmet>
        <title>Pricing Group Customers | Admin</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
        />

        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Pricing Group Customers
                </h1>
                <p className="mt-1 text-sm text-gray-600">Group: {groupId}</p>
              </div>
              <Link
                to={`/admin/pricing-groups/${groupId}`}
                className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Back to Products
              </Link>
            </div>

            <div className="mt-6 rounded-lg border bg-white p-4">
              <label
                htmlFor="customer-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search Users
              </label>
              <input
                id="customer-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {search.trim().length >= 2 ? (
              <div className="mt-6 overflow-hidden rounded-lg border bg-white">
                <div className="border-b px-4 py-3">
                  <h2 className="text-sm font-semibold text-gray-900">Available Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Email
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {user.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => addUser(user)}
                                className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-500">
                Type at least 2 characters to search and show users.
              </p>
            )}

            <div className="mt-6 overflow-hidden rounded-lg border bg-white">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Customers In This Group
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Email
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {groupUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                          No customers added yet.
                        </td>
                      </tr>
                    ) : (
                      groupUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeUser(user.id)}
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Remove from Group
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
