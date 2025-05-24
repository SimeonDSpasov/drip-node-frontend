import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { XSSService } from './../xss.service';
import { HttpService, CustomResponse } from './http.service';

import { env } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RequestsAuthService {

  constructor(
    private xSSService: XSSService,
    private httpService: HttpService) { }

  // B -> body
  // R -> response

  public register<B, R>(body: B): Observable<CustomResponse<R>> {
    const cleanBody = this.xSSService.clean(body);
    const url = env.apiUrl + env.endpoints.auth.register;

    return this.httpService.post<B, R>(url, cleanBody);
  }

  public login<B, R>(body: B): Observable<CustomResponse<R>> {
    const cleanBody = this.xSSService.clean(body);
    const url = env.apiUrl + env.endpoints.auth.login;

    return this.httpService.post<B, R>(url, cleanBody);
  }

  // public forgotenPassword<B, R>(body: B): Observable<CustomResponse<R>> {
  //   const cleanBody = this.xSSService.clean(body);
  //   const url = env.apiUrl + env.endpoints.auth.forgotenPassword;

  //   return this.httpService.post<B, R>(url, cleanBody);
  // }

  // public resetPassword<B, R>(body: B): Observable<CustomResponse<R>> {
  //   const cleanBody = this.xSSService.clean(body);
  //   const url = env.apiUrl + env.endpoints.auth.resetPassword;

  //   return this.httpService.post<B, R>(url, cleanBody);
  // }

}
