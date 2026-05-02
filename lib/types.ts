export type ProductCategory = "Compression Tops" | "Sets";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: ProductCategory;
  image: string;
  secondaryImage?: string;
  alt: string;
  color?: string;
  description: string;
  featured?: boolean;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  size: "S" | "M" | "L";
  quantity: number;
};

export type OrderStatus = "new" | "confirmed" | "delivered" | "cancelled";
