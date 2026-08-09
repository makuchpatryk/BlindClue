const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function getCsrfToken(): string {
  const name = "csrf_token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return "";
}

export class HttpClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || json.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
    }
    return response.json();
  }

  async post<T>(endpoint: string, body?: unknown, csrfToken?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = csrfToken || getCsrfToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || json.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
    }
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    return response.json();
  }
}

export const httpClient = new HttpClient();
