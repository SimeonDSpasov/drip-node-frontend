import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { XSSService } from './../xss.service';
import { HttpService, CustomResponse } from './http.service';

import { User } from './../../models/user.model';

import { env } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RequestsExchangeRateService {

  constructor(
    private xSSService: XSSService,
    private httpService: HttpService) { }

  // TODO: Write interface for the response
  public getRate(): Observable<CustomResponse<any>> {
    const url = env.apiUrl + env.endpoints.exchangeRate.getRate;

    return this.httpService.get<User>(url);
  }


}
