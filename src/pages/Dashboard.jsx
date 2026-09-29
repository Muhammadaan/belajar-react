import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../hooks/useProducts";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { products, loading, error } = useProducts();

  // Form input + filter realtime (task: filter data & pencarian realtime)
  const [search, setSearch] = useState("");

  // useMemo: hindari filter ulang kalau products/search tidak berubah
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.nama, p.code, p.kode, p.category, p.kategori]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, search]);

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Nama",
      render: (r) => r.name || r.nama || "-",
    },
    {
      key: "price",
      label: "Harga",
      render: (r) => r.price ?? r.harga ?? "-",
    },
    {
      key: "stock",
      label: "Stok",
      render: (r) => r.stock ?? r.stok ?? "-",
    },
  ];

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">
            Halo, {user?.name || user?.nama || user?.email || "Admin"} 👋
          </p>
        </div>
        <div className="topbar-actions">
          <Link to="/profile">
            <Button variant="secondary">Profile</Button>
          </Link>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="grid">
        <Card title="Total Produk" value={loading ? "..." : products.length} />
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Data Produk</h3>
          <input
            className="search"
            placeholder="Cari produk realtime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="center">Loading data produk...</p>}
        {error && <div className="alert-error">{error}</div>}
        {!loading && !error && (
          <Table columns={columns} data={filtered} emptyText="Produk tidak ditemukan." />
        )}
      </div>
    </div>
  );
}
