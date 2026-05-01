import axios from "axios";

function normalizeGroup(raw) {
  return {
    id: raw?._id || raw?.id || "",
    name: raw?.name || "",
    description: raw?.description || "",
    isActive: raw?.isActive !== false,
    customerIds: Array.isArray(raw?.customerIds) ? raw.customerIds : [],
  };
}

async function putPricingGroup(baseUrl, groupId, payload) {
  try {
    return await axios.put(`${baseUrl}api/pricing-groups/${groupId}`, payload, {
      headers: { "x-user-role": "admin" },
    });
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
    return axios.put(`${baseUrl}pricing-groups/${groupId}`, payload, {
      headers: { "x-user-role": "admin" },
    });
  }
}

async function deletePricingGroupRequest(baseUrl, groupId) {
  try {
    return await axios.delete(`${baseUrl}api/pricing-groups/${groupId}`, {
      headers: { "x-user-role": "admin" },
    });
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
    return axios.delete(`${baseUrl}pricing-groups/${groupId}`, {
      headers: { "x-user-role": "admin" },
    });
  }
}

export async function fetchPricingGroups(baseUrl) {
  const response = await axios.get(`${baseUrl}pricing-groups`, {
    headers: { "x-user-role": "admin" },
  });
  const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
  return rows.map(normalizeGroup);
}

export async function createPricingGroup(baseUrl, payload) {
  const response = await axios.post(`${baseUrl}pricing-groups`, payload, {
    headers: { "x-user-role": "admin" },
  });
  return normalizeGroup(response?.data?.data || {});
}

export async function updatePricingGroup(baseUrl, groupId, payload) {
  const response = await putPricingGroup(baseUrl, groupId, payload);
  return normalizeGroup(response?.data?.data || {});
}

export async function deletePricingGroup(baseUrl, groupId) {
  await deletePricingGroupRequest(baseUrl, groupId);
}
