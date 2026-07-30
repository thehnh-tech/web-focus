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
