export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  secondaryImage?: string;
  alt: string;
  color?: string;
  description: string;
  featured?: boolean;
  soldOutSizes?: string[];
  createdAt?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  productCount?: number;
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

export type AppliedPromo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
};
