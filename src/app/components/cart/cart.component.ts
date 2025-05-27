import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

import { IpiButtonComponent } from './../custom/button';
import { QuantitySelectorComponent } from './../custom/quantity-selector';

import { CartService } from './../services/cart.service';
import { UserAgentService } from './../custom/services/src/user-agent.service';
import { LoaderService, OSService, ScrollBlockService } from './../custom/services';

import { NavigationMobileAnimation } from './../../animations/navigation-mobile.animation';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  animations: [NavigationMobileAnimation],
  standalone: true,
  imports: [
    IpiImageComponent,
    IpiButtonComponent,
    ReactiveFormsModule,
    QuantitySelectorComponent,
  ],
})

export class CartComponent implements OnInit {

  constructor(
    public cartService: CartService,
    private fb: FormBuilder,
    private userAgent: UserAgentService,
    private loaderService: LoaderService,
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

  onClose(): void {
    this.cartService.closeCart();
  }

  ngOnInit(): void {
    const group: { [key: string]: FormControl } = {};

    this.cartItems.forEach(item => {
      group[item.id] = new FormControl(1); // default quantity 1
    });

    this.cartForm = this.fb.group(group);

    this.loaderService.show();
  }

  onQuantityChanged(productId: string, quantity: number) {
    console.log(`Quantity changed for ${productId}:`, quantity);
  }

  removeItem(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.cartForm.removeControl(productId);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      const quantity = this.cartForm.get(item.id)?.value || 1;
      return total + (item.price * quantity);
    }, 0);
  }

  public isExpanded: boolean = false;

  private handleCartStateChange(isOpen: boolean): void {
    if (!this.userAgent.getUserAgent()) {
      return;
    }

    const isMobile = window.innerWidth < 940;
  
    if (isOpen && !this.isExpanded) {
      this.isExpanded = true;
  
      if (isMobile) {
        setTimeout(() => {
          this.scrollBlockService.activate();
        }, 350);
      }
    } else if (!isOpen && this.isExpanded) {
      this.isExpanded = false;
  
      if (isMobile) {
        this.scrollBlockService.deactivate();
      }
    }
  }
}