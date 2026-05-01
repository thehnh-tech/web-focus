import type { Product } from "@/lib/types";

export const DELIVERY_FEE = 7;

export const governorates = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili"
] as const;

export const sizes = ["S", "M", "L", "XL", "XXL"] as const;
export const orderSizes = ["S", "M", "L"] as const;

export const fallbackProducts: Product[] = [
  {
    id: "focus-compression-short-sleeve-black",
    slug: "focus-compression-short-sleeve-black",
    name: "Focus Compression Short Sleeve - Black",
    price: 64.9,
    oldPrice: 89.9,
    category: "Compression Tops",
    image: "/images/black-front.png",
    secondaryImage: "/images/black-back.png",
    alt: "Black FOCUS compression short sleeve top",
    color: "Black",
    description:
      "A high-performance compression top with a second-skin fit, breathable feel and clean FOCUS identity.",
    featured: true
  },
  {
    id: "focus-compression-short-sleeve-white",
    slug: "focus-compression-short-sleeve-white",
    name: "Focus Compression Short Sleeve - White",
    price: 64.9,
    oldPrice: 89.9,
    category: "Compression Tops",
    image: "/images/white-front.png",
    secondaryImage: "/images/white-back.png",
    alt: "White FOCUS compression short sleeve top",
    color: "White",
    description:
      "A clean white compression top made for training, movement and everyday focus.",
    featured: true
  },
  {
    id: "focus-compression-tops-pack-2-pack",
    slug: "focus-compression-tops-pack-2-pack",
    name: "Focus Compression Tops Pack - 2 Pack",
    price: 124.9,
    oldPrice: 169.9,
    category: "Sets",
    image: "/images/pack-front.png",
    secondaryImage: "/images/pack-back.png",
    alt: "Black and white FOCUS compression tops pack",
    color: "Black & White",
    description:
      "A black and white compression tops pack built for daily training rotation.",
    featured: true
  }
];

export function formatPrice(value: number) {
  return `${value.toFixed(1)} DT`;
}

export function getProductBySlug(slug: string) {
  return fallbackProducts.find((product) => product.slug === slug);
}
