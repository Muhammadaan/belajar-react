export const API_BASE_URL = "http://postoko.haloaan.my.id/api/v1";

function getToken() {
  return localStorage.getItem("pos_token");
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};
  if (!res.ok) {
    const message =
      data.message ||
      (data.errors
        ? Object.values(data.errors).flat().join(" ")
        : `Request gagal (${res.status})`);
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Ambil token dari berbagai kemungkinan bentuk response Laravel/Sanctum
export function extractToken(data) {
  if (!data || typeof data !== "object") return null;
  return (
    data.token ||
    data.access_token ||
    data.plainTextToken ||
    data?.data?.token ||
    data?.data?.access_token ||
    data?.data?.plainTextToken ||
    null
  );
}

export function extractUser(data) {
  if (!data || typeof data !== "object") return null;
  return data.user || data?.data?.user || data?.data || data;
}
