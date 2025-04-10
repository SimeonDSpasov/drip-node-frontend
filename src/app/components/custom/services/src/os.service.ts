import { Injectable } from '@angular/core';

import { UserAgentService } from './user-agent.service';

export enum MobileOS {
  iOS,
  Android,
  WindowsPhone,
  Other,
}

@Injectable({
  providedIn: 'root'
})

export class OSService {

  constructor(private userAgentService: UserAgentService) { }

  public mobileOS = this.getMobileOS();

  private getMobileOS(): MobileOS {
    const userAgent = this.userAgentService.getUserAgent();

    if (!userAgent) {
      return MobileOS.Other;
    }
  
    switch (true) {
      case /windows phone/i.test(userAgent):
        return MobileOS.WindowsPhone;
      case /android/i.test(userAgent): 
        return MobileOS.Android;
      case /iPad|iPhone|iPod/.test(userAgent): 
        return MobileOS.iOS;
      default: 
        return MobileOS.Other;
    }
  }

}
