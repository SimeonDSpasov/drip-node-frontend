import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductFetchingService } from '../../../services/product-fetching.service';
import { Product } from '../../../interfaces/product.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-fetcher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-fetcher.component.html',
  styleUrls: ['./product-fetcher.component.scss']
})
export class ProductFetcherComponent {
  productForm: FormGroup;
  fetchedProduct: Product | null = null;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productFetchingService: ProductFetchingService
  ) {
    this.productForm = this.fb.group({
      productId: ['', Validators.required],
      platform: ['WEIDIAN', Validators.required]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const { productId, platform } = this.productForm.value;
      this.error = null;
      
      this.productFetchingService.fetchProduct(productId, platform).subscribe({
        next: (product) => {
          this.fetchedProduct = product;
        },
        error: (err) => {
          this.error = 'Error fetching product: ' + err.message;
          this.fetchedProduct = null;
        }
      });
    }
  }
} 