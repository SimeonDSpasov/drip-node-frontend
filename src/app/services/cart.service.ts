import { Injectable, signal } from '@angular/core';

import { Cart } from './../models/cart.model';


@Injectable({
  providedIn: 'root'
})

export class CartService {

  constructor() { }

  public cart = signal<Cart | null>(null);

}
