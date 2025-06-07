import { Product } from './product.model';
import { ProductSelection } from '../components/product-page/product-page.component';

export interface CartItem {
    product: ProductSelection;
    quantity: number;
}

export type Cart = CartItem[];
