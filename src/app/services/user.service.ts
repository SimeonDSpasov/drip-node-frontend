import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, lastValueFrom } from 'rxjs';

import { StorageService } from './storage.service';
import { RequestsUserService } from './requests/requests-user.service';

import { User, UserRole } from './../models/user.model';
@Injectable({
  providedIn: 'root',
})

export class UserService {

  constructor(
    private router: Router,
    private storageService: StorageService,
    private requestsUserService: RequestsUserService) { }

  public user = signal<User | null>(null);

  public isUserLogged(): boolean {
    return !!this.storageService.getItem('accessToken');
  }

  public isUserAdmin(): boolean {
    if (this.user()) {
      return this.user()!.role === UserRole.Admin;
    }

    return false;
  }

  public isUserMasterAdmin(): boolean {
    if (this.user()) {
      return this.user()!.role === UserRole.Master_Admin;
    }

    return false;
  }

  public async setUserFromDatabase(): Promise<number> {
    if (!this.isUserLogged()) {
      return 401;
    }

    const request = this.requestsUserService.getUser();
    const response = await lastValueFrom(request);

    switch(response.status) {
      case 200:
        this.user.set(response.data);

        break;
      case 403:
        this.router.navigate([ 'suspended' ]);
    }

    return response.status;
  }

  public async logout(): Promise<void> {
    this.storageService.clear();
    this.user.set(null); // this must be after clear of storage

    await this.router.navigate([ '' ]);
  }

}
