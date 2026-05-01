"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fallbackProducts, formatPrice } from "@/lib/products";
import type { Product, ProductCategory } from "@/lib/types";

type OfferForm = {
  id?: string;
  slug: string;
  name: string;
  price: string;
  oldPrice: string;
  category: ProductCategory;
  image: string;
  secondaryImage: string;
  alt: string;
  color: string;
  description: string;
  featured: boolean;
};

type Order = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  size: string;
  items: Array<{ name: string; quantity: number; size: string; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "new" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
};

const emptyForm: OfferForm = {
  slug: "",
  name: "",
  price: "",
  oldPrice: "",
  category: "Compression Tops",
  image: "/images/black-front.png",
  secondaryImage: "",
  alt: "",
  color: "",
  description: "",
  featured: true
};

const statuses: Order["status"][] = ["new", "confirmed", "delivered", "cancelled"];

function productToForm(product: Product): OfferForm {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: String(product.price),
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    category: product.category,
    image: product.image,
    secondaryImage: product.secondaryImage ?? "",
    alt: product.alt,
    color: product.color ?? "",
    description: product.description,
    featured: product.featured !== false
  };
}

export function AdminDashboard() {
  const router = useRouter();
  const [offers, setOffers] = useState<Product[]>(fallbackProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(form.id);

  async function loadData() {
    const [offersResponse, ordersResponse] = await Promise.all([
      fetch("/api/offers", { cache: "no-store" }),
      fetch("/api/orders", { cache: "no-store" })
    ]);

    if (offersResponse.ok) {
      const data = await offersResponse.json();
      if (Array.isArray(data.offers)) {
        setOffers(data.offers);
      }
    }

    if (ordersResponse.ok) {
      const data = await ordersResponse.json();
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    }
  }

  useEffect(() => {
    loadData().catch(() => setError("Unable to load admin data."));
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);
    return {
      orders: orders.length,
      newOrders: orders.filter((order) => order.status === "new").length,
      revenue
    };
  }, [orders]);

  function updateForm(field: keyof OfferForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const endpoint = isEditing ? `/api/offers/${form.id}` : "/api/offers";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined
      })
    });

    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setError(data?.error || "Unable to save offer.");
      return;
    }

    setMessage(isEditing ? "Offer updated." : "Offer created.");
    setForm(emptyForm);
    await loadData();
  }

  async function deleteOffer(product: Product) {
    const response = await fetch(`/api/offers/${product.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Unable to delete offer.");
      return;
    }

    setMessage("Offer deleted.");
    await loadData();
  }

  async function updateOrderStatus(order: Order, status: Order["status"]) {
    const response = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? { ...item, status } : item))
      );
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <section className="admin-page container">
      <div className="admin-topbar">
        <div>
          <span className="section-eyebrow">Dashboard</span>
          <h1>FOCUS Admin</h1>
        </div>
        <button className="btn-secondary" onClick={logout} type="button">
          Logout
        </button>
      </div>

      <div className="admin-stats">
        <article>
          <span>Orders</span>
          <strong>{stats.orders}</strong>
        </article>
        <article>
          <span>New Orders</span>
          <strong>{stats.newOrders}</strong>
        </article>
        <article>
          <span>Revenue</span>
          <strong>{formatPrice(stats.revenue)}</strong>
        </article>
      </div>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-layout">
        <form className="admin-panel" onSubmit={handleSubmit}>
          <h2>{isEditing ? "Edit Offer" : "Add Offer"}</h2>
          <div className="admin-form-grid">
            <input
              className="admin-input"
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Product name"
              required
              value={form.name}
            />
            <input
              className="admin-input"
              onChange={(event) => updateForm("slug", event.target.value)}
              placeholder="product-slug"
              required
              value={form.slug}
            />
            <input
              className="admin-input"
              min="0"
              onChange={(event) => updateForm("price", event.target.value)}
              placeholder="Price"
              required
              step="0.1"
              type="number"
              value={form.price}
            />
            <input
              className="admin-input"
              min="0"
              onChange={(event) => updateForm("oldPrice", event.target.value)}
              placeholder="Old price"
              step="0.1"
              type="number"
              value={form.oldPrice}
            />
            <select
              className="admin-input"
              onChange={(event) => updateForm("category", event.target.value as ProductCategory)}
              value={form.category}
            >
              <option>Compression Tops</option>
              <option>Sets</option>
              <option>Accessories</option>
            </select>
            <input
              className="admin-input"
              onChange={(event) => updateForm("color", event.target.value)}
              placeholder="Color"
              value={form.color}
            />
            <input
              className="admin-input"
              onChange={(event) => updateForm("image", event.target.value)}
              placeholder="/images/black-front.png"
              required
              value={form.image}
            />
            <input
              className="admin-input"
              onChange={(event) => updateForm("secondaryImage", event.target.value)}
              placeholder="/images/black-back.png"
              value={form.secondaryImage}
            />
            <input
              className="admin-input"
              onChange={(event) => updateForm("alt", event.target.value)}
              placeholder="Alt text"
              required
              value={form.alt}
            />
            <label className="admin-checkbox">
              <input
                checked={form.featured}
                onChange={(event) => updateForm("featured", event.target.checked)}
                type="checkbox"
              />
              Featured
            </label>
            <textarea
              className="admin-input textarea admin-full"
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Description"
              required
              value={form.description}
            />
          </div>
          <div className="admin-actions">
            <button className="buy-button" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : isEditing ? "Update Offer" : "Add Offer"}
            </button>
            {isEditing ? (
              <button className="btn-secondary" onClick={() => setForm(emptyForm)} type="button">
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-panel">
          <h2>Offers</h2>
          <div className="admin-offers-list">
            {offers.map((product) => (
              <article className="admin-offer-row" key={product.id}>
                <Image alt={product.alt} height={64} src={product.image} width={64} />
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {product.category} / {formatPrice(product.price)}
                  </span>
                </div>
                <button onClick={() => setForm(productToForm(product))} type="button">
                  Edit
                </button>
                <button onClick={() => deleteOffer(product)} type="button">
                  Delete
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Orders</h2>
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Delivery</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.fullName}</strong>
                      <span>{order.phone}</span>
                      <span>{order.email}</span>
                    </td>
                    <td>
                      <span>{order.city}</span>
                      <span>{order.address}</span>
                      <span>Size: {order.size}</span>
                    </td>
                    <td>
                      {order.items.map((item) => (
                        <span key={`${order.id}-${item.name}-${item.size}`}>
                          {item.name} x {item.quantity}
                        </span>
                      ))}
                    </td>
                    <td>{formatPrice(Number(order.total))}</td>
                    <td>
                      <select
                        onChange={(event) =>
                          updateOrderStatus(order, event.target.value as Order["status"])
                        }
                        value={order.status}
                      >
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
