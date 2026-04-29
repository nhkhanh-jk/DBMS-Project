const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("tnc_token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  
  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // If Content-Type is explicitly set to undefined or null, remove it
  // This is useful for FormData where the browser needs to set the boundary
  if (headers["Content-Type"] === undefined || headers["Content-Type"] === null) {
    delete headers["Content-Type"];
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

export function persistAuth(payload, fallbackUser = null) {
  const token = payload?.token || payload?.accessToken;
  const user = payload?.profile || payload?.user || payload?.data?.user || fallbackUser;

  if (token) {
    localStorage.setItem("tnc_token", token);
  }
  if (user) {
    localStorage.setItem("tnc_user", JSON.stringify(user));
  }
}

export function clearAuth() {
  localStorage.removeItem("tnc_token");
  localStorage.removeItem("tnc_user");
  localStorage.removeItem("tnc_superadmin");
  localStorage.removeItem("tnc_manager");
}
