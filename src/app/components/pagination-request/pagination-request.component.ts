import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface HaulfansResponse {
  code: number;
  data: {
    list: any[];
    total: number;
  };
  msg: string;
}

interface ItemDetailsResponse {
  code: number;
  data: {
    id: string;
    redeemCode: string;
    inboundImages: string[];
    [key: string]: any;
  };
  msg: string;
}

@Component({
  selector: 'app-pagination-request',
  templateUrl: './pagination-request.component.html',
  styleUrls: ['./pagination-request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaginationRequestComponent {
  startNumber: number = 1;
  endNumber: number = 800;
  isLoading: boolean = false;
  results: any[] = [];
  searchQuery: string = '';
  filteredResults: any[] = [];
  selectedItemImages: Map<string, { images: string[], currentIndex: number }> = new Map();

  constructor(private http: HttpClient) {}

  async makeRequests() {
    this.isLoading = true;
    this.results = [];
    this.filteredResults = [];
    this.selectedItemImages.clear();
    
    // Calculate the start and end page numbers
    const startPage = Math.ceil(this.startNumber / 20);
    const endPage = Math.ceil(this.endNumber / 20);
    
    console.log(`Fetching pages from ${startPage} to ${endPage}`);
    
    for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
      try {
        const response = await this.http.get<HaulfansResponse>(
          `https://haulfans.com/buffet/open/redeem/mall/list-items?subCategory=&category=&shopType=&redeemStatus=Redeemable&itemNameEn=&itemPropertiesEn=&maxPoint=&minPoint=&pageNo=${pageNo}&pageSize=20`
        ).toPromise();
        
        if (response?.data?.list) {
          this.results.push({
            pageNo,
            data: response
          });
        }
      } catch (error) {
        console.error(`Error fetching page ${pageNo}:`, error);
        this.results.push({
          pageNo,
          error: true
        });
      }
    }
    
    this.filteredResults = [...this.results];
    this.isLoading = false;
  }

  filterProducts() {
    if (!this.searchQuery.trim()) {
      this.filteredResults = [...this.results];
      return;
    }

    try {
      const searchRegex = new RegExp(this.searchQuery, 'i');
      this.filteredResults = this.results.map(result => {
        if (!result.data?.data?.list) return result;

        const filteredList = result.data.data.list.filter((item: any) => 
          searchRegex.test(item.itemNameEn || '')
        );

        return {
          ...result,
          data: {
            ...result.data,
            data: {
              ...result.data.data,
              list: filteredList
            }
          }
        };
      }).filter(result => result.data?.data?.list?.length > 0);
    } catch (error) {
      console.error('Invalid regex pattern:', error);
      this.filteredResults = [...this.results];
    }
  }

  async getItemDetails(itemId: string) {
    try {
      const response = await this.http.get<ItemDetailsResponse>(
        `https://haulfans.com/buffet/open/redeem/mall/item-details?id=${itemId}`
      ).toPromise();

      if (response?.data) {
        this.results.forEach(result => {
          if (result.data?.data?.list) {
            const item = result.data.data.list.find((i: any) => i.id === itemId);
            if (item) {
              item.redeemCode = response.data.redeemCode;
              // Store all images for this item
              const allImages = [item.firstImage, ...(response.data.inboundImages || [])].filter(Boolean);
              console.log('Setting images for item', itemId, allImages);
              this.selectedItemImages.set(itemId, {
                images: allImages,
                currentIndex: 0
              });
            }
          }
        });
        this.filterProducts();
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  }

  getCurrentImage(itemId: string, firstImage: string): string {
    const itemImages = this.selectedItemImages.get(itemId);
    if (itemImages && itemImages.images.length > 0) {
      return itemImages.images[itemImages.currentIndex];
    }
    return firstImage;
  }

  nextImage(itemId: string, event: Event) {
    event.stopPropagation();
    const itemImages = this.selectedItemImages.get(itemId);
    if (itemImages && itemImages.images.length > 0) {
      itemImages.currentIndex = (itemImages.currentIndex + 1) % itemImages.images.length;
      this.selectedItemImages.set(itemId, itemImages);
      console.log('Next image for item', itemId, 'new index:', itemImages.currentIndex);
    }
  }

  previousImage(itemId: string, event: Event) {
    event.stopPropagation();
    const itemImages = this.selectedItemImages.get(itemId);
    if (itemImages && itemImages.images.length > 0) {
      itemImages.currentIndex = (itemImages.currentIndex - 1 + itemImages.images.length) % itemImages.images.length;
      this.selectedItemImages.set(itemId, itemImages);
      console.log('Previous image for item', itemId, 'new index:', itemImages.currentIndex);
    }
  }

  hasMultipleImages(itemId: string): boolean {
    const itemImages = this.selectedItemImages.get(itemId);
    return itemImages ? itemImages.images.length > 1 : false;
  }

  copyRedeemCode(code: string, event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      const button = event.target as HTMLButtonElement;
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
} 