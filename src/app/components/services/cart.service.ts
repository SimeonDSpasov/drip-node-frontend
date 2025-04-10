import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import { Cart } from './../../models/cart.model';

@Injectable({
  providedIn: 'root',
})

export class CartService {

  constructor(
    private router: Router) { }

  public cart = signal<Cart | null>({
    items: [],
    totalAmount: 123131,
  });

}
