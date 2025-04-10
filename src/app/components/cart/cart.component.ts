import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { QuantitySelectorComponent } from './../custom/quantity-selector';

import { CartService } from './../services/cart.service';
import { ScrollBlockService } from './../custom/services';

import { NavigationMobileAnimation } from './../../animations/navigation-mobile.animation';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  animations: [NavigationMobileAnimation],
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    QuantitySelectorComponent,
  ],
})
export class CartComponent implements OnInit {

  constructor(
    public cartService: CartService,
    private fb: FormBuilder,
    private scrollBlockService: ScrollBlockService) {
      effect(() => {
        const isOpen = this.cartService.isCartOpen();
  
        this.handleCartStateChange(isOpen);
      });
    }

  cartForm!: FormGroup;

  public cartItems = [
    { id: 'product-1', name: 'iPhone 15', description: '256GB Gold', price: 1797 },
    { id: 'product-2', name: 'iPad Air', description: '9.7 inch, 128GB', price: 799 },
    { id: 'product-3', name: 'Playstation 5', description: 'Digital Edition', price: 599 },
  ];

  ngOnInit(): void {
    const group: { [key: string]: FormControl } = {};

    this.cartItems.forEach(item => {
      group[item.id] = new FormControl(1); // default quantity 1
    });

    this.cartForm = this.fb.group(group);
  }

  onQuantityChanged(productId: string, quantity: number) {
    console.log(`Quantity changed for ${productId}:`, quantity);
  }

  public isExpanded: boolean = false;

  private handleCartStateChange(isOpen: boolean): void {
    if (isOpen && !this.isExpanded) {
      this.isExpanded = true;
      setTimeout(() => {
        // this.scrollBlockService.activate();
      }, 350);
    } else if (!isOpen && this.isExpanded) {
      this.isExpanded = false;
      // this.scrollBlockService.deactivate();
    }
  }

}