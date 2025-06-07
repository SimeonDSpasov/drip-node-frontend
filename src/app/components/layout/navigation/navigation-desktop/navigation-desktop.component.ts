import { Component, Input, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { IpiImageComponent } from './../../../custom/image';

import { NavigationOption } from './../navigation.component';

import { CartService } from './../../../../services/cart.service';

@Component({
  selector: 'app-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    IpiImageComponent,
    CommonModule
  ],
  animations: [
    trigger('countAnimation', [
      transition('* => *', [
        style({ transform: 'scale(0.3)', opacity: 0 }),
        animate('0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ transform: 'scale(1.4)', opacity: 1 })),
        animate('0.2s ease-out', 
          style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})

export class NavigationDesktopComponent {
  cartCount: number = 0;

  constructor(
    public cartService: CartService,
  ) {
    effect(() => {
      const cart = this.cartService.cart();
      if (cart) {
        this.cartCount = cart.length;
      } else {
        this.cartCount = 0;
      }
    });
  }

  @Input() activeOptionIndex: number | null = null;
  @Input() navigationOptions: NavigationOption[] = [];
}
