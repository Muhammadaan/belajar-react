import axios from "axios";

export const API_BASE_URL = "http://postoko.haloaan.my.id/api/v1";

// Instance Axios utama
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor: otomatis pasang Bearer token, kecuali { auth: false }
api.interceptors.request.use((config) => {
  if (config.auth !== false) {
    const token = localStorage.getItem("pos_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // hapus flag custom agar tidak dikirim
  if ("auth" in config) delete config.auth;
  return config;
});

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  try {
    const res = await api.request({
      url: path,
      method,
      data: body,
      auth,
    });
    return res.data ?? {};
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data ?? {};
    const message =
      data.message ||
      (data.errors
        ? Object.values(data.errors).flat().join(" ")
        : err.message || `Request gagal (${status ?? "network"})`);
    const e = new Error(message);
    e.status = status;
    e.data = data;
    throw e;
  }
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
