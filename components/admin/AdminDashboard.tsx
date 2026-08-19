"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { formatDeliveryFee, formatPrice } from "@/lib/products";
import { ALL_SIZES } from "@/lib/sizes";
import type { Category, Product } from "@/lib/types";

type OfferForm = {
  id?: string;
  slug: string;
  name: string;
  price: string;
  oldPrice: string;
  category: string;
  image: string;
  secondaryImage: string;
  alt: string;
  color: string;
  description: string;
  featured: boolean;
  soldOutSizes: string[];
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
  category: "",
  image: "",
  secondaryImage: "",
  alt: "",
  color: "",
  description: "",
  featured: true,
  soldOutSizes: []
};

const statuses: Order["status"][] = ["new", "confirmed", "delivered", "cancelled"];

const statusLabels: Record<Order["status"], string> = {
  new: "Nouvelle",
  confirmed: "Confirmée",
  delivered: "Livrée",
  cancelled: "Annulée"
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
    featured: product.featured !== false,
    soldOutSizes: product.soldOutSizes ?? []
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

function ImageUploadField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  onUploadingChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const aliveRef = useRef(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);
    setUploadError("");

    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: data });
      const result = await response.json().catch(() => null);

      if (!aliveRef.current) {
        return;
      }

      if (!response.ok || !result?.url) {
        setUploadError(result?.error || "Upload impossible.");
        return;
      }

      onChange(result.url);
    } catch {
      if (aliveRef.current) {
        setUploadError("Upload impossible. Vérifiez votre connexion.");
      }
    } finally {
      onUploadingChange?.(false);

      if (aliveRef.current) {
        setIsUploading(false);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="admin-upload-field admin-full">
      <label className="admin-upload-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="admin-upload-row">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="admin-upload-preview" src={value} />
        ) : (
          <span className="admin-upload-placeholder" aria-hidden="true">
            IMG
          </span>
        )}
        <div className="admin-upload-main">
          <div className="admin-upload-actions">
            <button
              className="btn-secondary"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              {isUploading
                ? "Upload en cours..."
                : value
                  ? "Remplacer l’image"
                  : "Uploader une image"}
            </button>
            {value ? (
              <button
                className="admin-upload-clear"
                disabled={disabled || isUploading}
                onClick={() => onChange("")}
                type="button"
              >
                Retirer
              </button>
            ) : null}
          </div>
          <input
            className="admin-input"
            disabled={disabled || isUploading}
            id={inputId}
            onChange={(event) => onChange(event.target.value)}
            placeholder="ou collez une URL d’image"
            required={required}
            value={value}
          />
        </div>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        hidden
        onChange={handleFile}
        ref={inputRef}
        type="file"
      />
      {uploadError ? <p className="form-error">{uploadError}</p> : null}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [offers, setOffers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [savedDeliveryFee, setSavedDeliveryFee] = useState(0);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const isEditing = Boolean(form.id);

  async function loadSettings() {
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const fee = Number(data?.settings?.deliveryFee);

        if (Number.isFinite(fee)) {
          setSavedDeliveryFee(fee);
          setDeliveryFeeInput((current) => (current === "" ? String(fee) : current));
        }
      }
    } catch {
      setError("Impossible d’actualiser les paramètres. Cliquez sur Actualiser.");
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch("/api/categories", { cache: "no-store" });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (Array.isArray(data?.categories)) {
          setCategories(data.categories);
        }
      }
    } catch {
      setError("Impossible d’actualiser les catégories. Cliquez sur Actualiser.");
    }
  }

  async function loadData() {
    setIsRefreshing(true);

    try {
      const [offersResponse, ordersResponse] = await Promise.all([
        fetch("/api/offers", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        loadCategories(),
        loadSettings()
      ]);

      if (offersResponse.ok) {
        const data = await offersResponse.json().catch(() => null);
        if (Array.isArray(data?.offers)) {
          setOffers(data.offers);
        }
      }

      if (ordersResponse.ok) {
        const data = await ordersResponse.json().catch(() => null);
        if (Array.isArray(data?.orders)) {
          setOrders(data.orders);
        }
      }
    } catch {
      setError("Impossible de charger les données admin.");
    } finally {
      setIsRefreshing(false);
      setIsLoadingOffers(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setForm((current) =>
        current.category ? current : { ...current, category: categories[0].name }
      );
    }
  }, [categories]);

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

  function toggleSoldOutSize(size: string) {
    setForm((current) => ({
      ...current,
      soldOutSizes: current.soldOutSizes.includes(size)
        ? current.soldOutSizes.filter((entry) => entry !== size)
        : [...current.soldOutSizes, size]
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const endpoint = isEditing ? `/api/offers/${encodeURIComponent(form.id ?? "")}` : "/api/offers";
    const method = isEditing ? "PUT" : "POST";

    try {
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

      if (!response.ok) {
        setError(data?.error || "Impossible d’enregistrer le produit.");
        return;
      }

      setMessage(isEditing ? "Produit mis à jour." : "Produit créé.");
      setForm({ ...emptyForm, category: categories[0]?.name ?? "" });
      await loadData();
    } catch {
      setError("Impossible d’enregistrer le produit. Vérifiez votre connexion.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOffer(product: Product) {
    const confirmed = window.confirm(`Supprimer définitivement « ${product.name} » ?`);

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setDeletingOfferId(product.id);

    try {
      const response = await fetch(`/api/offers/${encodeURIComponent(product.id)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Impossible de supprimer le produit.");
        return;
      }

      setMessage("Produit supprimé.");
      setForm((current) =>
        current.id === product.id
          ? { ...emptyForm, category: categories[0]?.name ?? "" }
          : current
      );
      await loadData();
    } catch {
      setError("Impossible de supprimer le produit.");
    } finally {
      setDeletingOfferId(null);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryFee: Number(deliveryFeeInput) })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Impossible d’enregistrer les paramètres.");
        return;
      }

      const fee = Number(data?.settings?.deliveryFee ?? 0);
      setSavedDeliveryFee(fee);
      setDeliveryFeeInput(String(fee));
      setMessage("Frais de livraison enregistrés.");
    } catch {
      setError("Impossible d’enregistrer les paramètres. Vérifiez votre connexion.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSavingCategory(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Impossible de créer la catégorie.");
        return;
      }

      setNewCategoryName("");
      setMessage("Catégorie créée.");
      await loadCategories();
    } catch {
      setError("Impossible de créer la catégorie.");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function renameCategory(category: Category) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(category.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategoryName })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Impossible de renommer la catégorie.");
        return;
      }

      setEditingCategoryId(null);
      setEditingCategoryName("");
      setMessage("Catégorie mise à jour.");
      await loadData();
    } catch {
      setError("Impossible de renommer la catégorie.");
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(`Supprimer la catégorie « ${category.name} » ?`);

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");
    setDeletingCategoryId(category.id);

    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(category.id)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Impossible de supprimer la catégorie.");
        return;
      }

      setMessage("Catégorie supprimée.");
      await loadCategories();
    } catch {
      setError("Impossible de supprimer la catégorie.");
    } finally {
      setDeletingCategoryId(null);
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

      <div className="admin-panel">
        <div className="admin-section-head">
          <div>
            <h2>Paramètres</h2>
            <p>Frais de livraison ajoutés au total de chaque commande (0 = gratuite).</p>
          </div>
        </div>

        <form className="admin-category-form" onSubmit={saveSettings}>
          <input
            aria-label="Frais de livraison en dinars"
            className="admin-input"
            min="0"
            onChange={(event) => setDeliveryFeeInput(event.target.value)}
            placeholder="Frais de livraison (DT)"
            required
            step="0.1"
            type="number"
            value={deliveryFeeInput}
          />
          <button className="btn-secondary" disabled={isSavingSettings} type="submit">
            {isSavingSettings ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
        <p className="admin-category-empty">
          Frais actuels : {formatDeliveryFee(savedDeliveryFee)}
        </p>
      </div>

      <div className="admin-panel">
        <div className="admin-section-head">
          <div>
            <h2>Catégories</h2>
            <p>Ajoutez, renommez ou supprimez les catégories de la boutique.</p>
          </div>
        </div>

        <form className="admin-category-form" onSubmit={createCategory}>
          <input
            className="admin-input"
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="Nouvelle catégorie (ex. Leggings)"
            required
            value={newCategoryName}
          />
          <button className="btn-secondary" disabled={isSavingCategory} type="submit">
            {isSavingCategory ? "Ajout..." : "Ajouter"}
          </button>
        </form>

        {categories.length > 0 ? (
          <div className="admin-category-list">
            {categories.map((category) => (
              <article className="admin-category-row" key={category.id}>
                {editingCategoryId === category.id ? (
                  <>
                    <input
                      aria-label={`Renommer la catégorie ${category.name}`}
                      className="admin-input"
                      onChange={(event) => setEditingCategoryName(event.target.value)}
                      value={editingCategoryName}
                    />
                    <button
                      onClick={() => renameCategory(category)}
                      type="button"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
                      }}
                      type="button"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>{category.name}</strong>
                      <span>
                        {category.productCount ?? 0} produit
                        {(category.productCount ?? 0) > 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingCategoryName(category.name);
                      }}
                      type="button"
                    >
                      Renommer
                    </button>
                    <button
                      disabled={deletingCategoryId === category.id}
                      onClick={() => deleteCategory(category)}
                      type="button"
                    >
                      {deletingCategoryId === category.id ? "Suppression..." : "Supprimer"}
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-category-empty">
            Aucune catégorie pour le moment. Créez-en une pour pouvoir ajouter des produits.
          </p>
        )}
      </div>

      <div className="admin-layout">
        <form className="admin-panel" onSubmit={handleSubmit}>
          <h2>{isEditing ? "Modifier le produit" : "Ajouter un produit"}</h2>
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
              placeholder="slug-produit (auto si vide)"
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
              disabled={categories.length === 0}
              onChange={(event) => updateForm("category", event.target.value)}
              required
              value={form.category}
            >
              {categories.length === 0 ? (
                <option value="">Créez d’abord une catégorie</option>
              ) : null}
              {form.category &&
              !categories.some((category) => category.name === form.category) ? (
                <option value={form.category}>{form.category} (supprimée)</option>
              ) : null}
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              className="admin-input"
              onChange={(event) => updateForm("color", event.target.value)}
              placeholder="Couleur"
              value={form.color}
            />
            <ImageUploadField
              disabled={isSaving}
              key={`image-${form.id ?? "new"}`}
              label="Image principale"
              onChange={(value) => updateForm("image", value)}
              onUploadingChange={(uploading) =>
                setPendingUploads((count) => count + (uploading ? 1 : -1))
              }
              required
              value={form.image}
            />
            <ImageUploadField
              disabled={isSaving}
              key={`secondary-${form.id ?? "new"}`}
              label="Image secondaire (optionnelle)"
              onChange={(value) => updateForm("secondaryImage", value)}
              onUploadingChange={(uploading) =>
                setPendingUploads((count) => count + (uploading ? 1 : -1))
              }
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
            <div className="admin-sizes-field admin-full">
              <span className="admin-upload-label">Tailles en rupture de stock</span>
              <div className="admin-size-toggles">
                {ALL_SIZES.map((size) => {
                  const isSoldOut = form.soldOutSizes.includes(size);
                  return (
                    <button
                      aria-pressed={isSoldOut}
                      className={isSoldOut ? "sold-out" : ""}
                      key={size}
                      onClick={() => toggleSoldOutSize(size)}
                      type="button"
                    >
                      {size}
                      <small>{isSoldOut ? "Rupture" : "Disponible"}</small>
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea
              className="admin-input textarea admin-full"
              onChange={(event) => updateForm("description", event.target.value)}
              placeholder="Description"
              required
              value={form.description}
            />
          </div>
          <div className="admin-actions">
            <button
              className="buy-button"
              disabled={isSaving || pendingUploads > 0 || categories.length === 0}
              type="submit"
            >
              {pendingUploads > 0
                ? "Upload en cours..."
                : isSaving
                  ? "Enregistrement..."
                  : isEditing
                    ? "Mettre à jour"
                    : "Ajouter le produit"}
            </button>
            {isEditing ? (
              <button
                className="btn-secondary"
                onClick={() => setForm({ ...emptyForm, category: categories[0]?.name ?? "" })}
                type="button"
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-panel">
          <div className="admin-section-head">
            <h2>Produits</h2>
          </div>
          {isLoadingOffers ? (
            <p className="admin-category-empty">Chargement des produits...</p>
          ) : offers.length > 0 ? (
            <div className="admin-offers-list">
              {offers.map((product) => (
                <article className="admin-offer-row" key={product.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={product.alt} height={64} src={product.image} width={64} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {product.category} / {formatPrice(product.price)}
                    </span>
                    {product.soldOutSizes && product.soldOutSizes.length > 0 ? (
                      <span className="admin-soldout-hint">
                        Rupture : {product.soldOutSizes.join(", ")}
                      </span>
                    ) : null}
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
          ) : (
            <p className="admin-category-empty">
              Aucun produit en base. Ajoutez votre premier produit avec le formulaire.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
