import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { XSSService } from './../xss.service';
import { HttpService, CustomResponse } from './http.service';

import { User } from './../../models/user.model';

import { env } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RequestsProductService {

  constructor(
    private xSSService: XSSService,
    private httpService: HttpService) { }

  public getProductsChunk(page: number, size: number, chunkSize: number): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.product.getProductsChunk.replace(':from', page.toString()).replace(':to', size.toString()).replace(':chunkSize', chunkSize.toString());

    return this.httpService.get<User>(url);
  }

  // TODO: Write interface for the response
  public getCNFansProductDetail(productId: string, platform: string): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.product.getCNFansProductDetail.replace(':id', productId).replace(':platform', platform);

    return this.httpService.get<User>(url);
  }

  public saveCNFansProduct(productId: string, platform: string, body: any): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.product.saveCNFansProduct.replace(':id', productId).replace(':platform', platform);

    return this.httpService.post<any, any>(url, body);
  }

}
