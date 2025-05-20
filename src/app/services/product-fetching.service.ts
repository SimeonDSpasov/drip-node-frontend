import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductFetchingService {
  private apiUrl = 'https://cnfans.com/search-api/detail/product-info';

  constructor(private http: HttpClient) {}

  fetchProduct(productId: string, platform: string = 'WEIDIAN'): Observable<any> {
    const params = {
      platform,
      productID: productId,
      forceReload: 'false',
      site: 'cnfans',
      lang: 'en',
      'wmc-currency': 'USD'
    };

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {

        if (response.data.productInfo.skus && response.data.productInfo.skus.length > 1) {
            return { 
                id_2: params.productID || 'default-id',
                productTitle: response.data.productInfo.titleTrans || 'Default Title',
                productPrice: response.data.productInfo.price || 0,
                primaryImage: response.data.productInfo.skus[0].imgUrl || '',
                secondaryImage: response.data.productInfo.skus[1].imgUrl || '', 
            }
        }
        return {};
    })
    );
  }
} 