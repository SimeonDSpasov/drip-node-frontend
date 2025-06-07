import { Injectable, signal } from '@angular/core';

import { Cart } from './../models/cart.model';
import { ProductSelection } from './../components/product-page/product-page.component';
import { RateService } from './rate.service';

interface CartItem {
  product: ProductSelection;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private isOpen = signal<boolean>(false);

  constructor(private rateService: RateService) { }

  public cart = signal<CartItem[] | null>(null);

  isCartOpen(): boolean {
    return this.isOpen();
  }

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
  }

  addToCart(product: ProductSelection): void {
    const currentCart = this.cart();

    if (!currentCart || currentCart.length === 0) {
      // Initialize cart if empty
      this.cart.set([{
        product,
        quantity: 1
      }]);
    } else {
      // Check if product with same SKU already exists
      const existingItemIndex = currentCart.findIndex(
        item => item.product.selectedSku?.skuID === product.selectedSku?.skuID
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        const updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += 1;
        this.cart.set(updatedCart);
      } else {
        // Add new product if not found
        this.cart.set([...currentCart, {
          product,
          quantity: 1
        }]);
      }
    }

  }

  getConvertedPrice(price: number): number {
    const rate = this.rateService.getRate();
    if (!rate) return Number(price.toFixed(2));
    return Number((price * rate).toFixed(2));
  }
}
