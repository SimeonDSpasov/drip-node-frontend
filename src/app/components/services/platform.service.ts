import { computed, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})

export class PlatformService {

  private platformId = inject(PLATFORM_ID);

  public isServer = computed(() => isPlatformServer(this.platformId));
  public isBrowser = computed(() => isPlatformBrowser(this.platformId));

}
