import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Cart } from './../../models/cart.model';

@Injectable({
  providedIn: 'root',
})

export class CartService {
  constructor(private router: Router) {}

  public cart = signal<Cart | null>({
    items: [],
    totalAmount: 123131,
  });

  public isCartOpen = signal<boolean>(false);

  public openCart(): void {
    this.isCartOpen.set(true);
  }

  public closeCart(): void {
    this.isCartOpen.set(false);
  }

  public toggleCart(): void {
    this.isCartOpen.update(isOpen => !isOpen);
  }
}
