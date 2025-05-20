export interface Product {
  id: string;
  productTitle: string;
  productPrice: number;
  primaryImage: string;
  secondaryImage: string;
  description: string;
  sizes: ProductVariant[];
  colors: ProductVariant[];
  types: ProductVariant[];
  additionalImages?: string[];
}

export interface ProductVariant {
  id: string;
  value: string;
  available: boolean;
} 