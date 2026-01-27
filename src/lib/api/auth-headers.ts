/**
 * Get authorization headers with token from localStorage
 * Used by API calls to include Bearer token in requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}
