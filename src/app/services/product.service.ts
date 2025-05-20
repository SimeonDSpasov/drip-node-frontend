import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { ProductFetchingService } from './product-fetching.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>(this.products);

  constructor(private productFetchingService: ProductFetchingService) {
    this.initializeProducts();
  }

  private initializeProducts() {
    this.productFetchingService.fetchProduct('7316862688').subscribe({
      next: (product) => {
        this.products = [product];
        this.productsSubject.next(this.products);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        this.productsSubject.next([]);
      }
    });
  }

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }
} 