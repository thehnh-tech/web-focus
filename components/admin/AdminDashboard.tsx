"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fallbackProducts, formatDeliveryFee, formatPrice } from "@/lib/products";
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
  email?: string;
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

const statusLabels: Record<Order["status"], string> = {
  new: "Nouvelle",
  confirmed: "Confirmée",
  delivered: "Livrée",
  cancelled: "Annulée"
};

const categoryLabels: Record<ProductCategory, string> = {
  "Compression Tops": "Compression",
  Sets: "Packs"
};

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

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function AdminDashboard() {
  const router = useRouter();
  const [offers, setOffers] = useState<Product[]>(fallbackProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRestoringOffers, setIsRestoringOffers] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const isEditing = Boolean(form.id);

  async function loadData() {
    setIsRefreshing(true);
    const [offersResponse, ordersResponse] = await Promise.all([
      fetch("/api/offers", { cache: "no-store" }),
      fetch("/api/orders", { cache: "no-store" })
    ]);

    if (offersResponse.ok) {
      const data = await offersResponse.json();

      if (data?.source === "fallback") {
        try {
          const restoreResponse = await fetch("/api/offers/restore-defaults", {
            method: "POST"
          });
          const restoredData = await restoreResponse.json().catch(() => null);

          if (restoreResponse.ok && Array.isArray(restoredData?.offers)) {
            setOffers(restoredData.offers);
          } else if (Array.isArray(data.offers)) {
            setOffers(data.offers);
          }
        } catch {
          if (Array.isArray(data.offers)) {
            setOffers(data.offers);
          }
        }
      } else if (Array.isArray(data.offers)) {
        setOffers(data.offers);
      }
    }

    if (ordersResponse.ok) {
      const data = await ordersResponse.json();
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    }

    setIsRefreshing(false);
  }

  useEffect(() => {
    loadData().catch(() => {
      setError("Impossible de charger les données admin.");
      setIsRefreshing(false);
    });
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

    const endpoint = isEditing ? `/api/offers/${encodeURIComponent(form.id ?? "")}` : "/api/offers";
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
      setError(data?.error || "Impossible d’enregistrer l’offre.");
      return;
    }

    setMessage(isEditing ? "Offre mise à jour." : "Offre créée.");
    setForm(emptyForm);
    await loadData();
  }

  async function deleteOffer(product: Product) {
    setMessage("");
    setError("");
    setDeletingOfferId(product.id);

    try {
      const response = await fetch(`/api/offers/${encodeURIComponent(product.id)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Impossible de supprimer l’offre.");
        return;
      }

      setMessage("Offre supprimée.");
      await loadData();
    } catch {
      setError("Impossible de supprimer l’offre.");
    } finally {
      setDeletingOfferId(null);
    }
  }

  async function restoreInitialOffers() {
    setMessage("");
    setError("");
    setIsRestoringOffers(true);

    try {
      const response = await fetch("/api/offers/restore-defaults", { method: "POST" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Impossible de restaurer les offres initiales.");
        return;
      }

      if (Array.isArray(data?.offers)) {
        setOffers(data.offers);
      }

      setMessage("Offres initiales restaurées.");
    } catch {
      setError("Impossible de restaurer les offres initiales.");
    } finally {
      setIsRestoringOffers(false);
    }
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

  async function deleteOrder(order: Order) {
    const confirmed = window.confirm(
      `Supprimer définitivement la commande #${order.id.slice(-6).toUpperCase()} ?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setDeletingOrderId(order.id);

    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Impossible de supprimer la commande.");
        return;
      }

      setOrders((current) => current.filter((item) => item.id !== order.id));
      setMessage("Commande supprimée.");
    } catch {
      setError("Impossible de supprimer la commande.");
    } finally {
      setDeletingOrderId(null);
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
          <span className="section-eyebrow">Tableau de bord</span>
          <h1>FocusGym Admin</h1>
        </div>
        <button className="btn-secondary" onClick={logout} type="button">
          Déconnexion
        </button>
      </div>

      <div className="admin-stats">
        <article>
          <span>Commandes</span>
          <strong>{stats.orders}</strong>
        </article>
        <article>
          <span>Nouvelles</span>
          <strong>{stats.newOrders}</strong>
        </article>
        <article>
          <span>Chiffre d’affaires</span>
          <strong>{formatPrice(stats.revenue)}</strong>
        </article>
      </div>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-panel admin-orders-panel">
        <div className="admin-section-head">
          <div>
            <h2>Bons de commande</h2>
            <p>Les commandes les plus récentes apparaissent en premier.</p>
          </div>
          <button className="btn-secondary" disabled={isRefreshing} onClick={loadData} type="button">
            {isRefreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="admin-orders-grid">
            {orders.map((order) => (
              <article className="admin-order-card" key={order.id}>
                <header>
                  <div>
                    <strong>Commande #{order.id.slice(-6).toUpperCase()}</strong>
                    <span>{formatOrderDate(order.createdAt)}</span>
                  </div>
                  <select
                    aria-label="Statut de commande"
                    onChange={(event) =>
                      updateOrderStatus(order, event.target.value as Order["status"])
                    }
                    value={order.status}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </header>

                <div className="admin-order-main">
                  <div>
                    <span>Client</span>
                    <strong>{order.fullName}</strong>
                    <a href={`tel:${order.phone}`}>{order.phone}</a>
                    {order.email ? (
                      <a href={`mailto:${order.email}`}>{order.email}</a>
                    ) : (
                      <p>Email non renseigné</p>
                    )}
                  </div>
                  <div>
                    <span>Livraison</span>
                    <strong>{order.city}</strong>
                    <p>{order.address}</p>
                    <p>Taille demandée : {order.size}</p>
                  </div>
                </div>

                <div className="admin-order-items">
                  <span>Articles</span>
                  {order.items.map((item) => (
                    <p key={`${order.id}-${item.name}-${item.size}`}>
                      {item.name} x {item.quantity} / {item.size}
                    </p>
                  ))}
                </div>

                <footer className="admin-order-footer">
                  <div>
                    <span>Livraison : {formatDeliveryFee(Number(order.deliveryFee || 0))}</span>
                    <strong>Total : {formatPrice(Number(order.total || 0))}</strong>
                  </div>
                  <button
                    className="admin-delete-order"
                    disabled={deletingOrderId === order.id}
                    onClick={() => deleteOrder(order)}
                    type="button"
                  >
                    {deletingOrderId === order.id ? "Suppression..." : "Supprimer"}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-orders">
            <strong>Aucune commande pour le moment.</strong>
            <span>Les nouveaux bons de commande apparaîtront ici.</span>
          </div>
        )}
      </div>

      <div className="admin-layout">
        <form className="admin-panel" onSubmit={handleSubmit}>
          <h2>{isEditing ? "Modifier l’offre" : "Ajouter une offre"}</h2>
          <div className="admin-form-grid">
            <input
              className="admin-input"
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="Nom du produit"
              required
              value={form.name}
            />
            <input
              className="admin-input"
              onChange={(event) => updateForm("slug", event.target.value)}
              placeholder="slug-produit"
              required
              value={form.slug}
            />
            <input
              className="admin-input"
              min="0"
              onChange={(event) => updateForm("price", event.target.value)}
              placeholder="Prix"
              required
              step="0.1"
              type="number"
              value={form.price}
            />
            <input
              className="admin-input"
              min="0"
              onChange={(event) => updateForm("oldPrice", event.target.value)}
              placeholder="Ancien prix"
              step="0.1"
              type="number"
              value={form.oldPrice}
            />
            <select
              className="admin-input"
              onChange={(event) => updateForm("category", event.target.value as ProductCategory)}
              value={form.category}
            >
              <option value="Compression Tops">Compression</option>
              <option value="Sets">Packs</option>
            </select>
            <input
              className="admin-input"
              onChange={(event) => updateForm("color", event.target.value)}
              placeholder="Couleur"
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
              placeholder="Texte alternatif"
              required
              value={form.alt}
            />
            <label className="admin-checkbox">
              <input
                checked={form.featured}
                onChange={(event) => updateForm("featured", event.target.checked)}
                type="checkbox"
              />
              Produit mis en avant
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
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Ajouter l’offre"}
            </button>
            {isEditing ? (
              <button className="btn-secondary" onClick={() => setForm(emptyForm)} type="button">
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-panel">
          <div className="admin-section-head">
            <h2>Offres</h2>
            <button
              className="btn-secondary"
              disabled={isRestoringOffers}
              onClick={restoreInitialOffers}
              type="button"
            >
              {isRestoringOffers ? "Restauration..." : "Restaurer offres initiales"}
            </button>
          </div>
          <div className="admin-offers-list">
            {offers.map((product) => (
              <article className="admin-offer-row" key={product.id}>
                <Image alt={product.alt} height={64} src={product.image} width={64} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{categoryLabels[product.category]} / {formatPrice(product.price)}</span>
                </div>
                <button onClick={() => setForm(productToForm(product))} type="button">
                  Modifier
                </button>
                <button
                  disabled={deletingOfferId === product.id}
                  onClick={() => deleteOffer(product)}
                  type="button"
                >
                  {deletingOfferId === product.id ? "Suppression..." : "Supprimer"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
