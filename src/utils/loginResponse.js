/**
 * Login success check compatible with legacy JSON `status: 201` and new HTTP 200 + `success: true`.
 */
export function isAxiosLoginSuccess(response) {
  const data = response?.data;
  if (!data) return false;
  return (response.status === 200 && data.success === true) || data.status === 201;
}

export function getAxiosLoginErrorMessage(error, fallback = 'Login failed. Please try again.') {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (message) return message;
  if (status === 429) return 'Too many login attempts. Please try again later.';
  return fallback;
}

/**
 * Fetch-based login success check (website).
 */
export function isFetchLoginSuccess(response, data) {
  if (!data) return false;
  return (response.ok && data.success === true) || data.status === 201;
}

export function getFetchLoginErrorMessage(response, data, fallback = 'Login failed. Please try again.') {
  if (data?.message) return data.message;
  if (response.status === 429) return 'Too many login attempts. Please try again later.';
  if (response.status === 401) return 'Invalid email or password';
  return fallback;
}
