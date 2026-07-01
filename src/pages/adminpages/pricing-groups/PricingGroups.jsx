import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/Auth";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { TableSkeleton } from "../shared/Skeletons";
import {
  createPricingGroup,
  deletePricingGroup,
  fetchPricingGroups,
  updatePricingGroup,
} from "./api/groupsApi";
import { fetchPricingGroupUsers } from "./api/customerApi";

export default function PricingGroups() {
  const auth = useAuth();
  const [selectedPage] = useState("pricing-groups");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const loadGroups = async () => {
    if (!auth?.ip) return;
    setLoading(true);
    try {
      const [rows, users] = await Promise.all([
        fetchPricingGroups(auth.ip),
        fetchPricingGroupUsers(auth.ip),
      ]);

      const usersCountByGroupId = users.reduce((acc, user) => {
        const gid = String(user?.pricingGroup || "").trim();
        if (!gid) return acc;
        acc[gid] = (acc[gid] || 0) + 1;
        return acc;
      }, {});

      const groupsWithUsersCount = rows.map((group) => ({
        ...group,
        usersCount: usersCountByGroupId[String(group.id)] || 0,
      }));

      setGroups(groupsWithUsersCount);
    } catch (error) {
      console.error("Failed to load pricing groups:", error);
      toast.error("Failed to load pricing groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [auth?.ip]);

  const onDelete = async (groupId) => {
    if (!auth?.ip) return;
    const group = groups.find((g) => g.id === groupId);
    const confirmed = window.confirm(
      `Are you sure you want to delete the pricing group "${group?.name || "this group"}"?`
    );
    if (!confirmed) return;
    try {
      await deletePricingGroup(auth.ip, groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast.success("Group deleted");
    } catch (error) {
      console.error("Failed to delete pricing group:", error);
      toast.error("Failed to delete group");
    }
  };

  const onSaveGroup = async () => {
    if (!auth?.ip) return;
    const name = groupName.trim();
    if (!name) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await updatePricingGroup(auth.ip, editId, { name });
        setGroups((prev) => prev.map((g) => (g.id === editId ? updated : g)));
        toast.success("Group updated");
      } else {
        const created = await createPricingGroup(auth.ip, { name });
        setGroups((prev) => [created, ...prev]);
        toast.success("Group created");
      }
      setIsModalOpen(false);
      setGroupName("");
      setEditId(null);
    } catch (error) {
      console.error("Failed to save pricing group:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save pricing group"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Pricing Groups | Admin</title>
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Pricing Groups
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage customer pricing groups.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setEditId(null);
                  setGroupName("");
                }}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                + Add Group
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border bg-white">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={8} columns={3} showHeader={false} />
                </div>
              ) : groups.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  No groups created yet.
                </p>
              ) : (
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">
                        Users
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {group.name}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {Number.isFinite(group.usersCount) ? group.usersCount : 0}
                        </td>
                        <td className="space-x-3 px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/pricing-groups/${group.id}`)
                            }
                            className="text-sm font-medium text-primary hover:text-secondary hover:underline"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditId(group.id);
                              setGroupName(group.name);
                              setIsModalOpen(true);
                            }}
                            className="text-sm font-medium text-primary hover:text-secondary hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(group.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold">
                {editId ? "Edit Group" : "Create Group"}
              </h2>
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveGroup}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
