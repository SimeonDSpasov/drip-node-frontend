import { Component, AfterViewInit, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CartService } from './../services/cart.service';
import { PlatformService } from './../services/platform.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [
    RouterOutlet,
  ],
})

export class CartComponent {
 
  constructor(
    private cartService: CartService,
    private viewContainerRef: ViewContainerRef,
    private platformService: PlatformService) {
  }

}
