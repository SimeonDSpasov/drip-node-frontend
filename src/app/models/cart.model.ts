import { Product } from './product.model';

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
