export const ALL_SIZES = ["S", "M", "L"] as const;

export type SizeName = (typeof ALL_SIZES)[number];

const DEFAULT_SIZE: SizeName = "M";

type SizedProduct = {
  soldOutSizes?: string[];
};

export function isValidSize(value: string): value is SizeName {
  return (ALL_SIZES as readonly string[]).includes(value);
}

export function sanitizeSoldOutSizes(value: unknown): SizeName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return ALL_SIZES.filter((size) => value.includes(size));
}

export function isSizeSoldOut(product: SizedProduct, size: string) {
  return Boolean(product.soldOutSizes?.includes(size));
}

export function availableSizes(product: SizedProduct): SizeName[] {
  return ALL_SIZES.filter((size) => !isSizeSoldOut(product, size));
}

export function isProductSoldOut(product: SizedProduct) {
  return availableSizes(product).length === 0;
}

export function defaultAvailableSize(product: SizedProduct): SizeName | undefined {
  const sizes = availableSizes(product);
  return sizes.includes(DEFAULT_SIZE) ? DEFAULT_SIZE : sizes[0];
}
