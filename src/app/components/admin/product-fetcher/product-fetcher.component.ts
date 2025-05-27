import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { lastValueFrom } from 'rxjs';

import { RateService } from './../../../services/rate.service';
import { RequestsProductService } from './../../../services/requests/requests-product.service';

import { ProductInfo } from './../../../models/product.model';

interface SkuPrice {
  cny: string;
  usd: string;
}

@Component({
  selector: 'app-product-fetcher',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-fetcher.component.html',
  styleUrls: ['./product-fetcher.component.css']
})

export class ProductFetcherComponent {
  productForm: FormGroup;
  productInfo: ProductInfo | null = null;
  error: string | null = null;
  skuPrices: { [key: string]: SkuPrice } = {};
  showSkus = false;
  selectedImageIndex = 0;
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private requestsProductService: RequestsProductService,
    private rateService: RateService
  ) {
    this.productForm = this.fb.group({
      productLink: ['', [
        Validators.required,
      ]]
    });

    this.editForm = this.fb.group({
      titleTrans: ['', Validators.required]
    });

    // Subscribe to rate changes
    this.rateService.getRateObservable().subscribe(rate => {
      if (rate && this.productInfo?.skus) {
        this.updateAllPrices(rate);
      }
    });
  }

  private parseProductLink(link: string): { productId: string; platform: string } | null {
    try {
      // Remove @ if present at the start
      const cleanLink = link.startsWith('@') ? link.substring(1) : link;
      
      // Extract id and platform using regex
      const idMatch = cleanLink.match(/[?&]id=(\d+)/);
      const platformMatch = cleanLink.match(/[?&](?:platform|shop_type)=([^&]+)/i);
      
      if (idMatch && platformMatch) {
        const id = idMatch[1];
        const platform = platformMatch[1].toUpperCase();
        return { productId: id, platform };
      }
    } catch (error) {
      console.error('Error parsing product link:', error);
    }
    return null;
  }

  public formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  public formatCNYPrice(price: string): string {
    return this.formatCurrency(parseFloat(price), 'CNY');
  }

  public toggleSkus() {
    this.showSkus = !this.showSkus;
  }

  public selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  public async saveProduct() {
    if (this.editForm.valid && this.productInfo) {
      try {
        const parsedLink = this.parseProductLink(this.productForm.get('productLink')?.value);

        if (!parsedLink) {
          this.error = 'Invalid product link';
          return;
        }

        const request = this.requestsProductService.saveCNFansProduct(
          parsedLink.productId,
          parsedLink.platform,
          {
            titleTrans: this.editForm.get('titleTrans')?.value
          }
        );
        const response = await lastValueFrom(request);
        
        if (response.status === 200) {
          // Update the local product info with the new translated title
          this.productInfo.titleTrans = this.editForm.get('titleTrans')?.value;
          // TODO: Show success message
        } else {
          this.error = 'Failed to save product';
        }
      } catch (error) {
        this.error = 'Error saving product';
        console.error('Error saving product:', error);
      }
    }
  }

  private updateAllPrices(rate: number) {
    if (this.productInfo?.skus) {
      this.productInfo.skus.forEach(sku => {
        const cnyValue = parseFloat(sku.price);
        const usdValue = cnyValue * rate;
        
        this.skuPrices[sku.skuID] = {
          cny: this.formatCurrency(cnyValue, 'CNY'),
          usd: this.formatCurrency(usdValue, 'USD')
        };
      });
    }
  }

  public async getProductData() {
    if (this.productForm.valid) {
      const productLink = this.productForm.get('productLink')?.value;
      const parsedLink = this.parseProductLink(productLink);
      
      if (!parsedLink) {
        this.error = 'Invalid product link';
        return;
      }

      this.error = null;
      this.showSkus = false;
      this.selectedImageIndex = 0;

      const request = this.requestsProductService.getCNFansProductDetail(parsedLink.productId, parsedLink.platform);
      const response = await lastValueFrom(request);

      switch (response.status) {
        case 200:
          this.productInfo = response.data.data.productInfo;
          // Update form with product data
          this.editForm.patchValue({
            titleTrans: this.productInfo!.titleTrans
          });
          const currentRate = this.rateService.getRate();
          if (currentRate) {
            this.updateAllPrices(currentRate);
          }
          break;
        default:
          this.error = 'Failed to fetch product data';
          break;
      }
    }
  }
} 