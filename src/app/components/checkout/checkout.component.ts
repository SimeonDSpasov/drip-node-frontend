import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import { IpiImageComponent } from '@ipi-soft/ng-components/image';

import { IpiButtonComponent } from './../custom/button';

import { CartService } from './../../services/cart.service';
import { RequestsOrderService } from './../../services/requests/requests.order.service';

import { CartItem } from './../../models/cart.model';

import { PlatformService } from './../services/platform.service';

interface OrderItem {
  productId: string;
  skuId: string;
  quantity: number;
  price: number;
}

interface OrderData {
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    street: string;
    city: string;
    postalCode: string;
  };
  orderItems: OrderItem[];
  totalAmount: number;
  notes?: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IpiImageComponent,
    IpiButtonComponent,
    ReactiveFormsModule
  ]
})
export class CheckoutComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private platformService: PlatformService,
    private cartService: CartService,
    private router: Router,
    private requestsOrderService: RequestsOrderService,
  ) {
    effect(() => {
      const cart = this.cartService.cart();
      if (cart) {
        this.cartItems = cart;
        this.calculateTotal();
        setTimeout(() => {
          this.isLoading = false;
        }, 1000); // Simulate loading for animation
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  public checkoutForm!: FormGroup;
  public cartItems: CartItem[] = [];
  public totalAmount: number = 0;
  public shippingPrice: number = 0;
  public isLoading: boolean = true;
  public isCalculatingPrice: boolean = false;

  ngOnInit(): void {
    this.initForm();

  }

  ngAfterViewInit(): void {
    this.calculateTotalPrice();
  };

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      street: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      notes: ['']
    });

  }

  private calculateTotal(): void {
    this.totalAmount = Number(this.cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price.original);
      const convertedPrice = this.cartService.getConvertedPrice(price);
      return total + (convertedPrice * item.quantity);
    }, 0).toFixed(2));
  }

  private async calculateTotalPrice(): Promise<void> {
    this.isCalculatingPrice = true;
    const products = this.buildOrderItems();

    const body = {
      orderItems: products,
    };

    const request = this.requestsOrderService.calculateTotalPrice(body);
    const response = await lastValueFrom(request);

    switch (response.status) {
      case 200:
        const totalPriceBGN = response.data.totalPriceBGN;

        if (totalPriceBGN) {
          this.totalAmount = response.data.totalPriceBGN.toFixed(2);
        }
        break;
      default:
        break;
    }
    this.isCalculatingPrice = false;
  }

  private buildOrderItems(): OrderItem[] {
    return this.cartItems.map(item => ({
      productId: item.product.savedProduct!._id,
      skuId: item.product.selectedSku?.skuID || '',
      quantity: item.quantity,
      price: parseFloat(item.product.price.original)
    }));
  }

  private buildOrderData(): OrderData {
    const formValue = this.checkoutForm.value;
    
    return {
      customerInfo: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone
      },
      shippingAddress: {
        address: formValue.address,
        street: formValue.street,
        city: formValue.city,
        postalCode: formValue.postalCode
      },
      orderItems: this.buildOrderItems(),
      totalAmount: this.totalAmount,
      notes: formValue.notes || undefined
    };
  }

  public async onSubmit(): Promise<void> {
    if (this.checkoutForm.valid) {
      const orderData = this.buildOrderData();

      const request = this.requestsOrderService.createOrder(orderData);
      const response = await lastValueFrom(request);

      switch (response.status) {
        case 200:
          if (response.data.paymentUrl) {
            this.navigateToStripe(response.data.paymentUrl);
          }
          break;
        default:
          break;
      }
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.checkoutForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Това поле е задължително';
    }
    if (control.hasError('minlength')) {
      return `Минимална дължина ${control.errors?.['minlength'].requiredLength} символа`;
    }
    if (control.hasError('pattern')) {
      if (controlName === 'phone') {
        return 'Моля въведете валиден телефонен номер (напр. +359888123456)';
      }
      if (controlName === 'email') {
        return 'Моля въведете валиден имейл адрес';
      }
      if (controlName === 'postalCode') {
        return 'Моля въведете валиден пощенски код (4 цифри)';
      }
    }
    return 'Невалидна стойност';
  }

  private async navigateToStripe(paymentUrl: string): Promise<void> {
    if (this.platformService.isServer()) {
      return;
    }

    return new Promise(() => document.location.replace(paymentUrl));
  }

} 