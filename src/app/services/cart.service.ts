import { Injectable, signal } from '@angular/core';

import { Cart } from './../models/cart.model';
import { ProductSelection } from './../components/product-page/product-page.component';
import { RateService } from './rate.service';
import { IpiSnackbarService } from './../components/custom/snackbar';

interface CartItem {
  product: ProductSelection;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private isOpen = signal<boolean>(false);

  constructor(
    private rateService: RateService,
    private snackbarService: IpiSnackbarService
  ) { }

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

  addToCart(product: ProductSelection, quantity: number = 1): void {
    const currentCart = this.cart();

    if (!currentCart || currentCart.length === 0) {
      // Initialize cart if empty
      this.cart.set([{
        product,
        quantity
      }]);
      this.snackbarService.open(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
    } else {
      // Check if product with same SKU already exists
      const existingItemIndex = currentCart.findIndex(
        item => item.product.selectedSku?.skuID === product.selectedSku?.skuID
      );

      if (existingItemIndex > -1) {
        // Update quantity if product exists
        const updatedCart = [...currentCart];
        updatedCart[existingItemIndex].quantity += quantity;
        this.cart.set(updatedCart);
        this.snackbarService.open(`Updated quantity to ${updatedCart[existingItemIndex].quantity} items`);
      } else {
        // Add new product if not found
        this.cart.set([...currentCart, {
          product,
          quantity
        }]);
        this.snackbarService.open(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`);
      }
    }
  }

  getConvertedPrice(price: number): number {
    const rate = this.rateService.getRate();
    if (!rate) return Number(price.toFixed(2));
    return Number((price * rate).toFixed(2));
  }
}
