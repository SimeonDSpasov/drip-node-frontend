import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

import { Product } from './../../interfaces/product.interface';
import { ProductComponent } from './visual-product/product.component';
import { PaginationComponent } from './../pagination/pagination.component';
import { RequestsProductService } from './../../services/requests/requests-product.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductComponent,
    PaginationComponent
  ]
})
export class ProductsPageComponent implements OnInit {

  products: Product[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  itemsPerPageOptions: number[] = [10, 20, 50, 100];

  constructor(
    private requestsProductService: RequestsProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    try {
      const skip = (this.currentPage - 1) * this.itemsPerPage;
      const request = this.requestsProductService.getProductsChunk(skip, this.itemsPerPage);
      const response = await lastValueFrom(request);

      if (response.status === 200) {
        this.products = response.data.products;
        this.totalItems = response.data.total;
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
} 