import type { Product } from "@/lib/types";

export const DELIVERY_FEE = 0;

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

export const sizes = ["S", "M", "L"] as const;
export const orderSizes = ["S", "M", "L"] as const;

export const fallbackProducts: Product[] = [
  {
    id: "focus-compression-short-sleeve-black",
    slug: "focus-compression-short-sleeve-black",
    name: "T-shirt de compression FocusGym - Noir",
    price: 64.9,
    oldPrice: 89.9,
    category: "Compression Tops",
    image: "/images/black-front.png",
    secondaryImage: "/images/black-back.png",
    alt: "T-shirt de compression FocusGym noir",
    color: "Black",
    description:
      "Un t-shirt de compression performant avec une coupe seconde peau, une sensation respirante et une identité FocusGym épurée.",
    featured: true
  },
  {
    id: "focus-compression-short-sleeve-white",
    slug: "focus-compression-short-sleeve-white",
    name: "T-shirt de compression FocusGym - Blanc",
    price: 64.9,
    oldPrice: 89.9,
    category: "Compression Tops",
    image: "/images/white-front.png",
    secondaryImage: "/images/white-back.png",
    alt: "T-shirt de compression FocusGym blanc",
    color: "White",
    description:
      "Un t-shirt de compression blanc, propre et léger, conçu pour l’entraînement, le mouvement et la concentration.",
    featured: true
  },
  {
    id: "focus-compression-tops-pack-2-pack",
    slug: "focus-compression-tops-pack-2-pack",
    name: "Pack compression FocusGym - Noir & Blanc",
    price: 124.9,
    oldPrice: 169.9,
    category: "Sets",
    image: "/images/pack-front.png",
    secondaryImage: "/images/pack-back.png",
    alt: "Pack de t-shirts de compression FocusGym noir et blanc",
    color: "Black & White",
    description:
      "Un pack noir et blanc pensé pour alterner facilement entre les séances d’entraînement.",
    featured: true
  }
];

export function formatPrice(value: number) {
  return `${value.toFixed(1)} DT`;
}

export function formatDeliveryFee(value = DELIVERY_FEE) {
  return value > 0 ? formatPrice(value) : "Gratuite";
}

export function formatColor(value?: string) {
  const labels: Record<string, string> = {
    Black: "Noir",
    White: "Blanc",
    "Black & White": "Noir & Blanc"
  };

  return value ? labels[value] ?? value : "";
}

export function getProductBySlug(slug: string) {
  return fallbackProducts.find((product) => product.slug === slug);
}
