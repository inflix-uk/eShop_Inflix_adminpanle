import axios from "axios";

function normalizeUser(raw) {
  const name = `${raw?.firstname || ""} ${raw?.lastname || ""}`.trim();
  return {
    id: raw?._id || raw?.id || String(Math.random()),
    name: name || raw?.name || "Unnamed User",
    email: raw?.email || "",
    pricingGroup: raw?.pricingGroup || null,
  };
}

export async function fetchPricingGroupUsers(baseUrl) {
  const response = await axios.get(`${baseUrl}get/users/basic-info`);
  const rows = Array.isArray(response?.data?.users) ? response.data.users : [];
  return rows.map(normalizeUser);
}

export async function assignUserPricingGroup(baseUrl, userId, pricingGroup) {
  const response = await axios.put(
    `${baseUrl}api/users/${userId}/assign-group`,
    { pricingGroup: pricingGroup || null },
    { headers: { "x-user-role": "admin" } }
  );
  return response.data;
}

export async function removeUserFromPricingGroup(baseUrl, userId) {
  // This only unassigns the pricing group; it does not delete the user.
  return assignUserPricingGroup(baseUrl, userId, null);
}
