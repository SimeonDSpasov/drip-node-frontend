import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { ProductComponent } from '../product/product.component';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css'],
  imports: [ProductComponent],
  standalone: true
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Input() title: string = 'Products';
  @Input() excludeProductId?: string;
  @Output() productClick = new EventEmitter<Product>();

  filteredProducts: Product[] = [];

  ngOnChanges() {
    if (this.excludeProductId) {
      this.filteredProducts = this.products.filter(p => p.id !== this.excludeProductId);
    } else {
      this.filteredProducts = this.products;
    }
  }

  onProductClick(product: Product) {
    this.productClick.emit(product);
  }
} 