import { Component, OnInit, effect, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

import { IpiButtonComponent } from './../custom/button';
import { QuantitySelectorComponent } from './../custom/quantity-selector';

import { CartService } from './../../services/cart.service';
import { UserAgentService } from './../custom/services/src/user-agent.service';
import { LoaderService, OSService, ScrollBlockService } from './../custom/services';

import { CartAnimation, CartItemAnimation } from './../../animations/cart.animation';
import { ProductSelection } from '../product-page/product-page.component';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  animations: [CartAnimation, CartItemAnimation],
  standalone: true,
  imports: [
    CommonModule,
    IpiImageComponent,
    IpiButtonComponent,
    ReactiveFormsModule,
    QuantitySelectorComponent,
  ],
})
export class CartComponent implements OnInit, OnDestroy {
  cartForm!: FormGroup;
  public isExpanded: boolean = false;
  cartItems: CartItem[] = [];
  totalAmount: number = 0;

  constructor(
    public cartService: CartService,
    private fb: FormBuilder,
    private userAgent: UserAgentService,
    private loaderService: LoaderService,
    private scrollBlockService: ScrollBlockService,
    private router: Router
  ) {
    effect(() => {
      const isOpen = this.cartService.isCartOpen();
      this.handleCartStateChange(isOpen);
    });

    // Subscribe to cart changes
    effect(() => {
      const cart = this.cartService.cart();
      if (cart) {
        this.cartItems = cart;
        this.updateForm();
        this.calculateTotal();
      } else {
        this.cartItems = [];
        this.totalAmount = 0;
      }
    });
  }

  ngOnInit(): void {
    this.updateForm();
    this.loaderService.show();
  }

  ngOnDestroy(): void {
    // No need to unsubscribe from effects
  }

  onClose(): void {
    this.cartService.closeCart();
  }

  onCheckout(): void {
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }

  private updateForm(): void {
    const group: { [key: string]: FormControl } = {};
    this.cartItems.forEach(item => {
      if (item.product.selectedSku) {
        group[item.product.selectedSku.skuID] = new FormControl(item.quantity);
      }
    });
    this.cartForm = this.fb.group(group);
  }

  onQuantityChanged(productId: string | undefined, quantity: number): void {
    if (!productId) return;
    
    const currentCart = this.cartService.cart();
    if (!currentCart) return;

    const updatedCart = currentCart.map((item: CartItem) => {
      if (item.product.selectedSku?.skuID === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cartService.cart.set(updatedCart);
  }

  removeItem(productId: string | undefined): void {
    if (!productId) return;
    
    const currentCart = this.cartService.cart();
    if (!currentCart) return;

    const updatedCart = currentCart.filter(
      (item: CartItem) => item.product.selectedSku?.skuID !== productId
    );

    this.cartService.cart.set(updatedCart);
  }

  clearCart(): void {
    this.cartService.cart.set(null);
  }

  private calculateTotal(): void {
    this.totalAmount = Number(this.cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price.original);
      const convertedPrice = this.cartService.getConvertedPrice(price);
      return total + (convertedPrice * item.quantity);
    }, 0).toFixed(2));
  }

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