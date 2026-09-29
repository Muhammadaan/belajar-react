import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function Profile() {
  const { user: ctxUser, logout } = useAuth();
  const [user, setUser] = useState(ctxUser);
  const [loading, setLoading] = useState(!ctxUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ctxUser) return;
    setLoading(true);
    apiFetch("/me")
      .then((data) => setUser(data?.data || data?.user || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ctxUser]);

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h2>Profile</h2>
        </div>
        <div className="topbar-actions">
          <Link to="/">
            <Button variant="secondary">Dashboard</Button>
          </Link>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="card">
        {loading && <p>Loading profile...</p>}
        {error && <div className="alert-error">{error}</div>}
        {user && !loading && (
          <div className="profile">
            <p>
              <b>Nama:</b> {user.name || user.nama || "-"}
            </p>
            <p>
              <b>Email:</b> {user.email || "-"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
