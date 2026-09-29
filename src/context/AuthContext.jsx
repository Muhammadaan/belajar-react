import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, extractToken, extractUser } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pos_token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pos_user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem("pos_token"));

  // Cek token tersimpan -> fetch /me
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/me")
      .then((data) => {
        const u = extractUser(data);
        setUser(u);
        localStorage.setItem("pos_user", JSON.stringify(u));
      })
      .catch(() => {
        // token tidak valid -> hapus
        localStorage.removeItem("pos_token");
        localStorage.removeItem("pos_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const data = await apiFetch("/login", {
      method: "POST",
      auth: false,
      body: { email, password, device_name: "web" },
    });
    const newToken = extractToken(data);
    if (!newToken) throw new Error("Login berhasil tapi token tidak ditemukan.");
    let newUser = extractUser(data);

    localStorage.setItem("pos_token", newToken);
    setToken(newToken);

    // Jika response login tidak bawa user, fetch /me
    if (!newUser || !newUser.email) {
      try {
        const me = await apiFetch("/me", { auth: true });
        // apiFetch pakai getToken() dari localStorage -> sudah tersimpan
        newUser = extractUser(me);
      } catch {
        // abaikan, user tetap bisa masuk dashboard
      }
    }
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("pos_user", JSON.stringify(newUser));
    }
    return { token: newToken, user: newUser };
  }

  async function logout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // tetap logout lokal walau API gagal
    } finally {
      localStorage.removeItem("pos_token");
      localStorage.removeItem("pos_user");
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, isAuth: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
