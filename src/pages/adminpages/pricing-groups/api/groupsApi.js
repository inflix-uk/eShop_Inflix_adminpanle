import axios from "axios";

function normalizeGroup(raw) {
  const excluded = Array.isArray(raw?.excludedProductIds) ? raw.excludedProductIds : [];
  return {
    id: raw?._id || raw?.id || "",
    name: raw?.name || "",
    description: raw?.description || "",
    isActive: raw?.isActive !== false,
    customerIds: Array.isArray(raw?.customerIds) ? raw.customerIds : [],
    excludedProductIds: excluded.map((id) => String(id?._id ?? id ?? "")).filter(Boolean),
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

export async function fetchPricingGroupById(baseUrl, groupId) {
  const headers = { "x-user-role": "admin" };
  try {
    const response = await axios.get(`${baseUrl}api/pricing-groups/${groupId}`, {
      headers,
    });
    return normalizeGroup(response?.data?.data || {});
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
    const response = await axios.get(`${baseUrl}pricing-groups/${groupId}`, {
      headers,
    });
    return normalizeGroup(response?.data?.data || {});
  }
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

export async function setGroupProductInclusion(baseUrl, groupId, productId, included) {
  const headers = { "x-user-role": "admin" };
  const body = { productId: String(productId), included: Boolean(included) };
  try {
    const res = await axios.post(
      `${baseUrl}api/pricing-groups/${groupId}/product-inclusion`,
      body,
      { headers }
    );
    return normalizeGroup(res?.data?.data || {});
  } catch (err) {
    if (err?.response?.status !== 404) throw err;
    const res = await axios.post(
      `${baseUrl}pricing-groups/${groupId}/product-inclusion`,
      body,
      { headers }
    );
    return normalizeGroup(res?.data?.data || {});
  }
}
