import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

// Custom hook: fetch daftar produk (butuh token)
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch("/products")
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : data.data || data.products || [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}
