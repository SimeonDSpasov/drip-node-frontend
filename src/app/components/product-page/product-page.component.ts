import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductVariant } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product.service';
import { IpiImageComponent } from '../custom/image/src/ipi-img.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';
@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, IpiImageComponent, ProductGridComponent]
})
export class ProductPageComponent implements OnInit {
  product: Product | null = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  selectedType: string = '';
  additionalImages: string[] = [];
  allProducts: Product[] = [];

  get sizes(): ProductVariant[] {
    return this.product?.sizes || [];
  }

  get colors(): ProductVariant[] {
    return this.product?.colors || [];
  }

  get types(): ProductVariant[] {
    return this.product?.types || [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      const product = this.productService.getProductById(productId);
      if (product) {
        this.product = product;
        this.selectedImage = product.primaryImage;
        this.additionalImages = product.additionalImages || [];
      }
    });

    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  selectType(type: string): void {
    this.selectedType = type;
  }

  addToCart(): void {
    if (!this.selectedSize || !this.selectedColor || !this.selectedType) {
      alert('Please select all options before adding to cart');
      return;
    }

    // TODO: Implement cart functionality
    console.log('Adding to cart:', {
      product: this.product,
      size: this.selectedSize,
      color: this.selectedColor,
      type: this.selectedType
    });
  }

  onProductClick(product: Product) {
    this.router.navigate(['/product', product.id]);
  }
} 