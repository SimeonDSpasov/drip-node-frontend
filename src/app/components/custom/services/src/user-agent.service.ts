import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserAgentService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.init();
  }

  private userAgent: string | undefined;

  public getUserAgent(): string | undefined {
    return this.userAgent;
  }

  private init(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userAgent = navigator.userAgent;
    } else {
      this.userAgent = undefined;
    }
  }

}
