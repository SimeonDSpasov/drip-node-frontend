import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Subscription } from 'rxjs';

import { ProductInfo, Product, SKU } from './../../models/product.model';
import { RequestsProductService } from './../../services/requests/requests-product.service';
import { RateService } from './../../services/rate.service';
import { IpiImageComponent } from './../custom/image/src/ipi-img.component';
import { ProductGridComponent } from './../product-grid/product-grid.component';

interface FinishedProduct {
  productInfo: ProductInfo;
  savedProduct: Product | null;
}

interface CNFansResponse {
  status: number;
  data: {
    data: FinishedProduct;
  };
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
  singleSkuPrice?: string;  // Add optional price for single SKU cases
}

interface ProductSelection {
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
  imports: [CommonModule, FormsModule, IpiImageComponent, ProductGridComponent]
})
export class ProductPageComponent implements OnInit, OnDestroy {
  productInfo: ProductInfo | null = null;
  savedProduct: Product | null = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  selectedType: string = '';
  isLoading: boolean = true;
  error: string | null = null;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestsProductService: RequestsProductService,
    private rateService: RateService
  ) {
    this.subscription = this.rateService.getRateObservable().subscribe(rate => {
      this.currentRate = rate;
      if (this.productInfo) {
        this.updateSelectedSku();
      }
    });
  }

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
        
        console.log(this.savedProduct)
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
    console.log('Color groups:', this.colorGroups);
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
    const matchingSku = this.productInfo.skus.find(sku => {
      const props = this.productInfo?.skuPropNamesMap;
      const values = this.productInfo?.skuPropValsMap;
      
      if (!props || !values) return false;

      const skuProps = sku.propsID.split(';').map(id => values[id]);
      const colorMatch = skuProps.includes(this.selectedColor);
      
      // For single SKU cases, don't check size
      const selectedGroup = this.colorGroups.find(group => group.color === this.selectedColor);
      if (selectedGroup?.isSingleSku) {
        return colorMatch;
      }
      
      return colorMatch && skuProps.includes(this.selectedSize);
    });

    if (matchingSku) {
      const price = parseFloat(matchingSku.price);
      if (this.currentRate) {
        this.selectedSkuPrice = (price * this.currentRate).toFixed(2) + ' BGN';
      } else {
        this.selectedSkuPrice = price.toFixed(2) + ' CNY';
      }
      this.selectedSkuStock = matchingSku.stock;
      if (matchingSku.imgUrl) {
        this.selectedImage = matchingSku.imgUrl;
      }

      // Update the complete selection
      this.selection = {
        productInfo: this.productInfo,
        savedProduct: this.savedProduct,
        selectedSku: matchingSku,
        selectedColor: this.selectedColor,
        selectedSize: this.selectedSize,
        price: {
          original: matchingSku.price,
          converted: this.selectedSkuPrice
        },
        image: matchingSku.imgUrl
      };

      console.log('Current selection:', this.selection);
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

  addToCart(): void {
    if (!this.selection || !this.selection.selectedSku) {
      alert('Please select all options before adding to cart');
      return;
    }

    // Check if size is required for this color
    const selectedGroup = this.colorGroups.find(group => group.color === this.selectedColor);
    if (!selectedGroup?.isSingleSku && !this.selectedSize) {
      alert('Please select a size before adding to cart');
      return;
    }

    if (this.selection.selectedSku.stock <= 0) {
      alert('This item is out of stock');
      return;
    }

    console.log('Adding to cart:', this.selection);
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