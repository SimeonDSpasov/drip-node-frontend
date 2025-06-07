import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { XSSService } from './../xss.service';
import { HttpService, CustomResponse } from './http.service';

import { User } from './../../models/user.model';

import { env } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RequestsOrderService {

  constructor(
    private xSSService: XSSService,
    private httpService: HttpService) { }

  public calculateTotalPrice(body: any): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.order.calculateTotalPrice;

    return this.httpService.post<any, any>(url, body);
  }

  public createOrder(body: any): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.order.createOrder;

    return this.httpService.post<any, any>(url, body);
  }

}
