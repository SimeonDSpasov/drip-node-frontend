import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IpiImageComponent } from '../custom/image/src/ipi-img.component';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: true,
  imports: [CommonModule, IpiImageComponent]
})
export class ProductComponent {
  @Input() product!: Product;

  isSecondaryImageVisible: boolean = false;

  constructor(private router: Router) {}

  showSecondaryImage(): void {
    this.isSecondaryImageVisible = true;
  }

  showPrimaryImage(): void {
    this.isSecondaryImageVisible = false;
  }

  navigateToProduct(): void {
    this.router.navigate(['/product', this.product.id]);
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
