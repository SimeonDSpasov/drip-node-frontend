import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  // ================= Admin methods =================

  /**
   * Fetch all orders as an admin. In the future we could support pagination by
   * passing query parameters to the backend. For now we assume the endpoint
   * returns a list of orders.
   */
  public getOrders(): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.order.getOrders;

    /*
     * Some deployments (e.g. GitHub Pages fallback) may return an HTML document
     * instead of JSON which causes Angular's default JSON parser to throw
     * "Unexpected token '<'...". We therefore request the response as plain text
     * and attempt to parse it as JSON manually. If parsing fails we still
     * return a CustomResponse object so the caller can handle the error
     * gracefully.
     */
    return this.httpService.get<string>(url, 'text').pipe(
      map((resp) => {
        let data: any = {};
        let error: string | undefined;

        try {
          data = JSON.parse(resp.data as unknown as string);
        } catch (e) {
          error = 'Invalid JSON response';
        }

        return {
          status: resp.status,
          data,
          error,
        } as CustomResponse<any>;
      })
    );
  }

  /**
   * Update an order (e.g. change its status).
   * @param id  Order identifier
   * @param body Object containing the fields to update. Example: { status: 'finished' }
   */
  public updateOrder(id: string, body: any): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.order.updateOrder.replace(':id', id);

    return this.httpService.post<any, string>(url, body, 'text').pipe(
      map((resp) => {
        let data: any = {};
        let error: string | undefined;

        try {
          data = JSON.parse(resp.data as unknown as string);
        } catch (e) {
          error = 'Invalid JSON response';
        }

        return {
          status: resp.status,
          data,
          error,
        } as CustomResponse<any>;
      })
    );
  }

  /**
   * Delete an order by id.
   */
  public deleteOrder(id: string): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.order.deleteOrder.replace(':id', id);

    return this.httpService.delete<any, string>(url, {}, 'text').pipe(
      map((resp) => {
        let data: any = {};
        let error: string | undefined;

        try {
          data = JSON.parse(resp.data as unknown as string);
        } catch (e) {
          error = 'Invalid JSON response';
        }

        return {
          status: resp.status,
          data,
          error,
        } as CustomResponse<any>;
      })
    );
  }

}
