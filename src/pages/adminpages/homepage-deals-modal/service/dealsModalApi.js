import axios from "axios";

const getUploadHeaders = () => ({
  "x-user-role": "admin",
});

/**
 * @param {string} backendUrl - auth.ip from context (trailing slash ok)
 */
export async function getDealsModalAdmin(backendUrl) {
  const base = backendUrl?.endsWith("/") ? backendUrl : `${backendUrl}/`;
  const response = await axios.get(`${base}deals-modal`, {
    headers: { "x-user-role": "admin", "Content-Type": "application/json" },
  });
  return response.data;
}

/**
 * @param {string} backendUrl
 * @param {object} payload - fields matching API (no File inside)
 * @param {File | null} bannerFile
 */
export async function saveDealsModal(backendUrl, payload, bannerFile = null) {
  const base = backendUrl?.endsWith("/") ? backendUrl : `${backendUrl}/`;
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  if (bannerFile) {
    formData.append("bannerImage", bannerFile);
  }
  const response = await axios.post(`${base}deals-modal`, formData, {
    headers: getUploadHeaders(),
  });
  return response.data;
}
