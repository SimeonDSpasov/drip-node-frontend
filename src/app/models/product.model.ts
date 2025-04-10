
export interface ProductImage {
  url: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  link: string;
  images: ProductImage[];
  creatorName: string;
  mainImage: string;
}
