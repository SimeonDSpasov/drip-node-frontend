import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { IpiImageComponent } from './../../custom/image/src/ipi-img.component';

import { RateService } from './../../../services/rate.service';
import { PlatformService } from './../../services/platform.service';

import { Product } from './../../../interfaces/product.interface';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [CommonModule, IpiImageComponent]
})
export class ProductComponent implements OnDestroy {

  @Input() product!: Product;
  
  isSecondaryImageVisible: boolean = false;

  public rate: number | null = null;

  private subscription!: Subscription;

  constructor(
    public rateService: RateService,
    private platformService: PlatformService,
    private router: Router) {
    if (!this.platformService.isServer()) {
      this.subscription = this.rateService.getRateObservable().subscribe((rate) => {
        this.rate = rate;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  showSecondaryImage(): void {
    this.isSecondaryImageVisible = true;
  }

  showPrimaryImage(): void {
    this.isSecondaryImageVisible = false;
  }

  navigateToProduct(): void {
    console.log((this.product as any).id_2)
    this.router.navigate([`/product/${this.product.id_2}`]);
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', this.product);
  }

  addToWishlist(event: Event): void {
    event.stopPropagation();
    // TODO: Implement add to wishlist functionality
    console.log('Adding to wishlist:', this.product);
  }
}
