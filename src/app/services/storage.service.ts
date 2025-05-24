import { Injectable } from '@angular/core';

import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  constructor(private platformService: PlatformService) { 

  }

  public getItem(item: string): string | null {
    if (this.platformService.isServer()) {
      return null;
     }

    const value = localStorage.getItem(item);

    return value ? JSON.parse(value) : null;
  }

  public setItem(item: string, value: any): void {
    localStorage.setItem(item, JSON.stringify(value));
  }

  public clear(): void {
    localStorage.clear();
  }

}
