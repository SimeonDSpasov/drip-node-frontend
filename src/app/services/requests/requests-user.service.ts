import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { XSSService } from './../xss.service';
import { HttpService, CustomResponse } from './http.service';

import { User } from './../../models/user.model';

import { env } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RequestsUserService {

  constructor(
    private xSSService: XSSService,
    private httpService: HttpService) { }

  public getUser(): Observable<CustomResponse<User>> {
    const url = env.apiUrl + env.endpoints.user.getUser;

    return this.httpService.get<User>(url);
  }

  public getEndUsersAsAdmin(): Observable<CustomResponse<User[]>> {
    const url = env.apiUrl + env.endpoints.user.getEndUsersAsAdmin;

    return this.httpService.get<User[]>(url);
  }

}
