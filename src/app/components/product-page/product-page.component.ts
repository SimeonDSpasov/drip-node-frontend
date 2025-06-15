import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Subscription } from 'rxjs';

import { QuantitySelectorComponent } from './../custom/quantity-selector';
import { IpiImageComponent } from './../custom/image/src/ipi-img.component';
import { ProductGridComponent } from './../product-grid/product-grid.component';

import { CartService } from './../../services/cart.service';
import { RateService } from './../../services/rate.service';
import { RequestsOrderService } from './../../services/requests/requests.order.service';
import { RequestsProductService } from './../../services/requests/requests-product.service';

import { ProductInfo, Product, SKU } from './../../models/product.model';

interface FinishedProduct {
  productInfo: ProductInfo;
  savedProduct: Product | null;
}

interface ColorGroup {
  color: string;
  colorImage: string;
  sizes: {
    size: string;
    sku: SKU;
    stock: number;
  }[];
  isSingleSku: boolean;
  singleSkuPrice?: string;
}

export interface ProductSelection {
  productInfo: ProductInfo;
  savedProduct: Product | null;
  selectedSku: SKU | null;
  selectedColor: string;
  selectedSize: string;
  price: {
    original: string;
    converted: string;
  };
  image: string;
}

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IpiImageComponent,
    ProductGridComponent,
    QuantitySelectorComponent,
  ],
})
export class ProductPageComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestsProductService: RequestsProductService,
    private requestsOrderService: RequestsOrderService,
    private rateService: RateService,
    private cartService: CartService,
  ) {
    this.subscription = this.rateService.getRateObservable().subscribe(rate => {
      this.currentRate = rate;
      if (this.productInfo) {
        this.updateSelectedSku();
      }
    });
  }

  productInfo: ProductInfo | null = null;
  savedProduct: Product | null = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  selectedType: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  quantity: number = 1;

  // Available options
  availableColors: string[] = [];
  availableSizes: string[] = [];
  availableTypes: string[] = [];
  colorGroups: ColorGroup[] = [];

  // Price display
  selectedSkuPrice: string = '';
  selectedSkuStock: number = 0;
  currentRate: number | null = null;

  // Complete selection tracking
  selection: ProductSelection | null = null;

  private subscription: Subscription;

  ngOnInit(): void {
    this.loadProduct();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async loadProduct(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const productId = this.route.snapshot.paramMap.get('id');
      if (!productId) {
        this.error = 'No product ID provided';
        return;
      }

      // For now, hardcode the platform as WEIDIAN since we don't have the link
      const platform = 'WEIDIAN';

      const request = this.requestsProductService.getFinishedProduct(productId, platform);
      const response = await lastValueFrom(request);

      if (response.status === 200 && response.data?.data) {
        const { productInfo } = response.data.data as FinishedProduct;
        const { savedProduct } = response.data;

        this.productInfo = productInfo;
        this.savedProduct = savedProduct;

        if (this.productInfo.imgList?.length > 0) {
          this.selectedImage = this.productInfo.imgList[0];
        }
        this.updateAvailableOptions();
        this.groupSkusByColor();
        this.updateSelectedSku();
      } else {
        this.error = 'Failed to load product';
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.error = 'Error loading product';
    } finally {
      this.isLoading = false;
    }
  }

  private groupSkusByColor(): void {
    if (!this.productInfo?.skus) return;

    const colorGroupsMap = new Map<string, ColorGroup>();

    this.productInfo.skus.forEach(sku => {
      if (!sku.imgUrl) return;

      // Use the image URL as the key for grouping
      if (!colorGroupsMap.has(sku.imgUrl)) {
        // Extract color name from nameTrans if possible, otherwise use a default
        const colorName = this.extractColorName(sku.nameTrans) || 'Color ' + (colorGroupsMap.size + 1);
        
        colorGroupsMap.set(sku.imgUrl, {
          color: colorName,
          colorImage: sku.imgUrl,
          sizes: [],
          isSingleSku: false
        });
      }

      const group = colorGroupsMap.get(sku.imgUrl)!;
      // Extract size from nameTrans
      const size = this.extractSize(sku.nameTrans);
      if (size) {
        group.sizes.push({
          size: size,
          sku: sku,
          stock: sku.stock
        });
      } else {
        // If no size is found, this is a single SKU case
        group.isSingleSku = true;
        group.singleSkuPrice = this.getFormattedPrice(sku.price);
      }
    });

    this.colorGroups = Array.from(colorGroupsMap.values());
  }

  private extractColorName(nameTrans: string): string | null {
    try {
      const parts = nameTrans.split(';');
      const colorPart = parts.find(part => part.toLowerCase().includes('colour:'));
      if (colorPart) {
        return colorPart.split(':')[1].trim();
      }
    } catch (error) {
      console.warn('Error extracting color name:', error);
    }
    return null;
  }

  private extractSize(nameTrans: string): string | null {
    try {
      const parts = nameTrans.split(';');
      const sizePart = parts.find(part => part.toLowerCase().includes('size:'));
      if (sizePart) {
        return sizePart.split(':')[1].trim();
      }
    } catch (error) {
      console.warn('Error extracting size:', error);
    }
    return null;
  }

  private updateAvailableOptions(): void {
    if (!this.productInfo?.productAttr) return;

    const props = this.productInfo.productAttr;
    props.forEach(attr => {
      if (attr.attr.toLowerCase().includes('color')) {
        this.availableColors = attr.values.map(v => v.value);
      } else if (attr.attr.toLowerCase().includes('size')) {
        this.availableSizes = attr.values.map(v => v.value);
      } else if (attr.attr.toLowerCase().includes('type')) {
        this.availableTypes = attr.values.map(v => v.value);
      }
    });

    // Set default selections if available
    if (this.availableColors.length > 0) this.selectedColor = this.availableColors[0];
    if (this.availableSizes.length > 0) this.selectedSize = this.availableSizes[0];
    if (this.availableTypes.length > 0) this.selectedType = this.availableTypes[0];
  }

  private updateSelectedSku(): void {
    if (!this.productInfo?.skus) return;

    // Find the matching SKU based on selected options
    const selectedGroup = this.colorGroups.find(group => group.color === this.selectedColor);
    if (!selectedGroup) return;

    let matchingSku: SKU | undefined;

    if (selectedGroup.isSingleSku) {
      // For products with only colors (no sizes)
      matchingSku = this.productInfo.skus.find(sku => 
        sku.imgUrl === selectedGroup.colorImage
      );
    } else {
      // For products with both colors and sizes
      const sizeInfo = selectedGroup.sizes.find(size => size.size === this.selectedSize);
      matchingSku = sizeInfo?.sku;
    }

    if (matchingSku) {
      this.selectedSkuStock = matchingSku.stock;
      this.selectedSkuPrice = this.getFormattedPrice(matchingSku.price);
      
      // Update the selection
      this.selection = {
        productInfo: this.productInfo,
        savedProduct: this.savedProduct,
        selectedSku: matchingSku,
        selectedColor: this.selectedColor,
        selectedSize: this.selectedSize,
        price: {
          original: matchingSku.price,
          converted: this.getFormattedPrice(matchingSku.price)
        },
        image: this.selectedImage
      };
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.updateSelectedSku();
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    const selectedGroup = this.colorGroups.find(group => group.color === color);
    if (selectedGroup?.colorImage) {
      this.selectedImage = selectedGroup.colorImage;
    }
    this.updateSelectedSku();
  }

  selectType(type: string): void {
    this.selectedType = type;
    this.updateSelectedSku();
  }

  onQuantityChanged(quantity: number): void {
    if (quantity >= 1 && quantity <= 10) {
      this.quantity = quantity;
    }
  }

  addToCart(): void {
    if (!this.productInfo || !this.selection?.selectedSku) {
      return;
    }

    this.cartService.addToCart(this.selection, this.quantity);
  }

  onProductClick(product: Product) {
    this.router.navigate(['/product', product.id]);
  }

  getSizesForSelectedColor() {
    const selectedGroup = this.colorGroups.find(group => group.color === this.selectedColor);
    return selectedGroup?.sizes || [];
  }

  getFormattedPrice(price: string): string {
    const priceValue = parseFloat(price);
    if (this.currentRate) {
      return (priceValue * this.currentRate).toFixed(2) + ' BGN';
    }
    return priceValue.toFixed(2) + ' CNY';
  }

  isSingleSkuForSelectedColor(): boolean {
    const selectedGroup = this.colorGroups.find(group => group.color === this.selectedColor);
    return selectedGroup?.isSingleSku || false;
  }

  getSingleSkuPrice(): string | null {
    if (!this.selectedColor) return null;
    
    const selectedGroup = this.colorGroups.find(group => group.color === this.selectedColor);
    if (!selectedGroup?.isSingleSku || selectedGroup.sizes.length === 0) return null;

    const sku = selectedGroup.sizes[0].sku;
    return this.getFormattedPrice(sku.price);
  }

  getSelectedColorGroup(): ColorGroup | undefined {
    return this.colorGroups.find(group => group.color === this.selectedColor);
  }
} 