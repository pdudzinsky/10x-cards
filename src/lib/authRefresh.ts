/**
 * Helper do automatycznego odświeżania tokenów przy błędzie 401
 *
 * Użycie:
 * const response = await fetchWithAutoRefresh('/api/v1/decks', { method: 'GET' });
 */

/**
 * Odświeżenie tokenu za pomocą refresh_token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("auth_refresh_token");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      window.location.href = "/login";
      return null;
    }

    const data = await response.json();

    // Save new tokens
    localStorage.setItem("auth_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("auth_refresh_token", data.refresh_token);
    }

    return data.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}

/**
 * Fetch z automatycznym odświeżaniem tokenu przy błędzie 401
 *
 * @param url - URL endpointu
 * @param options - fetch options (będzie automatycznie dodany Authorization header)
 * @param retryCount - liczba prób (domyślnie 1)
 */
export async function fetchWithAutoRefresh(
  url: string,
  options: RequestInit = {},
  retryCount: number = 1
): Promise<Response> {
  // Get current token
  const token = localStorage.getItem("auth_token");

  // Add Authorization header if token exists
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we haven't retried yet, try to refresh token
  if (response.status === 401 && retryCount > 0) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry request with new token
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

/**
 * Sprawdzenie czy użytkownik jest zalogowany (ma token)
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("auth_token");
}

/**
 * Wylogowanie użytkownika (usunięcie tokenów i przekierowanie)
 */
export function logout(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_refresh_token");
  window.location.href = "/login";
}
