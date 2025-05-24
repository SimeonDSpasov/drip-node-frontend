export interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export interface ProductVariant {
  id: string;
  value: string;
  available: boolean;
} 