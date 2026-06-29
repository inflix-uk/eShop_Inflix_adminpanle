import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const adminHeaders = (actor = {}) => ({
  'x-user-role': 'admin',
  ...(actor.id ? { 'x-admin-user-id': String(actor.id) } : {}),
  ...(actor.name ? { 'x-admin-user-name': String(actor.name) } : {}),
});

export const listCustomers = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const response = await axios.get(`${BACKEND_URL}admin/crm/customers`, {
    headers: adminHeaders(),
    params: { page, limit, search },
  });
  return response.data;
};

export const getCustomer360 = async (userId) => {
  const response = await axios.get(`${BACKEND_URL}admin/crm/customers/${userId}/360`, {
    headers: adminHeaders(),
  });
  return response.data;
};

export const createCustomerNote = async (userId, body, actor) => {
  const response = await axios.post(
    `${BACKEND_URL}admin/crm/customers/${userId}/notes`,
    { body, authorId: actor?.id, authorName: actor?.name },
    { headers: adminHeaders(actor) }
  );
  return response.data;
};

export const updateCustomerNote = async (userId, noteId, body, actor) => {
  const response = await axios.patch(
    `${BACKEND_URL}admin/crm/customers/${userId}/notes/${noteId}`,
    { body, authorId: actor?.id, authorName: actor?.name },
    { headers: adminHeaders(actor) }
  );
  return response.data;
};

export const deleteCustomerNote = async (userId, noteId, actor) => {
  const response = await axios.delete(
    `${BACKEND_URL}admin/crm/customers/${userId}/notes/${noteId}`,
    { headers: adminHeaders(actor) }
  );
  return response.data;
};
